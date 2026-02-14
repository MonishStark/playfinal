/** @format */

const RETRY_BASE_DELAY_MS = 1500;

class Http5xxError extends Error {
	constructor(status, url) {
		super(`HTTP ${status} while navigating to ${url}`);
		this.name = "Http5xxError";
		this.status = status;
		this.url = url;
	}
}

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
				throw new Http5xxError(status, url);
			}

			return;
		} catch (err) {
			const message = String(err?.message || "");
			const isNetworkError =
				err instanceof Http5xxError ||
				message.includes("ERR_CONNECTION_CLOSED") ||
				message.includes("ERR_CONNECTION_RESET") ||
				message.includes("net::");

			if (!isNetworkError || attempt === retries) {
				throw err;
			}

			// Exponential backoff before retry
			const jitter = 0.8 + Math.random() * 0.4;
			await page.waitForTimeout(
				RETRY_BASE_DELAY_MS * Math.pow(2, attempt) * jitter,
			);
		}
	}
}

module.exports = safeGoto;
