export type ShopProductLinkState =
  | { from: 'home' }
  | { from: 'products' }
  | { from: 'category'; categorySlug: string };
