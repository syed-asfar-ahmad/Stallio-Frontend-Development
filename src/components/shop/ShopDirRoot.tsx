import type { ReactNode } from 'react';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { StorefrontThemeProvider } from '../../themes';
import type { ShopThemeConfig } from '../../themes';

export default function ShopDirRoot({
  className,
  themeId,
  themeConfig,
  children,
}: {
  className: string;
  themeId?: string | null;
  themeConfig?: ShopThemeConfig | null;
  children: ReactNode;
}) {
  const { dir, lang } = useShopLanguage();

  return (
    <StorefrontThemeProvider themeId={themeId ?? null} config={themeConfig ?? null}>
      <div dir={dir} lang={lang} className={className}>
        {children}
      </div>
    </StorefrontThemeProvider>
  );
}