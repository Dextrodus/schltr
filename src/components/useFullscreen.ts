import { useEffect, useRef, useState } from 'react';

// controls hide after this long without the mouse moving in fullscreen
const IDLE_MS = 2500;

// true fullscreen of the whole page, plus the idle timer that hides the controls while in it
export function useFullscreen() {
  const [full, setFull] = useState(false);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<number>(undefined);

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

  return { canFull, full, idle, toggleFull, wake };
}
