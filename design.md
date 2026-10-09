# schltr — Design

Everything design-relevant for schltr.com, a combined photography portfolio and dev/nerd personal website. Feature details and joke texts are in [README.md](README.md).

> The design itself now lives in Claude Design. The latest handoff ([design/handoff/2026-10-09](design/handoff/2026-10-09/README.md)) is the source of truth where it differs from this document (colors, fonts, footer, layout). Its values are captured as tokens in [src/styles/tokens.css](src/styles/tokens.css). This file stays as the original brief.

---

## Direction: Two Worlds

Two halves with clearly different styles. The divider is where they meet.

| | Photography | Dev |
|---|---|---|
| Mood | Darkroom | Code / terminal |
| Background | Warm near-black | Cold, neutral dark |
| Texture | Subtle film grain | Clean, flat |
| Type | To explore (should feel analog, not techy) | Monospace |
| Accent | To explore (e.g. darkroom safelight red) | To explore |
| Focus | The photos supply the color; UI stays quiet | Text and structure |

Shared across both:
- Clean and modern
- Dark mode only (light mode is a possible later addition, not part of this design)
- Central "schltr" title that always leads back to the split start page
- Fonts are self-hosted, no external font loading

---

## Things to Avoid

The site must not look like a typical "vibe coded" website:
- Purple-to-blue gradients and gradient text
- Glassmorphism: frosted, see-through cards with glowing borders
- Everything in rounded cards with soft shadows
- Emoji as icons
- Centered hero section with headline, subtitle and two buttons
- Generic sparkle or rocket icons
- Rambling text: only minimal, information-dense text and jokes, no rambling

---

## Pages & Layout

### Start page
- Split in two: photography and dev
- Desktop: side by side. Mobile: diagonal split
- Each side shows its own sidebar with its pages, already on the initial screen
  - Photography: top-down
  - Dev: bottom-up (makes the diagonal work on mobile)
- Hovering a side moves the divider to 80/20 in favor of that side
  - Dead zone near the divider, so the panels don't flicker when the mouse crosses the middle
  - The 20% side must stay recognizable
- Choosing a page on one side opens that side fully
- Mobile: drag handle on the divider to open one side fully
- Option to try: "schltr" logo on the divider/drag handle
- No footer

### Switching sides
- Central title: back to the split start page
- Logo click: extends the other side's sidebar to jump there directly

### Footer
- Only appears once a side is maximised
- Possible place for the tech support button

### Dev side
- Introduction (default page), placeholder text in [content/introduction.md](content/introduction.md)
- Career (clean version)
- Hobbies (3D printing etc.)
- Contact (simple mailto links)

### Photography side
- Top navigation: Albums, Uses (alternatively "What I use"), Contact
- Albums: dropdown on hover; click opens the album overview with thumbnails
- Album overview: one thumbnail per album (e.g. City, People, Landscapes, Astro, Action)
- Album pages: masonry grid
- EXIF data per photo, shown as JSON or similar; lens links to the Uses page

### Uses page
- Camera and dev gear in one page
- Camera: per-lens counter of photos taken, including borrowed lenses
- Dev: includes a live-looking 3D printer status ("Currently printing: something I don't need. 37%")

### 404 page
- "Is the lens cap on?"

---

## Small Components

Playful elements stay out of the way. Placement may differ between desktop and mobile.

- **Cookie preferences button:** small button/banner on every page, not a popup on load. Has an X that hides it for that visit. Opens the crunchy/soft choice.
- **Tech support button:** opens a yes/no flow, ends with a dog photo as "Level 2 Support" and a link to Contact.
- **Tooltips / callouts:** short joke texts on links and photos; optionally a moving banner.
- **Favicon:** swaps with the active side (e.g. aperture vs. `>_`).

---

## Mobile Interactions

- No hover: tapping Albums goes straight to the album overview
- Tap shows tooltips and EXIF data
- Long-press on a photo replaces the right-click easter egg

---

## Accessibility

- Every photo has alt text
- Respect "reduce motion": divider and side transitions are toned down or disabled
- Keyboard access: the divider can be moved and a side opened with the keyboard (e.g. arrow keys)
