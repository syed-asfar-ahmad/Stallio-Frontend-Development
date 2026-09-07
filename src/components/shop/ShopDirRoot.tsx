import type { ReactNode } from 'react';
import { useShopLanguage } from '../../context/ShopLanguageContext';

export default function ShopDirRoot({ className, children }: { className: string; children: ReactNode }) {
  const { dir, lang } = useShopLanguage();
  return (
    <div dir={dir} lang={lang} className={className}>
      {children}
    </div>
  );
}
