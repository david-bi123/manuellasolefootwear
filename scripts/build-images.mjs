import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { plate, still, ivorySweep, warm } from "./cutout.mjs";

const ROOT = path.resolve("public/images");
const PRODUCTS = path.join(ROOT, "products");
const CATEGORIES = path.join(ROOT, "categories");
const SHORT = path.join(ROOT, "shortlist");
const SHORT2 = path.join(ROOT, "shortlist2");

await fs.rm(PRODUCTS, { recursive: true, force: true });
await fs.rm(CATEGORIES, { recursive: true, force: true });
await fs.mkdir(PRODUCTS, { recursive: true });
await fs.mkdir(CATEGORIES, { recursive: true });

/** Product plates: cut-out on an ivory sweep, or a full-bleed still multiplied
 *  into the same sweep so white studio backdrops disappear entirely. */
const catalogue = [
  { slug: "amara-peep-toe-pump", src: path.join(SHORT, "shot-029.jpg"), mode: "still", position: "centre" },
  { slug: "celine-court-heel", src: path.join(SHORT, "shot-027.jpg"), mode: "still", position: "centre" },
  { slug: "adaeze-brogue-boot", src: path.join(SHORT, "shot-064.jpg"), mode: "cutout" },
  { slug: "nia-chelsea-boot", src: path.join(SHORT, "shot-051.jpg"), mode: "cutout" },
  { slug: "kofi-buckle-boot", src: path.join(SHORT, "shot-061.jpg"), mode: "cutout", scale: 0.84 },
  { slug: "efua-penny-loafer", src: path.join(SHORT2, "loafer-penny.jpg"), mode: "cutout", scale: 0.94 },
  { slug: "kwame-suede-loafer", src: path.join(SHORT2, "loafer-alden.jpg"), mode: "cutout", scale: 0.9 },
  { slug: "osei-oxford", src: path.join(SHORT2, "bontoni-oxfords.jpg"), mode: "cutout", scale: 0.9 },
  { slug: "mensah-derby", src: path.join(SHORT2, "bontoni-brera.jpg"), mode: "cutout", scale: 0.88 },
];

for (const item of catalogue) {
  const dest = path.join(PRODUCTS, `${item.slug}.jpg`);
  if (item.mode === "still") {
    await still(item.src, dest, { width: 1400, height: 1750, position: item.position });
  } else {
    await plate(item.src, dest, { scale: item.scale });
  }

  // Detail shot for the product gallery: a tighter crop of the same still.
  const detail = await sharp(dest)
    .extract({ left: 210, top: 280, width: 980, height: 980 })
    .resize(1200, 1200)
    .modulate({ brightness: 1.01 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(path.join(PRODUCTS, `${item.slug}-detail.jpg`), detail);
}

const categorySources = [
  ["heels", "amara-peep-toe-pump"],
  ["boots", "adaeze-brogue-boot"],
  ["loafers", "efua-penny-loafer"],
  ["formal", "osei-oxford"],
];
for (const [slug, product] of categorySources) {
  await sharp(path.join(PRODUCTS, `${product}.jpg`))
    .resize(900, 1125, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.98 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(CATEGORIES, `${slug}.jpg`));
}

await still(path.join(SHORT, "shot-029.jpg"), path.join(ROOT, "hero.jpg"), {
  width: 1600,
  height: 2000,
  position: "centre",
  zoom: 1.05,
});

await still(path.join(SHORT, "shot-037.jpg"), path.join(ROOT, "promo.jpg"), {
  width: 1600,
  height: 1200,
  position: "centre",
});

await still(path.join(SHORT, "shot-037.jpg"), path.join(ROOT, "og.jpg"), {
  width: 1200,
  height: 630,
  position: "centre",
  zoom: 1.02,
});

console.log(`built ${catalogue.length} products, 4 categories, hero, promo and og images`);
