const PRODUCT_STORAGE_PATH = '/stallio/products/';

function isStallioProductImage(src: string): boolean {
  return src.includes(PRODUCT_STORAGE_PATH);
}

export function getProductImageDisplayUrl(src: string | null | undefined): string {
  const trimmed = src?.trim() ?? '';
  if (!trimmed) return '';

  if (!isStallioProductImage(trimmed)) return trimmed;

  const api = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  return `${api}/api/product-image?v=4&url=${encodeURIComponent(trimmed)}`;
}
