/** @format */

const RETRY_BASE_DELAY_MS = 1500;

async function safeGoto(page, url, options = {}, retries = 2) {
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const response = await page.goto(url, {
				waitUntil: "domcontentloaded",
				timeout: 30000,
				...options,
			});

			const status = response?.status?.();
			if (typeof status === "number" && status >= 500) {
				throw new Error(`HTTP ${status} while navigating to ${url}`);
			}

			return;
		} catch (err) {
			const message = String(err?.message || "");
			const isNetworkError =
				message.includes("ERR_CONNECTION_CLOSED") ||
				message.includes("ERR_CONNECTION_RESET") ||
				message.includes("net::") ||
				/HTTP\s+5\d\d\b/.test(message);

			if (!isNetworkError || attempt === retries) {
				throw err;
			}

			// Exponential backoff before retry
			await page.waitForTimeout(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
		}
	}
}

module.exports = safeGoto;
