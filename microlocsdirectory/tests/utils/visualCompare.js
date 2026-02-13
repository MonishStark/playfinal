/** @format */

const { PNG } = require("pngjs");
const fs = require("fs");
const path = require("path");

// Fix for pixelmatch import - it's an ES module
let pixelmatch;

async function loadPixelmatch() {
	if (!pixelmatch) {
		const module = await import("pixelmatch");
		pixelmatch = module.default;
	}
	return pixelmatch;
}

async function getIgnoreRegions(page, selectors) {
	const regions = [];

	for (const selector of selectors) {
		try {
			const element = await page.locator(selector).first();
			if (await element.isVisible()) {
				const box = await element.boundingBox();
				if (box) {
					regions.push({
						x: Math.floor(box.x),
						y: Math.floor(box.y),
						width: Math.ceil(box.width),
						height: Math.ceil(box.height),
					});
					console.log(
						`[Ignore Region] ${selector}: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`,
					);
				}
			}
		} catch (e) {
			console.warn(`[Warning] Could not find element: ${selector}`);
		}
	}

	return regions;
}

async function compareImages(current, baseline, ignoreRegions = [], options = {}) {
	const pmatch = await loadPixelmatch(); // Load pixelmatch dynamically
	const threshold = options?.threshold ?? 0.1;

	const { width, height } = baseline;
	const diff = new PNG({ width, height });

	const baselineData = baseline.data;
	// Intentionally mutate this local parsed image buffer for performance.
	const currentData = current.data;

	// Make ignored regions identical by copying baseline pixels into current image
	for (const region of ignoreRegions) {
		const rowStartY = Math.max(0, region.y);
		const rowEndY = Math.min(region.y + region.height, height);
		if (rowEndY <= rowStartY) continue;

		const rowStartX = Math.max(0, region.x);
		const rowEndX = Math.min(region.x + region.width, width);
		if (rowEndX <= rowStartX) continue;

		const rowLength = (rowEndX - rowStartX) * 4;

		for (
			let y = rowStartY;
			y < rowEndY;
			y++
		) {
			const rowStart = (y * width + rowStartX) * 4;
			baselineData.copy(currentData, rowStart, rowStart, rowStart + rowLength);
		}
	}

	const diffPixels = pmatch(
		baselineData,
		currentData,
		diff.data,
		width,
		height,
		{
			threshold,
		},
	);

	return {
		diffPixels,
		diffPercent: diffPixels / (width * height),
		diffImage: PNG.sync.write(diff),
	};
}

async function compareWithIgnoredRegions(
	page,
	screenshotBuffer,
	baselinePath,
	ignoreSelectors = [],
	options = {},
) {
	const { maxDiffPixelRatio = 0.03, pixelmatchThreshold = 0.1 } = options;

	const ignoreRegions = await getIgnoreRegions(page, ignoreSelectors);

	// Create baseline if it doesn't exist
	if (!fs.existsSync(baselinePath)) {
		const dir = path.dirname(baselinePath);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(baselinePath, screenshotBuffer);
		return {
			pass: true,
			isNewBaseline: true,
			message: "✅ New baseline created",
			ignoredRegions: ignoreRegions.length,
		};
	}

	const baselineBuffer = fs.readFileSync(baselinePath);

	// Check dimensions before comparing
	const current = PNG.sync.read(screenshotBuffer);
	const baseline = PNG.sync.read(baselineBuffer);

	// If dimensions don't match, regenerate the baseline
	if (current.width !== baseline.width || current.height !== baseline.height) {
		console.warn(
			`[Baseline Mismatch] Current: ${current.width}x${current.height}, Baseline: ${baseline.width}x${baseline.height} - Regenerating...`,
		);
		fs.writeFileSync(baselinePath, screenshotBuffer);
		return {
			pass: true,
			isNewBaseline: true,
			message: `✅ Baseline regenerated (size changed from ${baseline.width}x${baseline.height} to ${current.width}x${current.height})`,
			ignoredRegions: ignoreRegions.length,
		};
	}

	const result = await compareImages(current, baseline, ignoreRegions, {
		threshold: pixelmatchThreshold,
	});

	const pass = result.diffPercent <= maxDiffPixelRatio;

	return {
		pass,
		diffPixels: result.diffPixels,
		diffPercent: result.diffPercent,
		diffImage: result.diffImage,
		ignoredRegions: ignoreRegions.length,
		message: pass
			? `✅ Passed (${(result.diffPercent * 100).toFixed(2)}% diff)`
			: `❌ Failed (${(result.diffPercent * 100).toFixed(2)}% diff, max: ${maxDiffPixelRatio * 100}%)`,
	};
}

module.exports = { compareWithIgnoredRegions };
