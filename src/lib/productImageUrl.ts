import { copyImageFocal, parseImageFocal } from './imageFocal';

const PRODUCT_STORAGE_PATH = '/stallio/products/';

function isStallioProductImage(src: string): boolean {
  return src.includes(PRODUCT_STORAGE_PATH);
}

/**
 * Returns the URL to render for a stored image. The focal point fragment (`#fp=x,y`)
 * is never sent to the proxy: it is stripped before building the proxy URL and
 * re-attached to the result so `ShopImage` can still read it.
 */
export function getProductImageDisplayUrl(src: string | null | undefined): string {
  const trimmed = src?.trim() ?? '';
  if (!trimmed) return '';

  const { url } = parseImageFocal(trimmed);
  if (!isStallioProductImage(url)) return trimmed;

  const api = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const proxied = `${api}/api/product-image?v=4&url=${encodeURIComponent(url)}`;
  return copyImageFocal(trimmed, proxied);
}
