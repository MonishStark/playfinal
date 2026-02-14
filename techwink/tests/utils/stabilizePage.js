/** @format */

const NO_SCROLL_PAGES = [
	"/learning-management-systems/", // LMS breaks on scroll
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
					if (!img.getAttribute("srcset") || img.getAttribute("srcset") === "") {
						img.setAttribute("srcset", value);
					}
					break;
				}
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

	// 8️⃣ Wait for visible images to fully load/decode
	try {
		await page.evaluate(
			async ({ imageLoadTimeoutMs, lazyAttrCandidates, lazySrcsetAttrCandidates }) => {
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
		await page.waitForLoadState("networkidle", { timeout: 5000 });
	} catch {}
	await page.waitForTimeout(800);

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
