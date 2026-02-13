/** @format */

async function stabilizePage(page) {
	// 1️⃣ Wait for fonts
	await page.evaluate(() => document.fonts.ready);

	// 2️⃣ Kill animations & transitions ONLY
	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation: none !important;
				transition: none !important;
			}
		`,
	});

	// 3️⃣ Remove popups (safe)
	await page.evaluate(() => {
		const selectors = [
			'[role="dialog"]',
			'[aria-modal="true"]',
			".elementor-popup-modal",
			".pum",
			".popmake",
			".sgpb-popup-dialog-main-div",
			".sgpb-popup-overlay",
			'div[class*="popup"]',
			'div[id*="popup"]',
			'div[class*="modal"]',
			'div[id*="modal"]',
		];

		selectors.forEach((sel) =>
			document.querySelectorAll(sel).forEach((el) => el.remove())
		);

		document.body.style.overflow = "visible";
	});

	// 4️⃣ HARD FREEZE REVOLUTION SLIDER (JS-level)
	await page.evaluate(() => {
		if (window.RS_MODULES?.revslider?.instances) {
			Object.values(window.RS_MODULES.revslider.instances).forEach((slider) => {
				try {
					slider.revpause?.();
				} catch {}
			});
		}

		document.querySelectorAll("rs-slide").forEach((slide, index) => {
			slide.style.opacity = index === 0 ? "1" : "0";
			slide.style.visibility = index === 0 ? "visible" : "hidden";
			slide.style.zIndex = index === 0 ? "20" : "0";
		});

		document.querySelectorAll("rs-sbg").forEach((bg) => {
			bg.style.transform = "none";
			bg.style.willChange = "auto";
		});
	});

	// 5️⃣ Disable parallax repaint ONLY
	await page.evaluate(() => {
		document.querySelectorAll(".mkdf-parallax-row-holder").forEach((el) => {
			el.style.backgroundAttachment = "scroll";
			el.style.transform = "none";
		});
	});

	// 6️⃣ Deterministic scroll to force lazy content
	await page.evaluate(async () => {
		const step = window.innerHeight * 0.9;
		const total = document.body.scrollHeight;

		for (let y = 0; y <= total; y += step) {
			window.scrollTo(0, y);
			await new Promise((r) => requestAnimationFrame(r));
		}

		window.scrollTo(0, 0);
	});
}

module.exports = stabilizePage;
