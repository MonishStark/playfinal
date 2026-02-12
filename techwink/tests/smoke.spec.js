/** @format */

const { test, expect } = require("@playwright/test");
const pages = require("./pages");

test.describe("TechWink – Smoke Tests", () => {
	for (const p of pages) {
		test(`Smoke: ${p.name}`, async ({ page }) => {
			await page.goto(p.path, { waitUntil: "domcontentloaded" });

			// 1️⃣ Body exists (auto-retries)
			await expect(page.locator("body")).toBeVisible();

			// 2️⃣ Title exists (navigation-safe)
			await expect(page).toHaveTitle(/.+/);

			// -----------------------------
			// 3️⃣ WEB STORIES HANDLING
			// -----------------------------

			// Web Stories index
			if (p.path === "/web-stories/") {
				await expect(page.locator("a, h1, h2").first()).toBeVisible();
				return;
			}

			// Individual Web Story (AMP)
			if (p.path.startsWith("/web-stories/")) {
				await expect(
					page.locator("amp-story, canvas, img").first()
				).toBeAttached();
				return;
			}

			// -----------------------------
			// 4️⃣ BLOG PAGE (special case)
			// -----------------------------
			if (p.path === "/blog/") {
				await expect(
					page.locator("article, .elementor-post").first()
				).toBeVisible();
				return;
			}

			// -----------------------------
			// 5️⃣ NORMAL PAGES
			// -----------------------------
			await expect(page.locator("body").getByText(/\w+/).first()).toBeVisible();
		});
	}
});
