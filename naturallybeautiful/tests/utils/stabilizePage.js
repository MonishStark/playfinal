/** @format */

const SCROLL_PAUSE_MS = 50;
const IMAGE_LOAD_TIMEOUT_MS = 8000;

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

		selectors.forEach((sel) => {
			document.querySelectorAll(sel).forEach((el) => el.remove());
		});

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
	await page.evaluate(
		async ({ scrollPauseMs }) => {
			const step = window.innerHeight * 0.9;
			let lastScrollY = -1;
			let scrollCount = 0;
			const maxScrolls = 30;

			while (window.scrollY !== lastScrollY && scrollCount < maxScrolls) {
				lastScrollY = window.scrollY;
				window.scrollBy(0, step);
				await new Promise((r) => requestAnimationFrame(r));
				await new Promise((r) => setTimeout(r, scrollPauseMs));
				scrollCount++;
			}

			window.scrollTo(0, 0);
		},
		{ scrollPauseMs: SCROLL_PAUSE_MS },
	);

	// 7️⃣ Best-effort wait for lazy images to load/decode before screenshot
	try {
		await page.evaluate(
			async ({ imageLoadTimeoutMs }) => {
				const waitImageSettled = (img, timeoutMs) =>
					new Promise((resolve) => {
						if (img.complete) {
							resolve();
							return;
						}

						let resolved = false;
						const done = () => {
							if (resolved) return;
							resolved = true;
							clearTimeout(timeoutId);
							img.removeEventListener("load", done);
							img.removeEventListener("error", done);
							resolve();
						};

						const timeoutId = setTimeout(done, timeoutMs);
						img.addEventListener("load", done, { once: true });
						img.addEventListener("error", done, { once: true });

						// Handle race where image completes between outer check and listener attachment.
						if (img.complete) {
							done();
						}
					});

				const imgs = Array.from(document.querySelectorAll("img")).filter(
					(img) => img.clientWidth > 1 && img.clientHeight > 1,
				);

				await Promise.all(
					imgs.map(async (img) => {
						await waitImageSettled(img, imageLoadTimeoutMs);

						if (img.naturalWidth > 0 && typeof img.decode === "function") {
							await img.decode().catch(() => {});
						}
					}),
				);
			},
			{ imageLoadTimeoutMs: IMAGE_LOAD_TIMEOUT_MS },
		);
	} catch (error) {
		console.warn(
			"stabilizePage: lazy-image stabilization failed (non-fatal)",
			error,
		);
	}
}

module.exports = stabilizePage;
