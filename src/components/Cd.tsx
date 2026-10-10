import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { knownView, resolveCd } from '../lib/route';
import type { Go } from './bits';

interface Props {
  /** What follows `cd` while nobody is typing: the page you are on. */
  value: string;
  /** Shown instead of `value` while a link is hovered, until the prompt is focused. */
  hint?: string | null;
  /** Relative paths resolve against this directory. */
  cwd: string;
  /** While the prompt is visible and in reach: typing anywhere on the page edits it. */
  enabled: boolean;
  /** Client-side navigation for known pages; without it every path is a page load. */
  go?: Go;
  /** Rendered instead of the input until the visitor starts typing. */
  idle?: ReactNode;
}

const isField = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/** The `~ $ cd <path>` prompt with the blinking cursor: type or edit a path, Enter goes there. */
export default function Cd({ value, hint, cwd, enabled, go, idle }: Props) {
  // null: not editing, shows the current page (or the hovered link)
  const [draft, setDraft] = useState<string | null>(null);
  const [atEnd, setAtEnd] = useState(true);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const focusAtEnd = useRef(false);
  const shown = draft ?? hint ?? value;

  // typing anywhere edits the line, at its end like a terminal
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || isField(e.target)) return;
      const typed = e.key.length === 1 && e.key !== ' ';
      if (!typed && e.key !== 'Backspace') return;
      e.preventDefault();
      // a fresh key replaces the page name, Backspace edits it
      setDraft((d) => (typed ? (d ?? '') + e.key : (d ?? value).slice(0, -1)));
      focusAtEnd.current = true;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, value]);

  useLayoutEffect(() => {
    if (!focusAtEnd.current || !input.current) return;
    focusAtEnd.current = false;
    const end = input.current.value.length;
    input.current.focus();
    input.current.setSelectionRange(end, end);
    setAtEnd(true);
  });

  const trackCaret = () => {
    const el = input.current;
    if (el) setAtEnd(el.selectionStart === el.value.length && el.selectionEnd === el.value.length);
  };

  const submit = () => {
    const path = resolveCd(shown, cwd);
    const view = go ? knownView(path) : null;
    setDraft(null);
    input.current?.blur();
    if (view && go) go(view);
    else location.assign(path);
  };

  if (draft === null && idle) return <>{idle}</>;

  return (
    <form
      className={`cd ${focused ? 'is-focused' : ''} ${focused && !atEnd ? 'is-mid' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <span className="dim" aria-hidden="true">
        ~ $
      </span>{' '}
      <span aria-hidden="true">cd </span>
      <span className="cd__field">
        <span className="cd__mirror" aria-hidden="true">
          {shown}
        </span>
        <input
          ref={input}
          className="cd__input"
          aria-label="cd: type a path and press Enter to go there"
          value={shown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(e) => setDraft(e.target.value)}
          onSelect={trackCaret}
          onFocus={() => {
            setFocused(true);
            setDraft((d) => d ?? value);
          }}
          onBlur={() => {
            setFocused(false);
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            e.currentTarget.blur();
          }}
        />
      </span>
      {(!focused || atEnd) && <span className="cursor" aria-hidden="true" />}
    </form>
  );
}
