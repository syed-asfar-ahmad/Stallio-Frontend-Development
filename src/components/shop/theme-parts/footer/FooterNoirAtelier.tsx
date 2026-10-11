import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedFooterAddress } from '../../../../lib/shopContentLanguages';
import { SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { readHours } from '../noir/NoirHours';
import type { ThemeFooterProps } from '../types';

const head = 'mb-6 text-[10px] font-semibold uppercase tracking-[0.35em]';

export default function FooterNoirAtelier({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { lang } = useShopLanguage();
  const address = getLocalizedFooterAddress(shop, lang).trim();
  const links = (shop.footerSocialLinks ?? []).filter((l) => l?.url?.trim());
  const hours = readHours(shop);

  return (
    <footer className="mt-24 border-t" style={{ background: 'var(--theme-background)', borderColor: 'var(--theme-primary)' }}>
      <div className={`${containerClass} py-16 lg:py-24`}>
        <div className="text-center">
          <span className="text-xl" style={{ color: 'var(--theme-primary)' }}>✦</span>
          <h2
            className="mt-5 text-3xl uppercase tracking-[0.4em] lg:text-5xl"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
          >
            {shop.shopName}
          </h2>
          <span className="mx-auto mt-8 block h-px w-24" style={{ background: 'var(--theme-primary)' }} />
        </div>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className={head} style={{ color: 'var(--theme-primary)' }}>Quick Links</h3>
            <nav className="flex flex-col gap-4">
              {quickLinks.map(({ to, label }, i) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] no-underline transition-colors hover:text-[var(--theme-primary)]"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  <span className="text-[9px] tabular-nums" style={{ color: 'var(--theme-primary)' }}>0{i + 1}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className={head} style={{ color: 'var(--theme-primary)' }}>Opening Hours</h3>
            {hours.length > 0 ? (
              <ul className="space-y-2.5">
                {hours.map((h) => (
                  <li key={h.day} className="flex items-baseline justify-between gap-4 text-xs">
                    <span style={{ color: 'var(--theme-text-secondary)' }}>{h.day}</span>
                    <span className="tabular-nums" style={{ color: 'var(--theme-text-primary)' }}>{h.hours}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-4 text-xs lg:col-span-2">
            <h3 className={head} style={{ color: 'var(--theme-primary)' }}>Contact</h3>
            {address ? (
              <p className="flex items-start gap-3" style={{ color: 'var(--theme-text-secondary)' }}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                {address}
              </p>
            ) : null}
            {shop.footerPhone?.trim() ? (
              <p className="flex items-center gap-3" style={{ color: 'var(--theme-text-secondary)' }}>
                <Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
              </p>
            ) : null}
            {shop.footerEmail?.trim() ? (
              <p className="flex items-center gap-3" style={{ color: 'var(--theme-text-secondary)' }}>
                <Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
              </p>
            ) : null}
            {links.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-3">
                {links.map((l, i) => (
                  <a
                    key={`${l.platform}-${i}`}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.platform}
                    className="flex h-10 w-10 items-center justify-center border transition-colors hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary-contrast)]"
                    style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                  >
                    <SocialIcon platform={l.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div
        className="border-t py-5 text-center text-[10px] uppercase tracking-[0.3em]"
        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
      >
        © {new Date().getFullYear()} {shop.shopName}
      </div>
    </footer>
  );
}