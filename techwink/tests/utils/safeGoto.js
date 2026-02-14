/** @format */

async function safeGoto(page, url, options = {}, retries = 2) {
	for (let attempt = 1; attempt <= retries + 1; attempt++) {
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

			try {
				await page.waitForLoadState("networkidle", { timeout: 10000 });
			} catch {}

			return;
		} catch (err) {
			const message = String(err?.message || "");
			const isNetworkError =
				message.includes("ERR_CONNECTION_CLOSED") ||
				message.includes("ERR_CONNECTION_RESET") ||
				message.includes("net::") ||
				/HTTP\s+5\d\d\b/.test(message);

			if (!isNetworkError || attempt > retries) {
				throw err;
			}

			// small backoff before retry
			await page.waitForTimeout(1500 * attempt);
		}
	}
}

module.exports = safeGoto;
