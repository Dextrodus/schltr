// Makes the grid-size photos (public/photos/grid, 720 px wide) from public/photos/thumbs.
// The album grid and covers show photos at roughly 260–350 px, so 720 px covers 2x screens
// without loading the 1200 px files. Run after adding photos: node scripts/make-grid-images.mjs
import { mkdir, readdir } from 'node:fs/promises';
import sharp from 'sharp';

const src = new URL('../public/photos/thumbs/', import.meta.url);
const out = new URL('../public/photos/grid/', import.meta.url);
await mkdir(out, { recursive: true });

for (const name of await readdir(src)) {
  if (!name.endsWith('.jpg')) continue;
  await sharp(new URL(name, src).pathname)
    .resize({ width: 720, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(new URL(name, out).pathname);
}
