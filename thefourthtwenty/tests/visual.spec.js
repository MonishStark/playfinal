/** @format */

const { test, expect } = require("@playwright/test");
const { pages } = require("./pages");
const { stabilizePage } = require("./utils/stabilizePage");
const path = require("path");
const { compareScreenshotToSnapshot } = require("./utils/compareSnapshot");

const IGNORE_MARK_TIMEOUT_MS = 7000;
const IGNORE_MARK_POLL_INTERVAL_MS = 250;

const MIN_IMG_WIDTH = 900;
const MIN_IMG_HEIGHT = 250;
const MIN_IMG_TOP = -50;
const MAX_IMG_TOP = 550;

const MAX_ITERATION_DEPTH = 12;
const MAX_DIFF_PIXEL_RATIO = 0.02;

const STILL_LOOKING_DYNAMIC_POST_PATHS = [
	"/of-life-and-death/",
	"/welcome-to-my-existential-crisis/",
	"/my-home-and-native-land/",
];

async function markBrowseByCategoryForIgnore(page) {
	await page
		.waitForFunction(
			() => {
				const headingText = "BROWSE BY CATEGORY";
				const headingSelectors = "h1,h2,h3,h4,h5,h6";
				const containerSelectors = "section,div,main,article";

				const heading = Array.from(
					document.querySelectorAll(headingSelectors),
				).find(
					(el) =>
						(el.textContent || "").replace(/\s+/g, " ").trim().toUpperCase() ===
						headingText,
				);
				if (!heading) return false;

				const container = heading.closest(containerSelectors);
				if (!container) return false;

				container.setAttribute("data-pw-ignore-visual", "browse-by-category");
				return true;
			},
			undefined,
			{
				timeout: IGNORE_MARK_TIMEOUT_MS,
				polling: IGNORE_MARK_POLL_INTERVAL_MS,
			},
		)
		.catch(() => {});
}

async function markHomeHeroForIgnore(page) {
	await page
		.waitForFunction(
			({ minImgWidth, minImgHeight, minImgTop, maxImgTop }) => {
				const containerSelectors = [
					'.elementor-element[data-element_type="section"]',
					".elementor-section",
					"section",
					"div",
					"main",
					"article",
				].join(",");

				const images = Array.from(
					document.querySelectorAll("main img, .elementor img, img"),
				);
				if (images.length === 0) return false;

				let bestImg = null;
				let bestScore = 0;

				for (const img of images) {
					const rect = img.getBoundingClientRect();
					if (rect.width < minImgWidth || rect.height < minImgHeight) continue;
					if (rect.top < minImgTop || rect.top > maxImgTop) continue;

					const score = rect.width * rect.height;
					if (score > bestScore) {
						bestScore = score;
						bestImg = img;
					}
				}

				if (!bestImg) return false;

				const container = bestImg.closest(containerSelectors);
				if (!container) return false;

				container.setAttribute("data-pw-ignore-visual", "home-hero");
				return true;
			},
			{
				minImgWidth: MIN_IMG_WIDTH,
				minImgHeight: MIN_IMG_HEIGHT,
				minImgTop: MIN_IMG_TOP,
				maxImgTop: MAX_IMG_TOP,
			},
			{
				timeout: IGNORE_MARK_TIMEOUT_MS,
				polling: IGNORE_MARK_POLL_INTERVAL_MS,
			},
		)
		.catch(() => {});
}

async function markDynamicPostsForIgnore(page) {
	await page.evaluate(() => {
		const widgetSelectors = [
			".elementor-widget-posts",
			'[data-widget_type="posts.classic"]',
			".elementor-posts",
			".elementor-posts-container",
		].join(",");
		const widgets = Array.from(document.querySelectorAll(widgetSelectors));
		if (widgets.length === 0) return;

		for (const widget of widgets) {
			const hasPosts =
				widget.classList.contains("elementor-posts") ||
				widget.classList.contains("elementor-posts-container") ||
				widget.querySelector(".elementor-posts-container") ||
				widget.querySelector("article.elementor-post");
			if (!hasPosts) continue;
			widget.setAttribute("data-pw-ignore-visual", "dynamic-posts");
		}
	});
}

