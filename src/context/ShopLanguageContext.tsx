import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getLocalizedCategoryName,
  getLocalizedProductDescription,
  getLocalizedProductName,
  SHOP_CONTENT_LANGUAGES,
  shopLangStorageKey,
  type LocalizedCategory,
  type LocalizedProduct,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import { getShopCustomerLanguages } from '../lib/shopLocaleConfig';
import { shopUiString, type ShopUiKey } from '../lib/shopUiTranslations';

type ShopLanguageContextValue = {
  lang: ShopContentLang;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  enabledLangs: ShopContentLang[];
  setLang: (lang: ShopContentLang) => void;
  t: (key: ShopUiKey, params?: Record<string, string | number>) => string;
  categoryName: (category: LocalizedCategory) => string;
  productName: (product: LocalizedProduct) => string;
  productDescription: (product: LocalizedProduct) => string;
};

const ShopLanguageContext = createContext<ShopLanguageContextValue | null>(null);

function langDir(lang: ShopContentLang): 'ltr' | 'rtl' {
  return SHOP_CONTENT_LANGUAGES.find((l) => l.id === lang)?.dir === 'rtl' ? 'rtl' : 'ltr';
}

type ProviderProps = {
  username: string;
  shopLangEsEnabled?: boolean;
  shopLangArEnabled?: boolean;
  children: ReactNode;
};

export function ShopLanguageProvider({
  username,
  shopLangEsEnabled = false,
  shopLangArEnabled = false,
  children,
}: ProviderProps) {
  const enabledLangs = useMemo(
    () => getShopCustomerLanguages({ shopLangEsEnabled, shopLangArEnabled }),
    [shopLangEsEnabled, shopLangArEnabled],
  );

  const [lang, setLangState] = useState<ShopContentLang>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem(shopLangStorageKey(username));
    if (stored === 'es' && enabledLangs.includes('es')) return 'es';
    if (stored === 'ar' && enabledLangs.includes('ar')) return 'ar';
    return 'en';
  });

  const dir = langDir(lang);

  useEffect(() => {
    if (!enabledLangs.includes(lang)) setLangState('en');
  }, [enabledLangs, lang]);

  useEffect(() => {
    localStorage.setItem(shopLangStorageKey(username), lang);
  }, [username, lang]);

  const value = useMemo<ShopLanguageContextValue>(
    () => ({
      lang,
      dir,
      isRtl: dir === 'rtl',
      enabledLangs,
      setLang: (next) => {
        if (enabledLangs.includes(next)) setLangState(next);
      },
      t: (key, params) => shopUiString(lang, key, params),
      categoryName: (category) => getLocalizedCategoryName(category, lang),
      productName: (product) => getLocalizedProductName(product, lang),
      productDescription: (product) => getLocalizedProductDescription(product, lang),
    }),
    [lang, dir, enabledLangs],
  );

  return <ShopLanguageContext.Provider value={value}>{children}</ShopLanguageContext.Provider>;
}

export function useShopLanguage() {
  const ctx = useContext(ShopLanguageContext);
  if (!ctx) {
    return {
      lang: 'en' as ShopContentLang,
      dir: 'ltr' as const,
      isRtl: false,
      enabledLangs: ['en'] as ShopContentLang[],
      setLang: () => {},
      t: (key: ShopUiKey, params?: Record<string, string | number>) => shopUiString('en', key, params),
      categoryName: (category: LocalizedCategory) => getLocalizedCategoryName(category, 'en'),
      productName: (product: LocalizedProduct) => getLocalizedProductName(product, 'en'),
      productDescription: (product: LocalizedProduct) => getLocalizedProductDescription(product, 'en'),
    };
  }
  return ctx;
}
