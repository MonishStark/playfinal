/** @format */

const fs = require("fs").promises;
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatchModule = require("pixelmatch");
const pixelmatch = pixelmatchModule.default || pixelmatchModule;

function sanitizeSnapshotPart(value) {
	return String(value)
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function buildSnapshotFileName(pageName, projectName) {
	const base = `${pageName}-${projectName}`;
	return `${sanitizeSnapshotPart(base)}.png`;
}

function clampRectToImage(rect, width, height) {
	const x1 = Math.max(0, Math.floor(rect.x));
	const y1 = Math.max(0, Math.floor(rect.y));
	const x2 = Math.min(width, Math.ceil(rect.x + rect.width));
	const y2 = Math.min(height, Math.ceil(rect.y + rect.height));

	if (x2 <= x1 || y2 <= y1) return null;
	return { x1, y1, x2, y2 };
}

function applyIgnoreRects(actualPng, expectedPng, ignoreRects) {
	if (!ignoreRects || ignoreRects.length === 0) return;
	const width = actualPng.width;
	const height = actualPng.height;

	for (const rect of ignoreRects) {
		const clamped = clampRectToImage(rect, width, height);
		if (!clamped) continue;

		for (let y = clamped.y1; y < clamped.y2; y++) {
			const rowStart = (y * width + clamped.x1) * 4;
			const rowLength = (clamped.x2 - clamped.x1) * 4;
			// Force actual pixels to match expected pixels inside ignored region
			expectedPng.data.copy(
				actualPng.data,
				rowStart,
				rowStart,
				rowStart + rowLength,
			);
		}
	}
}

async function compareScreenshotToSnapshot({
	pageName,
	projectName,
	snapshotsDir,
	actualBuffer,
	ignoreRects,
	maxDiffPixelRatio,
	testInfo,
}) {
	const fileName = buildSnapshotFileName(pageName, projectName);
	const snapshotPath = path.join(snapshotsDir, fileName);

	const updateMode =
		(testInfo?.config?.updateSnapshots &&
			testInfo.config.updateSnapshots !== "none") ||
		false;

	let expectedBuffer;
	try {
		expectedBuffer = await fs.readFile(snapshotPath);
	} catch (error) {
		if (error && error.code === "ENOENT") {
			if (!updateMode) {
				throw new Error(
					`Snapshot missing: ${path.relative(process.cwd(), snapshotPath)}`,
				);
			}
			await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
			await fs.writeFile(snapshotPath, actualBuffer);
			return;
		}
		throw error;
	}

	const expectedPng = PNG.sync.read(expectedBuffer);
	const actualPng = PNG.sync.read(actualBuffer);

	if (
		expectedPng.width !== actualPng.width ||
		expectedPng.height !== actualPng.height
	) {
		if (updateMode) {
			await fs.writeFile(snapshotPath, actualBuffer);
			return;
		}
		throw new Error(
			`Snapshot size mismatch. Expected ${expectedPng.width}x${expectedPng.height}, got ${actualPng.width}x${actualPng.height}`,
		);
	}

	const diffPng = new PNG({ width: actualPng.width, height: actualPng.height });
	applyIgnoreRects(actualPng, expectedPng, ignoreRects);

	const diffPixels = pixelmatch(
		expectedPng.data,
		actualPng.data,
		diffPng.data,
		actualPng.width,
		actualPng.height,
		{
			threshold: 0.1,
		},
	);

	const totalPixels = actualPng.width * actualPng.height;
	const ratio = totalPixels > 0 ? diffPixels / totalPixels : 0;

	if (ratio > maxDiffPixelRatio) {
		if (updateMode) {
			await fs.writeFile(snapshotPath, actualBuffer);
			return;
		}

		const diffPath = snapshotPath.replace(/\.png$/i, ".diff.png");
		const diffBuffer = PNG.sync.write(diffPng);
		await fs.writeFile(diffPath, diffBuffer);

		if (testInfo) {
			await testInfo.attach(`Expected – ${pageName}`, {
				body: expectedBuffer,
				contentType: "image/png",
			});
			await testInfo.attach(`Actual – ${pageName}`, {
				body: actualBuffer,
				contentType: "image/png",
			});
			await testInfo.attach(`Diff – ${pageName}`, {
				body: diffBuffer,
				contentType: "image/png",
			});
		}

		throw new Error(
			`Visual mismatch for ${pageName} (${projectName}): diff ratio ${ratio.toFixed(
				4,
			)} > ${maxDiffPixelRatio}`,
		);
	}
}

module.exports = {
	buildSnapshotFileName,
	compareScreenshotToSnapshot,
};
