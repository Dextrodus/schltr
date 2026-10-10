import { useEffect, useRef, useState } from 'react';
import Cd from './Cd';
import Dialog, { type DialogKind } from './Dialogs';
import Footer from './Footer';
import Wordmark from './Wordmark';

// The 404 page: served by Cloudflare Pages for any path that has no page.
export default function NotFound() {
  // the static HTML is the same for every path; fill in the one asked for once in the browser
  const [path, setPath] = useState('');
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setPath(decodeURI(location.pathname)), []);

  useEffect(() => {
    if (dialog || !returnFocus.current) return;
    returnFocus.current.focus();
    returnFocus.current = null;
  }, [dialog]);

  return (
    <div className="shell not-found">
      <main className="not-found__main" inert={dialog !== null}>
        <img
          className="not-found__photo"
          src="/photos/404/goat-600.jpg"
          srcSet="/photos/404/goat-600.jpg 600w, /photos/404/goat-1000.jpg 1000w"
          sizes="(max-width: 720px) 60vw, 480px"
          width={1000}
          height={1500}
          alt="A brown goat leaning over a wooden fence, staring straight into the camera with its head tilted."
        />
        <div className="not-found__text">
          <div>
            <span className="dim">~ $</span> cd <span className="not-found__path">{path}</span>
          </div>
          <h1>What are you looking at?</h1>
          <p>This page does not exist.</p>
          <div className="not-found__home">
            <Cd
              value="~"
              cwd="/"
              enabled={dialog === null}
              idle={
                <a href="/" className="te-h" title="Back to the start">
                  <span className="dim">~ $</span> cd ~<span className="cursor" />
                </a>
              }
            />
          </div>
        </div>
      </main>

      <Wordmark mode="open-tech" frac={0} onClick={() => location.assign('/')} onKeyDown={() => {}} inert={dialog !== null} />

      {dialog && (
        <Dialog kind={dialog} onClose={() => setDialog(null)} onContact={() => location.assign('/tech/contact/')} />
      )}

      <Footer
        side="tech"
        inert={dialog !== null}
        onOpenDialog={(kind) => {
          returnFocus.current = document.activeElement as HTMLElement | null;
          setDialog(kind);
        }}
      />
    </div>
  );
}
