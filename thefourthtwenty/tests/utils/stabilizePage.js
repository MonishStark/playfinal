/** @format */

/**
 * Utility function to stabilize a page before taking screenshots
 * Handles:
 * - Cookie banners
 * - Lazy loaded images
 * - Animations
 * - Third-party widgets
 * - Motion effects
 */

const COOKIE_BANNER_WAIT_MS = 500;

const MOBILE_SCROLL_STEP_PX = 150;
const DESKTOP_SCROLL_STEP_PX = 300;
const MOBILE_SCROLL_DELAY_MS = 200;
const DESKTOP_SCROLL_DELAY_MS = 100;
const SCROLL_BOTTOM_SETTLE_MS = 1000;
const SCROLL_TOP_SETTLE_MS = 500;

const IMAGE_LOAD_TIMEOUT_MS = 5000;

const VIDEO_IFRAME_SCROLL_TIMEOUT_MS = 5000;
const VIDEO_IFRAME_WAIT_MS = 1500;
const VIDEO_SCROLL_SETTLE_MS = 1000;

const NETWORK_IDLE_TIMEOUT_MS = 15000;

const MOBILE_FINAL_SETTLE_MS = 3000;
const DESKTOP_FINAL_SETTLE_MS = 2000;

async function stabilizePage(page, isMobile = false) {
	// Ensure fonts are ready
	await page.evaluate(async () => {
		await document.fonts.ready;
	});

	/* =====================================================
     Disable animations for visual stability
     ===================================================== */
	await page.addStyleTag({
		content: `
      *, *::before, *::after {
        animation: none !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition: none !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
	});

	/* =====================================================
     Handle common cookie consent banners
     ===================================================== */
	const cookieSelectors = [
		// Common cookie consent selectors
		"#cookie-notice",
		"#cookie-law-info-bar",
		".cookie-notice",
		".cookie-consent",
		".cc-banner",
		".cc-window",
		"#gdpr-cookie-notice",
		".gdpr-banner",
		"#moove_gdpr_cookie_info_bar",
		"[class*='cookie-banner']",
		"[class*='cookie-consent']",
		"[id*='cookie']",
	];

	// Try to click accept buttons
	const acceptButtonSelectors = [
		"#cookie-notice-accept",
		".cookie-notice-accept",
		".cc-accept",
		".cc-allow",
		".cc-dismiss",
		"[data-cookie-accept]",
		"button:has-text('Accept')",
		"button:has-text('Allow')",
		"button:has-text('Got it')",
		"button:has-text('I understand')",
		".moove-gdpr-infobar-allow-all",
	];

	for (const selector of acceptButtonSelectors) {
		const btn = page.locator(selector).first();
		if (await btn.isVisible().catch(() => false)) {
			await btn.click({ force: true }).catch(() => {});
			await page.waitForTimeout(COOKIE_BANNER_WAIT_MS);
			break;
		}
	}

	// Hide cookie banners via CSS
	await page.addStyleTag({
		content: `
      ${cookieSelectors.join(", ")} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
	});

	/* =====================================================
     Handle popups and modals
     ===================================================== */
	await page.addStyleTag({
		content: `
      /* Hide common popups and modals */
      .popup-overlay,
      .modal-overlay,
      .newsletter-popup,
      .subscribe-popup,
      [class*="popup"],
      [class*="modal"]:not(.modal-content) {
        display: none !important;
        visibility: hidden !important;
      }
    `,
	});

	// Close any open modals via JavaScript
	await page.evaluate(() => {
		// Close by clicking close buttons
		const closeSelectors = [
			".close",
			".close-btn",
			".modal-close",
			".popup-close",
			"[aria-label='Close']",
			"[data-dismiss='modal']",
		];

		closeSelectors.forEach((selector) => {
			document.querySelectorAll(selector).forEach((btn) => {
				btn.click();
			});
		});

		// Remove overlay elements
		document
			.querySelectorAll(".popup-overlay, .modal-overlay, .newsletter-popup")
			.forEach((el) => {
				el.remove();
			});
	});

	/* =====================================================
     Stabilize page for mobile screenshots
     ===================================================== */
	if (isMobile) {
		await page.addStyleTag({
			content: `
        html, body {
          overflow-x: hidden !important;
          width: 100% !important;
          max-width: 100vw !important;
          position: relative !important;
        }
      `,
		});
	}

	/* =====================================================
     Force lazy images to load
     ===================================================== */
	await page.evaluate(() => {
		// Swap data-src to src
		document
			.querySelectorAll("img[data-lazy-src], img[data-src], img[data-original]")
			.forEach((img) => {
				const lazySrc =
					img.getAttribute("data-lazy-src") ||
					img.getAttribute("data-src") ||
					img.getAttribute("data-original");
				if (lazySrc) {
					img.setAttribute("src", lazySrc);
				}
			});

		// Swap data-srcset to srcset
		document
			.querySelectorAll("img[data-lazy-srcset], img[data-srcset]")
			.forEach((img) => {
				const lazySrcset =
					img.getAttribute("data-lazy-srcset") ||
					img.getAttribute("data-srcset");
				if (lazySrcset) {
					img.setAttribute("srcset", lazySrcset);
				}
			});

		// Remove lazy classes
		document.querySelectorAll("img.lazy, img.lazyload").forEach((img) => {
			img.classList.remove("lazy", "lazyload");
			img.classList.add("lazyloaded");
		});

		// Trigger lazy load for background images
		document.querySelectorAll("[data-bg], [data-background]").forEach((el) => {
			const bg =
				el.getAttribute("data-bg") || el.getAttribute("data-background");
			if (bg) {
				el.style.backgroundImage = `url(${bg})`;
			}
		});
	});

	/* =====================================================
     Scroll to hydrate lazy content
     ===================================================== */
	await page.evaluate(
		async ({
			mobile,
			mobileScrollStepPx,
			desktopScrollStepPx,
			mobileScrollDelayMs,
			desktopScrollDelayMs,
			scrollBottomSettleMs,
			scrollTopSettleMs,
		}) => {
			const delay = (ms) => new Promise((r) => setTimeout(r, ms));

			const getScrollHeight = () => {
				return Math.max(
					document.body.scrollHeight,
					document.documentElement.scrollHeight,
					document.body.offsetHeight,
					document.documentElement.offsetHeight,
				);
			};

			let height = getScrollHeight();
			const scrollStep = mobile ? mobileScrollStepPx : desktopScrollStepPx;
			const scrollDelay = mobile ? mobileScrollDelayMs : desktopScrollDelayMs;

			// Scroll down
			for (let y = 0; y <= height; y += scrollStep) {
				window.scrollTo(0, y);
				await delay(scrollDelay);

				const newHeight = getScrollHeight();
				if (newHeight > height) {
					height = newHeight;
				}
			}

			window.scrollTo(0, height);
			await delay(scrollBottomSettleMs);

			// Scroll back up
			for (let y = height; y >= 0; y -= scrollStep) {
				window.scrollTo(0, y);
				await delay(scrollDelay);
			}

			window.scrollTo(0, 0);
			await delay(scrollTopSettleMs);
		},
		{
			mobile: isMobile,
			mobileScrollStepPx: MOBILE_SCROLL_STEP_PX,
			desktopScrollStepPx: DESKTOP_SCROLL_STEP_PX,
			mobileScrollDelayMs: MOBILE_SCROLL_DELAY_MS,
			desktopScrollDelayMs: DESKTOP_SCROLL_DELAY_MS,
			scrollBottomSettleMs: SCROLL_BOTTOM_SETTLE_MS,
			scrollTopSettleMs: SCROLL_TOP_SETTLE_MS,
		},
	);

	/* =====================================================
     Wait for images to load
     ===================================================== */
	await page.evaluate(async (imageLoadTimeoutMs) => {
		const images = Array.from(document.querySelectorAll("img"));
		await Promise.all(
			images.map((img) => {
				if (img.complete) return Promise.resolve();
				return new Promise((resolve) => {
					img.onload = resolve;
					img.onerror = resolve;
					setTimeout(resolve, imageLoadTimeoutMs);
				});
			}),
		);
	}, IMAGE_LOAD_TIMEOUT_MS);

	/* =====================================================
     Handle video iframes (YouTube, Vimeo)
     ===================================================== */
	const videoIframes = page.locator(
		'iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="youtu.be"]',
	);
	const iframeCount = await videoIframes.count();

	if (iframeCount > 0) {
		console.log(`Found ${iframeCount} video iframes`);

		for (let i = 0; i < iframeCount; i++) {
			await videoIframes
				.nth(i)
				.scrollIntoViewIfNeeded({ timeout: VIDEO_IFRAME_SCROLL_TIMEOUT_MS })
				.catch(() => {});
			await page.waitForTimeout(VIDEO_IFRAME_WAIT_MS);
		}

		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(VIDEO_SCROLL_SETTLE_MS);
	}

	/* =====================================================
     Wait for network to settle
     ===================================================== */
	await Promise.race([
		page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }),
		page.waitForTimeout(NETWORK_IDLE_TIMEOUT_MS),
	]).catch(() => {
		console.log("Network idle timeout - proceeding");
	});

	/* =====================================================
     Scroll to top and final settle
     ===================================================== */
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	});

	// Force layout recalculation
	await page.evaluate(() => {
		document.body.offsetHeight;
	});

	await page.waitForTimeout(
		isMobile ? MOBILE_FINAL_SETTLE_MS : DESKTOP_FINAL_SETTLE_MS,
	);
}

module.exports = { stabilizePage };
