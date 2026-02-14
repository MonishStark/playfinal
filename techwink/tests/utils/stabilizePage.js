/** @format */

const NO_SCROLL_PAGES = [
	"/learning-management-systems/", // LMS breaks on scroll
];
const PARTNERS_PATH = "/partners/";
const CAREERS_PATH = "/careers/";
const FONTS_READY_TIMEOUT_MS = 5000;
const DEFAULT_FINAL_NETWORK_IDLE_TIMEOUT_MS = 5000;
const DEFAULT_FINAL_WAIT_MS = 800;
const EXTRA_DEEP_HYDRATION_PATHS = [
	"/services/",
	CAREERS_PATH,
	"/contact/",
	"/services/chatgpt-integration-services/",
	"/services/nft-marketplace-development/",
	"/services/startup-product-development/",
];
const IMAGE_LOAD_TIMEOUT_MS = 8000;
const PARTNER_LOGO_WARMUP_DELAY_MS = 80;
const CAREERS_ANCHOR_WARMUP_DELAY_MS = 60;
const DEEP_HYDRATION_NETWORK_IDLE_TIMEOUT_MS = 15000;
const EXTRA_DEEP_HYDRATION_NETWORK_IDLE_TIMEOUT_MS = 22000;
const DEEP_HYDRATION_POST_WAIT_MS = 1000;
const EXTRA_DEEP_HYDRATION_POST_WAIT_MS = 1600;
const DEEP_HYDRATION_FINAL_WAIT_MS = 1400;
const EXTRA_DEEP_HYDRATION_FINAL_WAIT_MS = 2000;
const HYDRATE_IMAGE_CONCURRENCY = 8;
const HEADER_MENU_PANEL_SELECTOR =
	'.elementor-nav-menu--dropdown, .elementor-nav-menu__container, [class*="mega-menu"], [class*="sub-menu"]';
const HEADER_MENU_MAX_TOP_PX = 260;
const HEADER_MENU_MIN_WIDTH_PX = 180;
const HEADER_MENU_MIN_HEIGHT_PX = 40;
const HEADER_MOUSE_SAFE_X_PX = 24;
const HEADER_MOUSE_SAFE_MIN_Y_PX = 200;
const HEADER_MOUSE_SAFE_MAX_Y_PX = 500;
const HEADER_MOUSE_VIEWPORT_FALLBACK_HEIGHT_PX = 800;
const HEADER_MOUSE_BOTTOM_OFFSET_PX = 120;
const LAZY_ATTR_CANDIDATES = [
	"data-src",
	"data-lazy",
	"data-lazy-src",
	"data-original",
];
const LAZY_SRCSET_ATTR_CANDIDATES = ["data-srcset", "data-lazy-srcset"];
const VISIBILITY_FIX_SELECTOR =
	'[style*="opacity"], [style*="visibility"], .elementor-invisible, .wow, [data-aos], [data-animate], [data-settings*="animation"], [data-settings*="_animation"], [class*="fade"], [class*="slide"], [class*="zoom"], .animated';
const PARTNER_KEYWORDS = [
	"cisco",
	"aws",
	"google cloud",
	"red hat",
	"openstack",
	"lenovo",
	"dell",
	"netapp",
	"servicenow",
	"service now",
	"ethereum",
	"polygon",
	"paypal",
	"coinbase",
	"cardano",
	"binance",
	"metamask",
	"stripe",
	"solana",
];
const CAREERS_WARMUP_ANCHORS = [
	"h1",
	"h2",
	"form",
	'input[type="file"]',
	'button[type="submit"]',
];

function buildPartnerAltSelectors(partnerKeywords) {
	return partnerKeywords
		.map((keyword) => `img[alt*="${keyword}" i]`)
		.join(",\n          ");
}

function warnNonFatal(context, error) {
	const message = error?.message || String(error);
	console.warn(`[stabilizePage] ${context}: ${message}`);
}

