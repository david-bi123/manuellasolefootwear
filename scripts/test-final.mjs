import { plate } from "./cutout.mjs";
import path from "node:path";

const jobs = [
  ["public/images/shortlist/shot-051.jpg", "p051.jpg"],
  ["public/images/shortlist/shot-061.jpg", "p061.jpg"],
  ["public/images/shortlist2/loafer-penny.jpg", "penny.jpg", 0.9],
  ["public/images/shortlist2/loafer-alden.jpg", "alden.jpg"],
];

for (const [src, dest, scale] of jobs) {
  await plate(path.resolve(src), path.resolve("public/images/_test", dest), { scale });
}
console.log("ok");
