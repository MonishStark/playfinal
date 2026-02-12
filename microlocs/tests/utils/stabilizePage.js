/** @format */

async function stabilizePage(page) {
  // 1️⃣ Ensure fonts/icons are ready
  await page.evaluate(() => {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready;
    }
    return Promise.resolve();
  });

  // 2️⃣ Kill animations & transitions (no layout changes)
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

      /* Prevent sticky/fixed elements from messing up full-page screenshots */
      header, nav, [style*="position: fixed"], [style*="position: sticky"] {
        position: relative !important;
        transform: none !important;
      }
    `,
  });

  // 3️⃣ Deterministic scroll to trigger lazy loading
  await page.evaluate(async () => {
    // Stop jQuery animations and pause FlexSlider
    if (window.jQuery) {
      window.jQuery.fx.off = true;
      try {
        window.jQuery('.flexslider').each(function() {
          const $slider = window.jQuery(this);
          const sliderData = $slider.data('flexslider');
          if (sliderData) {
            // Pause the slideshow
            if (typeof sliderData.pause === 'function') {
              sliderData.pause();
            }
            if (typeof sliderData.stop === 'function') {
              sliderData.stop();
            }
            // Attempt to force to first slide to be consistent
            if (typeof sliderData.flexAnimate === 'function') {
               // flexAnimate(target, pause)
               sliderData.flexAnimate(0, true); 
            }
          }
        });
      } catch (e) {
        console.log('Error stabilizing flexslider:', e);
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

  // 4️⃣ Wait for network to settle
  await page.waitForLoadState("networkidle");
}

module.exports = stabilizePage;
