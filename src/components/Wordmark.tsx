import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

export type Mode = 'split' | 'lean-photo' | 'lean-tech' | 'open-photo' | 'open-tech';

interface Props {
  mode: Mode;
  /** Position of the divider, 0–1 from the left. */
  frac: number;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  inert: boolean;
}

// open side: the wordmark shrinks to 47% and slides into the top corner of the closed side
const SCALE = 0.47;
const EDGE = 64;

// useLayoutEffect warns during server rendering; measuring only matters in the browser
const useIsoLayoutEffect = typeof window === 'undefined' ? () => {} : useLayoutEffect;

export default function Wordmark({ mode, frac, onClick, onKeyDown, inert }: Props) {
  const schRef = useRef<HTMLSpanElement>(null);
  const ltrRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState({ sch: 112, ltr: 112 });

  useIsoLayoutEffect(() => {
    const measure = () => {
      const sch = schRef.current?.offsetWidth ?? 0;
      const ltr = ltrRef.current?.offsetWidth ?? 0;
      if (!sch || !ltr) return;
      setWidths((w) => (Math.abs(w.sch - sch) > 0.5 || Math.abs(w.ltr - ltr) > 0.5 ? { sch, ltr } : w));
    };
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  const openPhoto = mode === 'open-photo';
  const openTech = mode === 'open-tech';
  const open = openPhoto || openTech;

  // the junction between "sch" and "ltr" sits on the divider
  let junction = `${frac * 100}%`;
  if (openPhoto) junction = `calc(100% - ${Math.round(EDGE + SCALE * (widths.ltr - 4))}px)`;
  if (openTech) junction = `${Math.round(EDGE + SCALE * widths.sch)}px`;

  const style = { '--wm-a': junction, '--wm-scale': open ? SCALE : 1 } as CSSProperties;

  return (
    <button
      className={`wm slide ${open ? 'is-open' : ''} ${openTech ? 'is-tech' : ''}`}
      style={style}
      onClick={() => open && onClick()}
      onKeyDown={onKeyDown}
      inert={inert}
      aria-label={open ? 'schltr: back to the split view' : 'schltr. Left and right arrow keys lean toward a side, Enter opens it.'}
    >
      <span className="wm__row">
        <span className="wm__left slide">
          <span className="wm__sch" ref={schRef}>
            sch
          </span>
        </span>
        <span className="wm__right">
          <span className="wm__ltr" ref={ltrRef}>
            ltr
          </span>
        </span>
      </span>
      <span className={`wm__row wm__labels slide ${open ? 'is-hidden' : ''}`}>
        <span className="wm__left wm__photo slide">photo</span>
        <span className="wm__right wm__tech">tech</span>
      </span>
    </button>
  );
}
