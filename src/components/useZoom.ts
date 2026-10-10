import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import type { Photo } from '../data/photos';

// zoom: s is the scale over the fitted size, x/y move the image centre away from the stage centre (px)
export type Zoom = { s: number; x: number; y: number };
const FIT: Zoom = { s: 1, x: 0, y: 0 };
// a press that moves less than this is a click, not a drag
const CLICK_SLOP = 4;

interface Options {
  photo: Photo;
  index: number;
  full: boolean;
  imgRef: RefObject<HTMLImageElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  /** A click on the photo outside fullscreen. */
  onClickToFullscreen: () => void;
}

export function useZoom({ photo, index, full, imgRef, stageRef, onClickToFullscreen }: Options) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState<Zoom>(FIT);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; zx: number; zy: number; onImg: boolean; moved: boolean } | null>(null);
  const zoomed = zoom.s > 1;

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

  const fit = box.w && box.h ? Math.min(box.w / photo.width, box.h / photo.height) : 0;
  const w = photo.width * fit;
  const h = photo.height * fit;
  // the largest file decides how far in it goes: at least 1:1 pixels on a click, twice that at most
  const native = () => (imgRef.current?.naturalWidth || photo.width) / (w || 1);
  const maxScale = () => Math.max(4, 2 * native());

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
  const reset = () => setZoom(FIT);
  // keyboard zoom works around the stage centre
  const zoomBy = (factor: number) => setZoom((z) => zoomTo(z, z.s * factor, 0, 0));

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
    else if (d.onImg && !full) onClickToFullscreen();
    else if (d.onImg) {
      const [px, py] = fromCentre(ev);
      setZoom((z) => zoomTo(z, Math.max(2, native()), px, py));
    }
  };
  const onPointerCancel = () => {
    drag.current = null;
    setDragging(false);
  };

  return { zoom, zoomed, dragging, box, w, h, reset, zoomBy, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
}
