import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const IVORY = { r: 249, g: 244, b: 236 };

/**
 * Scanline flood fill from the image border. Any pixel reachable from the
 * frame whose colour sits within `tolerance` of the sampled backdrop colour
 * becomes transparent. Interior whites (a shoe's stitching, a cream upper)
 * survive because they are walled off by the object's darker outline.
 */
export function backgroundMask(raw, width, height, tolerance = 38) {
  const pixels = width * height;
  const visited = new Uint8Array(pixels);

  // Sample the backdrop from the frame, ignoring obviously dark pixels where
  // the product itself touches the edge.
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const sample = (x, y) => {
    const i = (y * width + x) * 4;
    const l = (raw[i] + raw[i + 1] + raw[i + 2]) / 3;
    if (l > 150) {
      r += raw[i];
      g += raw[i + 1];
      b += raw[i + 2];
      n += 1;
    }
  };
  for (let x = 0; x < width; x += 2) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += 2) {
    sample(0, y);
    sample(width - 1, y);
  }
  if (!n) return visited.fill(0);
  const ref = [r / n, g / n, b / n];
  const tol2 = tolerance * tolerance * 3;

  const matches = (p) => {
    const i = p * 4;
    const dr = raw[i] - ref[0];
    const dg = raw[i + 1] - ref[1];
    const db = raw[i + 2] - ref[2];
    return dr * dr + dg * dg + db * db <= tol2;
  };

  const stack = [];
  const pushSeed = (x, y) => {
    const p = y * width + x;
    if (!visited[p] && matches(p)) stack.push(p);
  };
  for (let x = 0; x < width; x++) {
    pushSeed(x, 0);
    pushSeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushSeed(0, y);
    pushSeed(width - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    const y = (p / width) | 0;
    const rowStart = y * width;
    const rowEnd = rowStart + width - 1;
    let left = p;
    while (left > rowStart && !visited[left - 1] && matches(left - 1)) left -= 1;
    let right = p;
    while (right < rowEnd && !visited[right + 1] && matches(right + 1)) right += 1;
    for (let q = left; q <= right; q++) {
      if (visited[q]) continue;
      visited[q] = 1;
      if (y > 0) {
        const up = q - width;
        if (!visited[up] && matches(up)) stack.push(up);
      }
      if (y < height - 1) {
        const down = q + width;
        if (!visited[down] && matches(down)) stack.push(down);
      }
    }
  }

  return visited;
}

