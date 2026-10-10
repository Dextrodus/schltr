// Every state of the site that has its own URL. Leaning a side (hover) has none.

import { albumBySlug } from '../data/photos';

export type PhotoPage = 'albums' | 'album' | 'uses' | 'contact';
export type TechPage = 'start' | 'introduction' | 'career' | 'what-i-use' | 'contact';

export type View =
  | { side: 'split' }
  | { side: 'photo'; page: PhotoPage; album?: string }
  | { side: 'tech'; page: TechPage };

export const techPages: TechPage[] = ['start', 'introduction', 'career', 'what-i-use', 'contact'];

export function pathFor(view: View): string {
  if (view.side === 'split') return '/';
  if (view.side === 'photo') {
    if (view.page === 'album') return `/photo/${view.album}/`;
    if (view.page === 'uses') return '/photo/what-i-use/';
    if (view.page === 'contact') return '/photo/contact/';
    return '/photo/';
  }
  return view.page === 'introduction' ? '/tech/' : `/tech/${view.page}/`;
}

export function viewFromPath(path: string): View {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'photo') {
    const page = parts[1];
    if (!page) return { side: 'photo', page: 'albums' };
    if (page === 'what-i-use') return { side: 'photo', page: 'uses' };
    if (page === 'contact') return { side: 'photo', page: 'contact' };
    if (albumBySlug(page)) return { side: 'photo', page: 'album', album: page };
  }
  if (parts[0] === 'tech') {
    const page = (parts[1] ?? 'introduction') as TechPage;
    if (techPages.includes(page)) return { side: 'tech', page };
  }
  return { side: 'split' };
}

export function titleFor(view: View): string {
  if (view.side === 'split') return 'schltr';
  if (view.side === 'photo') {
    if (view.page === 'album') return `${albumBySlug(view.album ?? '')?.name ?? 'Album'} · schltr`;
    return { albums: 'Portfolio', uses: 'What I use', contact: 'Contact', album: '' }[view.page] + ' · schltr';
  }
  return `${view.page} · schltr`;
}

/** The view at exactly this path, or null when no page has it. */
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
  const arg = input.trim().replace(/^cd\s+/, '').toLowerCase();
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
