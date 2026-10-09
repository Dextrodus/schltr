# schltr
Personal Website

Combined photography portfolio and personal website as dev/nerd.

Status: desktop start page implemented from the Claude Design handoff of 9 Oct 2026 (`design/handoff/2026-10-09/`). Mobile next.

## Development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run check    # type check
```

- `src/components/Site.tsx`: the whole interactive shell (split view, divider, wordmark, viewer, dialogs). Every URL renders it in the right state, so deep links work and moving between pages stays animated.
- `src/lib/route.ts`: which URL belongs to which state.
- `src/data/`: albums, photos with camera data, and gear. Photos live in `public/photos/`.
- `src/styles/tokens.css`: the design tokens, derived from the handoff.
- `design/handoff/<date>/`: Claude Design exports, kept as design history.

## Deployment

Every push builds and deploys to Cloudflare Pages ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)): `main` goes to https://schltr.pages.dev, other branches to `https://<branch>.schltr.pages.dev`. Needs the repo secrets `CLOUDFLARE_API_TOKEN` (Cloudflare Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID`.

schltr.com itself still points at Adobe Portfolio. Going live means moving the nameservers from Namecheap to Cloudflare, copying the mail records (MX, SPF, DKIM, DMARC) first, recreating the Namecheap URL redirects, then adding schltr.com as a custom domain of the Pages project.

---

## Layout & Navigation

### Start page
- Separated into two parts: one for photography, one for dev
- Side by side on desktop, diagonal on mobile (instead of top/bottom)
- Each side has its own sidebar for choosing different pages, already visible on the initial screen
  - Photography: top-down
  - Dev: bottom-up (to make the diagonal work on mobile)
- Hovering over one side moves the divider to 80/20 in favor of that side
  - Dead zone near the divider, so the panels don't flicker back and forth when the mouse crosses the middle
- When a point on one side is chosen, that side opens fully
- Drag handle on the divider for mobile, allowing users to open one side fully
- Option to try: "schltr" logo on the divider/drag handle
- Favicon swaps depending on which side the visitor is on (e.g. aperture vs. `>_`)
- No footer on the start page

### Switching sides
- Central title that always goes back to the split start page
- Logo click extends the sidebar of the other section, to jump directly to the other side

### Footer
- Only shows up once one side has been maximised
- Possible place for the tech support button

### Dev side
Sections:
- Introduction (default page), placeholder text in [content/introduction.md](content/introduction.md)
- Career (clean version for now)
- Hobbies (3D printing etc.)
- Contact

### Photography side
- Navigation at the top: Albums, Uses (alternatively "What I use"), Contact
- Albums: dropdown on hover, click leads to the main page with album thumbnails
  - On mobile (no hover), tapping Albums goes directly to the full-screen album overview page, same as clicking on desktop
- Main page shows album thumbnails with links to albums (e.g. City, People, Landscapes, Astro, Action...)
- Album pages use a masonry grid
- Photos can mostly keep their GPS data (almost never taken at home)

### Contact
- Simple mailto links
- Catch-all address, so joke addresses like spam@schltr.com already work

### Mobile interactions
- Tapping Albums goes to the album overview (see above)
- Tap shows tooltips and EXIF data (instead of hover)
- Long-press on a photo replaces the right-click easter egg

---

## Style

All design-relevant info is collected in [design.md](design.md).

- Two worlds: darkroom style with film grain for photography, monospace/code-like for dev
- Clean and modern, without the typical "vibe coded website" look
- Dark mode only for now; maybe add a light mode and toggle later
- Still to brainstorm, possibly explore in Claude Design before designing the whole website
- Playful elements should be relatively out of the way; placement may differ between mobile and desktop

---

## Features

### Camera EXIF data
- Shown in JSON or similar
- Linked to the Uses page (e.g. clicking the lens jumps to that lens on the Uses page)

### Uses page
What I use, both for camera stuff and dev stuff.

Camera:
- a7c
- Tamron 28-200
- Samyang 75 1.8
- Counter of how many photos were taken with each lens
- Also lists lenses I only borrowed and don't own (needed for the counter / EXIF links)

Dev:
- Zed / VS Code
- Claude Code / Codex
- Whatever framework the website is in
- React, Python, Marimo Notebooks, Java, LaTeX
- Fedora w. GNOME (probably changed by the time you read this)
- Anycubic Kobra S1, with a live-looking status (e.g. "Currently printing: something I don't need. 37%")
- Onshape

---

## Playful Ideas

In general, many easter eggs if possible.

### Fake cookie banner
- Does not appear immediately; instead a small "cookie preferences" button/banner on every page
- Has an X that removes it for that visit

States that I do not use cookies and asks people to choose which kind of cookies they prefer: crunchy or soft.
- Soft: "Disappointing, your preference will be ignored."
- Crunchy (green): "Good choice. Here's a cookie as a reward: 🍪"

### Tech support button
A flow of yes/no questions. Each "no" asks them to try that, each "yes" goes to the next question:
1. Have you tried turning it off and on again?
2. Did you take off the lens cap?
3. Have you tried unplugging it, waiting 10 seconds and then plugging it back in?
4. Well, it works on my machine.
5. Escalating to Level 2 Support... (with a cute dog image as Level 2 Support)
6. Link to the contact page

### Silly tooltips / explanations / callouts
Or a moving banner showing all kinds of messages/statements.

Photography part:
- "Wow, your camera takes great photos!"
- "I think there's a dead fly on your lens..."
- "It's not a bug, it's a filter!"

Contact part:
- "Send any complaints to spam@schltr.com for appropriate disposal"
- "To cancel your subscription, please prove your identity by solving P=NP"
- "I have two Microsoft Outlooks, and neither one of those are working." - Astronaut Reid Wiseman to mission control during Artemis II
- "Your message will be read by a human. Eventually."

GitHub link:
- "Copilot hurt itself in its confusion!"
- "Fork me. I dare you."

LinkedIn link:
- "Loading Buzzwords..."
- "Preparing preposterously powerful post..."

Input fields (if there are any):
- "pls no SQL Injection"

### Other easter eggs
- Right-click on a photo: "Nice try. Just ask, I'm happy to send you a high-res file."
- 404 page: "Is the lens cap on?"
- ASCII art of a cookie in the developer console with a bug bounty (wording not final): "If you find a bug, I will bake cookies for you (crunchy of course, and guaranteed bug-free)"
- `/.well-known/security.txt` pointing to the same bug bounty

### Credits
- Bad Puns: Mostly me
- Easter Eggs: The Easter Bunny
- Photos: Me, unless marked otherwise
- Code: Mostly Claude
- QA: You, right now
- Bugs: Probably me, but let's blame Claude

---

## Accessibility

- Every photo with alt text
- Respect "reduce motion": divider and side transitions are toned down or disabled
- Keyboard access: the divider can be moved and a side opened with the keyboard (e.g. arrow keys)

---

## Legal

- Impressum with only name and email address (no postal address)
- No external font loading (fonts are self-hosted)

---

## Implementation

- Framework: Astro, with React components where helpful
- Hosting: Cloudflare Pages, see [Deployment](#deployment). Very little needed, willing to pay for stability if necessary. No significant traffic expected (<20 visitors per month)

---

## Future Ideas

Not planned for now, but worth keeping in mind:
- 3D viewer of something I designed (3D printing is not a big enough focus yet)
- Git version of the Career page (career as a `git log`)
- Light mode with toggle