function hydrateLazyImageElement(
	img,
	{ lazyAttrCandidates, lazySrcsetAttrCandidates },
) {
	if (!img) return;

	if (img.loading === "lazy") img.loading = "eager";

	const lazySrc = lazyAttrCandidates
		.map((attr) => String(img.getAttribute(attr) || "").trim())
		.find(Boolean);
	if (lazySrc && img.getAttribute("src") !== lazySrc) {
		img.setAttribute("src", lazySrc);
	}

	const lazySrcset = lazySrcsetAttrCandidates
		.map((attr) => String(img.getAttribute(attr) || "").trim())
		.find(Boolean);
	if (lazySrcset && img.getAttribute("srcset") !== lazySrcset) {
		img.setAttribute("srcset", lazySrcset);
	}
}

function forceElementsVisible(selector) {
	for (const el of Array.from(document.querySelectorAll(selector))) {
		const style = window.getComputedStyle(el);
		if (Number.parseFloat(style.opacity || "1") < 1) {
			el.style.setProperty("opacity", "1", "important");
		}
		if (style.visibility === "hidden") {
			el.style.setProperty("visibility", "visible", "important");
		}
	}
}

async function hydrateLazyImages(page) {
	const images = page.locator("img");
	const count = await images.count();
	const concurrency = HYDRATE_IMAGE_CONCURRENCY;

	for (let start = 0; start < count; start += concurrency) {
		const end = Math.min(start + concurrency, count);
		const hydrationTasks = [];

		for (let i = start; i < end; i++) {
			hydrationTasks.push(
				images.nth(i).evaluate(hydrateLazyImageElement, {
					lazyAttrCandidates: LAZY_ATTR_CANDIDATES,
					lazySrcsetAttrCandidates: LAZY_SRCSET_ATTR_CANDIDATES,
				}),
			);
		}

		await Promise.allSettled(hydrationTasks);
	}
}

function isNoScrollPath(path) {
	return NO_SCROLL_PAGES.some((p) => path.startsWith(p));
}

function isExtraDeepHydrationPath(path) {
	return EXTRA_DEEP_HYDRATION_PATHS.some((p) => path.startsWith(p));
}

async function collapseHeaderDropdowns(page) {
	try {
		await page.addStyleTag({
			content: `
        /* Hide common nav dropdown/mega-menu surfaces (including detached overlays) */
				:is(header, .elementor-location-header, .main-header, nav) :is(.sub-menu, .mega-menu, .mega-sub-menu),
        :is(header, .elementor-location-header, .main-header) .elementor-nav-menu--dropdown,
        header .elementor-nav-menu__container,
        [class*="mega-menu"],
        [class*="sub-menu"] {
          pointer-events: none !important;
        }
      `,
		});

		await page.evaluate(
			({
				headerMenuPanelSelector,
				headerMenuMaxTopPx,
				headerMenuMinWidthPx,
				headerMenuMinHeightPx,
			}) => {
				const maybeMenuPanels = Array.from(
					document.querySelectorAll(headerMenuPanelSelector),
				);

				for (const panel of maybeMenuPanels) {
					const rect = panel.getBoundingClientRect();
					const nearTop = rect.top <= headerMenuMaxTopPx;
					const sizeable =
						rect.width >= headerMenuMinWidthPx ||
						rect.height >= headerMenuMinHeightPx;
					const hasMenuRole =
						panel.matches('[role="menu"], [role="menubar"]') ||
						panel.querySelector('[role="menuitem"], a, button');

					if (nearTop && sizeable && hasMenuRole) {
						panel.style.setProperty("display", "none", "important");
						panel.style.setProperty("visibility", "hidden", "important");
						panel.style.setProperty("opacity", "0", "important");
						panel.style.setProperty("max-height", "0", "important");
						panel.style.setProperty("overflow", "hidden", "important");
					}
				}

				document
					.querySelectorAll(
						':is(header, nav, .elementor-location-header) [aria-expanded="true"]',
					)
					.forEach((el) => el.setAttribute("aria-expanded", "false"));

				document
					.querySelectorAll(
						":is(header, nav) :is(.open, .show, .active, .current-menu-ancestor, .current_page_ancestor)",
					)
					.forEach((el) => {
						el.classList.remove(
							"open",
							"show",
							"active",
							"current-menu-ancestor",
							"current_page_ancestor",
						);
					});
			},
			{
				headerMenuPanelSelector: HEADER_MENU_PANEL_SELECTOR,
				headerMenuMaxTopPx: HEADER_MENU_MAX_TOP_PX,
				headerMenuMinWidthPx: HEADER_MENU_MIN_WIDTH_PX,
				headerMenuMinHeightPx: HEADER_MENU_MIN_HEIGHT_PX,
			},
		);

		const viewport = page.viewportSize();
		const safeY = Math.min(
			HEADER_MOUSE_SAFE_MAX_Y_PX,
			Math.max(
				HEADER_MOUSE_SAFE_MIN_Y_PX,
				(viewport?.height || HEADER_MOUSE_VIEWPORT_FALLBACK_HEIGHT_PX) -
					HEADER_MOUSE_BOTTOM_OFFSET_PX,
			),
		);
		await page.mouse.move(HEADER_MOUSE_SAFE_X_PX, safeY);
	} catch (e) {
		warnNonFatal("collapse header dropdowns", e);
	}
}

