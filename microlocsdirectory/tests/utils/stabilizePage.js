/** @format */

async function stabilizePage(page) {
	// Wait for fonts to load
	await page.evaluate(() => {
		if (document.fonts && document.fonts.ready) {
			return document.fonts.ready;
		}
		return Promise.resolve();
	});

	// Disable animations and transitions
	await page.addStyleTag({
		content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }

      html, body {
        scroll-behavior: auto !important;
      }
      header, nav, [style*="position: fixed"], [style*="position: sticky"] {
        position: relative !important;
        transform: none !important;
      }
    `,
	});

	// Pause sliders and scroll through page
	await page.evaluate(async () => {
		if (window.jQuery) {
			window.jQuery.fx.off = true;
			try {
				window.jQuery(".flexslider").each(function () {
					const $slider = window.jQuery(this);
					const sliderData = $slider.data("flexslider");
					if (sliderData) {
						if (typeof sliderData.pause === "function") {
							sliderData.pause();
						}
						if (typeof sliderData.stop === "function") {
							sliderData.stop();
						}
						if (typeof sliderData.flexAnimate === "function") {
							sliderData.flexAnimate(0, true);
						}
					}
				});
			} catch (e) {
				console.log("Error stabilizing flexslider:", e);
			}
		}

		const delay = (ms) => new Promise((r) => setTimeout(r, ms));
		const viewport = window.innerHeight || 800;
		const total =
			document.body.scrollHeight || document.documentElement.scrollHeight;

		for (let y = 0; y <= total; y += viewport) {
			window.scrollTo(0, y);
			await delay(150);
		}
		window.scrollTo(0, 0);
	});

	// Use load state with timeout instead of networkidle
	try {
		await page.waitForLoadState("networkidle", { timeout: 10000 });
	} catch (e) {
		// If networkidle times out, just wait for domcontentloaded and a short delay
		console.log(
			"[stabilizePage] networkidle timeout, continuing with fallback...",
		);
		await page.waitForLoadState("domcontentloaded");
		await page.waitForTimeout(2000); // Wait 2 seconds for content to settle
	}

	// Wait for images to load (with timeout)
	try {
		await page.waitForFunction(
			() => {
				const images = document.querySelectorAll("img");
				return Array.from(images).every((img) => img.complete);
			},
			{ timeout: 10000 },
		);
	} catch (e) {
		console.log("[stabilizePage] Image loading timeout, continuing...");
	}

	// Final short wait for any last renders
	await page.waitForTimeout(500);
}

module.exports = { stabilizePage };
