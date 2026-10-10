import type { MouseEvent } from 'react';
import { albums, albumBySlug, gridSrcSet, thumbSrc } from '../data/photos';
import { currentGear, previousGear, photoCount, type Gear } from '../data/gear';
import type { PhotoPage, View } from '../lib/route';
import { Envelope, Grain, LINKEDIN, LinkedInMark, ViewLink, type Go } from './bits';

interface Props {
  page: PhotoPage;
  album?: string;
  open: boolean;
  /** Out of reach for keyboard and screen readers: the side is collapsed, or a viewer or dialog is open. */
  inert: boolean;
  /** The menu dims slightly while the tech side is leaned. */
  dimmed: boolean;
  go: Go;
  onNoCopy: (e: MouseEvent) => void;
  onOpenPhoto: (index: number) => void;
}

export default function PhotoSide({ page, album, open, inert, dimmed, go, onNoCopy, onOpenPhoto }: Props) {
  const current = (p: PhotoPage, slug?: string) => (page === p && (!slug || album === slug) ? 'is-current' : undefined);
  const albumView = (slug: string): View => ({ side: 'photo', page: 'album', album: slug });

  return (
    <section className="photo slide" aria-label="Photography" inert={inert}>
      <Grain id="grain-side" />

      <nav className="photo-nav slide" aria-label="Photography" style={{ opacity: dimmed ? 0.8 : 1 }}>
        <div className="photo-nav__group">
          <ViewLink to={{ side: 'photo', page: 'albums' }} go={go} className={`photo-nav__item ph-h ${current('albums') ?? ''}`}>
            Portfolio
          </ViewLink>
          <div className="photo-nav__albums">
            {albums.map((a) => (
              <ViewLink key={a.slug} to={albumView(a.slug)} go={go} className={`photo-nav__album ph-h ${current('album', a.slug) ?? ''}`}>
                {a.name}
              </ViewLink>
            ))}
          </div>
        </div>
        <ViewLink to={{ side: 'photo', page: 'uses' }} go={go} className={`photo-nav__item ph-h ${current('uses') ?? ''}`}>
          What I use
        </ViewLink>
        <ViewLink to={{ side: 'photo', page: 'contact' }} go={go} className={`photo-nav__item ph-h ${current('contact') ?? ''}`}>
          Contact
        </ViewLink>
      </nav>

      <div className={`photo-content ${open ? 'is-open' : ''} ${page === 'albums' ? 'has-covers' : ''}`}>
        {page === 'albums' && (
          <div className="covers">
            {albums.map((a) => (
              <ViewLink key={a.slug} to={albumView(a.slug)} go={go} className="cover" tabIndex={open ? undefined : -1}>
                <span className="cover__name">{a.name}</span>
                {a.cover ? (
                  <img
                    src={thumbSrc(a.cover)}
                    srcSet={gridSrcSet(a.cover)}
                    sizes="(orientation: portrait) 60vw, 35vw"
                    alt={a.cover.alt}
                    width={a.cover.width}
                    height={a.cover.height}
                    onContextMenu={onNoCopy}
                  />
                ) : (
                  <span className="cover__empty">[ {a.name.toLowerCase()} ]</span>
                )}
              </ViewLink>
            ))}
          </div>
        )}

        {page === 'album' && <AlbumPage slug={album ?? ''} onNoCopy={onNoCopy} onOpenPhoto={onOpenPhoto} />}
        {page === 'uses' && <UsesPage />}
        {page === 'contact' && <ContactPage />}
      </div>
    </section>
  );
}

function AlbumPage({ slug, onNoCopy, onOpenPhoto }: { slug: string; onNoCopy: Props['onNoCopy']; onOpenPhoto: Props['onOpenPhoto'] }) {
  const album = albumBySlug(slug);
  if (!album) return null;
  return (
    <div className="photo-page album">
      <h1 className="album__title">{album.name}</h1>
      {album.photos.length > 0 ? (
        <div className="masonry">
          {album.photos.map((p, i) => (
            <img
              key={p.file}
              src={thumbSrc(p)}
              srcSet={gridSrcSet(p)}
              sizes="350px"
              data-index={i}
              alt={p.alt}
              width={p.width}
              height={p.height}
              loading="lazy"
              tabIndex={0}
              role="button"
              aria-label={`${p.alt}. Open in viewer`}
              onClick={() => onOpenPhoto(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenPhoto(i);
                }
              }}
              onContextMenu={onNoCopy}
            />
          ))}
        </div>
      ) : (
        <p className="note">Nothing developed yet. Still in the darkroom.</p>
      )}
    </div>
  );
}

function GearList({ items }: { items: Gear[] }) {
  return (
    <div className="gear__list">
      {items.map((g, i) => {
        const first = i === 0 || items[i - 1].kind !== g.kind;
        const n = photoCount(g);
        return (
          <div key={g.id} id={g.id} className={`gear__row ${first ? 'is-first' : ''}`}>
            <span className="gear__kind">{first ? g.kind : ''}</span>
            <span className="gear__name">{g.name}</span>
            <span className="gear__count">{n > 0 ? `${n} ${n === 1 ? 'photo' : 'photos'}` : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

function UsesPage() {
  return (
    <div className="photo-page gear">
      <section className="gear__section">
        <h2 className="gear__title">Current</h2>
        <GearList items={currentGear} />
      </section>
      <section className="gear__section">
        <h2 className="gear__title">Previous or borrowed</h2>
        <GearList items={previousGear} />
      </section>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="photo-page contact">
      <p className="contact__name">Konrad Schlüter</p>
      <div className="contact__mailbox">
        <a href="mailto:k@schltr.com" className="contact__mail ph-h">
          <Envelope />
          k@schltr.com
        </a>
        <p className="note">
          Send any complaints to{' '}
          <a href="mailto:spam@schltr.com" className="ph-h">
            spam@schltr.com
          </a>{' '}
          for appropriate disposal.
        </p>
      </div>
      <ul className="contact__links">
        <li>
          <a href={LINKEDIN} className="contact__link ph-h" rel="me">
            <LinkedInMark color="var(--photo-accent)" />
            LinkedIn
          </a>
          <span className="note">Preparing preposterously powerful post...</span>
        </li>
      </ul>
    </div>
  );
}
