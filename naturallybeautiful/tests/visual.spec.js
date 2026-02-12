/** @format */

const { test, expect } = require("@playwright/test");
const pages = require("./pages");
const stabilizePage = require("./utils/stabilizePage");
const lockHeroSlide = require("./utils/lockHeroSlide");

const safeFileName = (name) =>
	String(name)
		.replace(/[\\/:*?"<>|]/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

for (const p of pages) {
	test(`Visual: ${p.name}`, async ({ page }, testInfo) => {
		await page.goto(p.path, { waitUntil: "load" });

		await stabilizePage(page);

		if (p.name === "Home") {
			await lockHeroSlide(page);
		}

		// ✅ 1️⃣ FULL PAGE SCREENSHOT ATTACHED TO REPORT VIA FILE PATH
		const fullPagePath = testInfo.outputPath(
			`fullpage-${safeFileName(p.name) || "page"}.png`
		);
		await page.screenshot({
			fullPage: true,
			animations: "disabled",
			path: fullPagePath,
		});

		await testInfo.attach(`FULL PAGE – ${p.name}`, {
			path: fullPagePath,
			contentType: "image/png",
		});

		// ✅ 2️⃣ VISUAL REGRESSION ASSERTION (STAYS AS IS)
		await expect(page).toHaveScreenshot(`${p.name}.png`, {
			fullPage: true,
			animations: "disabled",
			scale: "css",
			maxDiffPixelRatio: 0.06,
		});
	});
}
