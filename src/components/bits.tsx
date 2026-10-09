import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { pathFor, type View } from '../lib/route';

/** Film grain over the photo side: above the background, below the content. */
export function Grain({ id }: { id: string }) {
  return (
    <svg className="grain" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

export const ChevronLeft = () => (
  <svg width="18" height="64" viewBox="0 0 18 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 4L3 32l12 28" />
  </svg>
);

export const ChevronRight = () => (
  <svg width="18" height="64" viewBox="0 0 18 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4l12 28L3 60" />
  </svg>
);

export const Cross = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M3 3l14 14M17 3L3 17" />
  </svg>
);

export const Envelope = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--photo-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </svg>
);

export type Go = (view: View, hash?: string) => void;

/** A real link to a view, handled client-side on a plain left click. */
export function ViewLink({
  to,
  go,
  hash,
  children,
  ...rest
}: { to: View; go: Go; hash?: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    rest.onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(to, hash);
  };
  return (
    <a {...rest} href={pathFor(to) + (hash ? `#${hash}` : '')} onClick={onClick}>
      {children}
    </a>
  );
}
