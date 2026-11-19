import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "images", "products");
mkdirSync(OUT, { recursive: true });

const silhouettes = {
  sneaker: {
    upper:
      "M 176 638 L 178 506 C 180 470 196 450 228 448 L 294 446 C 318 446 332 458 342 478 L 390 418 C 402 402 420 396 438 402 L 488 420 C 516 430 530 450 534 478 C 564 490 606 518 640 550 C 662 570 672 592 666 610 L 656 638 Z",
    sole:
      "M 170 610 L 668 610 C 678 610 684 618 684 628 L 680 656 C 678 672 662 682 640 682 L 208 682 C 186 682 170 672 168 656 L 166 628 C 166 618 168 610 170 610 Z",
    details: [
      "M 534 478 C 572 498 612 530 634 558",
      "M 228 448 C 244 470 258 492 262 524",
      "M 294 446 C 316 456 334 470 348 486",
      "M 398 446 L 448 464",
      "M 414 426 L 466 446",
      "M 432 406 L 484 428",
      "M 342 478 C 370 492 398 502 430 506",
      "M 180 508 C 206 514 232 518 254 520",
    ],
    accents: ["M 190 646 L 660 646"],
  },
  heel: {
    upper:
      "M 330 486 C 348 456 392 440 446 444 C 508 450 566 474 614 520 C 648 550 674 574 692 584 C 702 590 700 600 686 602 L 452 602 C 392 602 348 582 332 552 C 324 536 324 506 330 486 Z",
    sole: "M 330 590 L 690 590 C 700 598 698 608 684 610 L 458 612 C 402 612 352 602 330 590 Z",
    heel:
      "M 356 598 L 344 752 C 342 768 350 776 364 776 L 376 776 C 389 776 396 768 394 754 L 384 598 Z",
    details: [
      "M 330 486 C 366 492 404 502 438 518",
      "M 446 444 C 466 472 488 498 514 520",
      "M 614 520 C 590 534 560 546 528 554",
      "M 332 552 C 372 562 420 568 470 570",
    ],
    accents: ["M 336 598 L 686 598"],
  },
  boot: {
    upper:
      "M 248 300 L 448 300 L 458 458 C 512 468 574 496 616 536 C 648 566 658 586 644 596 L 300 596 C 272 596 258 580 260 556 L 268 460 C 270 400 260 344 248 300 Z",
    sole:
      "M 256 578 L 640 578 C 660 578 672 588 672 602 L 670 620 C 668 634 654 642 636 642 L 288 642 C 270 642 256 634 252 620 L 250 598 C 248 586 250 578 256 578 Z",
    heel: "M 262 636 L 254 712 C 252 728 262 736 278 736 L 384 736 C 396 736 404 728 404 716 L 404 636 Z",
    details: [
      "M 250 302 C 300 322 398 322 446 302",
      "M 276 430 C 322 442 396 444 440 436",
      "M 402 456 C 432 468 460 486 482 508",
      "M 300 350 L 312 566",
      "M 420 300 L 428 380",
      "M 372 330 C 380 372 382 412 380 448",
      "M 616 540 C 634 554 644 570 644 588",
    ],
    accents: ["M 272 606 L 656 606"],
  },
  loafer: {
    upper:
      "M 238 606 C 230 576 244 548 278 534 L 382 500 C 412 490 438 472 460 448 C 488 418 528 410 564 426 C 602 442 628 480 644 520 C 656 550 672 564 690 574 C 706 584 706 596 692 602 L 286 602 C 264 602 248 610 238 606 Z",
    sole:
      "M 236 592 L 696 592 C 710 592 718 600 716 610 L 712 624 C 710 636 698 644 682 644 L 286 644 C 268 644 256 636 252 624 L 248 608 C 246 598 244 592 236 592 Z",
    heel: "M 256 638 L 252 696 C 250 712 260 720 276 720 L 382 720 C 394 720 402 712 402 700 L 402 638 Z",
    details: [
      "M 382 500 C 410 510 438 516 460 516",
      "M 460 448 C 476 472 500 490 526 498",
      "M 330 546 C 380 552 450 562 506 578",
      "M 536 440 C 550 468 566 490 586 504",
      "M 628 602 C 610 614 590 620 568 622",
      "M 278 534 C 296 558 320 574 350 582",
    ],
    accents: ["M 250 607 L 700 607"],
  },
  sandal: {
    sole:
      "M 248 600 C 246 566 276 546 322 544 L 592 544 C 648 546 684 566 692 594 C 700 624 676 646 630 648 L 302 648 C 264 648 250 626 248 600 Z",
    upper:
      "M 336 550 C 352 494 398 472 444 492 L 478 548 L 440 552 C 414 524 382 524 362 558 Z",
    details: [
      "M 462 548 C 480 496 528 480 566 502 L 588 550 L 556 552 C 538 522 506 520 486 556",
      "M 304 560 C 342 576 386 586 436 590",
      "M 512 580 C 556 580 596 572 626 558",
      "M 590 544 C 604 554 616 566 624 580",
    ],
    heel: "M 332 652 L 326 740 C 324 756 334 764 350 764 L 444 764 C 456 764 464 756 464 744 L 464 652 Z",
    accents: ["M 260 604 L 680 604"],
  },
  flats: {
    upper:
      "M 254 606 C 248 568 266 540 302 526 L 392 498 C 420 488 444 468 464 446 C 488 418 524 408 556 422 C 592 438 616 474 632 512 C 644 538 662 552 680 562 C 696 572 698 590 684 598 L 292 598 C 272 598 258 604 254 606 Z",
    sole:
      "M 250 592 L 686 592 C 700 592 708 600 706 610 L 702 622 C 700 634 688 642 672 642 L 286 642 C 270 642 260 634 256 622 L 252 608 C 250 600 250 592 250 592 Z",
    details: [
      "M 392 498 C 418 508 444 514 464 514",
      "M 464 446 C 478 468 498 482 522 490",
      "M 424 526 C 452 528 480 534 504 542",
      "M 490 466 C 502 474 516 480 530 484",
      "M 330 540 C 348 562 372 576 400 582",
    ],
    accents: ["M 264 607 L 694 607"],
  },
  derby: {
    upper:
      "M 242 606 C 234 566 254 532 294 518 L 384 488 C 414 478 438 458 460 434 C 488 404 530 394 566 410 C 604 426 632 462 648 506 C 660 538 674 554 692 564 C 708 574 712 592 698 600 L 290 600 C 268 600 246 608 242 606 Z",
    sole:
      "M 240 592 L 700 592 C 714 592 720 602 718 612 L 714 626 C 712 638 700 646 684 646 L 290 646 C 272 646 260 638 258 626 L 254 610 C 252 600 250 592 240 592 Z",
    heel: "M 260 640 L 256 700 C 254 716 264 724 280 724 L 384 724 C 396 724 404 716 404 704 L 404 640 Z",
    details: [
      "M 384 488 C 412 498 438 504 460 504",
      "M 460 434 C 476 460 500 478 526 486",
      "M 336 530 C 388 536 456 546 512 564",
      "M 520 446 L 566 468",
      "M 538 420 L 584 444",
      "M 556 398 L 600 424",
      "M 294 518 C 312 542 336 558 364 566",
    ],
    accents: ["M 256 607 L 712 607"],
  },
};

