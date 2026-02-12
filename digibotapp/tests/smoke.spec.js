/** @format */

const { test, expect } = require("@playwright/test");
const pages = require("./pages");

test.describe("DigiBot – Smoke Tests", () => {
	for (const p of pages) {
		test(`Smoke: ${p.name}`, async ({ page }) => {
			await page.goto(p.path, { waitUntil: "domcontentloaded" });

			await expect(page.locator("body")).toBeVisible();
			await expect(page.locator("header")).toBeVisible();
		});
	}
});
