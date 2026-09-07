import { useMemo } from 'react';
import type { AdminSellerShopFields } from '../types/admin';
import type { ShopContentLang } from '../lib/shopContentLanguages';

export function getAdminContentLanguages(
  form: Pick<AdminSellerShopFields, 'shopLangEsEnabled' | 'shopLangArEnabled'>,
): ShopContentLang[] {
  const langs: ShopContentLang[] = ['en'];
  if (form.shopLangEsEnabled) langs.push('es');
  if (form.shopLangArEnabled) langs.push('ar');
  return langs;
}

export function adminMultilingualEnabled(
  form: Pick<AdminSellerShopFields, 'shopLangEsEnabled' | 'shopLangArEnabled'>,
): boolean {
  return Boolean(form.shopLangEsEnabled || form.shopLangArEnabled);
}

export function useAdminShopContentLanguages(form: AdminSellerShopFields) {
  return useMemo(() => getAdminContentLanguages(form), [form.shopLangEsEnabled, form.shopLangArEnabled]);
}

export function useAdminShopMultilingualEnabled(form: AdminSellerShopFields) {
  return useMemo(() => adminMultilingualEnabled(form), [form.shopLangEsEnabled, form.shopLangArEnabled]);
}
