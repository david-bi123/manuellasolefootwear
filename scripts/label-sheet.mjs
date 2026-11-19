import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/images/shortlist");
const files = (await fs.readdir(DIR)).filter((f) => f.startsWith("shot-")).sort();

const cellW = 240;
const cellH = 210;
const cols = 6;
const rows = Math.ceil(files.length / cols);
const composites = [];

for (let i = 0; i < files.length; i++) {
  const left = (i % cols) * cellW;
  const top = Math.floor(i / cols) * cellH;
  const thumb = await sharp(path.join(DIR, files[i]))
    .resize(cellW - 8, cellH - 26, { fit: "contain", background: "#ffffff" })
    .toBuffer();
  composites.push({ input: thumb, left: left + 4, top: top + 20 });
  const label = `<svg width="${cellW}" height="20"><rect width="100%" height="20" fill="#111"/><text x="6" y="14" font-family="Arial" font-size="12" fill="#fff">${String(i).padStart(3, "0")} ${files[i].replace("shot-", "").replace(".jpg", "")}</text></svg>`;
  composites.push({ input: Buffer.from(label), left, top });
}

await sharp({
  create: { width: cols * cellW, height: rows * cellH, channels: 3, background: "#ffffff" },
})
  .composite(composites)
  .jpeg({ quality: 88 })
  .toFile(path.join(DIR, "labelled-sheet.jpg"));

console.log(files.length);
