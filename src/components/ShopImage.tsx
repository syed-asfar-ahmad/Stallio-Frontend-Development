import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { focalToObjectPosition, parseImageFocal } from '../lib/imageFocal';

/**
 * Drop-in replacement for `<img>` used for every merchant photo on the storefront
 * (product, category, hero, about). It reads the focal point stored in the image URL
 * and applies it as `object-position`, so the important part of the photo stays in
 * frame whatever ratio the active theme gives it.
 *
 * - Themes keep owning the frame (aspect-ratio / min-height / radius / masks).
 * - Focal point only applies to cropped fits (`object-cover`). Images that a theme
 *   deliberately letterboxes with `object-contain` are left centered.
 * - An explicit `style.objectPosition` always wins.
 */
const ShopImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(function ShopImage(
  { src, style, className, alt = '', ...rest },
  ref,
) {
  const { url, focal, hasFocal } = parseImageFocal(src);
  const isContain = typeof className === 'string' && /\bobject-contain\b/.test(className);
  const merged =
    hasFocal && !isContain ? { objectPosition: focalToObjectPosition(focal), ...style } : style;

  return <img ref={ref} {...rest} src={url || undefined} alt={alt} className={className} style={merged} />;
});

export default ShopImage;
