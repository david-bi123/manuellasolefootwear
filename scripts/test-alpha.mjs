import sharp from "sharp";
import { cutout } from "./cutout.mjs";

const cut = await cutout("public/images/shortlist/shot-064.jpg");
const raw = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { data, info } = raw;
console.log("cut raw", info);
const alphaBuf = Buffer.alloc(info.width * info.height);
for (let p = 0; p < alphaBuf.length; p++) alphaBuf[p] = data[p * 4 + 3];
const blurred = await sharp(alphaBuf, { raw: { width: info.width, height: info.height, channels: 1 } })
  .blur(0.7)
  .raw()
  .toBuffer({ resolveWithObject: true });
console.log("blurred", blurred.info, blurred.data.length, info.width * info.height);
// print first 20 alpha values down a column
const col = 300;
console.log([...Array(12).keys()].map((y) => blurred.data[y * blurred.info.width + col]));
