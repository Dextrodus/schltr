// Camera gear for "What I use" on the photo side.
// `exif` is the camera or lens name as it appears in photo EXIF; photo counts are computed from it.
// The EXIF names of the current gear are best guesses until photos taken with it are added.

import { albums, type Photo } from './photos';

export interface Gear {
  id: string;
  kind: 'Body' | 'Lens' | 'Drone';
  name: string;
  exif: string;
}

export const currentGear: Gear[] = [
  { id: 'sony-a7c', kind: 'Body', name: 'Sony a7c', exif: 'ILCE-7C' },
  { id: 'tamron-28-200', kind: 'Lens', name: 'Tamron 28–200mm', exif: '28-200mm F2.8-5.6 Di III RXD' },
  { id: 'samyang-75', kind: 'Lens', name: 'Samyang 75mm f/1.8', exif: 'AF 75mm F1.8 FE' },
];

export const previousGear: Gear[] = [
  { id: 'canon-200d', kind: 'Body', name: 'Canon EOS 200D', exif: 'Canon EOS 200D' },
  { id: 'canon-5d3', kind: 'Body', name: 'Canon EOS 5D Mark III', exif: 'Canon EOS 5D Mark III' },
  { id: 'ef-s-55-250', kind: 'Lens', name: 'Canon EF-S 55–250mm f/4–5.6 IS STM', exif: 'EF-S55-250mm f/4-5.6 IS STM' },
  { id: 'ef-s-10-18', kind: 'Lens', name: 'Canon EF-S 10–18mm f/4.5–5.6 IS STM', exif: 'EF-S10-18mm f/4.5-5.6 IS STM' },
  { id: 'ef-s-18-55', kind: 'Lens', name: 'Canon EF-S 18–55mm f/4–5.6 IS STM', exif: 'EF-S18-55mm f/4-5.6 IS STM' },
  { id: 'ef-100-400', kind: 'Lens', name: 'Canon EF 100–400mm f/4.5–5.6L IS USM', exif: 'EF100-400mm f/4.5-5.6L IS USM' },
  { id: 'dji-fc2103', kind: 'Drone', name: 'DJI (FC2103)', exif: 'DJI FC2103' },
];

const allPhotos: Photo[] = albums.flatMap((a) => a.photos);

export function photoCount(g: Gear): number {
  return allPhotos.filter((p) => p.exif && (p.exif.camera === g.exif || p.exif.lens === g.exif)).length;
}

/** Gear row id for a lens as written in EXIF, for the link from the viewer. */
export function lensId(exifLens: string): string | undefined {
  return [...currentGear, ...previousGear].find((g) => g.kind === 'Lens' && g.exif === exifLens)?.id;
}
