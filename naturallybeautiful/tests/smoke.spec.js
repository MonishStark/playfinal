/** @format */

const { test, expect } = require("@playwright/test");
const pages = require("./pages"); // centralized source

test.describe("NaturallyBeautiful – Smoke Tests", () => {
	for (const p of pages) {
		test(`Smoke: ${p.name}`, async ({ page }) => {
			await page.goto(p.path, { waitUntil: "load" });

			// Page loaded
			await expect(page.locator("body")).toBeVisible();

			// Header exists (1+ is valid for this theme)
			const headers = page.locator("header");
			const headerCount = await headers.count();
			expect(headerCount).toBeGreaterThan(0);

			// Navigation exists
			const navItems = page.locator("header a, header nav, header button");
			const navCount = await navItems.count();
			expect(navCount).toBeGreaterThan(0);
		});
	}
});
