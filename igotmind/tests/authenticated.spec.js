/** @format */

const { test, expect } = require("@playwright/test");
require("dotenv").config();

const CREDENTIALS = {
	email: process.env.TEST_EMAIL,
	password: process.env.TEST_PASSWORD,
};

test.describe("I Got Mind - Authenticated Dashboard Audit", () => {
	test.beforeEach(async ({ page }) => {
		test.setTimeout(900000);

		await page.addStyleTag({
			content: `
        #moove_gdpr_cookie_info_bar { display: none !important; } 
        iframe { opacity: 0 !important; } 
        .slick-track { visibility: hidden !important; }
        .clock-animation { visibility: hidden !important; }
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
		});
	});

	test("Authenticated: Full Student Dashboard Journey", async ({ page }) => {
		await page.goto("/my-courses/");
		await page
			.getByLabel("Email Address", { exact: false })
			.pressSequentially(CREDENTIALS.email, { delay: 100 });
		await page
			.getByLabel("Password", { exact: false })
			.pressSequentially(CREDENTIALS.password, { delay: 100 });
		await page.getByRole("button", { name: "Login", exact: false }).click();

		await expect(page.locator("body")).toHaveClass(/logged-in/, {
			timeout: 30000,
		});

		await expect(page).toHaveScreenshot("Auth-01-Dashboard.png", {
			fullPage: true,
			animations: "disabled",
		});

		const internalPages = [
			{ name: "Auth-02-My-Courses", path: "/my-courses/my-courses/" },
			{ name: "Auth-03-My-Grades", path: "/my-courses/my-grades/" },
			{ name: "Auth-04-My-Memberships", path: "/my-courses/my-memberships/" },
			{ name: "Auth-05-Private-Area", path: "/my-courses/my-private-area/" },
			{ name: "Auth-06-Achievements", path: "/my-courses/my-achievements/" },
			{ name: "Auth-07-Certificates", path: "/my-courses/my-certificates/" },
			{ name: "Auth-08-My-Notes", path: "/my-courses/my-notes/" },
			{ name: "Auth-09-Notifications", path: "/my-courses/notifications/" },
			{ name: "Auth-10-Edit-Account", path: "/my-courses/edit-account/" },
			{ name: "Auth-11-Redeem-Voucher", path: "/my-courses/redeem-voucher/" },
			{ name: "Auth-12-Order-History", path: "/my-courses/orders/" },
		];

		for (const internalPage of internalPages) {
			console.log(`Navigating to ${internalPage.name}...`);
			await page.goto(internalPage.path);

			await page.waitForLoadState("domcontentloaded");
			await page.waitForTimeout(2000);

			await expect(page).toHaveScreenshot(`${internalPage.name}.png`, {
				fullPage: true,
			});
		}
	});
});