export async function cutout(file, { tolerance = 38, max = 1800, whiteKey = 238 } = {}) {
  const source = await sharp(file)
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = source;
  const mask = backgroundMask(data, info.width, info.height, tolerance);

  // Grow the flood into the faint JPEG halo that hugs the subject: any pixel
  // adjacent to the backdrop that is still very light joins it. This removes
  // the soft rectangular residue that would otherwise show on the ivory plate.
  for (let pass = 0; pass < 3; pass++) {
    const additions = [];
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const p = y * info.width + x;
        if (mask[p]) continue;
        const i = p * 4;
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (lum < 236) continue;
        const near =
          (x > 0 && mask[p - 1]) ||
          (x < info.width - 1 && mask[p + 1]) ||
          (y > 0 && mask[p - info.width]) ||
          (y < info.height - 1 && mask[p + info.width]);
        if (near) additions.push(p);
      }
    }
    if (!additions.length) break;
    for (const p of additions) mask[p] = 1;
  }

  const rgba = Buffer.from(data);

  // Clear the alpha of every flooded pixel, then soften the seam.
  for (let p = 0; p < mask.length; p++) {
    const i = p * 4 + 3;
    rgba[i] = mask[p] ? 0 : 255;
  }

  // Recover a little edge softness: blur alpha only.
  const alpha = Buffer.alloc(info.width * info.height);
  for (let p = 0; p < mask.length; p++) alpha[p] = rgba[p * 4 + 3];
  const soft = await sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(0.7)
    .extractChannel(0)
    .raw()
    .toBuffer();

  // Knock out any pure-white studio spill that survived inside the silhouette
  // (floor reflections between a heel and a sole, for example). Only near-neutral
  // highlights are touched, so coloured leather and cream product are safe.
  if (whiteKey > 0) {
    for (let p = 0; p < mask.length; p++) {
      const i = p * 4;
      const min = Math.min(rgba[i], rgba[i + 1], rgba[i + 2]);
      const max = Math.max(rgba[i], rgba[i + 1], rgba[i + 2]);
      if (soft[p] && max >= whiteKey && max - min <= 14) soft[p] = 0;
    }
  }

  for (let p = 0; p < mask.length; p++) rgba[p * 4 + 3] = soft[p];

  // Tight box around the subject (the shadow is trimmed away here).
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y++) {
    const row = y * info.width;
    for (let x = 0; x < info.width; x++) {
      if (rgba[(row + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX) {
    minX = 0;
    minY = 0;
    maxX = info.width - 1;
    maxY = info.height - 1;
  }
  const pad = 3;
  const bbox = {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(info.width, maxX + pad + 1) - Math.max(0, minX - pad),
    height: Math.min(info.height, maxY + pad + 1) - Math.max(0, minY - pad),
  };

  const png = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();

  return { png, bbox };
}

export async function trimmedCutout(file, options) {
  const { png, bbox } = await cutout(file, options);
  return sharp(png).extract(bbox).png().toBuffer();
}

function warm(pipeline) {
  return pipeline.recomb([
    [1.035, 0.004, 0],
    [0.002, 1.004, 0],
    [0, 0.003, 0.962],
  ]);
}

export async function plate(file, out, { width = 1400, height = 1750, scale = 0.86, dy = 0, background } = {}) {
  const fg = await trimmedCutout(file);
  const meta = await sharp(fg).metadata();

  const maxW = width * scale;
  const maxH = height * scale;
  const ratio = Math.min(maxW / meta.width, maxH / meta.height);
  const fw = Math.round(meta.width * ratio);
  const fh = Math.round(meta.height * ratio);
  const left = Math.round((width - fw) / 2);
  const top = Math.round((height - fh) / 2 + dy);

  // Contact shadow: the product silhouette, blurred and pushed down.
  const sweep = background ?? (await ivorySweep(width, height));
  const product = await warm(sharp(fg).resize(fw, fh))
    .png()
    .toBuffer();

  await sharp(sweep)
    .composite([{ input: product, left, top, blend: "multiply" }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(out);
}

/**
 * Full-bleed still: the photograph is multiplied into the ivory sweep, so a
 * white studio backdrop dissolves into the plate instead of showing an edge.
 */
export async function still(file, out, { width, height, position = "centre", zoom = 1 } = {}) {
  const w = Math.round(width * zoom);
  const h = Math.round(height * zoom);
  const base = await warm(
    sharp(file).resize(w, h, { fit: "cover", position }).modulate({ brightness: 1.04, saturation: 0.92 }),
  )
    .toBuffer();

  const cropped = await sharp(base)
    .extract({ left: Math.round((w - width) / 2), top: Math.round((h - height) / 2), width, height })
    .toBuffer();

  const sweep = await ivorySweep(width, height);
  await sharp(sweep)
    .composite([{ input: cropped, blend: "multiply" }])
    .jpeg({ quality: 91, mozjpeg: true })
    .toFile(out);
}

export async function ivorySweep(width, height) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stop-color="#FCF8F2"/>
          <stop offset="0.55" stop-color="#F6EFE4"/>
          <stop offset="1" stop-color="#EBE0D0"/>
        </linearGradient>
        <radialGradient id="v" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/>
          <stop offset="1" stop-color="#7A6248" stop-opacity="0.12"/>
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect width="100%" height="100%" fill="url(#v)"/>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.5"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export { warm };
