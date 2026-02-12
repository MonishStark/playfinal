/** @format */

const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	retries: 0,

	reporter: [["html"], ["json", { outputFile: "results.json" }]],

	use: {
		baseURL: "https://digibotapp.com",
		trace: "retain-on-failure",
		screenshot: "on",
	},

	expect: {
		timeout: 30000,
		toHaveScreenshot: {
			animations: "disabled",
			scale: "css",
		},
	},

	projects: [
		{
			name: "Desktop Chrome",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1280, height: 800 },
			},
		},
		{
			name: "iPhone 17",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 393, height: 852 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
			},
		},

		{
			name: "iPhone 17 Pro Max",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 430, height: 932 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
			},
		},

		{
			name: "Galaxy S25",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 360, height: 780 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (Linux; Android 15; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
			},
		},
		{
			name: "Galaxy S25 Ultra",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 412, height: 915 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
			},
		},
		{
			name: "iPad Pro 11-inch",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 834, height: 1194 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (iPad; CPU OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
			},
		},
		{
			name: "Galaxy Tab S9 FE",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 800, height: 1280 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (Linux; Android 15; SM-X516B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			},
		},
	],
});