async function stabilizePartnersPage(page) {
	try {
		const partnerAltSelectors = buildPartnerAltSelectors(PARTNER_KEYWORDS);

		await page.addStyleTag({
			content: `
          /* Keep partner logos fully visible for deterministic snapshots */
          .elementor-widget-image img,
          .elementor-image img,
					${partnerAltSelectors} {
            opacity: 1 !important;
            visibility: visible !important;
            filter: none !important;
            transform: none !important;
          }
        `,
		});

		await page.evaluate(
			async ({
				lazyAttrCandidates,
				partnerKeywords,
				partnerLogoWarmupDelayMs,
			}) => {
				const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

				const logoImages = Array.from(document.querySelectorAll("img"));
				for (const img of logoImages) {
					const alt = (img.getAttribute("alt") || "").toLowerCase();
					const src = (img.getAttribute("src") || "").toLowerCase();
					const lazyAttrText = lazyAttrCandidates
						.map((attr) => String(img.getAttribute(attr) || ""))
						.join(" ")
						.toLowerCase();

					const searchableText = `${alt} ${src} ${lazyAttrText}`;
					const isPartnerLogo =
						partnerKeywords.some((kw) => searchableText.includes(kw)) ||
						searchableText.includes("partner");

					if (!isPartnerLogo) continue;

					img.loading = "eager";
					img.style.setProperty("opacity", "1", "important");
					img.style.setProperty("visibility", "visible", "important");
					img.style.setProperty("filter", "none", "important");
					img.style.setProperty("transform", "none", "important");

					img.scrollIntoView({ behavior: "instant", block: "center" });
					await delay(partnerLogoWarmupDelayMs);
				}

				window.scrollTo(0, 0);
			},
			{
				lazyAttrCandidates: LAZY_ATTR_CANDIDATES,
				partnerKeywords: PARTNER_KEYWORDS,
				partnerLogoWarmupDelayMs: PARTNER_LOGO_WARMUP_DELAY_MS,
			},
		);
	} catch (e) {
		warnNonFatal("partners stabilization", e);
	}
}

