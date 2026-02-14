/** @format */

const NO_SCROLL_PAGES = [
	"/learning-management-systems/", // LMS breaks on scroll
];
const PARTNERS_PATH = "/partners/";
const CAREERS_PATH = "/careers/";
const EXTRA_DEEP_HYDRATION_PATHS = [
	"/services/",
	"/careers/",
	"/contact/",
	"/services/chatgpt-integration-services/",
	"/services/nft-marketplace-development/",
	"/services/startup-product-development/",
];
const IMAGE_LOAD_TIMEOUT_MS = 8000;
const LAZY_ATTR_CANDIDATES = [
	"data-src",
	"data-lazy",
	"data-lazy-src",
	"data-original",
	"data-bg",
];
const LAZY_SRCSET_ATTR_CANDIDATES = ["data-srcset", "data-lazy-srcset"];

function isNoScrollPath(path) {
	return NO_SCROLL_PAGES.some((p) => path.startsWith(p));
}

function isExtraDeepHydrationPath(path) {
	return EXTRA_DEEP_HYDRATION_PATHS.some((p) => path.startsWith(p));
}

async function stabilizePage(page, path = "") {
	const skipScroll = isNoScrollPath(path);
	const needsDeepHydration = !skipScroll;
	const isExtraDeepHydration = isExtraDeepHydrationPath(path);

	// 1️⃣ DOM ready
	await page.waitForLoadState("domcontentloaded");

	// 2️⃣ Fonts (best effort, never fatal)
	try {
		await page.waitForFunction(
			() => document.fonts && document.fonts.status === "loaded",
			{ timeout: 5000 },
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
				[data-aos],
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
	} catch {}

	// 4️⃣ Force eager images (safe per-image)
	const images = page.locator("img");
	const count = await images.count();

	for (let i = 0; i < count; i++) {
		try {
			await images.nth(i).evaluate((img) => {
				if (img.loading === "lazy") img.loading = "eager";

				const lazySrcCandidates = [
					img.dataset?.src,
					img.dataset?.lazy,
					img.dataset?.lazySrc,
					img.dataset?.original,
					img.getAttribute("data-src"),
					img.getAttribute("data-lazy"),
					img.getAttribute("data-lazy-src"),
					img.getAttribute("data-original"),
					img.getAttribute("data-bg"),
				];

				for (const src of lazySrcCandidates) {
					const value = String(src || "").trim();
					if (!value) continue;
					if (!img.getAttribute("src") || img.getAttribute("src") === "") {
						img.setAttribute("src", value);
					}
					break;
				}

				const lazySrcsetCandidates = [
					img.dataset?.srcset,
					img.dataset?.lazySrcset,
					img.getAttribute("data-srcset"),
					img.getAttribute("data-lazy-srcset"),
				];

				for (const srcset of lazySrcsetCandidates) {
					const value = String(srcset || "").trim();
					if (!value) continue;
					if (
						!img.getAttribute("srcset") ||
						img.getAttribute("srcset") === ""
					) {
						img.setAttribute("srcset", value);
					}
					break;
				}
			});
		} catch {}
	}

	// 4.1️⃣ Partners page: force all partner logos to visible/eager and warm them up.
	if (path.startsWith(PARTNERS_PATH)) {
		try {
			await page.addStyleTag({
				content: `
          /* Keep partner logos fully visible for deterministic snapshots */
          .elementor-widget-image img,
          .elementor-image img,
          img[alt*="Dell"],
          img[alt*="NetApp"],
          img[alt*="ServiceNow"],
          img[alt*="Service Now"],
          img[alt*="Cisco"],
          img[alt*="AWS"],
          img[alt*="Google Cloud"],
          img[alt*="Red Hat"],
          img[alt*="OpenStack"],
          img[alt*="Lenovo"],
          img[alt*="Ethereum"],
          img[alt*="Polygon"],
          img[alt*="Paypal"],
          img[alt*="Coinbase"],
          img[alt*="Cardano"],
          img[alt*="Binance"],
          img[alt*="Metamask"],
          img[alt*="Stripe"],
          img[alt*="Solana"] {
            opacity: 1 !important;
            visibility: visible !important;
            filter: none !important;
            transform: none !important;
          }
        `,
			});

			await page.evaluate(async () => {
				const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

				const logoImages = Array.from(document.querySelectorAll("img"));
				for (const img of logoImages) {
					const alt = (img.getAttribute("alt") || "").toLowerCase();
					const src = (img.getAttribute("src") || "").toLowerCase();
					const dataSrc = (
						img.getAttribute("data-src") ||
						img.getAttribute("data-lazy-src") ||
						img.getAttribute("data-original") ||
						""
					).toLowerCase();

					const isPartnerLogo =
						alt.includes("cisco") ||
						alt.includes("aws") ||
						alt.includes("google cloud") ||
						alt.includes("red hat") ||
						alt.includes("openstack") ||
						alt.includes("lenovo") ||
						alt.includes("dell") ||
						alt.includes("netapp") ||
						alt.includes("service") ||
						alt.includes("ethereum") ||
						alt.includes("polygon") ||
						alt.includes("paypal") ||
						alt.includes("coinbase") ||
						alt.includes("cardano") ||
						alt.includes("binance") ||
						alt.includes("metamask") ||
						alt.includes("stripe") ||
						alt.includes("solana") ||
						src.includes("partner") ||
						src.includes("servicenow") ||
						dataSrc.includes("partner") ||
						dataSrc.includes("servicenow");

					if (!isPartnerLogo) continue;

					const lazySrc =
						img.dataset?.src ||
						img.dataset?.lazySrc ||
						img.dataset?.original ||
						img.getAttribute("data-src") ||
						img.getAttribute("data-lazy-src") ||
						img.getAttribute("data-original");

					if (lazySrc && !img.getAttribute("src")) {
						img.setAttribute("src", lazySrc);
					}

					img.loading = "eager";
					img.style.setProperty("opacity", "1", "important");
					img.style.setProperty("visibility", "visible", "important");
					img.style.setProperty("filter", "none", "important");
					img.style.setProperty("transform", "none", "important");

					img.scrollIntoView({ behavior: "instant", block: "center" });
					await delay(80);
				}

				window.scrollTo(0, 0);
			});
		} catch {}
	}

	// 4.2️⃣ Careers page: reveal animation-gated cards/form blocks that can stay faded.
	if (path.startsWith(CAREERS_PATH)) {
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

			await page.evaluate(async () => {
				const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

				// Force lazy assets and animation styles into final state.
				for (const el of Array.from(document.querySelectorAll("*"))) {
					const style = window.getComputedStyle(el);
					if (Number.parseFloat(style.opacity || "1") < 1) {
						el.style.setProperty("opacity", "1", "important");
					}
					if (style.visibility === "hidden") {
						el.style.setProperty("visibility", "visible", "important");
					}
				}

				for (const img of Array.from(document.querySelectorAll("img"))) {
					const lazySrc =
						img.getAttribute("data-src") ||
						img.getAttribute("data-lazy-src") ||
						img.getAttribute("data-original");
					if (lazySrc && !img.getAttribute("src")) {
						img.setAttribute("src", lazySrc);
					}
					img.loading = "eager";
				}

				// Warm up the sections that are often animation-triggered on this page.
				const anchors = [
					"h1",
					"h2",
					"form",
					'input[type="file"]',
					'button[type="submit"]',
				];

				for (const selector of anchors) {
					for (const node of Array.from(document.querySelectorAll(selector))) {
						node.scrollIntoView({ behavior: "instant", block: "center" });
						await delay(60);
					}
				}

				window.scrollTo(0, 0);
			});
		} catch {}
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

			await page.evaluate(async (isExtraDeep) => {
				const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

				const lazyAttrCandidates = [
					"data-src",
					"data-lazy",
					"data-lazy-src",
					"data-original",
					"data-bg",
				];
				const lazySrcsetCandidates = ["data-srcset", "data-lazy-srcset"];

				const allNodes = Array.from(document.querySelectorAll("*"));
				for (const node of allNodes) {
					const style = window.getComputedStyle(node);
					if (Number.parseFloat(style.opacity || "1") < 1) {
						node.style.setProperty("opacity", "1", "important");
					}
					if (style.visibility === "hidden") {
						node.style.setProperty("visibility", "visible", "important");
					}
				}

				for (const img of Array.from(document.querySelectorAll("img"))) {
					img.loading = "eager";

					if (!img.getAttribute("src")) {
						for (const attr of lazyAttrCandidates) {
							const v = String(img.getAttribute(attr) || "").trim();
							if (!v) continue;
							img.setAttribute("src", v);
							break;
						}
					}

					if (!img.getAttribute("srcset")) {
						for (const attr of lazySrcsetCandidates) {
							const v = String(img.getAttribute(attr) || "").trim();
							if (!v) continue;
							img.setAttribute("srcset", v);
							break;
						}
					}
				}

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
				const step = Math.max(
					180,
					Math.floor(viewport * (isExtraDeep ? 0.5 : 0.6)),
				);
				let height = getHeight();

				for (let y = 0; y <= height; y += step) {
					window.scrollTo(0, y);
					window.dispatchEvent(new Event("scroll"));
					window.dispatchEvent(new Event("resize"));
					await delay(isExtraDeep ? 300 : 220);

					const newHeight = getHeight();
					if (newHeight > height) height = newHeight;
				}

				const anchors = Array.from(
					document.querySelectorAll(
						"section, .elementor-section, .elementor-widget, .elementor-widget-container, form, .service-box, .service-card, .career-card",
					),
				)
					.filter((el) => el.getBoundingClientRect().width > 10)
					.slice(0, isExtraDeep ? 320 : 220);

				for (const el of anchors) {
					el.scrollIntoView({ behavior: "instant", block: "center" });
					window.dispatchEvent(new Event("scroll"));
					await delay(isExtraDeep ? 95 : 70);
				}

				window.scrollTo(0, 0);
				window.dispatchEvent(new Event("scroll"));
			}, isExtraDeepHydration);

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
				.catch(() => {});

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
				.catch(() => {});

			try {
				await page.waitForLoadState("networkidle", {
					timeout: isExtraDeepHydration ? 22000 : 15000,
				});
			} catch {}
			await page.waitForTimeout(isExtraDeepHydration ? 1600 : 1000);
		} catch {}
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

		for (let y = 0; y <= height; y += step) {
			if (navigated) break;
			await page.evaluate((yy) => window.scrollTo(0, yy), y);
			await page.waitForTimeout(delay);
		}

		if (needsDeepHydration && !navigated) {
			for (let y = height; y >= 0; y -= step) {
				if (navigated) break;
				await page.evaluate((yy) => window.scrollTo(0, yy), y);
				await page.waitForTimeout(delay);
			}
		}
	} catch {}

	page.off("framenavigated", onNav);

	// 7️⃣ Back to top
	try {
		await page.evaluate(() => window.scrollTo(0, 0));
	} catch {}

	// 8️⃣ Wait for visible images to fully load/decode
	try {
		await page.evaluate(
			async ({
				imageLoadTimeoutMs,
				lazyAttrCandidates,
				lazySrcsetAttrCandidates,
			}) => {
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
						if (!img.getAttribute("src")) {
							for (const attr of lazyAttrCandidates) {
								const src = String(img.getAttribute(attr) || "").trim();
								if (!src) continue;
								img.setAttribute("src", src);
								break;
							}
						}

						if (!img.getAttribute("srcset")) {
							for (const attr of lazySrcsetAttrCandidates) {
								const srcset = String(img.getAttribute(attr) || "").trim();
								if (!srcset) continue;
								img.setAttribute("srcset", srcset);
								break;
							}
						}

						await waitImageSettled(img, imageLoadTimeoutMs);

						if (img.naturalWidth > 0 && typeof img.decode === "function") {
							await img.decode().catch(() => {});
						}
					}),
				);
			},
			{
				imageLoadTimeoutMs: IMAGE_LOAD_TIMEOUT_MS,
				lazyAttrCandidates: LAZY_ATTR_CANDIDATES,
				lazySrcsetAttrCandidates: LAZY_SRCSET_ATTR_CANDIDATES,
			},
		);
	} catch {}

	// 9️⃣ Final settle
	try {
		await page.waitForLoadState("networkidle", {
			timeout: needsDeepHydration
				? isExtraDeepHydration
					? 22000
					: 15000
				: 5000,
		});
	} catch {}
	await page.waitForTimeout(
		needsDeepHydration ? (isExtraDeepHydration ? 2000 : 1400) : 800,
	);

	// 🔟 Freeze height (stitch-safe)
	try {
		await page.evaluate(() => {
			const h = document.documentElement.scrollHeight;
			document.documentElement.style.height = h + "px";
			document.body.style.height = h + "px";
		});
	} catch {}
}

module.exports = stabilizePage;
