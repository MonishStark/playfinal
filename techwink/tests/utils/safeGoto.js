/** @format */

async function safeGoto(page, url, options = {}, retries = 2) {
	for (let attempt = 1; attempt <= retries + 1; attempt++) {
		try {
			await page.goto(url, {
				waitUntil: "domcontentloaded",
				timeout: 30000,
				...options,
			});
			return;
		} catch (err) {
			const isNetworkError =
				err.message.includes("ERR_CONNECTION_CLOSED") ||
				err.message.includes("ERR_CONNECTION_RESET") ||
				err.message.includes("net::");

			if (!isNetworkError || attempt > retries) {
				throw err;
			}

			// small backoff before retry
			await page.waitForTimeout(1500);
		}
	}
}

module.exports = safeGoto;
