// Album cover grid layout. Runs inline in <head> so the grid is sized before first paint.
// That is before the stylesheet applies, so the layout values marked with a token copy tokens.css: keep them in sync.
//
// The divider in the split view always cuts one cover column in half. Within that rule,
// pick the column width, column and row count and left edge that give the largest
// covers fitting between header and footer: never taller than 4:3, and penalised when
// cropped wider than 2:1. Columns are placed in window coordinates, so moving the
// divider only reveals or hides them.
function fitCovers(n) {
  const MENU_RIGHT = 185; // right edge of the widest menu text ("What I use")
  const MIN_GAP = 40; // between menu text and covers
  const MAX_LEFT = 304;
  const TOP = 140; // --content-top
  const BOTTOM = 64 + 24; // --footer-h plus breathing room
  const STRIP = 48; // --strip-w
  const GAP = 8;

  function layout(W, H) {
    const D = W / 2;
    const right = W - STRIP - 16;
    const avail = Math.max(H, 640) - TOP - BOTTOM;
    let best = null;
    // j: whole columns left of the one the divider cuts
    for (let j = 0; j <= 3; j++) {
      for (let L = MENU_RIGHT + MIN_GAP; L <= MAX_LEFT; L += 2) {
        const w = (D - L - j * GAP) / (j + 0.5);
        if (w < 100) continue;
        const more = Math.floor((right - D - w / 2) / (w + GAP));
        if (more < 0) continue;
        for (let rows = 1; rows <= n; rows++) {
          const cols = Math.ceil(n / rows);
          if (cols > j + 1 + more || cols < j + 1) continue;
          const h = Math.min((avail - (rows - 1) * GAP) / rows, w * 0.75);
          const wide = w / h;
          const score = w * h * (wide > 2 ? (2 / wide) ** 2 : 1);
          if (!best || score > best.score) best = { score, L, w, h, rows };
        }
      }
    }
    return best;
  }

  function apply() {
    const W = document.documentElement.clientWidth;
    const r = layout(W, window.innerHeight);
    if (!r) return;
    const s = document.documentElement.style;
    s.setProperty('--cover-left', `${r.L}px`);
    s.setProperty('--cover-area', `${W - r.L - STRIP}px`);
    s.setProperty('--cover-w', `${Math.floor(r.w)}px`);
    s.setProperty('--cover-h', `${Math.floor(r.h)}px`);
    s.setProperty('--cover-rows', `${r.rows}`);
  }

  apply();
  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(apply);
  });
}