async function markStillLookingHeresMoreForIgnore(page) {
	const timeoutMs = IGNORE_MARK_TIMEOUT_MS;
	const pollEveryMs = IGNORE_MARK_POLL_INTERVAL_MS;
	const startedAt = Date.now();

	while (Date.now() - startedAt < timeoutMs) {
		const marked = await page.evaluate((maxIterationDepth) => {
			const targetHeadingText = "STILL LOOKING? HERE'S MORE";
			const stopHeadingText = "DON'T MISS MY NEXT POST";
			const headingSelectors = "h1,h2,h3,h4,h5,h6";
			const containerSelector = "section,div,main,article";

			const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
			const toKey = (s) => normalize(s).toUpperCase();

			const heading = Array.from(
				document.querySelectorAll(headingSelectors),
			).find((el) => toKey(el.textContent) === targetHeadingText);
			if (!heading) return false;

			let node = heading;
			for (
				let depth = 0;
				depth < maxIterationDepth && node && node !== document.body;
				depth++
			) {
				if (node.matches && node.matches(containerSelector)) {
					const key = toKey(node.textContent);
					if (
						key.includes(targetHeadingText) &&
						!key.includes(stopHeadingText)
					) {
						// Prefer a container that actually contains a related-posts grid/cards.
						const hasCards =
							node.querySelector("article") ||
							node.querySelector(".elementor-post") ||
							node.querySelector(".elementor-posts") ||
							node.querySelector(".elementor-posts-container") ||
							node.querySelector("a[href]");
						if (hasCards) {
							node.setAttribute(
								"data-pw-ignore-visual",
								"still-looking-heres-more",
							);
							return true;
						}
					}
				}
				node = node.parentElement;
			}

			const container = heading.closest(containerSelector);
			if (!container) return false;
			container.setAttribute(
				"data-pw-ignore-visual",
				"still-looking-heres-more",
			);
			return true;
		}, MAX_ITERATION_DEPTH);

		if (marked) return;
		await page.waitForTimeout(pollEveryMs);
	}
}

async function getIgnoreRects(page) {
	return await page.evaluate(() => {
		const pad = 6;
		return Array.from(document.querySelectorAll("[data-pw-ignore-visual]"))
			.map((el) => {
				const rect = el.getBoundingClientRect();
				return {
					x: rect.left + window.scrollX - pad,
					y: rect.top + window.scrollY - pad,
					width: rect.width + pad * 2,
					height: rect.height + pad * 2,
				};
			})
			.filter((r) => r.width > 0 && r.height > 0);
	});
}

test.use({
	locale: "en-US",
});

test.describe("Visual Regression Tests - thefourthtwenty.ca", () => {
	for (const pageInfo of pages) {
		test(`Visual: ${pageInfo.name}`, async ({ page }, testInfo) => {
			// Detect device type
			const isMobile = !testInfo.project.name.includes("Desktop");

			console.log(`\n========================================`);
			console.log(`Running: ${testInfo.project.name}`);
			console.log(`Page: ${pageInfo.name}`);
			console.log(`Mobile: ${isMobile}`);
			console.log(`========================================\n`);

			// Navigate to page
			await page.goto(pageInfo.path, {
				waitUntil: "load",
				timeout: 60000,
			});

			// Initial wait
			await page.waitForTimeout(isMobile ? 4000 : 2000);

			// Stabilize page for screenshot
			await stabilizePage(page, isMobile);

			// Take screenshot
			const screenshotOptions = {
				fullPage: true,
				timeout: 90000,
			};

			// Use CSS scale for mobile to avoid rendering issues
			if (isMobile) {
				screenshotOptions.scale = "css";
			}

			// 1) Always attach an unmodified full-page screenshot ("like normal")
			const screenshot = await page.screenshot(screenshotOptions);

			console.log(
				`Screenshot captured for ${pageInfo.name} on ${testInfo.project.name}`,
			);

			// Attach screenshot to report
			await testInfo.attach(`Full Page – ${pageInfo.name}`, {
				body: screenshot,
				contentType: "image/png",
			});

			// 2) Visual comparison (ignore dynamic sections, but keep them visible)
			const isHome = pageInfo.name === "01_Home";
			const isCategoryPage = pageInfo.path.startsWith("/category/");
			const isWeeklyWtfsListing = pageInfo.path === "/weekly-wtfs/";
			const isStillLookingDynamicPost =
				STILL_LOOKING_DYNAMIC_POST_PATHS.includes(pageInfo.path);
			const shouldHideDynamicPostsGrid = isCategoryPage || isWeeklyWtfsListing;

			if (isHome) {
				await markBrowseByCategoryForIgnore(page);
				await markHomeHeroForIgnore(page);
				// Home includes dynamic "Featured" posts widgets
				await markDynamicPostsForIgnore(page);
			}

			if (shouldHideDynamicPostsGrid) {
				await markDynamicPostsForIgnore(page);
			}

			if (isStillLookingDynamicPost) {
				await markStillLookingHeresMoreForIgnore(page);
			}

			const ignoreRects = await getIgnoreRects(page);
			const snapshotsDir = path.join(__dirname, "visual.spec.js-snapshots");

			await compareScreenshotToSnapshot({
				pageName: pageInfo.name,
				projectName: testInfo.project.name,
				snapshotsDir,
				actualBuffer: screenshot,
				ignoreRects,
				maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
				testInfo,
			});
		});
	}
});
