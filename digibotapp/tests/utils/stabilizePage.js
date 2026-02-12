/** @format */

async function stabilizePage(page) {
	// 1️⃣ Ensure fonts/icons are ready
	await page.evaluate(() => {
		if (document.fonts && document.fonts.ready) {
			return document.fonts.ready;
		}
		return Promise.resolve();
	});

	// 2️⃣ Kill animations & transitions, but do NOT change layout/positioning
	await page.addStyleTag({
		content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }

      html, body {
        scroll-behavior: auto !important;
      }
    `,
	});

	// 3️⃣ Deterministic scroll to trigger lazy loading
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((r) => setTimeout(r, ms));
		const viewport = window.innerHeight || 800;
		const total =
			document.body.scrollHeight || document.documentElement.scrollHeight;

		for (let y = 0; y <= total; y += viewport) {
			window.scrollTo(0, y);
			await delay(150);
		}
		window.scrollTo(0, 0);
	});

	// 4️⃣ Wait for network to settle
	await page.waitForLoadState("networkidle");
}

module.exports = stabilizePage;
