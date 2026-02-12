/** @format */

const { test, expect } = require("@playwright/test");

test.use({
	locale: "en-US",
	permissions: ["geolocation"],
});

async function preparePageForScreenshot(page, isMobile = false) {
	// Mark playwright (optional debug hook)
	await page.addInitScript(() => {
		window.__PLAYWRIGHT__ = true;
	});

	// Ensure fonts are ready
	await page.evaluate(async () => {
		await document.fonts.ready;
	});

	// Disable animations for visual stability
	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation: none !important;
				animation-duration: 0s !important;
				animation-delay: 0s !important;
				transition: none !important;
				transition-duration: 0s !important;
				transition-delay: 0s !important;
			}
			.elementor-invisible {
				opacity: 1 !important;
				visibility: visible !important;
				transform: none !important;
			}
		`,
	});

	/* =====================================================
	   ✅ CALENDLY POPUP FIX - Hide popups and floating buttons
	   This prevents Calendly from appearing on wrong pages
	   ===================================================== */
	await page.addStyleTag({
		content: `
			/* Hide Calendly popup/modal overlays */
			.calendly-overlay,
			.calendly-popup,
			.calendly-popup-content,
			.calendly-popup-close,
			.calendly-badge-widget,
			.calendly-badge-content,
			[class*="calendly-overlay"],
			[class*="calendly-popup"],
			[class*="calendly-badge"] {
				display: none !important;
				visibility: hidden !important;
				opacity: 0 !important;
				pointer-events: none !important;
			}
			
			/* Hide Calendly's cookie consent */
			[class*="cookie-consent"],
			[class*="cookie-banner"],
			div[role="dialog"][aria-modal="true"] {
				display: none !important;
				visibility: hidden !important;
			}
			
			/* Hide any floating "Book Now" type buttons that trigger Calendly */
			.calendly-floating-button,
			[data-url*="calendly.com"],
			a[href*="calendly.com"]:not(iframe):not(.elementor-widget-container *) {
				pointer-events: none !important;
			}
		`,
	});

	/* =====================================================
	   ✅ Close any open Calendly popups via JavaScript
	   ===================================================== */
	await page.evaluate(() => {
		// Close Calendly popup if open
		const calendlyOverlay = document.querySelector(
			'.calendly-overlay, .calendly-popup, [class*="calendly-overlay"]',
		);
		if (calendlyOverlay) {
			calendlyOverlay.remove();
		}

		// Click close button if exists
		const closeBtn = document.querySelector(
			".calendly-popup-close, .calendly-close-overlay",
		);
		if (closeBtn) {
			closeBtn.click();
		}

		// Remove Calendly badge widget (floating button)
		const badge = document.querySelector(
			".calendly-badge-widget, .calendly-badge-content",
		);
		if (badge) {
			badge.remove();
		}

		// Close any modal dialogs (Calendly cookie consent)
		document
			.querySelectorAll('[role="dialog"][aria-modal="true"]')
			.forEach((dialog) => {
				dialog.remove();
			});
	});

	await page.waitForTimeout(500);

	/* =====================================================
	   ✅ Disable Elementor Motion Effects
	   ===================================================== */
	await page.addStyleTag({
		content: `
			.elementor-motion-effects-element,
			.elementor-motion-effects-parent,
			.elementor-motion-effects-container,
			.elementor-motion-effects-layer,
			[class*="elementor-motion-effects"] {
				opacity: 1 !important;
				visibility: visible !important;
				transform: none !important;
				-webkit-transform: none !important;
				will-change: auto !important;
			}
			
			.elementor-widget-container[style*="opacity"],
			.elementor-element[style*="opacity"],
			div[style*="will-change: opacity"] {
				opacity: 1 !important;
				will-change: auto !important;
			}
			
			.elementor-widget-price-table .elementor-widget-container,
			.elementor-widget-image .elementor-widget-container {
				opacity: 1 !important;
				visibility: visible !important;
			}
			
			.elementor-widget {
				opacity: 1 !important;
				visibility: visible !important;
			}
		`,
	});

	/* =====================================================
	   ✅ Video/Iframe visibility CSS
	   ===================================================== */
	await page.addStyleTag({
		content: `
			.elementor-widget-video,
			.elementor-video-iframe,
			iframe[src*="vimeo"],
			iframe[src*="youtube"],
			.presto-player__wrapper,
			.presto-player,
			.plyr,
			.plyr__poster {
				opacity: 1 !important;
				visibility: visible !important;
			}
			
			.elementor-wrapper.elementor-open-inline {
				min-height: 200px !important;
			}
		`,
	});

	/* =====================================================
	   ✅ MOOVE GDPR COOKIE BANNER
	   ===================================================== */
	const mooveAcceptBtn = page.locator(
		"#moove_gdpr_cookie_info_bar .moove-gdpr-infobar-allow-all",
	);

	if (await mooveAcceptBtn.isVisible().catch(() => false)) {
		await mooveAcceptBtn.click({ force: true }).catch(() => {});
		await page.waitForTimeout(1000);
	}

	await page.addStyleTag({
		content: `
			#moove_gdpr_cookie_info_bar {
				display: none !important;
				visibility: hidden !important;
				pointer-events: none !important;
			}
		`,
	});

	await page.waitForTimeout(500);

	/* =====================================================
	   ✅ Stabilize page for mobile screenshots
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
				.elementor-section,
				.elementor-container,
				.elementor-column,
				.elementor-widget-wrap,
				.elementor-widget {
					transform: none !important;
					-webkit-transform: none !important;
				}
			`,
		});
	}

	/* =====================================================
	   ✅ Disable Elementor Motion Effects via JavaScript
	   ===================================================== */
	await page.evaluate(() => {
		document.querySelectorAll('[data-settings*="motion_fx"]').forEach((el) => {
			el.style.setProperty("opacity", "1", "important");
			el.style.setProperty("visibility", "visible", "important");
			el.style.setProperty("will-change", "auto", "important");

			const container = el.querySelector(".elementor-widget-container");
			if (container) {
				container.style.setProperty("opacity", "1", "important");
				container.style.setProperty("visibility", "visible", "important");
				container.style.setProperty("will-change", "auto", "important");
			}
		});

		document
			.querySelectorAll(".elementor-motion-effects-element")
			.forEach((el) => {
				el.style.setProperty("opacity", "1", "important");
				el.style.setProperty("transform", "none", "important");
				el.style.setProperty("will-change", "auto", "important");
			});
	});

	/* =====================================================
	   ✅ Force lazy images to load
	   ===================================================== */
	await page.evaluate(() => {
		document
			.querySelectorAll("img[data-lazy-src], img[data-src]")
			.forEach((img) => {
				const lazySrc =
					img.getAttribute("data-lazy-src") || img.getAttribute("data-src");
				if (lazySrc) {
					img.setAttribute("src", lazySrc);
					img.removeAttribute("data-lazy-src");
					img.removeAttribute("data-src");
				}
			});

		document.querySelectorAll("img.lazy, img.lazyload").forEach((img) => {
			img.classList.remove("lazy", "lazyload");
			img.classList.add("lazyloaded");
		});
	});

	/* =====================================================
	   ✅ VIMEO/YOUTUBE IFRAMES: Pre-load by scrolling to each
	   ===================================================== */
	console.log("Pre-loading video iframes (Vimeo/YouTube)...");

	const videoIframes = page.locator(
		'iframe[src*="vimeo"], iframe[src*="youtube"], .elementor-video-iframe',
	);
	const iframeCount = await videoIframes.count();

	if (iframeCount > 0) {
		console.log(`Found ${iframeCount} video iframes`);

		for (let i = 0; i < iframeCount; i++) {
			const iframe = videoIframes.nth(i);

			console.log(`Scrolling to iframe ${i + 1}/${iframeCount}`);

			await iframe.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
			await page.waitForTimeout(2000);
		}

		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(1000);
	}

	/* =====================================================
	   ✅ PRESTO PLAYER: Pre-load
	   ===================================================== */
	const prestoPlayers = page.locator(
		".presto-player__wrapper, .presto-player, .plyr",
	);
	const prestoCount = await prestoPlayers.count();

	if (prestoCount > 0) {
		console.log(`Found ${prestoCount} Presto Player instances`);

		for (let i = 0; i < prestoCount; i++) {
			await prestoPlayers
				.nth(i)
				.scrollIntoViewIfNeeded({ timeout: 5000 })
				.catch(() => {});
			await page.waitForTimeout(1500);
		}

		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(1000);
	}

	/* =====================================================
	   ✅ CHECK AND CLOSE CALENDLY POPUP (before main scroll)
	   ===================================================== */
	await page.evaluate(() => {
		const calendlyOverlay = document.querySelector(
			'.calendly-overlay, .calendly-popup, [class*="calendly-overlay"]',
		);
		if (calendlyOverlay) {
			calendlyOverlay.remove();
		}
		const badge = document.querySelector(".calendly-badge-widget");
		if (badge) {
			badge.remove();
		}
	});

	/* =====================================================
	   Main scroll to hydrate lazy content
	   ===================================================== */
	await page.evaluate(async (mobile) => {
		const delay = (ms) => new Promise((r) => setTimeout(r, ms));

		const getScrollHeight = () => {
			return Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight,
				document.body.offsetHeight,
				document.documentElement.offsetHeight,
				document.body.clientHeight,
				document.documentElement.clientHeight,
			);
		};

		let height = getScrollHeight();
		const scrollStep = mobile ? 100 : 200;
		const scrollDelay = mobile ? 350 : 250;

		for (let y = 0; y <= height; y += scrollStep) {
			window.scrollTo(0, y);
			await delay(scrollDelay);

			const newHeight = getScrollHeight();
			if (newHeight > height) {
				height = newHeight;
			}
		}

		window.scrollTo(0, height);
		await delay(mobile ? 3000 : 2000);

		for (let y = height; y >= 0; y -= scrollStep) {
			window.scrollTo(0, y);
			await delay(scrollDelay);
		}

		window.scrollTo(0, 0);
		await delay(1500);
	}, isMobile);

	/* =====================================================
	   ✅ CHECK AND CLOSE CALENDLY POPUP (after scroll)
	   Scrolling might have triggered the popup
	   ===================================================== */
	await page.evaluate(() => {
		// Remove any Calendly popups that appeared during scrolling
		document
			.querySelectorAll(
				'.calendly-overlay, .calendly-popup, [class*="calendly-overlay"], [class*="calendly-popup"]',
			)
			.forEach((el) => {
				el.remove();
			});

		// Remove Calendly badge/floating button
		document
			.querySelectorAll(".calendly-badge-widget, .calendly-badge-content")
			.forEach((el) => {
				el.remove();
			});

		// Remove any modal dialogs
		document
			.querySelectorAll('[role="dialog"][aria-modal="true"]')
			.forEach((el) => {
				el.remove();
			});
	});

	// Also try to close via Playwright locator (in case it's in an iframe)
	const calendlyCloseBtn = page
		.locator(
			'.calendly-popup-close, .calendly-close-overlay, [aria-label="Close"]',
		)
		.first();
	if (await calendlyCloseBtn.isVisible().catch(() => false)) {
		await calendlyCloseBtn.click({ force: true }).catch(() => {});
		await page.waitForTimeout(500);
	}

	/* =====================================================
	   ✅ SECOND PASS: Scroll to each video iframe again
	   ===================================================== */
	console.log("Second pass for video iframes...");

	const videoIframes2 = page.locator(
		'iframe[src*="vimeo"], iframe[src*="youtube"], .elementor-video-iframe',
	);
	const iframeCount2 = await videoIframes2.count();

	if (iframeCount2 > 0) {
		for (let i = 0; i < iframeCount2; i++) {
			const iframe = videoIframes2.nth(i);

			console.log(`Second pass: iframe ${i + 1}/${iframeCount2}`);

			await iframe.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
			await page.waitForTimeout(3000);
		}
	}

	/* =====================================================
	   ✅ Wait for all iframes to load
	   ===================================================== */
	console.log("Waiting for iframes to fully load...");

	await page.evaluate(async () => {
		const iframes = document.querySelectorAll(
			'iframe[src*="vimeo"], iframe[src*="youtube"], .elementor-video-iframe',
		);

		const loadPromises = Array.from(iframes).map((iframe) => {
			return new Promise((resolve) => {
				if (iframe.contentDocument?.readyState === "complete") {
					resolve();
					return;
				}

				iframe.addEventListener("load", resolve, { once: true });
				setTimeout(resolve, 10000);
			});
		});

		await Promise.all(loadPromises);
	});

	await page.waitForTimeout(isMobile ? 8000 : 6000);

	/* =====================================================
	   ✅ THIRD PASS: One more scroll to each iframe
	   ===================================================== */
	console.log("Third pass for stubborn iframes...");

	const videoIframes3 = page.locator(
		'iframe[src*="vimeo"], iframe[src*="youtube"], .elementor-video-iframe',
	);
	const iframeCount3 = await videoIframes3.count();

	if (iframeCount3 > 0) {
		for (let i = 0; i < iframeCount3; i++) {
			await videoIframes3
				.nth(i)
				.scrollIntoViewIfNeeded({ timeout: 3000 })
				.catch(() => {});
			await page.waitForTimeout(2000);
		}

		await page.waitForTimeout(5000);
	}

	/* =====================================================
	   ✅ Presto Player poster fix
	   ===================================================== */
	await page.evaluate(() => {
		document.querySelectorAll(".plyr__poster").forEach((poster) => {
			poster.style.setProperty("opacity", "1", "important");
			poster.style.setProperty("visibility", "visible", "important");
			poster.style.setProperty("display", "block", "important");
		});

		document
			.querySelectorAll(".presto-player__wrapper, .presto-player, .plyr")
			.forEach((el) => {
				el.style.setProperty("opacity", "1", "important");
				el.style.setProperty("visibility", "visible", "important");
			});
	});

	/* =====================================================
	   ✅ RE-APPLY motion effects fix
	   ===================================================== */
	await page.evaluate(() => {
		document.querySelectorAll('[data-settings*="motion_fx"]').forEach((el) => {
			el.style.setProperty("opacity", "1", "important");
			el.style.setProperty("visibility", "visible", "important");
			el.style.setProperty("will-change", "auto", "important");
			el.style.setProperty("transform", "none", "important");

			const container = el.querySelector(".elementor-widget-container");
			if (container) {
				container.style.setProperty("opacity", "1", "important");
				container.style.setProperty("visibility", "visible", "important");
				container.style.setProperty("will-change", "auto", "important");
				container.style.setProperty("transform", "none", "important");
			}
		});

		document
			.querySelectorAll(".elementor-motion-effects-element")
			.forEach((el) => {
				el.style.setProperty("opacity", "1", "important");
				el.style.setProperty("transform", "none", "important");
				el.style.setProperty("will-change", "auto", "important");
			});

		document.querySelectorAll('[style*="opacity"]').forEach((el) => {
			const style = window.getComputedStyle(el);
			const opacity = parseFloat(style.opacity);
			if (opacity < 1) {
				el.style.setProperty("opacity", "1", "important");
			}
		});
	});

	// Extra settle time for mobile
	if (isMobile) {
		await page.waitForTimeout(3000);
	}

	// Calendly iframe (only for pages that should have it embedded)
	const calendlyIframe = page.locator('iframe[src*="calendly"]');
	if (await calendlyIframe.count()) {
		await calendlyIframe
			.first()
			.scrollIntoViewIfNeeded()
			.catch(() => {});
		await page.waitForTimeout(isMobile ? 3000 : 2000);
	}

	/* =====================================================
	   ✅ PayPal iframe handler
	   ===================================================== */
	const paypalIframe = page.locator('iframe[src*="paypal.com/giving"]');
	const paypalIframeCount = await paypalIframe.count();

	if (paypalIframeCount > 0) {
		console.log(`PayPal iframe detected`);

		await paypalIframe
			.first()
			.waitFor({ state: "attached", timeout: 20000 })
			.catch(() => {});

		if (isMobile) {
			await page.addStyleTag({
				content: `
					iframe[src*="paypal.com/giving"] {
						min-width: 300px !important;
						min-height: 400px !important;
						width: 100% !important;
						display: block !important;
						visibility: visible !important;
						opacity: 1 !important;
					}
				`,
			});
		}

		for (let i = 0; i < (isMobile ? 3 : 2); i++) {
			await page.evaluate(() => {
				const iframe = document.querySelector(
					'iframe[src*="paypal.com/giving"]',
				);
				if (iframe) {
					iframe.scrollIntoView({ behavior: "instant", block: "center" });
				}
			});

			await paypalIframe
				.first()
				.scrollIntoViewIfNeeded({ timeout: 5000 })
				.catch(() => {});
			await page.waitForTimeout(isMobile ? 3000 : 2000);
		}

		await page.waitForTimeout(isMobile ? 5000 : 3000);
		await paypalIframe
			.first()
			.waitFor({ state: "visible", timeout: 10000 })
			.catch(() => {});
	}

	// Wait for network to settle
	await Promise.race([
		page.waitForLoadState("networkidle", { timeout: isMobile ? 25000 : 20000 }),
		page.waitForTimeout(isMobile ? 25000 : 20000),
	]).catch(() => {
		console.log("Network idle timeout - proceeding");
	});

	/* =====================================================
	   ✅ FINAL PASS: Scroll to all video elements one more time
	   ===================================================== */
	console.log("Final pass for all video elements...");

	const allVideoElements = page.locator(
		'iframe[src*="vimeo"], iframe[src*="youtube"], .elementor-video-iframe, ' +
			".presto-player__wrapper, .presto-player, .plyr, .elementor-widget-video",
	);
	const totalVideoCount = await allVideoElements.count();

	if (totalVideoCount > 0) {
		console.log(`Final pass: ${totalVideoCount} video elements`);

		for (let i = 0; i < totalVideoCount; i++) {
			await allVideoElements
				.nth(i)
				.scrollIntoViewIfNeeded({ timeout: 3000 })
				.catch(() => {});
			await page.waitForTimeout(1500);
		}

		await page.waitForTimeout(isMobile ? 5000 : 3000);
	}

	/* =====================================================
	   ✅ FINAL: Remove any Calendly popups before screenshot
	   ===================================================== */
	await page.evaluate(() => {
		// Remove ALL Calendly-related popups and overlays
		const calendlySelectors = [
			".calendly-overlay",
			".calendly-popup",
			".calendly-popup-content",
			".calendly-badge-widget",
			".calendly-badge-content",
			'[class*="calendly-overlay"]',
			'[class*="calendly-popup"]',
			'[class*="calendly-badge"]',
			'[role="dialog"][aria-modal="true"]',
		];

		calendlySelectors.forEach((selector) => {
			document.querySelectorAll(selector).forEach((el) => {
				el.remove();
			});
		});
	});

	// Try closing via button click as backup
	const closeButtons = page.locator(
		'.calendly-popup-close, [aria-label="Close"], [aria-label="close"]',
	);
	const closeCount = await closeButtons.count();
	for (let i = 0; i < closeCount; i++) {
		await closeButtons
			.nth(i)
			.click({ force: true })
			.catch(() => {});
	}

	// Scroll back to top
	await page.evaluate(() => {
		window.scrollTo(0, 0);
	});

	// Final settle
	await page.waitForTimeout(isMobile ? 6000 : 4000);

	/* =====================================================
	   ✅ ABSOLUTE FINAL: One more Calendly cleanup
	   ===================================================== */
	await page.evaluate(() => {
		// Nuclear option - remove anything that looks like a popup overlay
		document
			.querySelectorAll(
				'.calendly-overlay, .calendly-popup, [class*="calendly-overlay"], [class*="calendly-popup"], .calendly-badge-widget',
			)
			.forEach((el) => {
				el.remove();
			});

		// Also hide via CSS in case it re-appears
		const style = document.createElement("style");
		style.textContent = `
			.calendly-overlay, .calendly-popup, .calendly-badge-widget,
			[class*="calendly-overlay"], [class*="calendly-popup"], [class*="calendly-badge"] {
				display: none !important;
				visibility: hidden !important;
				opacity: 0 !important;
			}
		`;
		document.head.appendChild(style);
	});

	/* =====================================================
	   ✅ FINAL: Force layout recalculation
	   ===================================================== */
	await page.evaluate(() => {
		document.body.offsetHeight;
		document.documentElement.offsetHeight;

		document
			.querySelectorAll(
				'[data-settings*="motion_fx"], .elementor-motion-effects-element, [style*="opacity"]',
			)
			.forEach((el) => {
				el.style.setProperty("opacity", "1", "important");
				el.style.setProperty("visibility", "visible", "important");
				el.style.setProperty("will-change", "auto", "important");
				el.style.setProperty("transform", "none", "important");
			});

		window.scrollTo(0, 0);
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	});

	await page.waitForTimeout(1000);
}

