// One-off helper: gathers CC-licensed studio shoe photos and builds a contact sheet.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/images/shortlist");
const QUERIES = [
  "high heels",
  "pumps",
  "stilettos",
  "platform heels",
  "peep toe",
  "loafers",
  "oxford shoes",
  "brogues",
  "derby shoes",
  "ankle boots",
  "chelsea boots",
  "sneakers",
  "trainers",
  "running shoes",
  "sandals",
  "mules",
  "ballet flats",
  "men shoes",
  "leather shoes",
  "dress shoes",
];

const seen = new Set();
const picks = [];

async function collect(query) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
    query,
  )}&license_type=commercial&page_size=20&mature=false`;
  const res = await fetch(url, { headers: { "User-Agent": "ManuellaDemo/1.0" } });
  if (!res.ok) return;
  const json = await res.json();
  for (const item of json.results ?? []) {
    if (!item.url || seen.has(item.url)) continue;
    const title = String(item.title ?? "").toLowerCase();
    if (/(woman|women|girl|man |men |person|people|street|fashion show|model|legs|feet|shop|display|museum|ancient|roman|greek)/.test(title)) continue;
    if (!item.width || !item.height) continue;
    const ratio = item.width / item.height;
    if (ratio < 1.15 || ratio > 2.1) continue;
    if (item.width < 800) continue;
    seen.add(item.url);
    picks.push({ query, title: item.title, url: item.url, width: item.width, height: item.height, license: item.license, creator: item.creator });
  }
}

for (const query of QUERIES) {
  try {
    await collect(query);
  } catch (error) {
    console.error("query failed", query, error.message);
  }
}

await fs.mkdir(OUT, { recursive: true });

const downloaded = [];
let index = 0;
for (const pick of picks.slice(0, 90)) {
  try {
    const res = await fetch(pick.url);
    if (!res.ok) continue;
    const buffer = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) continue;
    // Reject tiny or near-square images after the fact.
    if (meta.width / meta.height < 1.1) continue;
    const name = `shot-${String(index++).padStart(3, "0")}.jpg`;
    await sharp(buffer).resize({ width: 640, height: 640, fit: "inside" }).jpeg({ quality: 82 }).toFile(path.join(OUT, name));
    downloaded.push({ ...pick, file: name });
  } catch {
    // ignore broken downloads
  }
}

// Contact sheet, 5 columns.
const cell = 260;
const cols = 5;
const rows = Math.ceil(downloaded.length / cols);
const composites = [];
for (let i = 0; i < downloaded.length; i++) {
  const tile = await sharp(path.join(OUT, downloaded[i].file))
    .resize(cell, cell, { fit: "contain", background: "#ffffff" })
    .toBuffer();
  composites.push({
    input: tile,
    left: (i % cols) * cell,
    top: Math.floor(i / cols) * cell,
  });
}
if (composites.length) {
  await sharp({
    create: { width: cols * cell, height: Math.max(rows, 1) * cell, channels: 3, background: "#ffffff" },
  })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(path.join(OUT, "contact-sheet.jpg"));
}

await fs.writeFile(path.join(OUT, "credits.json"), JSON.stringify(downloaded, null, 2));
console.log(`downloaded ${downloaded.length} images`);
