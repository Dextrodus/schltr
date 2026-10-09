import { useEffect, useRef, useState } from 'react';
import type { DialogKind } from './Dialogs';

interface Props {
  side: 'split' | 'photo' | 'tech';
  onOpenDialog: (kind: DialogKind) => void;
}

export default function Footer({ side, onOpenDialog }: Props) {
  return (
    <footer className={`footer ${side === 'split' ? '' : `is-${side}`}`}>
      <div className="footer__start">
        <Cookie />
      </div>
      <nav className="footer__links" aria-label="Footer">
        <button className="po-h" onClick={() => onOpenDialog('impressum')}>
          Impressum
        </button>
        <button className="po-h" onClick={() => onOpenDialog('credits')}>
          Credits
        </button>
        <button className="po-h" onClick={() => onOpenDialog('support')}>
          Tech support
        </button>
      </nav>
      <div />
    </footer>
  );
}

type CookieState = 'closed' | 'open' | 'done' | 'closing' | 'hidden';
type Choice = 'crunchy' | 'soft';

function Cookie() {
  const [state, setState] = useState<CookieState>('closed');
  const [choice, setChoice] = useState<Choice | null>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  // play the reaction, then get out of the way
  const pick = (c: Choice, hold: number) => {
    clear();
    setChoice(c);
    setState('done');
    timers.current.push(
      window.setTimeout(() => setState('closing'), hold),
      window.setTimeout(() => {
        setState('closed');
        setChoice(null);
      }, hold + 240),
    );
  };

  if (state === 'hidden') return null;

  const panelOpen = state === 'open' || state === 'done' || state === 'closing';
  const anim = state === 'closing' ? 'is-closing' : state === 'done' ? (choice === 'crunchy' ? 'is-yay' : 'is-no') : '';

  return (
    <div className="cookie">
      {panelOpen && (
        <div className={`cookie__panel popup no-lean ${anim}`}>
          <p>I don't use cookies. But which kind do you prefer?</p>
          <div className="cookie__slot" aria-live="polite">
            {state === 'open' && (
              <div className="cookie__choices">
                <button className="popup-btn po-h" onClick={() => pick('crunchy', 1800)}>
                  Crunchy
                </button>
                <button className="popup-btn po-h" onClick={() => pick('soft', 1600)}>
                  Soft
                </button>
              </div>
            )}
            {state !== 'open' && choice === 'crunchy' && (
              <p className="cookie__result cookie__result--yay">
                <span className="cookie__icon">
                  <span aria-hidden="true">🍪</span>
                  <span className="crumb" />
                  <span className="crumb" />
                  <span className="crumb" />
                  <span className="crumb" />
                  <span className="crumb" />
                  <span className="crumb" />
                </span>
                <span>Good choice. Here's a cookie as a reward.</span>
              </p>
            )}
            {state !== 'open' && choice === 'soft' && (
              <p className="cookie__result cookie__result--no">Disappointing. Your preference will be ignored.</p>
            )}
          </div>
        </div>
      )}
      <div className="cookie__chip">
        <button
          aria-expanded={panelOpen}
          onClick={() => {
            clear();
            setChoice(null);
            setState(state === 'open' ? 'closed' : 'open');
          }}
        >
          Cookie preferences
        </button>
        <button
          aria-label="Hide cookie preferences for this visit"
          onClick={() => {
            clear();
            setState('hidden');
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
