import sharp from "sharp";
import { trimmedCutout, ivorySweep } from "./cutout.mjs";

const fg = await trimmedCutout("public/images/shortlist/shot-064.jpg");
const bg = await sharp({
  create: { width: 1000, height: 1250, channels: 3, background: { r: 249, g: 244, b: 236 } },
}).png().toBuffer();
const product = await sharp(fg).resize(800).png().toBuffer();
await sharp(bg).composite([{ input: product, gravity: "centre" }]).jpeg({ quality: 90 }).toFile("public/images/_test/plain.jpg");
await sharp(bg).composite([{ input: fg, gravity: "centre" }]).jpeg({ quality: 90 }).toFile("public/images/_test/plain2.jpg");
const sweep = await ivorySweep(1000, 1250);
await sharp(sweep).composite([{ input: product, gravity: "centre" }]).jpeg({ quality: 90 }).toFile("public/images/_test/sweep.jpg");
console.log("ok");
