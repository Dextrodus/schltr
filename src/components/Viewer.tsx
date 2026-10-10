import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import type { Album } from '../data/photos';
import { cameraName, lensId } from '../data/gear';
import { ChevronLeft, ChevronRight, Cross, EnterFullscreen, ExitFullscreen, Grain, ViewLink, trapTab, type Go } from './bits';
import Picture from './Picture';

interface Props {
  album: Album;
  index: number;
  onStep: (delta: number) => void;
  onClose: () => void;
  onNoCopy: (e: MouseEvent) => void;
  go: Go;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

// zoom: s is the scale over the fitted size, x/y move the image centre away from the stage centre (px)
type Zoom = { s: number; x: number; y: number };
const FIT: Zoom = { s: 1, x: 0, y: 0 };
// a press that moves less than this is a click, not a drag
const CLICK_SLOP = 4;
// controls hide after this long without the mouse moving in fullscreen
const IDLE_MS = 2500;

export default function Viewer({ album, index, onStep, onClose, onNoCopy, go }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const photo = album.photos[index];
  const e = photo.exif;

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState<Zoom>(FIT);
  const [dragging, setDragging] = useState(false);
  const [full, setFull] = useState(false);
  const [idle, setIdle] = useState(false);
  const drag = useRef<{ x: number; y: number; zx: number; zy: number; onImg: boolean; moved: boolean } | null>(null);
  const idleTimer = useRef<number>(undefined);
  const zoomed = zoom.s > 1;

  // on close, focus the thumbnail of the photo last shown (it may differ from the one that opened the viewer)
  const last = useRef(index);
  last.current = index;
  useEffect(() => {
    ref.current?.focus();
    return () => document.querySelector<HTMLElement>(`.masonry [data-index="${last.current}"]`)?.focus();
  }, []);

  // the stage size decides the fitted image size; a new size (window, fullscreen) starts from the fitted view
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      setBox({ w: el.clientWidth, h: el.clientHeight });
      setZoom(FIT);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setZoom(FIT), [index]);

