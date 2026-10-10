# schltr

Konrad Schlüter's personal site: a photography portfolio and a dev side, split down the middle. Desktop only so far; mobile is still to come.

Work in Progress! Currently at https://schltr.pages.dev, schltr.com still points at the old Adobe Portfolio site.

## The site

The start page shows both sides next to each other. Hovering a side moves the divider to 80/20 in its favour, choosing a page opens that side fully, and the `schltr` wordmark always leads back to the split. Keyboard: focus the wordmark, then ← / → move the divider (← widens the tech side), Enter opens the wider side, Esc returns to the middle.

**Photo side** (`/photo/`)

- Portfolio: album covers (Landscapes, Astro, People, Action, Wildlife, Street, City, Aerial), each album as a grid.
- Viewer with camera data from EXIF. Camera and lens link to What I use. Clicking the photo or pressing F opens true fullscreen, where the photo can be zoomed and panned. Back and Esc close it.
- What I use: cameras and lenses with the number of photos taken with each.
- Contact.
- Right-clicking a photo shows a note instead of the save menu.

**Tech side** (`/tech/`), styled as a terminal

- Pages: introduction, career, what-i-use (dev tools and the 3D printer), contact, and start (the short `whoami` screen the split view shows).
- The `cd` prompt under the page list is typeable: type a path anywhere on the page and press Enter.

**Everywhere**

- Footer with a cookie-preferences joke (crunchy or soft), Impressum, Credits and a Tech support quiz that ends with the Level 2 support dog. LinkedIn, mail and, on the tech side, GitHub as icons with popups.
- A goat on the 404 page.
- `prefers-reduced-motion` turns off all transitions.
- Fonts are self-hosted: Avancement 2020 on the photo side, Martian Mono on the tech side.

## Development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run check    # type check
npm run format   # Prettier
```

Astro builds a static page for every URL; one React island renders the whole site in the matching state, so deep links work and moving between pages stays animated.

| Path | What |
|---|---|
| `src/components/Site.tsx` | The interactive shell: split view, divider, viewer, dialogs |
| `src/lib/route.ts` | Which URL belongs to which state, and how `cd` resolves paths |
| `src/data/` | Albums and photos, gear, career, contact details |
| `src/styles/` | Design tokens, fonts and styles |
| `scripts/photos.mjs` | The photo pipeline, see below |

## Photos

Original exports go into `content/<album>/` (git-ignored), named `<album>-NN.jpg`; a file ending in `-cover` becomes the album cover, otherwise the first photo is. Then:

```sh
npm run photos   # builds AVIF/JPEG sizes and blur previews into public/photos/, removes deleted ones
```

and commit `public/photos/` and `src/data/photos.json`. Album names and order are in `src/data/photos.ts`, alt texts in `src/data/alt.json`; the script lists photos that have none yet. Gear names on What I use come from `src/data/gear.ts`, which maps EXIF names to display names.

## Deployment

Every push builds and deploys to Cloudflare Pages ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)): `main` goes to https://schltr.pages.dev, other branches to `<branch>.schltr.pages.dev` (Cloudflare shortens long branch names). Needs the repo secrets `CLOUDFLARE_API_TOKEN` (Cloudflare Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID`. The `pages.dev` copies are marked noindex in `public/_headers`.

Open work, the go-live steps and unused ideas are in [docs/todo.md](docs/todo.md).
