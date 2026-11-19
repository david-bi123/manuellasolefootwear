import sharp from "sharp";
import { cutout } from "./cutout.mjs";

const cut = await cutout("public/images/shortlist/shot-064.jpg");
const t = await sharp(cut).trim({ threshold: 1 }).png().toBuffer();
await sharp(t).toFile("public/images/_test/trim-only.png");
await sharp(cut).extract({ left: 0, top: 50, width: 400, height: 250 }).toFile("public/images/_test/extract-only.png");
await sharp(cut).resize(500).toFile("public/images/_test/resize-only.png");
console.log("done");