async function stabilizeCareersPage(page) {
	try {
		await page.addStyleTag({
			content: `
          /* Force all career blocks/text/cards to final rendered state */
          .elementor-section,
          .elementor-column,
          .elementor-widget,
          .elementor-widget-container,
          .elementor-top-column,
          .career-card,
          .careers,
          .careers * {
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            filter: none !important;
          }

          /* Elementor animation classes */
          .elementor-invisible,
          .elementor-animated,
          [data-settings*="_animation"],
          [data-settings*="animation"],
          [style*="opacity: 0"],
          [style*="opacity:0"] {
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            filter: none !important;
          }
        `,
		});
		await page.evaluate(forceElementsVisible, VISIBILITY_FIX_SELECTOR);

		await page.evaluate(
			async ({ anchors, careersAnchorWarmupDelayMs }) => {
				const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

				// Warm up the sections that are often animation-triggered on this page.
				for (const node of Array.from(document.querySelectorAll(anchors.join(",")))) {
					node.scrollIntoView({ behavior: "instant", block: "center" });
					await delay(careersAnchorWarmupDelayMs);
				}

				window.scrollTo(0, 0);
			},
			{
				anchors: CAREERS_WARMUP_ANCHORS,
				careersAnchorWarmupDelayMs: CAREERS_ANCHOR_WARMUP_DELAY_MS,
			},
		);
	} catch (e) {
		warnNonFatal("careers stabilization", e);
	}
}

