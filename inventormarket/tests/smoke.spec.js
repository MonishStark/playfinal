/** @format */
const { test, expect } = require("@playwright/test");
const { pagesToTest } = require("./pages");

test.describe("Smoke Tests", () => {
	for (const p of pagesToTest) {
		test(`Smoke: ${p.name}`, async ({ page }) => {
			await page.goto(p.path, { waitUntil: "domcontentloaded" });

			await expect(page.locator("body")).toBeVisible();
			await expect(page).toHaveTitle(/Inventor/i);
		});
	}
});
