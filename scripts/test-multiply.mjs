import sharp from "sharp";

const IVORY = { r: 249, g: 244, b: 236 };

async function multiplyPlate(file, out, { width = 1200, height = 1500 } = {}) {
  const base = await sharp(file)
    .resize(width, height, { fit: "cover", position: "centre" })
    .modulate({ brightness: 1.06, saturation: 0.94 })
    .recomb([
      [1.02, 0.004, 0],
      [0.002, 1.0, 0],
      [0, 0.003, 0.975],
    ])
    .toBuffer();

  await sharp({ create: { width, height, channels: 3, background: IVORY } })
    .composite([{ input: base, blend: "multiply" }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);
}

await multiplyPlate("public/images/shortlist/shot-026.jpg", "public/images/_test/mul-026.jpg", { width: 1000, height: 1250 });
await multiplyPlate("public/images/shortlist/shot-027.jpg", "public/images/_test/mul-027.jpg", { width: 1000, height: 1250 });
await multiplyPlate("public/images/shortlist/shot-029.jpg", "public/images/_test/mul-029.jpg", { width: 1000, height: 1250 });
console.log("ok");
