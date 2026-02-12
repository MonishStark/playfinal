/** @format */

const { test, expect } = require("@playwright/test");
const { stabilizePage } = require("./utils/stabilizePage");
const { pagesToTest } = require("./pages");

test.describe("Full Page Visual Audit (Always Show Screenshot)", () => {
	for (const p of pagesToTest) {
		test(`Audit: ${p.name} – Full Page`, async ({ page }, testInfo) => {
			await page.goto(p.path, { waitUntil: "networkidle" });
			await stabilizePage(page);

			// ✅ ALWAYS capture screenshot
			const current = await page.screenshot({
				fullPage: true,
			});

			// ✅ ALWAYS attach to report
			await testInfo.attach(`SCREENSHOT – ${p.name}`, {
				body: current,
				contentType: "image/png",
			});

			// ✅ Visual regression (baseline comparison)
			await expect(page).toHaveScreenshot(`FULL-${p.name}.png`, {
				fullPage: true,
				animations: "disabled",
				timeout: 60000,
			});
		});
	}
});
