import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { fullSrc, type Album } from '../data/photos';
import { lensId } from '../data/gear';
import { ChevronLeft, ChevronRight, Cross, Grain, ViewLink, type Go } from './bits';

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

export default function Viewer({ album, index, onStep, onClose, onNoCopy, go }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const photo = album.photos[index];
  const e = photo.exif;

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowLeft') onStep(-1);
    else if (ev.key === 'ArrowRight') onStep(1);
    else if (ev.key === 'Escape') onClose();
    else return;
    ev.preventDefault();
  };

  const onImageClick = (ev: MouseEvent<HTMLImageElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    onStep(ev.clientX - r.left < r.width / 2 ? -1 : 1);
  };

  return (
    <div
      ref={ref}
      className="viewer"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${album.name}, photo ${index + 1} of ${album.photos.length}`}
      onKeyDown={onKey}
    >
      <Grain id="grain-viewer" />
      <p className="viewer__title">{album.name}</p>
      <button className="viewer__close ph-h" onClick={onClose} aria-label="Close">
        <Cross size={20} />
      </button>

      <div className="viewer__stage">
        <img src={fullSrc(photo)} alt={photo.alt} onClick={onImageClick} onContextMenu={onNoCopy} />
      </div>
      <button className="viewer__nav viewer__nav--prev chev chev--photo" onClick={() => onStep(-1)} aria-label="Previous photo">
        <ChevronLeft />
      </button>
      <button className="viewer__nav viewer__nav--next chev chev--photo" onClick={() => onStep(1)} aria-label="Next photo">
        <ChevronRight />
      </button>

      <div className="viewer__meta">
        {e ? (
          // fixed slot widths in ch of the mono font, so the line never jumps between photos
          <p className="exif">
            <span style={{ width: '21ch' }}>{e.camera}</span>
            {e.lens === 'built-in' ? (
              <span style={{ width: '29ch' }}>built-in lens</span>
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
