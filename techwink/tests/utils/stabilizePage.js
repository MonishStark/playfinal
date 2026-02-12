/** @format */

const NO_SCROLL_PAGES = [
	"/learning-management-systems/", // LMS breaks on scroll
];

async function stabilizePage(page, path = "") {
	// 1️⃣ DOM ready
	await page.waitForLoadState("domcontentloaded");

	// 2️⃣ Fonts (best effort, never fatal)
	try {
		await page.waitForFunction(
			() => document.fonts && document.fonts.status === "loaded",
			{ timeout: 5000 }
		);
	} catch (e) {
		console.warn(`Could not wait for fonts to load: ${e.message}`);
	}

	// 3️⃣ Disable animations (navigation-safe)
	try {
		await page.evaluate(() => {
			const style = document.createElement("style");
			style.textContent = `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
        }
        html { scroll-behavior: auto !important; }
      `;
			document.head.appendChild(style);
		});
	} catch {}

	// 4️⃣ Force eager images (safe per-image)
	const images = page.locator("img");
	const count = await images.count();

	for (let i = 0; i < count; i++) {
		try {
			await images.nth(i).evaluate((img) => {
				if (img.loading === "lazy") img.loading = "eager";
				if (img.dataset?.src) img.src = img.dataset.src;
				if (img.dataset?.lazy) img.src = img.dataset.lazy;
				if (img.dataset?.srcset) img.srcset = img.dataset.srcset;
			});
		} catch {}
	}

	// 5️⃣ Initial settle
	await page.waitForTimeout(800);

	// 🚫 Skip scroll for unstable pages
	if (NO_SCROLL_PAGES.some((p) => path.startsWith(p))) {
		await page.waitForTimeout(600);
		return;
	}

	// 6️⃣ Navigation-safe scroll
	let navigated = false;
	const onNav = () => (navigated = true);
	page.on("framenavigated", onNav);

	try {
		const height = await page.evaluate(() => document.body.scrollHeight);
		for (let y = 0; y <= height; y += 350) {
			if (navigated) break;
			await page.evaluate((yy) => window.scrollTo(0, yy), y);
			await page.waitForTimeout(160);
		}
	} catch {}

	page.off("framenavigated", onNav);

	// 7️⃣ Back to top
	try {
		await page.evaluate(() => window.scrollTo(0, 0));
	} catch {}

	// 8️⃣ Final settle
	await page.waitForTimeout(500);

	// 9️⃣ Freeze height (stitch-safe)
	try {
		await page.evaluate(() => {
			const h = document.documentElement.scrollHeight;
			document.documentElement.style.height = h + "px";
			document.body.style.height = h + "px";
		});
	} catch {}
}

module.exports = stabilizePage;
