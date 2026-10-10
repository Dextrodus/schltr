import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import type { Album } from '../data/photos';
import { ChevronLeft, ChevronRight, Cross, EnterFullscreen, ExitFullscreen, trapTab, type Go } from './bits';
import ExifLine from './ExifLine';
import Picture from './Picture';
import { useFullscreen } from './useFullscreen';
import { useZoom } from './useZoom';

interface Props {
  album: Album;
  index: number;
  onStep: (delta: number) => void;
  onClose: () => void;
  onNoCopy: (e: MouseEvent) => void;
  go: Go;
}

export default function Viewer({ album, index, onStep, onClose, onNoCopy, go }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const photo = album.photos[index];

  const { canFull, full, idle, toggleFull, wake } = useFullscreen();
  const { zoom, zoomed, dragging, box, w, h, reset, zoomBy, handlers } = useZoom({
    photo,
    index,
    full,
    imgRef,
    stageRef,
    onClickToFullscreen: () => {
      if (canFull) toggleFull();
    },
  });

  // on close, focus the thumbnail of the photo last shown (it may differ from the one that opened the viewer)
  const last = useRef(index);
  last.current = index;
  useEffect(() => {
    ref.current?.focus();
    return () => document.querySelector<HTMLElement>(`.masonry [data-index="${last.current}"]`)?.focus();
  }, []);

  // the browser picks the file for the fitted size; zoomed in, it switches to the largest one
  const sizes = zoomed ? `${photo.width}px` : w ? `${Math.ceil(w)}px` : '100vw';
  // the photos either side are loaded in hidden images, so stepping through shows them without a wait
  const neighbours = [-1, 1].map((d) => album.photos[(index + d + album.photos.length) % album.photos.length]).filter((p) => p !== photo);
  const sizesOf = (p: typeof photo) => (box.w && box.h ? `${Math.ceil(p.width * Math.min(box.w / p.width, box.h / p.height))}px` : '100vw');

  const onKey = (ev: KeyboardEvent<HTMLDivElement>) => {
    trapTab(ev);
    if (full) wake();
    if (ev.key === 'ArrowLeft') onStep(-1);
    else if (ev.key === 'ArrowRight') onStep(1);
    else if ((ev.key === '+' || ev.key === '=') && full) zoomBy(1.5);
    else if (ev.key === '-' && full) zoomBy(1 / 1.5);
    else if ((ev.key === 'f' || ev.key === 'F') && canFull && !ev.ctrlKey && !ev.metaKey && !ev.altKey) toggleFull();
    // Esc steps back one level at a time: out of the zoom, out of fullscreen, out of the viewer
    else if (ev.key === 'Escape') {
      if (zoomed) reset();
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
      <p className="viewer__title">{album.name}</p>
      <button className={`viewer__close viewer__ctl ph-h ${over(cornerX && img.top < 62)}`} onClick={onClose} aria-label="Close">
        <Cross size={20} />
      </button>

      <div
        ref={stageRef}
        className={`viewer__stage ${zoomed ? 'is-zoomed' : ''} ${dragging ? 'is-dragging' : ''}`}
        {...handlers}
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

      <ExifLine exif={photo.exif} go={go} />
    </div>
  );
}
