/** @format */

const SCROLL_PAUSE_MS = 50;
const LAZY_POST_SWAP_WAIT_MS = 250;
const IMAGE_LOAD_TIMEOUT_MS = 8000;
const HEADING_SELECTORS =
	"h1,h2,h3,h4,h5,h6,.mkdf-related-portfolio-title,.mkdf-related-title";
const MORE_WORKS_TEXT = "MORE WORKS";
const CONTAINER_SELECTORS =
	"section,.wpb_row,.vc_row,.elementor-section,.mkdf-portfolio-related-holder,.mkdf-row-grid-section";
const IMAGE_SELECTORS = "img";
const PLACEHOLDER_SRC_PATTERNS = [
	"placeholder",
	"preloader",
	"blank.gif",
	"spacer.gif",
	"pixel.gif",
];
const LAZY_ATTR_CANDIDATES = [
	"data-src",
	"data-lazy-src",
	"data-original",
	"data-url",
	"data-lazy",
	"data-bg",
];
const LAZY_SRCSET_ATTR_CANDIDATES = ["data-srcset", "data-lazy-srcset"];

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
			const total = document.body.scrollHeight;

			for (let y = 0; y <= total; y += step) {
				window.scrollTo(0, y);
				await new Promise((r) => requestAnimationFrame(r));
				await new Promise((r) => setTimeout(r, scrollPauseMs));
			}

			window.scrollTo(0, 0);
		},
		{ scrollPauseMs: SCROLL_PAUSE_MS },
	);

	// 7️⃣ Force-load lazy images (esp. "More Works") and wait for decode
	// Playwright fullPage screenshots scroll quickly and can capture lazy sections
	// before thumbnails finish swapping from placeholders.
	try {
		await page.evaluate(
			async ({
				lazyPostSwapWaitMs,
				imageLoadTimeoutMs,
				HEADING_SELECTORS,
				MORE_WORKS_TEXT,
				CONTAINER_SELECTORS,
				IMAGE_SELECTORS,
				PLACEHOLDER_SRC_PATTERNS,
				LAZY_ATTR_CANDIDATES,
				LAZY_SRCSET_ATTR_CANDIDATES,
			}) => {
				const pickMoreWorksContainer = () => {
					const headingCandidates = Array.from(
						document.querySelectorAll(HEADING_SELECTORS),
					);
					const heading = headingCandidates.find((el) =>
						(el.textContent || "")
							.trim()
							.toUpperCase()
							.includes(MORE_WORKS_TEXT),
					);
					if (!heading) return null;
					return heading.closest(CONTAINER_SELECTORS) || heading.parentElement;
				};

				const forceImageAttrs = (img) => {
					img.setAttribute("loading", "eager");
					img.setAttribute("decoding", "sync");
					// Use attribute for broader compatibility; avoids try/catch.
					img.setAttribute("fetchpriority", "high");

					const isPlaceholderSrc = (value) => {
						const v = String(value || "")
							.trim()
							.toLowerCase();
						if (!v) return true;
						// Treat any data URI as a placeholder: lazy loaders commonly use 1x1 pixels or
						// blurred previews as data URIs before swapping to the real network image.
						if (v.startsWith("data:")) return true;
						if (v === "about:blank") return true;
						if (v === "#") return true;
						return PLACEHOLDER_SRC_PATTERNS.some((pattern) =>
							v.includes(pattern),
						);
					};

					const srcAttr = String(img.getAttribute("src") || "").trim();
					const currentSrcValue = String(img.currentSrc || srcAttr).trim();
					const shouldPromoteLazySrc = isPlaceholderSrc(currentSrcValue);

					if (shouldPromoteLazySrc) {
						for (const attr of LAZY_ATTR_CANDIDATES) {
							const v = String(img.getAttribute(attr) || "").trim();
							if (!v) continue;
							// Allow absolute, protocol-relative, and root/relative URLs.
							// Avoid setting obvious script/data placeholders.
							const lower = v.toLowerCase();
							if (lower.startsWith("javascript:")) continue;
							if (lower.startsWith("data:")) continue;
							if (v === srcAttr || v === currentSrcValue) continue;

							img.setAttribute("src", v);
							break;
						}
					}

					if (!img.getAttribute("srcset")) {
						for (const attr of LAZY_SRCSET_ATTR_CANDIDATES) {
							const srcset = String(img.getAttribute(attr) || "").trim();
							if (!srcset) continue;
							img.setAttribute("srcset", srcset);
							break;
						}
					}
				};

				const waitForImg = (img, timeoutMs) => {
					return new Promise((resolve) => {
						if (img.complete && img.naturalWidth > 0) {
							resolve();
							return;
						}

						let timeoutId;
						let settled = false;
						const onDone = () => {
							if (settled) return;
							settled = true;
							if (timeoutId) clearTimeout(timeoutId);
							img.removeEventListener("load", onDone);
							img.removeEventListener("error", onDone);
							resolve();
						};

						img.addEventListener("load", onDone, { once: true });
						img.addEventListener("error", onDone, { once: true });

						// Avoid a race where the image finishes loading after the initial `complete`
						// check but before the listeners are attached.
						if (img.complete) {
							onDone();
							return;
						}

						timeoutId = setTimeout(onDone, timeoutMs);
					});
				};

				const container = pickMoreWorksContainer();
				const imgs = Array.from(
					(container || document).querySelectorAll(IMAGE_SELECTORS),
				).filter((img) => {
					const rect = img.getBoundingClientRect();
					return rect.width > 1 && rect.height > 1;
				});

				imgs.forEach(forceImageAttrs);

				// Give lazy loaders a beat after attribute swap
				await new Promise((r) => setTimeout(r, lazyPostSwapWaitMs));

				// Wait for images to load/complete; keep it bounded to avoid hanging
				await Promise.all(
					imgs.map((img) => waitForImg(img, imageLoadTimeoutMs)),
				);

				// Attempt decode for sharper/stabler rendering (ignore failures)
				await Promise.all(
					imgs.map((img) => (img.decode ? img.decode().catch(() => {}) : null)),
				);
			},
			{
				lazyPostSwapWaitMs: LAZY_POST_SWAP_WAIT_MS,
				imageLoadTimeoutMs: IMAGE_LOAD_TIMEOUT_MS,
				HEADING_SELECTORS,
				MORE_WORKS_TEXT,
				CONTAINER_SELECTORS,
				IMAGE_SELECTORS,
				PLACEHOLDER_SRC_PATTERNS,
				LAZY_ATTR_CANDIDATES,
				LAZY_SRCSET_ATTR_CANDIDATES,
			},
		);
	} catch (error) {
		// Best-effort; don't fail tests because a site script blocks evaluate.
		// Logging helps diagnose unexpected visual diffs/flakes.
		const message = String(error?.message || error);
		const stack =
			typeof error === "object" && error && "stack" in error
				? error.stack
				: undefined;
		console.warn(
			"stabilizePage: lazy-image stabilization failed (non-fatal)",
			message,
			stack,
		);
	}
}

module.exports = stabilizePage;
