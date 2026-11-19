import sharp from "sharp";
import { trimmedCutout, ivorySweep } from "./cutout.mjs";

const candidates = [
  "public/images/shortlist/shot-051.jpg",
  "public/images/shortlist/shot-058.jpg",
  "public/images/shortlist/shot-061.jpg",
  "public/images/shortlist/shot-075.jpg",
  "public/images/shortlist2/loafer-alden.jpg",
  "public/images/shortlist2/loafer-barker.jpg",
  "public/images/shortlist2/bontoni-brera.jpg",
  "public/images/shortlist/shot-032.jpg",
];

const W = 400;
const H = 400;
const tiles = [];
for (const file of candidates) {
  const fg = await trimmedCutout(file);
  const meta = await sharp(fg).metadata();
  const ratio = Math.min((W * 0.86) / meta.width, (H * 0.86) / meta.height);
  const w = Math.round(meta.width * ratio);
  const h = Math.round(meta.height * ratio);
  const bg = await ivorySweep(W, H);
  tiles.push(
    await sharp(bg)
      .composite([{ input: await sharp(fg).resize(w, h).png().toBuffer(), gravity: "centre" }])
      .png()
      .toBuffer(),
  );
}

const sheet = sharp({ create: { width: W * 4, height: H * 2, channels: 3, background: "#ddd" } });
await sheet
  .composite(tiles.map((input, i) => ({ input, left: (i % 4) * W, top: Math.floor(i / 4) * H })))
  .jpeg({ quality: 82 })
  .toFile("public/images/_test/candidates.jpg");
console.log("ok");
