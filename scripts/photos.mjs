// Builds the web versions of the photos in content/<album>/ and the manifest the site reads.
//
//   npm run photos           add new or changed photos, remove outputs of deleted ones
//   npm run photos -- --all  re-encode everything (after changing sizes or quality below)
//
// content/ holds the original exports and stays out of git. One folder per album; photos are
// ordered by file name (natural order, so astro-2 comes before astro-10). A file whose name ends
// in -cover is the album's cover, otherwise the first photo is. Album names and their order on
// the site are in src/data/photos.ts, alt texts in src/data/alt.json.
//
// Output, per photo, in public/photos/<album>/:
//   <id>-<w>.avif  at every width in WIDTHS below the full size, plus the full size
//   <id>-<w>.jpg   at 720 and 1600 for browsers without AVIF
// Full size: horizontal photos 3840 px wide, vertical ones 2160 px tall, never upscaled.
// Panoramas so wide that 3840 px would leave them under 1080 px tall get 1080 px height instead.
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import exifReader from 'exif-reader';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url).pathname;
const CONTENT = `${ROOT}content/`;
const OUT = `${ROOT}public/photos/`;
const MANIFEST = `${ROOT}src/data/photos.json`;
const ALT = `${ROOT}src/data/alt.json`;

const WIDTHS = [720, 1080, 1600, 2560];
const JPEG_WIDTHS = [720, 1600];
const AVIF = { quality: 70, effort: 4 };
const JPEG = { quality: 82, mozjpeg: true, progressive: true };
/** Folders in public/photos that are not albums. */
const KEEP = new Set(['404', 'support']);

const all = process.argv.includes('--all');
const natural = new Intl.Collator('en', { numeric: true }).compare;

function fullSize(w, h) {
  if (h > w) return h > 2160 ? [Math.round((w * 2160) / h), 2160] : [w, h];
  if (w <= 3840) return [w, h];
  const fw = (h * 3840) / w >= 1080 ? 3840 : Math.round((w * Math.min(h, 1080)) / h);
  return [Math.min(fw, w), Math.round((h * Math.min(fw, w)) / w)];
}

const MAKES = { SONY: 'Sony' };
const fmtShutter = (t) => (t >= 1 ? `${Math.round(t * 10) / 10}` : `1/${Math.round(1 / t)}`);

function readExif(buf) {
  if (!buf) return undefined;
  const { Image: img = {}, Photo: ph = {} } = exifReader(buf);
  if (!img.Model || !ph.ExposureTime) return undefined;
  const make = MAKES[img.Make] ?? img.Make ?? '';
  const camera = img.Model.toLowerCase().startsWith(make.toLowerCase()) ? img.Model : `${make} ${img.Model}`;
  const lens = ph.LensModel && !/^-+$/.test(ph.LensModel) ? ph.LensModel : make === 'DJI' ? 'built-in' : '';
  const taken = ph.DateTimeOriginal instanceof Date ? ph.DateTimeOriginal.toISOString().slice(0, 10) : '';
  // manual lenses report no focal length or aperture; left out rather than written as null
  const round = (x) => (x ? Math.round(x * 10) / 10 : undefined);
  return {
    camera,
    lens,
    focal: round(ph.FocalLength),
    aperture: round(ph.FNumber),
    shutter: fmtShutter(ph.ExposureTime),
    iso: ph.ISOSpeedRatings,
    taken,
  };
}

const isNewer = async (file, than) => (await stat(file).catch(() => null))?.mtimeMs >= than;

