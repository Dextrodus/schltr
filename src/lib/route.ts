// Every state of the site that has its own URL. Leaning a side (hover) has none.

import { albums, albumBySlug } from '../data/photos';

export type View = { side: 'split' } | { side: 'photo'; page: PhotoPage; album?: string } | { side: 'tech'; page: TechPage };

// Pages with a fixed URL: the directory under /photo/ or /tech/ and the page title. Albums add one page each.
const photoPages = {
  albums: { dir: '', title: 'Portfolio' },
  uses: { dir: 'what-i-use', title: 'What I use' },
  contact: { dir: 'contact', title: 'Contact' },
} as const;
// in order of the `ls` listing, top to bottom
const techPageDirs = {
  start: 'start',
  introduction: '',
  career: 'career',
  'what-i-use': 'what-i-use',
  contact: 'contact',
} as const;

export type PhotoPage = keyof typeof photoPages | 'album';
export type TechPage = keyof typeof techPageDirs;

export const techPages = Object.keys(techPageDirs) as TechPage[];

/** Every view that gets its own static page. */
export const allViews: View[] = [
  { side: 'split' },
  ...(Object.keys(photoPages) as (keyof typeof photoPages)[]).map((page): View => ({ side: 'photo', page })),
  ...albums.map((a): View => ({ side: 'photo', page: 'album', album: a.slug })),
  ...techPages.map((page): View => ({ side: 'tech', page })),
];

const dirPath = (side: string, dir: string) => (dir ? `/${side}/${dir}/` : `/${side}/`);

export function pathFor(view: View): string {
  if (view.side === 'split') return '/';
  if (view.side === 'tech') return dirPath('tech', techPageDirs[view.page]);
  return dirPath('photo', view.page === 'album' ? (view.album ?? '') : photoPages[view.page].dir);
}

export function viewFromPath(path: string): View {
  const [side, dir = '', ...rest] = path.split('/').filter(Boolean);
  if (rest.length) return { side: 'split' };
  if (side === 'photo') {
    const page = (Object.keys(photoPages) as (keyof typeof photoPages)[]).find((p) => photoPages[p].dir === dir);
    if (page) return { side: 'photo', page };
    if (albumBySlug(dir)) return { side: 'photo', page: 'album', album: dir };
  }
  if (side === 'tech') {
    // /tech/introduction/ is accepted too, so `cd introduction` finds it
    const page = techPages.find((p) => techPageDirs[p] === dir || p === dir);
    if (page) return { side: 'tech', page };
  }
  return { side: 'split' };
}

export function titleFor(view: View): string {
  if (view.side === 'split') return 'schltr';
  if (view.side === 'tech') return `${view.page} · schltr`;
  if (view.page === 'album') return `${albumBySlug(view.album ?? '')?.name ?? 'Album'} · schltr`;
  return `${photoPages[view.page].title} · schltr`;
}

/** The view at exactly this path (or /tech/introduction/, the long form of /tech/), or null when no page has it. */
export function knownView(path: string): View | null {
  const view = viewFromPath(path);
  if (pathFor(view) === path) return view;
  return path === '/tech/introduction/' ? view : null;
}

/**
 * Where `cd <input>` goes, shell style: `~` is home (/), absolute paths stay as they are, and relative
 * ones are tried against the current directory first, then the root, /tech/ and /photo/, so `cd career`
 * works from anywhere. Nothing known: the literal path, which lands on the 404 page.
 */
export function resolveCd(input: string, cwd: string): string {
  const arg = input
    .trim()
    .replace(/^cd\s+/, '')
    .toLowerCase();
  if (arg === '' || arg === '~') return '/';
  const rel = arg.startsWith('~/') ? arg.slice(1) : arg;
  const bases = rel.startsWith('/') ? ['/'] : [...new Set([cwd, '/', '/tech/', '/photo/'])];
  const tries = bases.map((base) => {
    const url = new URL(rel, `http://x${base}`);
    // pages live at directory URLs
    if (!/\.[a-z0-9]+$/.test(url.pathname) && !url.pathname.endsWith('/')) url.pathname += '/';
    return url.pathname + url.search + url.hash;
  });
  return tries.find((t) => knownView(t.replace(/[?#].*$/, ''))) ?? tries[0];
}
