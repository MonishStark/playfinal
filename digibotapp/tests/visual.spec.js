/** @format */

const { test, expect } = require("@playwright/test");
const stabilizePage = require("./utils/stabilizePage");
const pages = require("./pages");

const safeFileName = (name) =>
	String(name)
		.replace(/[\\/:*?"<>|]/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

test.describe("DigiBot – Visual Regression", () => {
	for (const p of pages) {
		test(`Visual: ${p.name}`, async ({ page }, testInfo) => {
			await page.goto(p.path, { waitUntil: "networkidle" });

			await stabilizePage(page);

				const fullPagePath = testInfo.outputPath(
					`fullpage-${safeFileName(p.name) || "page"}.png`
				);
				await page.screenshot({ fullPage: true, path: fullPagePath });
				await testInfo.attach(`FULL PAGE – ${p.name}`, {
					path: fullPagePath,
					contentType: "image/png",
				});

			// Visual baseline assertion
			await expect(page).toHaveScreenshot(`${p.name}.png`, {
				fullPage: true,
				timeout: 30000,
				maxDiffPixelRatio: 0.02,
				scale: "css",
				animations: "disabled",
			});
		});
	}
});
