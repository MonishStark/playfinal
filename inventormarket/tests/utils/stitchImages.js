/** @format */

const sharp = require("sharp");

async function stitchImages(images) {
	const buffers = [];
	let totalHeight = 0;
	let width = null;

	for (const img of images) {
		const meta = await sharp(img).metadata();
		width = meta.width;
		totalHeight += meta.height;
		buffers.push({ input: img, top: totalHeight - meta.height, left: 0 });
	}

	return sharp({
		create: {
			width,
			height: totalHeight,
			channels: 4,
			background: "#ffffff",
		},
	})
		.composite(buffers)
		.png()
		.toBuffer();
}

module.exports = { stitchImages };