const pagesToTest = [
	{ path: "/", name: "01_Home" },
	{ path: "/about/", name: "02_About_Us" },
	{ path: "/sports/", name: "03_Sports_Programs" },
	{ path: "/business/", name: "04_Corporate_Programs" },
	{ path: "/4-the-boys/", name: "05_Scholarship" },
	{ path: "/book-now/", name: "06_Contact_Us" },
	{ path: "/forsportsandeducation/", name: "07_Non_Profit" },
	{ path: "/my-courses/", name: "08_Login_Page" },
	{ path: "/my-courses/lost-password/", name: "09_Password_Reset" },
	{ path: "/tlw/", name: "10_The_Little_Warriors" },
	{ path: "/membership/front-of-line-membership/", name: "11_Membership_Flow" },
	{ path: "/purchase/", name: "12_Purchase_Flow" },
];

test.describe("I Got Mind – Public Visual Audit (Screenshots ALWAYS attached)", () => {
	for (const pageInfo of pagesToTest) {
		test(`Visual (3P widgets captured): ${pageInfo.name}`, async ({
			page,
		}, testInfo) => {
			const isMobile = !testInfo.project.name.includes("Desktop");

			console.log(`\n========================================`);
			console.log(`Running: ${testInfo.project.name}`);
			console.log(`Page: ${pageInfo.name}`);
			console.log(`Mobile/Tablet: ${isMobile}`);
			console.log(`========================================\n`);

			await page.goto(pageInfo.path, {
				waitUntil: "load",
				timeout: 60000,
			});

			await page.waitForTimeout(isMobile ? 5000 : 3000);

			await preparePageForScreenshot(page, isMobile);

			let screenshot;

			if (isMobile) {
				screenshot = await page.screenshot({
					fullPage: true,
					timeout: 120000,
					scale: "css",
				});
			} else {
				screenshot = await page.screenshot({
					fullPage: true,
					timeout: 120000,
				});
			}

			console.log(
				`Screenshot captured for ${pageInfo.name} on ${testInfo.project.name}`,
			);

			await testInfo.attach(`Full Page – ${pageInfo.name}`, {
				body: screenshot,
				contentType: "image/png",
			});

			expect(screenshot).toMatchSnapshot({
				maxDiffPixelRatio: 0.02,
			});
		});
	}
});
