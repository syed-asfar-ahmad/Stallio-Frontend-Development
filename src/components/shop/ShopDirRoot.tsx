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
    <StorefrontThemeProvider config={themeConfig ?? null}>
      <div
        dir={dir}
        lang={lang}
        className={className}
        style={{
          background: 'var(--theme-bg, #f8fafc)',
          color: 'var(--theme-text-primary, #0f172a)',
          fontFamily: 'var(--theme-font-body, inherit)',
        }}
      >
        {children}
      </div>
    </StorefrontThemeProvider>
  );
}