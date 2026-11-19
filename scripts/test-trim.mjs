import sharp from "sharp";
import { cutout } from "./cutout.mjs";

const cut = await cutout("public/images/shortlist/shot-064.jpg");
console.log("cut", await sharp(cut).metadata());

const t = await sharp(cut).trim({ threshold: 1 }).png().toBuffer();
console.log("trim", await sharp(t).metadata());

const t2 = await sharp(cut).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).png().toBuffer();
console.log("trim2", await sharp(t2).metadata());

// manual bbox from alpha
const { data, info } = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log("bbox", { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
