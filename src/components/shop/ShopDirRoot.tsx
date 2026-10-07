import type { ReactNode } from 'react';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { StorefrontThemeProvider } from '../../themes';
import { isStandaloneThemePreview, isThemePreviewFrame, useThemePreviewPayload } from '../../lib/themePreviewBridge';
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
  const previewPayload = useThemePreviewPayload();
  const colorMode = isThemePreviewFrame() || isStandaloneThemePreview() ? previewPayload?.colorMode : undefined;

  return (
    <StorefrontThemeProvider config={themeConfig ?? null} colorMode={colorMode} dir={dir} lang={lang} className={className}>
      {children}
    </StorefrontThemeProvider>
  );
}