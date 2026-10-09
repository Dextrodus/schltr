// Albums and photos for the photography side.
// Files live in public/photos: thumbs/ (≤1200 px, grid and covers) and full/ (≤2048 px, viewer).
// The exported files carry no EXIF, so camera data is written here by hand.

export interface Exif {
  camera: string;
  /** 'built-in' for cameras without interchangeable lenses (the drone). */
  lens: string;
  focal: number;
  aperture: number;
  shutter: string;
  iso: number;
  /** ISO date, YYYY-MM-DD */
  taken: string;
}

export interface Photo {
  file: string;
  width: number;
  height: number;
  alt: string;
  exif?: Exif;
}

export interface Album {
  slug: string;
  name: string;
  cover?: Photo;
  photos: Photo[];
}

const cover = (file: string, alt: string): Photo => ({ file, width: 960, height: 640, alt });

const covers = {
  landscapes: cover('cover-landscapes', 'Layered blue mountain ridges under heavy clouds'),
  astro: cover('cover-astro', 'Power pylon against a starry night sky'),
  people: cover('cover-people', 'Three people silhouetted on a dune at sunset'),
  action: cover('cover-action', 'Snowboarder mid-jump against a hazy sun'),
  wildlife: cover('cover-wildlife', 'Ducks flying over the sea at dusk'),
};

// Order matters: the cover grid fills column by column, three rows high.
export const albums: Album[] = [
  { slug: 'landscapes', name: 'Landscapes', cover: covers.landscapes, photos: [covers.landscapes] },
  { slug: 'astro', name: 'Astro', cover: covers.astro, photos: [covers.astro] },
  { slug: 'people', name: 'People', cover: covers.people, photos: [covers.people] },
  {
    slug: 'action',
    name: 'Action',
    cover: covers.action,
    photos: [
      covers.action,
      { file: 'action-01', width: 1200, height: 673, alt: 'Paraglider with a yellow-green wing over hazy forested ridges', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 100, aperture: 5, shutter: '1/500', iso: 100, taken: '2017-01-23' } },
      { file: 'action-02', width: 1200, height: 673, alt: 'Paraglider with a yellow-green wing against dark misty hills', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 100, aperture: 5, shutter: '1/320', iso: 100, taken: '2017-01-23' } },
      { file: 'action-03', width: 1200, height: 800, alt: 'Skier in a blue jacket throwing up a wall of powder', exif: { camera: 'Canon EOS 200D', lens: 'EF-S10-18mm f/4.5-5.6 IS STM', focal: 18, aperture: 7.1, shutter: '1/4000', iso: 400, taken: '2022-03-13' } },
      { file: 'action-04', width: 1200, height: 800, alt: 'Paraglider with a red wing against a clear blue sky', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 84, aperture: 4.5, shutter: '1/1600', iso: 100, taken: '2022-03-13' } },
      { file: 'action-05', width: 1200, height: 800, alt: 'Skier carving past a second skier under a bright sun', exif: { camera: 'Canon EOS 200D', lens: 'EF-S10-18mm f/4.5-5.6 IS STM', focal: 11, aperture: 9, shutter: '1/2500', iso: 400, taken: '2022-03-14' } },
      { file: 'action-06', width: 1200, height: 800, alt: 'Skier spraying snow under a low sun and a gondola line', exif: { camera: 'Canon EOS 200D', lens: 'EF-S10-18mm f/4.5-5.6 IS STM', focal: 10, aperture: 9, shutter: '1/2500', iso: 400, taken: '2022-03-14' } },
      { file: 'action-07', width: 1200, height: 800, alt: 'Skier in yellow trousers jumping against a blue sky', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 55, aperture: 4, shutter: '1/3200', iso: 100, taken: '2022-03-14' } },
      { file: 'action-08', width: 1200, height: 800, alt: 'Skier crossing skis mid-jump against a blue sky', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 55, aperture: 4, shutter: '1/4000', iso: 100, taken: '2022-03-14' } },
      { file: 'action-09', width: 1200, height: 800, alt: 'Skier in blue carving through powder toward the camera', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 169, aperture: 5.6, shutter: '1/1600', iso: 100, taken: '2022-03-14' } },
      { file: 'action-10', width: 1200, height: 800, alt: 'Climber stretched across a granite slab', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 100, aperture: 5, shutter: '1/200', iso: 200, taken: '2022-05-22' } },
      { file: 'action-11', width: 1200, height: 800, alt: 'Hiker with a large pack crossing a snowfield', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 250, aperture: 5.6, shutter: '1/2500', iso: 100, taken: '2022-05-27' } },
      { file: 'action-12', width: 800, height: 1200, alt: 'Runner splashing through shallow water on a beach', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 143, aperture: 5, shutter: '1/4000', iso: 100, taken: '2022-09-12' } },
      { file: 'action-13', width: 802, height: 1200, alt: 'Skimboarder dropping his board into the shallows', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 149, aperture: 5.6, shutter: '1/3200', iso: 100, taken: '2022-09-12' } },
      { file: 'action-14', width: 899, height: 1200, alt: 'Four friends carrying skimboards across the sand', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 100, aperture: 5, shutter: '1/2000', iso: 100, taken: '2022-09-12' } },
      { file: 'action-15', width: 1200, height: 681, alt: 'Overhead shot of a skimboarder in the surf', exif: { camera: 'DJI FC2103', lens: 'built-in', focal: 4.5, aperture: 2.8, shutter: '1/1250', iso: 100, taken: '2022-09-12' } },
      { file: 'action-16', width: 954, height: 1200, alt: 'Spikeball players diving for the ball on a beach', exif: { camera: 'Canon EOS 200D', lens: 'EF-S18-55mm f/4-5.6 IS STM', focal: 46, aperture: 5.6, shutter: '1/1250', iso: 100, taken: '2022-09-12' } },
      { file: 'action-17', width: 1200, height: 800, alt: 'Surfer sitting on his board, raising a fist', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 250, aperture: 5.6, shutter: '1/1600', iso: 200, taken: '2022-09-14' } },
      { file: 'action-18', width: 1200, height: 800, alt: 'Surfer riding a small green wave', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 250, aperture: 5.6, shutter: '1/1000', iso: 200, taken: '2022-09-14' } },
      { file: 'action-19', width: 800, height: 1200, alt: 'Surfer walking out of the sea with his board', exif: { camera: 'Canon EOS 200D', lens: 'EF-S55-250mm f/4-5.6 IS STM', focal: 124, aperture: 5, shutter: '1/3200', iso: 200, taken: '2022-09-14' } },
      { file: 'action-20', width: 800, height: 1200, alt: 'Kitesurfer launching under a dark storm sky', exif: { camera: 'Canon EOS 5D Mark III', lens: 'EF100-400mm f/4.5-5.6L IS USM', focal: 160, aperture: 5.6, shutter: '1/2000', iso: 400, taken: '2022-09-16' } },
    ],
  },
  { slug: 'wildlife', name: 'Wildlife', cover: covers.wildlife, photos: [covers.wildlife] },
];

export const thumbSrc = (p: Photo) => `/photos/thumbs/${p.file}.jpg`;
export const fullSrc = (p: Photo) => `/photos/full/${p.file}.jpg`;

export const albumBySlug = (slug: string) => albums.find((a) => a.slug === slug);
