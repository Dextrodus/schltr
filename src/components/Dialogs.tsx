import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Cross } from './bits';

export type DialogKind = 'impressum' | 'credits' | 'support';

const TITLES: Record<DialogKind, string> = { impressum: 'Impressum', credits: 'Credits', support: 'Tech support' };

interface Props {
  kind: DialogKind;
  onClose: () => void;
  /** "Still broken? Contact me" at the end of tech support. */
  onContact: () => void;
}

export default function Dialog({ kind, onClose, onContact }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => before?.focus?.();
  }, []);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="scrim no-lean"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={ref} className="dialog popup" tabIndex={-1} role="dialog" aria-modal="true" aria-label={TITLES[kind]} onKeyDown={onKey}>
        <div className="dialog__head">
          <h2>{TITLES[kind]}</h2>
          <button className="dialog__close po-h" onClick={onClose} aria-label="Close">
            <Cross size={16} />
          </button>
        </div>
        {kind === 'impressum' && (
          <div className="impressum">
            <span>Konrad Schlüter</span>
            <a href="mailto:k@schltr.com" className="po-h">
              k@schltr.com
            </a>
          </div>
        )}
        {kind === 'credits' && <Credits />}
        {kind === 'support' && <Support onContact={onContact} />}
      </div>
    </div>
  );
}

function Credits() {
  const rows = [
    ['bad puns', 'mostly me'],
    ['easter eggs', 'the Easter Bunny'],
    ['photos', 'me, unless marked otherwise'],
    ['code', 'mostly Claude'],
    ['qa', 'you, right now'],
    ['bugs', "probably me, but let's blame Claude"],
  ];
  return (
    <dl className="credits">
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const QUESTIONS = [
  'Have you tried turning it off and on again?',
  'Did you take off the lens cap?',
  'Have you tried unplugging it, waiting 10 seconds and plugging it back in?',
];

function Support({ onContact }: { onContact: () => void }) {
  // 0–2: questions, 3: works on my machine, 4: escalating, 5: Level 2 Support
  const [step, setStep] = useState(0);
  const [trying, setTrying] = useState(false);

  useEffect(() => {
    if (step !== 4) return;
    const t = setTimeout(() => setStep(5), 1800);
    return () => clearTimeout(t);
  }, [step]);

  const asking = step < 3 && !trying;
  const next = () => {
    setStep(step + 1);
    setTrying(false);
  };

  return (
    <div className={`support ${step === 5 ? 'is-tall' : ''}`}>
      <div className="support__body" aria-live="polite">
        {asking && <p>{QUESTIONS[step]}</p>}
        {step < 3 && trying && <p>Please try that first. I'll wait.</p>}
        {step === 3 && <p>Well, it works on my machine.</p>}
        {step === 4 && (
          <p>
            Escalating to Level 2 Support
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        )}
        {step === 5 && (
          <>
            {/* TODO: dog photo for Level 2 Support */}
            <div className="support__dog">[ dog photo ]</div>
            <p style={{ color: 'var(--popup-ink-2)' }}>
              Level 2 Support is looking into it.
              <br />
              Very closely.
            </p>
            <p style={{ fontSize: 12, color: 'var(--popup-ink-2)' }}>ticket #0001: resolved (probably)</p>
          </>
        )}
      </div>
      <div className="support__actions">
        <span className="support__step">{step < 3 ? `step ${step + 1} / 3` : ''}</span>
        {asking && (
          <>
            <button className="popup-btn po-h" onClick={next}>
              Yes
            </button>
            <button className="popup-btn po-h" onClick={() => setTrying(true)}>
              No
            </button>
          </>
        )}
        {step < 3 && trying && (
          <button className="popup-btn po-h" onClick={next}>
            Done, still broken
          </button>
        )}
        {step === 3 && (
          <button className="popup-btn po-h" onClick={() => setStep(4)}>
            Escalate
          </button>
        )}
        {step === 5 && (
          <button className="support__contact po-h" onClick={onContact}>
            Still broken? Contact me →
          </button>
        )}
      </div>
    </div>
  );
}
