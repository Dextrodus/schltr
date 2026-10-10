import type { Exif } from '../data/photos';
import { cameraId, cameraName, lensId } from '../data/gear';
import { ViewLink, type Go } from './bits';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  // photos without a date come through as '' (or something unparseable); show nothing rather than "undefined undefined 0"
  if (!y || !MONTHS[m - 1] || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const UNKNOWN_LENS = 'Likely a manual lens, could be the Samyang 20mm F1.8 or an old 600mm reflex lens';

export default function ExifLine({ exif: e, go }: { exif?: Exif; go: Go }) {
  return (
    <div className="viewer__meta">
      {e ? (
        // fixed slot widths in ch of the mono font, so the line never jumps between photos
        <p className="exif">
          <ViewLink
            to={{ side: 'photo', page: 'uses' }}
            hash={cameraId(e.camera)}
            go={go}
            className="ph-h"
            title="See it on What I use"
            style={{ width: '21ch' }}
          >
            {cameraName(e.camera)}
          </ViewLink>
          {e.lens === 'built-in' ? (
            <span style={{ width: '29ch' }}>built-in lens</span>
          ) : !e.lens ? (
            // the camera records no lens for manual lenses; the hint shows on hover or focus, without the title delay
            <span style={{ width: '29ch' }}>
              <span className="tip" tabIndex={0} data-tip={UNKNOWN_LENS} aria-label={`Unknown lens. ${UNKNOWN_LENS}`}>
                unknown lens
              </span>
            </span>
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
          <span style={{ width: '7ch' }}>{e.focal ? `${e.focal} mm` : ''}</span>
          <span style={{ width: '5ch' }}>{e.aperture ? `f/${e.aperture}` : ''}</span>
          <span style={{ width: '8ch' }}>{e.shutter} s</span>
          <span style={{ width: '9ch' }}>ISO {e.iso}</span>
          <span style={{ width: '11ch' }}>{fmtDate(e.taken)}</span>
        </p>
      ) : (
        <p className="note">No camera data on this one. Lost in the darkroom.</p>
      )}
    </div>
  );
}
