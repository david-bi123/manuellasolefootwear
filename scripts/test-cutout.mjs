import path from "node:path";
import fs from "node:fs/promises";
import { plate } from "./cutout.mjs";

const OUT = path.resolve("public/images/_test");
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const jobs = [
  ["public/images/shortlist2/bontoni-oxfords.jpg", "oxfords.jpg", 38],
  ["public/images/shortlist/shot-064.jpg", "boot.jpg", 38],
  ["public/images/shortlist/shot-026.jpg", "heel.jpg", 42],
  ["public/images/shortlist2/grenson-monk.jpg", "monk.jpg", 38],
];

for (const [src, dest, tol] of jobs) {
  const t = Date.now();
  await plate(path.resolve(src), path.join(OUT, dest), { width: 1000, height: 1250 });
  console.log(dest, Date.now() - t + "ms");
}
