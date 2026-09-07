import { useMemo } from 'react';
import { FileText, House, LayoutGrid, Mail, Package } from 'lucide-react';
import type { Shop } from '../types';
import { useShopLanguage } from '../context/ShopLanguageContext';

export function useShopNavLinks(username: string, shop: Shop) {
  const { t, lang } = useShopLanguage();

  return useMemo(() => {
    const links: { to: string; label: string; icon: typeof LayoutGrid }[] = [
      { to: `/${username}`, label: t('navHome'), icon: House as typeof LayoutGrid },
      { to: `/${username}/products`, label: t('navProducts'), icon: Package as typeof LayoutGrid },
    ];
    if (shop.aboutEnabled) links.push({ to: `/${username}/about`, label: t('navAbout'), icon: FileText as typeof LayoutGrid });
    if (shop.categoriesEnabled && (shop.categories?.length ?? 0) > 0) {
      links.push({ to: `/${username}/categories`, label: t('navCategories'), icon: LayoutGrid });
    }
    links.push({ to: `/${username}/contact`, label: t('navContact'), icon: Mail });
    return links;
  }, [username, shop.aboutEnabled, shop.categoriesEnabled, shop.categories?.length, t, lang]);
}
