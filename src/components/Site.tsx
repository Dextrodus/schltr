import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { albumBySlug } from '../data/photos';
import { pathFor, titleFor, viewFromPath, type View } from '../lib/route';
import { ChevronLeft, ChevronRight, type Go } from './bits';
import Dialog, { type DialogKind } from './Dialogs';
import Footer from './Footer';
import PhotoSide from './PhotoSide';
import TechSide from './TechSide';
import Viewer from './Viewer';
import Wordmark, { type Mode } from './Wordmark';

const FRAC: Record<Mode, number> = { split: 0.5, 'lean-photo': 0.8, 'lean-tech': 0.2, 'open-photo': 1, 'open-tech': 0 };
const HEADER = 132;
const FOOTER = 64;
// no leaning within this distance of the divider while it is in the middle
const DEAD_ZONE = 120;

export default function Site({ initial }: { initial: View }) {
  const [view, setView] = useState<View>(initial);
  const [lean, setLean] = useState<'photo' | 'tech' | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [toast, setToast] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number>(undefined);

  const mode: Mode =
    view.side === 'photo' ? 'open-photo' : view.side === 'tech' ? 'open-tech' : lean ? (`lean-${lean}` as Mode) : 'split';
  const frac = FRAC[mode];
  const open = view.side !== 'split';

  const go: Go = useCallback((next, hash) => {
    setView(next);
    setLean(null);
    setViewer(null);
    const path = pathFor(next);
    if (path !== location.pathname || location.hash) history.pushState(null, '', path);
    document.title = titleFor(next);
    // lens links from the viewer: a real fragment navigation once the page has rendered, so :target applies
    if (hash) requestAnimationFrame(() => location.replace(`#${hash}`));
  }, []);
  const goHome = () => go({ side: 'split' });

  useEffect(() => {
    const onPop = () => {
      const next = viewFromPath(location.pathname);
      setView(next);
      setLean(null);
      setViewer(null);
      document.title = titleFor(next);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      clearTimeout(toastTimer.current);
    };
  }, []);

  // ── divider: hover leans a side ───────────────
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (open) return;
    // floating popups and dialogs leave the divider alone
    if ((e.target as Element).closest?.('.no-lean')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // header and footer bands never lean a side; a leaned side returns to the middle
    if (y < HEADER || y > rect.height - FOOTER) {
      if (lean) setLean(null);
      return;
    }
    const divider = rect.width * frac;
    if (!lean) {
      if (Math.abs(x - divider) < DEAD_ZONE) return;
      setLean(x < divider ? 'photo' : 'tech');
      return;
    }
    // leaned: crossing the divider sends it straight back to the middle
    const crossed = lean === 'photo' ? x > divider : x < divider;
    if (crossed) setLean(null);
  };

  // ── keyboard on the wordmark ──────────────────
  const onWordmarkKey = (e: KeyboardEvent) => {
    if (open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        goHome();
      }
      return;
    }
    const order = ['tech', null, 'photo'] as const;
    const i = order.indexOf(lean);
    if (e.key === 'ArrowLeft') setLean(order[Math.max(0, i - 1)]);
    else if (e.key === 'ArrowRight') setLean(order[Math.min(2, i + 1)]);
    else if (e.key === 'Enter' || e.key === ' ') {
      if (lean === 'photo') go({ side: 'photo', page: 'albums' });
      else if (lean === 'tech') go({ side: 'tech', page: 'introduction' });
    } else if (e.key === 'Escape') setLean(null);
    else return;
    e.preventDefault();
  };

  // ── right-click on a photo ────────────────────
  const onNoCopy = (e: MouseEvent) => {
    e.preventDefault();
    const root = rootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    const x = Math.max(16, Math.min(e.clientX - r.left + 12, r.width - 296));
    const y = Math.max(16, Math.min(e.clientY - r.top + 12, r.height - 200));
    clearTimeout(toastTimer.current);
    setToast({ x: Math.round(x), y: Math.round(y) });
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  };

  const album = view.side === 'photo' && view.page === 'album' ? albumBySlug(view.album ?? '') : undefined;
  const step = (d: number) => album && setViewer((i) => (i === null ? i : (i + d + album.photos.length) % album.photos.length));

  const contact = () => go(view.side === 'tech' ? { side: 'tech', page: 'contact' } : { side: 'photo', page: 'contact' });

  return (
    <div
      ref={rootRef}
      className="shell"
      style={{ '--photo-w': `${frac * 100}%` } as CSSProperties}
      onMouseMove={onMove}
      onMouseLeave={() => !open && setLean(null)}
    >
      <PhotoSide
        page={view.side === 'photo' ? view.page : 'albums'}
        album={view.side === 'photo' ? view.album : undefined}
        open={view.side === 'photo'}
        dimmed={frac < 0.5}
        go={go}
        onNoCopy={onNoCopy}
        onOpenPhoto={(i) => {
          setToast(null);
          setViewer(i);
        }}
      />
      <TechSide page={view.side === 'tech' ? view.page : null} leanedAway={frac > 0.5} go={go} />

      <div className="divider slide" aria-hidden="true" style={{ opacity: open ? 0 : 1 }} />

      <Wordmark mode={mode} frac={frac} onClick={goHome} onKeyDown={onWordmarkKey} />

      {view.side === 'photo' && (
        <button
          className="strip strip--photo chev chev--photo"
          tabIndex={-1}
          onClick={goHome}
          aria-label="Back to the split view, to reach the tech side"
          title="Back to the split view"
        >
          <ChevronRight />
        </button>
      )}
      {view.side === 'tech' && (
        <button
          className="strip strip--tech chev chev--tech"
          tabIndex={-1}
          onClick={goHome}
          aria-label="Back to the split view, to reach the photography side"
          title="Back to the split view"
        >
          <ChevronLeft />
        </button>
      )}

      {album && viewer !== null && viewer < album.photos.length && (
        <Viewer album={album} index={viewer} onStep={step} onClose={() => setViewer(null)} onNoCopy={onNoCopy} go={go} />
      )}

      {toast && (
        <div className="toast popup no-lean" role="status" style={{ left: toast.x, top: toast.y }}>
          <span>Please do not try to download these web-quality files. Just ask, I can send you a high-res version.</span>
          <a
            href="/photo/contact/"
            className="po-h"
            onClick={(e) => {
              e.preventDefault();
              clearTimeout(toastTimer.current);
              setToast(null);
              go({ side: 'photo', page: 'contact' });
            }}
          >
            Contact →
          </a>
        </div>
      )}

      {dialog && (
        <Dialog
          kind={dialog}
          onClose={() => setDialog(null)}
          onContact={() => {
            setDialog(null);
            contact();
          }}
        />
      )}

      <Footer side={view.side} onOpenDialog={setDialog} />
    </div>
  );
}
