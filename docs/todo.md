# To do

## Mobile

- Diagonal split instead of side by side, with a drag handle on the divider to open one side fully (maybe the `schltr` logo on the handle).
- Tapping Portfolio goes straight to the album covers.
- Tap shows tooltips and camera data instead of hover; long-press on a photo replaces the right-click note.

## Go-live

schltr.com is registered and hosted at Namecheap and still serves Adobe Portfolio. To switch:

1. Copy the mail records (MX, SPF, DKIM, DMARC, mail hostnames) to Cloudflare first; the existing mail server stays, k@schltr.com is a catch-all.
2. Move the nameservers from Namecheap to Cloudflare.
3. Recreate the Namecheap URL redirects.
4. Add schltr.com as a custom domain of the Pages project.

## Open checks

- Avancement 2020: web licence not verified yet.
- Samyang 20mm and DJI Mini 5 Pro: their EXIF names in `src/data/gear.ts` are guesses until photos taken with them exist.

## Ideas

- Favicon that changes with the side (aperture vs. `>_`).
- ASCII cookie in the developer console with a bug bounty ("If you find a bug, I will bake cookies for you, crunchy of course, and guaranteed bug-free"), plus `/.well-known/security.txt` pointing to it.
- Career as a `git log`.
- 3D viewer of something I designed.
- Light mode with a toggle.

Unused jokes:

- "Wow, your camera takes great photos!"
- "There's a dead fly on your lens..." / "It's not a bug, it's a filter!"
- "To cancel your subscription, please prove your identity by solving P=NP"
- "I have two Microsoft Outlooks, and neither one of those are working." (Reid Wiseman to mission control, Artemis II)
- "pls no SQL Injection" (if the site ever gets input fields)
