# schltr — design handoff

Export of the schltr.com start-page design from the Design canvas, 9 Oct 2026.

## What's in here

| Path | What |
|---|---|
| `design/Main.dc.html` | Desktop design, fully interactive (split view, both sides, albums, viewer, dialogs). Reference source: it needs the canvas runtime (`support.js`) to run, so read it rather than open it. |
| `design/Mobile.dc.html` | Mobile start page (static). |
| `design/canvas.json` | Canvas layout of the two artboards. |
| `images/thumbs/` | Grid-size photos (≤1200 px) used in the album grid and covers. |
| `images/full/` | Larger photos (≤2048 px) used in the photo viewer. No EXIF, no GPS. |
| `images/blob-map.json` | Maps the `/_blob/<id>` references in the design files to the files in `images/`. |

The camera data shown in the viewer is written into `Main.dc.html` (the `X(...)` entries), because the exported files carry no EXIF.

## Colors

**Photo side**

| Role | Value |
|---|---|
| Background | `#80838f` + film grain |
| Text | `#16181e` |
| Secondary text | `#2b2e37` |
| Highlight (current page, hover, focus, link underline on dark) | `#0e3a6b` |
| Photo placeholder | `#6c6f7b` |
| Album tree line, edge strip line | `#b4b7c0` |

**Tech side**

| Role | Value |
|---|---|
| Background | `#0b1626` (flat) |
| Text | `#dce6f0` |
| Secondary text, prompts | `#8fa2b8` |
| Highlight, cursor | `#6fb7cf` |
| Surface (printer box) | `#12223a` |

**Shared**

| Role | Value |
|---|---|
| Divider | `#f2f2f2`, 1px |
| Footer background | split `#464c5a`, photo open `#55585f`, tech open `#060d18` (520 ms fade) |
| Footer text | `#e2e4e8` |
| Dialogs and popups | bg `#1c1c1c`, border `#333333`, text `#e6e6e6`, secondary `#b5b5b5`, link `#8fb3e6` |
| Cookie: correct / wrong | `#7cc08a` / `#e0574a` border, `#f08a7e` text |

## Type

- **Photo side:** Schibsted Grotesk. Menu items 30px/600, album names 20px/500, album title 44px/700, body 18px.
- **Tech side:** Martian Mono, everything 14px. Headings are `# text` in `#6fb7cf`, weight 700, same size.
- **Wordmark:** "sch" Schibsted Grotesk 65px/600, letter-spacing −0.02em. "ltr" Martian Mono 56px/400, letter-spacing −0.03em, margin-left −0.08em. At these sizes the "h" and "l" are the same height. Labels underneath share one baseline: "photo" (Schibsted 17px/500) and "tech" (Martian 14px).
- Self-host both fonts on the live site (Fontsource: `@fontsource-variable/schibsted-grotesk`, `@fontsource-variable/martian-mono`).
- Film grain: inline SVG `feTurbulence` fractalNoise, baseFrequency 0.75, 3 octaves, desaturated, opacity 0.17, above the background and below content.

## Layout (desktop)

- **Header band:** 0–132px. Holds the wordmark, centered on the divider.
- **Footer:** 64px, full width, always visible. Cookie preferences on the left; Impressum, Credits and Tech support centered.
- **Photo menu:** left 32px, top 140px. Albums indented 24px with a 1px line on their left.
- **Photo content:** left 304px, top 140px. Album covers sit in a fixed grid: 3 rows, filled column by column, column width `calc((100vw − 400px) / 4)`. Moving the divider only reveals or hides covers; it never reflows them.
- **Tech menu:** bottom-up `ls` listing, bottom-right, 24px above the footer. The last line is `cd <hovered item>` with a blinking cursor.

## Divider behaviour

- **Positions:** split 50/50. Hovering a side widens it to 80/20. Clicking a page opens that side to 100%.
- **Dead zones:**
  - ±120px around the divider, only while it is in the middle.
  - Once a side is widened, crossing the divider sends it straight back to the middle.
  - The header and footer bands never widen a side. Entering them returns a widened side to the middle.
  - The open cookie popup and the dialogs are ignored.
- **Animation:** 520ms `cubic-bezier(.22,.8,.24,1)` for the divider, the halves and the wordmark. With `prefers-reduced-motion`, everything jumps without animating.
- **Keyboard:** focus the wordmark, then ← / → to widen a side, Enter to open it, Esc to return.

## Open side

- **Wordmark:** it shrinks to 47% and slides into the top corner of the closed side. "sch" fades to `#6fb7cf` when the tech side is open.
- **Back strip:** a 48px strip on the closed side's edge, with a 1px line and a tall chevron. Clicking anywhere on it returns to the split. Clicking the wordmark does the same.

## Albums and viewer

- **Album page:** masonry with `column-width: 300px` and 8px gaps. Photos are never cropped.
- **Viewer:** full screen. Click the left or right half of the photo, the edge chevrons, or ← / → to navigate. Esc closes. The image fills the space between the bars with `object-fit: contain`.
- **Camera data line:** each field has a fixed-width slot in `ch`, so nothing shifts between photos: camera 21, lens 29, focal 7, aperture 5, shutter 8, ISO 9, date 11. The lens links to What I use.
- **Right-click** on any photo shows: "Please do not try to download these web-quality files. Just ask, I can send you a high-res version." with a Contact link. It hides after 4.5s.

## Small components

- **Cookie popup:**
  - Choosing an answer swaps the buttons for the result in the same fixed-height slot.
  - Crunchy: green border, cookie pop with 6 crumbs; closes after 1.8s.
  - Soft: shake and red border; closes after 1.6s.
  - × hides the popup for the visit.
- **Tech support:**
  - Fixed 236px body with centered text and the buttons bottom-right.
  - "No" leads to "Please try that first."
  - After the three questions: "works on my machine" → Escalate → 1.8s of dots → the card grows to 380px and shows the Level 2 Support dog and a contact link.
- **Impressum:** name and email. **Credits:** list from the README.

## Open items

- Dog photo for Level 2 Support: still a placeholder.
- Impressum: § 5 DDG usually expects a postal address. Check whether the site counts as purely private.
- The schltr design system still has the old brown/serif tokens. The colors above are the current ones.
- Mobile artboard: static, and it doesn't have the dialogs, album pages or viewer yet.
- Not designed yet: tech start-screen content beyond `whoami`, Career and Hobbies pages, 404 ("Is the lens cap on?"), favicon swap, console cookie and `security.txt`.
- Live site: serve 3840px photo versions via `srcset` for 4K screens. Photo counts on What I use should be computed from EXIF.
