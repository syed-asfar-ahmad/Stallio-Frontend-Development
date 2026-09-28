import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getSocialBrandColor, SocialIcon } from '../../../SocialIcons';
import type { ThemeFooterProps } from '../types';

export default function FooterCompactInline({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t } = useShopLanguage();
  if (!shop.footerEnabled) return null;
  const links = shop.footerSocialLinks ?? [];
  const year = new Date().getFullYear();
  const copyrightText = t('footerCopyright', { year, shopName: shop.shopName });

  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
    >
      <div className={`${containerClass} py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs`}>
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-2">
          <span
            className="font-bold tracking-tight"
            style={{
              color: 'var(--theme-text-primary)',
              fontFamily: 'var(--theme-font-heading)',
            }}
          >
            {shop.shopName}
          </span>
          <span style={{ color: 'var(--theme-text-muted)' }}>•</span>
          <span style={{ color: 'var(--theme-text-muted)' }}>{copyrightText}</span>
        </div>

        {/* Center: Quick Links */}
        <nav className="flex flex-wrap items-center justify-center gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="no-underline transition-colors hover:underline font-medium"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Social Icons */}
        {links.length > 0 && (
          <div className="flex items-center gap-2">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ color: getSocialBrandColor(link.platform) }}
                aria-label={link.platform}
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
