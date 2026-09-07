import type { ShopContentLang } from './shopContentLanguages';

export type ShopLocaleConfig = {
  shopLangEsEnabled?: boolean;
  shopLangArEnabled?: boolean;
};

export function getSellerContentLanguages(config: ShopLocaleConfig): ShopContentLang[] {
  const langs: ShopContentLang[] = ['en'];
  if (config.shopLangEsEnabled) langs.push('es');
  if (config.shopLangArEnabled) langs.push('ar');
  return langs;
}

export function hasMultilingualContent(config: ShopLocaleConfig): boolean {
  return Boolean(config.shopLangEsEnabled || config.shopLangArEnabled);
}

export function getShopCustomerLanguages(config: ShopLocaleConfig): ShopContentLang[] {
  return getSellerContentLanguages(config);
}