  // ── true fullscreen ───────────────────────────
  const canFull = document.fullscreenEnabled;
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };
  useEffect(() => {
    // the browser's own Esc leaves fullscreen too, so follow the document rather than our own toggle
    const sync = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      clearTimeout(idleTimer.current);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);
  const wake = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  };
  useEffect(() => {
    if (full) wake();
    else {
      clearTimeout(idleTimer.current);
      setIdle(false);
    }
  }, [full]);

  // ── zoom and pan ──────────────────────────────
  const fit = box.w && box.h ? Math.min(box.w / photo.width, box.h / photo.height) : 0;
  const w = photo.width * fit;
  const h = photo.height * fit;
  // the largest file decides how far in it goes: at least 1:1 pixels on a click, twice that at most
  const native = () => (imgRef.current?.naturalWidth || photo.width) / (w || 1);
  const maxScale = () => Math.max(4, 2 * native());
  // the browser picks the file for the fitted size; zoomed in, it switches to the largest one
  const sizes = zoomed ? `${photo.width}px` : w ? `${Math.ceil(w)}px` : '100vw';
  // the photos either side are loaded in hidden images, so stepping through shows them without a wait
  const neighbours = [-1, 1].map((d) => album.photos[(index + d + album.photos.length) % album.photos.length]).filter((p) => p !== photo);
  const sizesOf = (p: typeof photo) => (box.w && box.h ? `${Math.ceil(p.width * Math.min(box.w / p.width, box.h / p.height))}px` : '100vw');

  const clamp = (z: Zoom): Zoom => {
    const s = Math.min(Math.max(z.s, 1), maxScale());
    if (s <= 1.001) return FIT;
    // never pull an edge into the stage: an image smaller than the stage on one axis stays centred on it
    const mx = Math.max(0, (w * s - box.w) / 2);
    const my = Math.max(0, (h * s - box.h) / 2);
    return { s, x: Math.min(mx, Math.max(-mx, z.x)), y: Math.min(my, Math.max(-my, z.y)) };
  };
  // scale to s, keeping the point (px, py) from the stage centre where it is
  const zoomTo = (z: Zoom, s: number, px: number, py: number) => {
    const k = Math.min(Math.max(s, 1), maxScale()) / z.s;
    return clamp({ s: z.s * k, x: px - (px - z.x) * k, y: py - (py - z.y) * k });
  };
  const fromCentre = (ev: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    return [ev.clientX - r.left - r.width / 2, ev.clientY - r.top - r.height / 2] as const;
  };

  // zoom lives in fullscreen only. Wheel needs a non-passive listener to keep the page still; plain scrolling
  // only zooms once zoomed in, a trackpad pinch (ctrl + wheel) always does
  const onWheel = useRef<(ev: WheelEvent) => void>(undefined);
  onWheel.current = (ev) => {
    if (!full || (!zoomed && !ev.ctrlKey)) return;
    ev.preventDefault();
    const d = ev.deltaY * (ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? 400 : 1);
    const [px, py] = fromCentre(ev);
    setZoom((z) => zoomTo(z, z.s * Math.exp(-d * (ev.ctrlKey ? 0.01 : 0.002)), px, py));
  };
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const listener = (ev: WheelEvent) => onWheel.current?.(ev);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  const onPointerDown = (ev: PointerEvent<HTMLDivElement>) => {
    if (ev.button !== 0) return;
    const onImg = ev.target === imgRef.current;
    if (!onImg && !zoomed) return;
    drag.current = { x: ev.clientX, y: ev.clientY, zx: zoom.x, zy: zoom.y, onImg, moved: false };
    if (zoomed) {
      ev.currentTarget.setPointerCapture(ev.pointerId);
      setDragging(true);
    }
  };
  const onPointerMove = (ev: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = ev.clientX - d.x;
    const dy = ev.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < CLICK_SLOP) return;
    d.moved = true;
    if (zoomed) setZoom((z) => clamp({ ...z, x: d.zx + dx, y: d.zy + dy }));
  };
  const onPointerUp = (ev: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || d.moved) return;
    // a click on the photo opens fullscreen; there it zooms in, and back out to the whole photo when zoomed
    if (zoomed) setZoom(FIT);
    else if (d.onImg && !full) {
      if (canFull) toggleFull();
    } else if (d.onImg) {
      const [px, py] = fromCentre(ev);
      setZoom((z) => zoomTo(z, Math.max(2, native()), px, py));
    }
  };
  const onPointerCancel = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKey = (ev: KeyboardEvent<HTMLDivElement>) => {
    trapTab(ev);
    if (full) wake();
    if (ev.key === 'ArrowLeft') onStep(-1);
    else if (ev.key === 'ArrowRight') onStep(1);
    else if ((ev.key === '+' || ev.key === '=') && full) setZoom((z) => zoomTo(z, z.s * 1.5, 0, 0));
    else if (ev.key === '-' && full) setZoom((z) => zoomTo(z, z.s / 1.5, 0, 0));
    else if ((ev.key === 'f' || ev.key === 'F') && canFull && !ev.ctrlKey && !ev.metaKey && !ev.altKey) toggleFull();
    // Esc steps back one level at a time: out of the zoom, out of fullscreen, out of the viewer
    else if (ev.key === 'Escape') {
      if (zoomed) setZoom(FIT);
      else if (document.fullscreenElement) toggleFull();
      else onClose();
    } else return;
    ev.preventDefault();
  };

  // in fullscreen the controls float over the photo; they get a backdrop where the photo runs under them
  const img = {
    left: box.w / 2 + zoom.x - (w * zoom.s) / 2,
    right: box.w / 2 + zoom.x + (w * zoom.s) / 2,
    top: box.h / 2 + zoom.y - (h * zoom.s) / 2,
    bottom: box.h / 2 + zoom.y + (h * zoom.s) / 2,
  };
  const over = (hit: boolean) => (full && hit ? 'is-over' : '');
  const cornerX = img.right > box.w - 70;

  return (
    <div
      ref={ref}
      className={`viewer ${full ? 'is-full' : ''} ${full && idle && !dragging ? 'is-idle' : ''}`}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${album.name}, photo ${index + 1} of ${album.photos.length}`}
      onKeyDown={onKey}
      onPointerMove={full ? wake : undefined}
    >
      <Grain id="grain-viewer" />
      <p className="viewer__title">{album.name}</p>
      <button className={`viewer__close viewer__ctl ph-h ${over(cornerX && img.top < 62)}`} onClick={onClose} aria-label="Close">
        <Cross size={20} />
      </button>

      <div
        ref={stageRef}
        className={`viewer__stage ${zoomed ? 'is-zoomed' : ''} ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <Picture
          key={photo.id}
          ref={imgRef}
          photo={photo}
          sizes={sizes}
          draggable={false}
          style={{ width: w, height: h, transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})` }}
          onContextMenu={onNoCopy}
        />
        {neighbours.map((p) => (
          <Picture key={p.id} photo={p} sizes={sizesOf(p)} alt="" hidden />
        ))}
      </div>
      <button
        className={`viewer__nav viewer__nav--prev viewer__ctl chev chev--photo ${over(img.left < 72)}`}
        onClick={() => onStep(-1)}
        aria-label="Previous photo"
      >
        <ChevronLeft />
      </button>
      <button
        className={`viewer__nav viewer__nav--next viewer__ctl chev chev--photo ${over(img.right > box.w - 72)}`}
        onClick={() => onStep(1)}
        aria-label="Next photo"
      >
        <ChevronRight />
      </button>
      {canFull && (
        <button
          className={`viewer__full viewer__ctl ph-h ${over(cornerX && img.bottom > box.h - 62)}`}
          onClick={toggleFull}
          aria-label={full ? 'Exit fullscreen' : 'Fullscreen'}
          title={full ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        >
          {full ? <ExitFullscreen /> : <EnterFullscreen />}
        </button>
      )}

      <div className="viewer__meta">
        {e ? (
          // fixed slot widths in ch of the mono font, so the line never jumps between photos
          <p className="exif">
            <span style={{ width: '21ch' }}>{cameraName(e.camera)}</span>
            {e.lens === 'built-in' ? (
              <span style={{ width: '29ch' }}>built-in lens</span>
            ) : !e.lens ? (
              // the camera records no lens for manual lenses
              <span style={{ width: '29ch', cursor: 'help' }} title="Likely a manual lens, could be the Samyang 20mm F1.8 or an old 600mm reflex lens">
                unknown lens
              </span>
            ) : (
              <ViewLink
                to={{ side: 'photo', page: 'uses' }}
                hash={lensId(e.lens)}
                go={go}
                className="ph-h"
                title="See it on What I use"
                style={{ width: '29ch' }}
              >
                {e.lens}
              </ViewLink>
            )}
            <span style={{ width: '7ch' }}>{e.focal} mm</span>
            <span style={{ width: '5ch' }}>f/{e.aperture}</span>
            <span style={{ width: '8ch' }}>{e.shutter} s</span>
            <span style={{ width: '9ch' }}>ISO {e.iso}</span>
            <span style={{ width: '11ch' }}>{fmtDate(e.taken)}</span>
          </p>
        ) : (
          <p className="note">No camera data on this one. Lost in the darkroom.</p>
        )}
      </div>
    </div>
  );
}
