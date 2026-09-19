import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getSocialBrandColor, SocialIcon } from '../../../SocialIcons';
import { getLocalizedFooterDescription } from '../../../../lib/shopContentLanguages';
import type { ThemeFooterProps } from '../types';

export default function FooterCenteredMinimal({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t, lang } = useShopLanguage();
  if (!shop.footerEnabled) return null;
  const links = shop.footerSocialLinks ?? [];
  const year = new Date().getFullYear();
  const copyrightText = t('footerCopyright', { year, shopName: shop.shopName });

  return (
    <footer className="mt-auto border-t" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
      <div className={`${containerClass} flex flex-col items-center gap-6 py-16 text-center lg:py-24`}>
        <h3 className="text-sm font-light uppercase tracking-[0.3em]" style={{ color: 'var(--theme-text-primary)' }}>
          {shop.shopName}
        </h3>
        {getLocalizedFooterDescription(shop, lang) ? (
          <p className="max-w-sm text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
            {getLocalizedFooterDescription(shop, lang)}
          </p>
        ) : null}

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-light uppercase tracking-[0.2em] no-underline"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {links.length > 0 && (
          <div className="flex gap-4">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: getSocialBrandColor(link.platform) }}
                aria-label={link.platform}
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        )}

        <p className="text-[11px] font-light uppercase tracking-[0.2em]" style={{ color: 'var(--theme-text-muted)' }}>
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
