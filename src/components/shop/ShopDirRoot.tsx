import type { ReactNode } from 'react';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { StorefrontThemeProvider } from '../../themes';
import type { ShopThemeConfig } from '../../themes';

export default function ShopDirRoot({
  className,
  themeConfig,
  children,
}: {
  className: string;
  themeConfig?: ShopThemeConfig | null;
  children: ReactNode;
}) {
  const { dir, lang } = useShopLanguage();

  return (
    <StorefrontThemeProvider config={themeConfig ?? null} dir={dir} lang={lang} className={className}>
      {children}
    </StorefrontThemeProvider>
  );
}