import type { ImgHTMLAttributes, Ref } from 'react';
import { avifSrcSet, jpegSrc, jpegSrcSet, type Photo } from '../data/photos';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> {
  photo: Photo;
  sizes: string;
  ref?: Ref<HTMLImageElement>;
  /** Show the blurred preview behind the image until it has loaded. */
  preview?: boolean;
}

/** A photo as AVIF in every generated width, with JPEG for browsers without AVIF. */
export default function Picture({ photo, sizes, preview, style, ...img }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet(photo)} sizes={sizes} />
      <img
        src={jpegSrc(photo)}
        srcSet={jpegSrcSet(photo)}
        sizes={sizes}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        decoding="async"
        style={preview ? { backgroundImage: `url(${photo.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center', ...style } : style}
        {...img}
      />
    </picture>
  );
}
