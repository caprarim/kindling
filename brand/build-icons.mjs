// Renders brand/icon.svg into every raster asset the site needs.
// Run with: node brand/build-icons.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const svg = await readFile(join(here, "icon.svg"));

const render = (size) => sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

const targets = [
  ["src/app/icon.png", 512],
  ["src/app/apple-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
];

for (const [rel, size] of targets) {
  const out = join(root, rel);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, await render(size));
  console.log(`wrote ${rel} (${size}px)`);
}

// The link preview card Discord, Slack, iMessage and X show when the URL is
// pasted. Landscape at the 1.91:1 those unfurlers crop to, so it fills the
// frame instead of being letterboxed like a square icon would be.
const ogSvg = await readFile(join(here, "og.svg"));
await writeFile(
  join(root, "public/og.png"),
  await sharp(ogSvg, { density: 192 }).resize(1200, 630).png().toBuffer(),
);
console.log("wrote public/og.png (1200x630)");

// Multi-resolution .ico so Windows/browser tabs pick the sharpest available.
const icoSizes = [16, 32, 48, 64, 128, 256];
const ico = await pngToIco(await Promise.all(icoSizes.map(render)));
await writeFile(join(root, "src/app/favicon.ico"), ico);
console.log(`wrote src/app/favicon.ico (${icoSizes.join(", ")})`);
