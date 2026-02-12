/** @format */

async function lockHeroSlide(page) {
	await page.evaluate(() => {
		// Swiper
		document.querySelectorAll(".swiper").forEach((swiperEl) => {
			if (swiperEl.swiper) {
				swiperEl.swiper.slideTo(0, 0, false);
				swiperEl.swiper.autoplay?.stop();
			}
		});

		// Slick
		if (window.jQuery?.fn?.slick) {
			window.jQuery(".slick-slider").each(function () {
				window.jQuery(this).slick("slickGoTo", 0, true);
				window.jQuery(this).slick("slickPause");
			});
		}

		// Owl
		if (window.jQuery?.fn?.owlCarousel) {
			window.jQuery(".owl-carousel").each(function () {
				window.jQuery(this).trigger("stop.owl.autoplay");
				window.jQuery(this).trigger("to.owl.carousel", [0, 0, true]);
			});
		}
	});
}

module.exports = lockHeroSlide;