const colorways = [
  { file: "sneaker-ivory", kind: "sneaker", body: "#ece3d5", accent: "#cdb99b" },
  { file: "sneaker-onyx", kind: "sneaker", body: "#2c2825", accent: "#4a423b" },
  { file: "heel-champagne", kind: "heel", body: "#dcc4a3", accent: "#b99972" },
  { file: "heel-onyx", kind: "heel", body: "#241f1c", accent: "#463d37" },
  { file: "boot-cognac", kind: "boot", body: "#8a5a3b", accent: "#6d4529" },
  { file: "loafer-tan", kind: "loafer", body: "#b98b5e", accent: "#9a6f45" },
  { file: "loafer-espresso", kind: "loafer", body: "#4a3325", accent: "#35241a" },
  { file: "sandal-tan", kind: "sandal", body: "#c39a6c", accent: "#a57c4f" },
  { file: "flats-cream", kind: "flats", body: "#efe6d8", accent: "#d3c2a8" },
  { file: "derby-onyx", kind: "derby", body: "#26221f", accent: "#443b34" },
];

for (const colorway of colorways) {
  const shape = silhouettes[colorway.kind];
  const detailPaths = shape.details ?? [];
  const accentPaths = shape.accents ?? [];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img">
  <defs>
    <radialGradient id="bg" cx="48%" cy="34%" r="80%">
      <stop offset="0%" stop-color="#fcf8f1"/>
      <stop offset="58%" stop-color="#f6efe3"/>
      <stop offset="100%" stop-color="#e9ddcb"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
    </filter>
    <linearGradient id="bodyGrad" x1="0.1" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="${shade(colorway.body, 10)}"/>
      <stop offset="100%" stop-color="${shade(colorway.body, -18)}"/>
    </linearGradient>
  </defs>

  <rect width="800" height="1000" fill="url(#bg)"/>
  <rect width="800" height="1000" filter="url(#grain)" opacity="0.55"/>
  <line x1="120" y1="700" x2="680" y2="700" stroke="#b08d57" stroke-width="1" opacity="0.4"/>

  <ellipse cx="430" cy="696" rx="238" ry="22" fill="#191614" opacity="0.18" filter="url(#soft)"/>

  <g fill="url(#bodyGrad)" stroke="#2a2420" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    ${shape.heel ? `<path d="${shape.heel}" fill="${shade(colorway.body, -24)}"/>` : ""}
    ${shape.sole ? `<path d="${shape.sole}" fill="${colorway.accent}"/>` : ""}
    <path d="${shape.upper}"/>
  </g>

  <g fill="none" stroke="#2a2420" stroke-width="1.9" stroke-linecap="round" opacity="0.7">
    ${detailPaths.map((path) => `<path d="${path}"/>`).join("\n    ")}
  </g>

  <g fill="none" stroke="#f8f1e6" stroke-width="1.2" stroke-linecap="round" opacity="0.25">
    ${accentPaths.map((path) => `<path d="${path}"/>`).join("\n    ")}
  </g>
</svg>`;

  writeFileSync(join(OUT, `${colorway.file}.svg`), svg, "utf8");
}

function shade(hex, amount) {
  const value = hex.replace("#", "");
  const num = parseInt(value, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

writeFileSync(
  join(process.cwd(), "public", "images", "product-sheet.html"),
  `<html><body style="margin:0;padding:24px;background:#ece1d1;display:grid;grid-template-columns:repeat(5,1fr);gap:16px">
  ${colorways.map((c) => `<figure style="margin:0;background:#fff"><img src="products/${c.file}.svg" style="width:100%;display:block"><figcaption style="font:13px Arial;padding:8px">${c.file}</figcaption></figure>`).join("")}
  </body></html>`,
  "utf8",
);

console.log(`Generated ${colorways.length} product artworks.`);
