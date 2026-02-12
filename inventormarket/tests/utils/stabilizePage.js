/** @format */

async function stabilizePage(page) {
	// 1️⃣ Disable animations & transitions
	await page.addStyleTag({
		content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html {
        scroll-behavior: auto !important;
      }
    `,
	});

	// 2️⃣ Force lazy-loaded images to load
	await page.evaluate(async () => {
		const imgs = Array.from(document.images);
		imgs.forEach((img) => {
			img.loading = "eager";
			if (img.dataset.src) img.src = img.dataset.src;
			if (img.dataset.lazy) img.src = img.dataset.lazy;
		});

		await Promise.all(
			imgs.map((img) =>
				img.complete
					? Promise.resolve()
					: new Promise((res) => {
							img.onload = img.onerror = res;
					  })
			)
		);
	});

	// 3️⃣ Progressive scroll warm-up (CRITICAL)
	// Triggers IntersectionObserver / AOS / lazy sections
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((r) => setTimeout(r, ms));
		const height = document.body.scrollHeight;

		for (let y = 0; y < height; y += 200) {
			window.scrollTo(0, y);
			await delay(120);
		}

		window.scrollTo(0, 0);
	});

	// 4️⃣ Disable parallax repaint issues
	await page.evaluate(() => {
		document.body.style.backgroundAttachment = "initial";
	});

	// 5️⃣ Final settle
	await page.waitForTimeout(1000);
}

module.exports = { stabilizePage };
