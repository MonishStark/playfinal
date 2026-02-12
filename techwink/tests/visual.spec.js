/** @format */

const { test, expect } = require("@playwright/test");
const stabilizePage = require("./utils/stabilizePage");
const safeGoto = require("./utils/safeGoto");
const pages = require("./pages");

const safeFileName = (name) =>
	String(name)
		.replace(/[\\/:*?"<>|]/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

// 🔥 CRITICAL FIX: Visual tests are slow by nature
test.setTimeout(120000); // 2 minutes per visual test

test.describe("TechWink – Visual Regression", () => {
	for (const p of pages) {
		test(`Visual: ${p.name}`, async ({ page }, testInfo) => {
			// ✅ Navigation with retry for mobile/network drops
			await safeGoto(page, p.path);

			// ✅ Fully deterministic page settling
			await stabilizePage(page, p.path);

			// ✅ Always attach full-page screenshot to report
			const fullPagePath = testInfo.outputPath(
				`fullpage-${safeFileName(p.name) || "page"}.png`,
			);
			await page.screenshot({ fullPage: true, path: fullPagePath });
			await testInfo.attach(`FULL PAGE – ${p.name}`, {
				path: fullPagePath,
				contentType: "image/png",
			});

			// ✅ Visual assertion
			await expect(page).toHaveScreenshot(`${p.name}.png`, {
				fullPage: true,
				scale: "css",
				maxDiffPixelRatio: 0.03,
				timeout: 60000, // screenshot budget
			});
		});
	}
});
