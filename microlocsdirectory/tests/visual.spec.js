/** @format */

const { test, expect } = require("@playwright/test");
const { stabilizePage } = require("./utils/stabilizePage");
const { compareWithIgnoredRegions } = require("./utils/visualCompare");
const pages = require("./pages");
const path = require("path");

test.describe("Visual Regression Tests", () => {
	test.setTimeout(120000);

	for (const pageConfig of pages) {
		const snapshotName = `${pageConfig.name}.png`;

		test(`Visual Check: ${pageConfig.name}`, async ({ page }, testInfo) => {
			await page.goto(pageConfig.path, { waitUntil: "domcontentloaded" });
			await stabilizePage(page);

			// Take FULL screenshot - QA sees everything (no masking!)
			const fullPageBuffer = await page.screenshot({
				fullPage: true,
				scale: "css",
				animations: "disabled",
			});

			// Attach full screenshot to HTML report
			await testInfo.attach(`FULL PAGE – ${pageConfig.name}`, {
				body: fullPageBuffer,
				contentType: "image/png",
			});

			// Check if this page has sections to ignore (only Explore page)
			if (pageConfig.ignoreSelectors && pageConfig.ignoreSelectors.length > 0) {
				// Build baseline path matching Playwright's naming convention
				const baselinePath = path.join(
					__dirname,
					"visual.spec.js-snapshots",
					`${pageConfig.name}-${testInfo.project.name.replace(/\s+/g, "-")}-${process.platform}.png`,
				);

				const result = await compareWithIgnoredRegions(
					page,
					fullPageBuffer,
					baselinePath,
					pageConfig.ignoreSelectors,
					{ maxDiffPixelRatio: 0.03 },
				);

				// Attach diff image if failed
				if (!result.pass && result.diffImage) {
					await testInfo.attach(`DIFF – ${pageConfig.name}`, {
						body: result.diffImage,
						contentType: "image/png",
					});
				}

				console.log(
					`[${pageConfig.name}] Ignored ${result.ignoredRegions} region(s) - ${result.message}`,
				);

				expect(result.pass, result.message).toBe(true);
			} else {
				// Standard Playwright comparison for all other pages
				await expect(page).toHaveScreenshot(snapshotName, {
					fullPage: true,
					timeout: 45000,
					maxDiffPixelRatio: 0.03,
					scale: "css",
				});
			}
		});
	}
});
