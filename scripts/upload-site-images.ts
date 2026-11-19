/**
 * Uploads the site's static imagery to Cloudinary and prints the final
 * delivery URLs (f_auto + q_auto) to paste into the source.
 *
 * Usage: npx tsx scripts/upload-site-images.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { loadEnv } from "./_env";

loadEnv();

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD || !KEY || !SECRET) {
  console.error("Cloudinary credentials missing in .env.local (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).");
  process.exit(1);
}

cloudinary.config({ cloud_name: CLOUD, api_key: KEY, api_secret: SECRET, secure: true });

const ROOT = resolve(process.cwd(), "public");
const FOLDER = "manuella-sole/site";

// [file relative to public/, public_id, delivery width]
const IMAGES: [string, string, number][] = [
  ["images/hero.jpg", "hero", 1600],
  ["images/story.jpg", "story", 1600],
  ["images/promo.jpg", "promo", 1600],
  ["images/og.jpg", "og", 1200],
];

async function main() {
  for (const [rel, publicId, width] of IMAGES) {
    const filePath = resolve(ROOT, rel);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: FOLDER,
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
      });
      const url = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${width}/v${result.version}/${FOLDER}/${publicId}.${result.format}`;
      console.log(`${rel.padEnd(18)} -> ${url}`);
    } catch (error) {
      console.error(`FAILED ${rel}:`, (error as Error).message);
      process.exitCode = 1;
    }
  }
}

main();