async function buildPhoto(src, dir, id) {
  const meta = await sharp(src).metadata();
  // sharp reports the stored size; EXIF orientations 5–8 are rotated by 90°
  const [w, h] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  const [fw, fh] = fullSize(w, h);
  const widths = [...WIDTHS.filter((x) => x < fw), fw];
  const jpegWidths = JPEG_WIDTHS.map((x) => Math.min(x, fw)).filter((x, i, a) => a.indexOf(x) === i);
  const outputs = [...widths.map((x) => `${id}-${x}.avif`), ...jpegWidths.map((x) => `${id}-${x}.jpg`)];

  const srcTime = (await stat(src)).mtimeMs;
  const fresh = !all && (await Promise.all(outputs.map((o) => isNewer(`${dir}${o}`, srcTime)))).every(Boolean);
  if (!fresh) {
    const base = sharp(src, { limitInputPixels: false }).rotate();
    // written under a temporary name first, so an interrupted run never leaves a half file that looks done
    const save = async (img, name) => {
      await img.toFile(`${dir}${name}.tmp`);
      await rename(`${dir}${name}.tmp`, `${dir}${name}`);
    };
    for (const x of widths) await save(base.clone().resize({ width: x }).avif(AVIF), `${id}-${x}.avif`);
    for (const x of jpegWidths) await save(base.clone().resize({ width: x }).jpeg(JPEG), `${id}-${x}.jpg`);
    process.stdout.write(`  ${id} ${fw}×${fh}\n`);
  }

  // ~200-byte blurred preview, inlined so grids show the photo's colours before it loads
  const lqip = await sharp(`${dir}${id}-${widths[0]}.avif`).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  return {
    photo: { id, width: fw, height: fh, widths, jpeg: jpegWidths, lqip: `data:image/webp;base64,${lqip.toString('base64')}`, exif: readExif(meta.exif) },
    outputs,
  };
}

// AVIF encoding uses about one core per image, so several photos are encoded at once
const PARALLEL = Math.max(1, Math.floor(availableParallelism() / 2));
async function pool(jobs) {
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const i = next++;
      results[i] = await jobs[i]();
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  return results;
}

const albums = {};
const alt = JSON.parse(await readFile(ALT, 'utf8').catch(() => '{}'));
const missingAlt = [];

for (const entry of (await readdir(CONTENT, { withFileTypes: true })).sort((a, b) => natural(a.name, b.name))) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const files = (await readdir(`${CONTENT}${slug}`)).filter((f) => /\.jpe?g$/i.test(f)).sort(natural);
  if (!files.length) continue;
  const dir = `${OUT}${slug}/`;
  await mkdir(dir, { recursive: true });
  console.log(`${slug}: ${files.length} photos`);

  const stems = files.map((f) => f.replace(/\.jpe?g$/i, ''));
  const ids = stems.map((s) => s.replace(/-cover$/i, ''));
  const cover = ids.find((id, i) => id !== stems[i]);
  const built = await pool(files.map((f, i) => () => buildPhoto(`${CONTENT}${slug}/${f}`, dir, ids[i])));
  const photos = built.map((b) => b.photo);
  const keep = new Set(built.flatMap((b) => b.outputs));
  missingAlt.push(...ids.filter((id) => !alt[id]));
  for (const f of await readdir(dir)) {
    if (!keep.has(f)) {
      await rm(`${dir}${f}`);
      console.log(`  removed ${slug}/${f}`);
    }
  }
  albums[slug] = { cover: cover ?? photos[0].id, photos };
}

// albums whose folder is gone
for (const entry of await readdir(OUT, { withFileTypes: true })) {
  if (entry.isDirectory() && !KEEP.has(entry.name) && !albums[entry.name]) {
    await rm(`${OUT}${entry.name}`, { recursive: true });
    console.log(`removed album ${entry.name}`);
  }
}

await writeFile(MANIFEST, `${JSON.stringify(albums, null, 1)}\n`);
const count = Object.values(albums).reduce((n, a) => n + a.photos.length, 0);
console.log(`\n${count} photos in ${Object.keys(albums).length} albums -> src/data/photos.json`);
if (missingAlt.length) console.log(`No alt text yet in src/data/alt.json: ${missingAlt.join(', ')}`);