async function stabilizePage(page, path = "") {
	const skipScroll = isNoScrollPath(path);
	const needsDeepHydration = !skipScroll;
	const isExtraDeepHydration = isExtraDeepHydrationPath(path);
	let didDeepScrollPass = false;

	// 1️⃣ DOM ready
	await page.waitForLoadState("domcontentloaded");

	// 2️⃣ Fonts (best effort, never fatal)
	try {
		await page.waitForFunction(
			() => document.fonts && document.fonts.status === "loaded",
			{ timeout: FONTS_READY_TIMEOUT_MS },
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
				/* Reveal common animation-gated elements so disabling animation does not keep them hidden */
				.wow,
				.elementor-invisible,
				[data-aos],
				[data-animate],
				[class*="wow"],
				[class*="fadeIn"],
				[class*="slideIn"],
				[class*="zoomIn"],
				.aos-init,
				.aos-animate,
				.animated,
				.reveal,
				.revealed {
					opacity: 1 !important;
					visibility: visible !important;
					transform: none !important;
				}
        html { scroll-behavior: auto !important; }
      `;
			document.head.appendChild(style);
		});
	} catch (e) {
		warnNonFatal("animation stabilization", e);
	}

	// 3.1️⃣ Ensure header dropdown/mega-menu overlays are never captured.
	await collapseHeaderDropdowns(page);

	// 4️⃣ Force eager images (safe per-image)
	await hydrateLazyImages(page);

	// 4.1️⃣ Partners page: force all partner logos to visible/eager and warm them up.
	if (path.startsWith(PARTNERS_PATH)) {
		await stabilizePartnersPage(page);
	}

	// 4.2️⃣ Careers page: reveal animation-gated cards/form blocks that can stay faded.
	if (path.startsWith(CAREERS_PATH)) {
		await stabilizeCareersPage(page);
	}

	// 4.3️⃣ Deep hydration pass for high-scroll / lazy-heavy pages.
	if (needsDeepHydration) {
		try {
			await page.addStyleTag({
				content: `
          /* Keep delayed/animated blocks in final state for full-page captures */
          .elementor-section,
          .elementor-column,
          .elementor-widget,
          .elementor-widget-wrap,
          .elementor-widget-container,
          .service-box,
          .service-card,
          .career-card,
          form,
          form * {
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            filter: none !important;
            will-change: auto !important;
          }

          [style*="opacity: 0"],
          [style*="opacity:0"],
          [data-settings*="animation"],
          [data-settings*="_animation"] {
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
          }
        `,
			});

			await page.evaluate(forceElementsVisible, VISIBILITY_FIX_SELECTOR);

			await page.evaluate(async (isExtraDeep) => {
				const SCROLL_STEP_RATIO = isExtraDeep ? 0.5 : 0.6;
				const SCROLL_DELAY_MS = isExtraDeep ? 300 : 220;
				const ANCHOR_LIMIT = isExtraDeep ? 320 : 220;
				const ANCHOR_DELAY_MS = isExtraDeep ? 95 : 70;

				const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

				for (const iframe of Array.from(document.querySelectorAll("iframe"))) {
					iframe.setAttribute("loading", "eager");
				}

				const getHeight = () =>
					Math.max(
						document.body.scrollHeight,
						document.documentElement.scrollHeight,
						document.body.offsetHeight,
						document.documentElement.offsetHeight,
					);

				const viewport = Math.max(window.innerHeight || 800, 800);
				const step = Math.max(180, Math.floor(viewport * SCROLL_STEP_RATIO));
				let height = getHeight();

				for (let y = 0; y <= height; y += step) {
					window.scrollTo(0, y);
					window.dispatchEvent(new Event("scroll"));
					window.dispatchEvent(new Event("resize"));
					await delay(SCROLL_DELAY_MS);

					const newHeight = getHeight();
					if (newHeight > height) height = newHeight;
				}

				const anchors = Array.from(
					document.querySelectorAll(
						"section, .elementor-section, .elementor-widget, .elementor-widget-container, form, .service-box, .service-card, .career-card",
					),
				)
					.filter((el) => el.getBoundingClientRect().width > 10)
					.slice(0, ANCHOR_LIMIT);

				for (const el of anchors) {
					el.scrollIntoView({ behavior: "instant", block: "center" });
					window.dispatchEvent(new Event("scroll"));
					await delay(ANCHOR_DELAY_MS);
				}

				window.scrollTo(0, 0);
				window.dispatchEvent(new Event("scroll"));
			}, isExtraDeepHydration);
			didDeepScrollPass = true;

			await hydrateLazyImages(page);

			await page
				.waitForFunction(
					() => {
						const nodes = Array.from(
							document.querySelectorAll(
								".elementor-section, .elementor-widget, .elementor-widget-container, .service-box, .service-card, .career-card, form",
							),
						).filter((el) => el.getBoundingClientRect().width > 10);

						if (nodes.length === 0) return true;

						return nodes.every((el) => {
							const style = window.getComputedStyle(el);
							const opacity = Number.parseFloat(style.opacity || "1");
							return style.visibility !== "hidden" && opacity > 0.01;
						});
					},
					{ timeout: 15000 },
				)
				.catch((e) =>
					warnNonFatal("deep hydration element visibility check", e),
				);

			await page
				.waitForFunction(
					() => {
						const visibleImgs = Array.from(
							document.querySelectorAll("img"),
						).filter((img) => img.clientWidth > 1 && img.clientHeight > 1);
						if (visibleImgs.length === 0) return true;
						return visibleImgs.every((img) => img.complete);
					},
					{ timeout: 12000 },
				)
				.catch((e) => warnNonFatal("deep hydration image completion check", e));

			try {
				await page.waitForLoadState("networkidle", {
					timeout: isExtraDeepHydration
						? EXTRA_DEEP_HYDRATION_NETWORK_IDLE_TIMEOUT_MS
						: DEEP_HYDRATION_NETWORK_IDLE_TIMEOUT_MS,
				});
			} catch (e) {
				warnNonFatal("deep hydration network idle", e);
			}
			await page.waitForTimeout(
				isExtraDeepHydration
					? EXTRA_DEEP_HYDRATION_POST_WAIT_MS
					: DEEP_HYDRATION_POST_WAIT_MS,
			);
		} catch (e) {
			warnNonFatal("deep hydration block", e);
		}
	}

	// 5️⃣ Initial settle
	await page.waitForTimeout(800);

	// 🚫 Skip scroll for unstable pages
	if (skipScroll) {
		await page.waitForTimeout(600);
		return;
	}

	// 6️⃣ Navigation-safe scroll
	let navigated = false;
	const onNav = () => (navigated = true);
	page.on("framenavigated", onNav);

	try {
		const height = await page.evaluate(() => document.body.scrollHeight);
		const step = needsDeepHydration ? (isExtraDeepHydration ? 200 : 240) : 350;
		const delay = needsDeepHydration ? (isExtraDeepHydration ? 260 : 210) : 160;

		if (!didDeepScrollPass) {
			for (let y = 0; y <= height; y += step) {
				if (navigated) break;
				await page.evaluate((yy) => window.scrollTo(0, yy), y);
				await page.waitForTimeout(delay);
			}
		}

		if (needsDeepHydration && !navigated) {
			for (let y = height; y >= 0; y -= step) {
				if (navigated) break;
				await page.evaluate((yy) => window.scrollTo(0, yy), y);
				await page.waitForTimeout(delay);
			}
		}
	} catch (e) {
		warnNonFatal("navigation-safe scroll", e);
	}

	page.off("framenavigated", onNav);

	// 7️⃣ Back to top
	try {
		await page.evaluate(() => window.scrollTo(0, 0));
	} catch (e) {
		warnNonFatal("scroll reset to top", e);
	}

	// 7.1️⃣ Re-collapse header menus (some themes reopen on hover after scroll-to-top).
	await collapseHeaderDropdowns(page);

	// 8️⃣ Wait for visible images to fully load/decode
	try {
		await page.evaluate(
			async ({ imageLoadTimeoutMs }) => {
				const waitImageSettled = (img, timeoutMs) =>
					new Promise((resolve) => {
						if (img.complete && img.naturalWidth > 0) {
							resolve();
							return;
						}

						let settled = false;
						const done = () => {
							if (settled) return;
							settled = true;
							clearTimeout(timeoutId);
							img.removeEventListener("load", done);
							img.removeEventListener("error", done);
							resolve();
						};

						const timeoutId = setTimeout(done, timeoutMs);
						img.addEventListener("load", done, { once: true });
						img.addEventListener("error", done, { once: true });

						if (img.complete) done();
					});

				const imgs = Array.from(document.querySelectorAll("img")).filter(
					(img) => img.clientWidth > 1 && img.clientHeight > 1,
				);

				await Promise.all(
					imgs.map(async (img) => {
						await waitImageSettled(img, imageLoadTimeoutMs);

						if (img.naturalWidth > 0 && typeof img.decode === "function") {
							await img.decode().catch((e) => {
								console.warn(
									`[stabilizePage] image decode failed for ${img.src || "(unknown src)"}: ${e?.message || e}`,
								);
							});
						}
					}),
				);
			},
			{
				imageLoadTimeoutMs: IMAGE_LOAD_TIMEOUT_MS,
			},
		);
	} catch (e) {
		warnNonFatal("image decode settle", e);
	}

	// 9️⃣ Final settle
	let networkIdleTimeout = DEFAULT_FINAL_NETWORK_IDLE_TIMEOUT_MS;
	let finalWait = DEFAULT_FINAL_WAIT_MS;

	if (needsDeepHydration) {
		if (isExtraDeepHydration) {
			networkIdleTimeout = EXTRA_DEEP_HYDRATION_NETWORK_IDLE_TIMEOUT_MS;
			finalWait = EXTRA_DEEP_HYDRATION_FINAL_WAIT_MS;
		} else {
			networkIdleTimeout = DEEP_HYDRATION_NETWORK_IDLE_TIMEOUT_MS;
			finalWait = DEEP_HYDRATION_FINAL_WAIT_MS;
		}
	}

	try {
		await page.waitForLoadState("networkidle", {
			timeout: networkIdleTimeout,
		});
	} catch (e) {
		warnNonFatal("final network idle", e);
	}
	await page.waitForTimeout(finalWait);

	// 🔟 Freeze height (stitch-safe)
	try {
		await page.evaluate(() => {
			const h = document.documentElement.scrollHeight;
			document.documentElement.style.height = h + "px";
			document.body.style.height = h + "px";
		});
	} catch (e) {
		warnNonFatal("freeze document height", e);
	}
}

module.exports = stabilizePage;
