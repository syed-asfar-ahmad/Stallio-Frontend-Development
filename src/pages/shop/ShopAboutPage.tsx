import { useShop } from '../../context/ShopContext';
import { useStorefrontTheme } from '../../themes';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import {
  getLocalizedAboutContent,
  getLocalizedAboutTitle,
} from '../../lib/shopContentLanguages';
import { prepareShopAboutHtml, SHOP_RICH_TEXT_BODY_CLASS } from '../../lib/prepareShopAboutHtml';
import { Sparkles, BookOpen, HeartHandshake, Leaf, ShieldCheck, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FreshButton } from '../../components/shop/theme-parts/fresh/FreshParts';
import { MART_GRID_BG, MART_HAIR, MART_INK, MART_SOFT, MART_TEXT, MartEyebrow } from '../../components/shop/theme-parts/mart/MartParts';
import { getLocalizedTrustLabel } from '../../lib/shopContentLanguages';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../lib/trustBadgeIcons';

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';
const DEFAULT_ABOUT_TEXT_COLOR = '#ffffff';

function getSafeHexColor(value: string | null | undefined, fallback: string = DEFAULT_ABOUT_TEXT_COLOR): string {
  const trimmed = String(value ?? '').trim();
  return /^#([0-9A-Fa-f]{6})$/.test(trimmed) ? trimmed : fallback;
}

export default function ShopAboutPage() {
  const { shop, username } = useShop();
  const { layout } = useStorefrontTheme();
  const aboutVariant = layout.aboutVariant ?? 'minimal-clean';
  const { t, lang } = useShopLanguage();

  if (!shop) return null;

  const aboutTitleText =
    getLocalizedAboutTitle(shop, lang) || t('aboutTitleFallback', { shopName: shop.shopName });
  const aboutContentHtml = getLocalizedAboutContent(shop, lang);
  const heroImage = shop.aboutImages?.[0];
  const aboutHeroTextColor = getSafeHexColor(shop.aboutTextColor);

  // ── FRESH-STORY (Pacific Fresh) ───────────────────────────────────────────
  if (aboutVariant === 'fresh-story') {
    const gallery = (shop.aboutImages ?? []).slice(1, 4);
    const values = shop.homeTrustEnabled ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()).slice(0, 6) : [];
    return (
      <main className="flex-1 pb-16 lg:pb-28">
        <section className="px-4 pb-10 pt-14 text-center lg:pb-16 lg:pt-24" style={{ background: 'var(--theme-surface-secondary)' }}>
          <div className={containerClass}>
            <h1 className="mx-auto max-w-3xl text-[2.6rem] font-medium leading-[1.04] sm:text-6xl lg:text-7xl" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em', textWrap: 'balance' as never }}>
              {aboutTitleText}
            </h1>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              {heroImage ? t('aboutSubtitleImage', { shopName: shop.shopName }) : t('aboutSubtitlePlain', { shopName: shop.shopName })}
            </p>
          </div>
        </section>
        {heroImage ? (
          <section className={`${containerClass} -mt-4 lg:-mt-8`}>
            <div className="mx-auto max-w-5xl overflow-hidden rounded-[var(--theme-radius-card)] shadow-[var(--theme-shadow-card)]">
              <img src={heroImage} alt="" loading="eager" className="aspect-[16/9] w-full object-cover" />
            </div>
          </section>
        ) : null}
        <section className={`${containerClass} mt-14 lg:mt-24`}>
          <article className="mx-auto max-w-2xl">
            {aboutContentHtml ? (
              <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className={`text-base leading-8 sm:text-[17px] sm:leading-9 ${SHOP_RICH_TEXT_BODY_CLASS}`}
                style={{ color: 'var(--theme-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
              />
            ) : (
              <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('aboutEmpty')}</p>
            )}
          </article>
        </section>
        {gallery.length > 0 && (
          <section className={`${containerClass} mt-14 lg:mt-24`}>
            <div className={`grid gap-3 lg:gap-5 ${gallery.length === 1 ? 'grid-cols-1' : gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {gallery.map((img, i) => (
                <div key={`${img}-${i}`} className={`overflow-hidden rounded-[var(--theme-radius-card)] ${i === 1 ? 'lg:mt-10' : ''}`} style={{ background: 'var(--theme-surface-secondary)' }}>
                  <img src={img} alt="" loading="lazy" className={`w-full object-cover ${gallery.length === 1 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`} />
                </div>
              ))}
            </div>
          </section>
        )}
        {values.length > 0 && (
          <section className={`${containerClass} mt-16 lg:mt-28`}>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-center text-[1.75rem] font-medium sm:text-4xl" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}>{t('freshWhyTitle')}</h2>
              <ol className="mt-8">
                {values.map((b, i) => (
                  <li key={`${b.label}-${i}`} className="flex items-baseline gap-5 border-b py-4" style={{ borderColor: 'var(--theme-border)' }}>
                    <span className="w-7 shrink-0 text-xs font-semibold tabular-nums" style={{ color: 'var(--theme-text-muted)' }}>{String(i + 1).padStart(2, '0')}.</span>
                    <span className="text-[15px] font-medium" style={{ color: 'var(--theme-text-primary)' }}>{getLocalizedTrustLabel(b, lang)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
        <section className={`${containerClass} mt-16 lg:mt-28`}>
          <div className="flex flex-col items-center gap-5 rounded-[var(--theme-radius-card)] px-6 py-12 text-center sm:py-16" style={{ background: '#d3e8a3', color: '#1e1611' }}>
            <p className="max-w-lg text-3xl font-medium leading-tight sm:text-4xl" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}>{t('freshPopularTitle')}</p>
            <FreshButton to={`/${username}/products`} variant="ink" arrow>{t('heroBrowse')}</FreshButton>
          </div>
        </section>
      </main>
    );
  }

  // ── VOLT-STORY (Retail Catalog) ──────────────────────────────────────────
  if (aboutVariant === 'mart-story') {
    const gallery = (shop.aboutImages ?? []).slice(1, 5);
    const stats = shop.homeTrustEnabled ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()).slice(0, 4) : [];

    return (
      <main className="flex-1 pb-16 lg:pb-28">
        <section className={`${containerClass} pt-4 lg:pt-6`}>
          <header className="relative isolate overflow-hidden rounded-2xl" style={{ background: MART_INK, color: MART_TEXT }}>
            <div aria-hidden className="absolute inset-0" style={MART_GRID_BG} />
            <div aria-hidden className="absolute -start-20 -top-24 h-96 w-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgb(245 166 35 / 0.45), transparent 65%)' }} />
            <div className="relative grid items-center gap-10 px-6 py-14 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-20">
              <div>
                <MartEyebrow dark>{shop.shopName}</MartEyebrow>
                <h1 className="mt-5 text-[2.4rem] font-bold leading-[1.02] sm:text-6xl" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.045em', textWrap: 'balance' as never }}>
                  {aboutTitleText}
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: MART_SOFT }}>
                  {heroImage ? t('aboutSubtitleImage', { shopName: shop.shopName }) : t('aboutSubtitlePlain', { shopName: shop.shopName })}
                </p>
              </div>
              {heroImage ? (
                <div className="overflow-hidden rounded-2xl border" style={{ borderColor: MART_HAIR, boxShadow: '0 0 0 8px rgb(255 255 255 / 0.03)' }}>
                  <img src={heroImage} alt="" loading="eager" className="aspect-[4/3] w-full object-cover" />
                </div>
              ) : null}
            </div>
          </header>
        </section>

        {stats.length > 0 && (
          <section className={`${containerClass} mt-4 lg:mt-5`}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {stats.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-3.5 rounded-[var(--theme-radius-card)] border px-5 py-4" style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}>
                    <TrustBadgeTypeIcon type={resolveTrustBadgeType(b.icon)} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{getLocalizedTrustLabel(b, lang)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={`${containerClass} mt-12 lg:mt-20`}>
          <article className="mx-auto max-w-3xl rounded-2xl border p-6 sm:p-10 lg:p-14" style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)', boxShadow: 'var(--theme-shadow-card)' }}>
            {aboutContentHtml ? (
              <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className={`text-base leading-8 sm:text-[17px] ${SHOP_RICH_TEXT_BODY_CLASS}`}
                style={{ color: 'var(--theme-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
              />
            ) : (
              <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('aboutEmpty')}</p>
            )}
          </article>
        </section>

        {gallery.length > 0 && (
          <section className={`${containerClass} mt-12 lg:mt-20`}>
            <div className={`grid gap-3 lg:gap-5 ${gallery.length === 1 ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {gallery.map((img, i) => (
                <div key={`${img}-${i}`} className="overflow-hidden rounded-[var(--theme-radius-card)] border" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)' }}>
                  <img src={img} alt="" loading="lazy" className={`w-full object-cover ${gallery.length === 1 ? 'aspect-[16/9]' : 'aspect-square'}`} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={`${containerClass} mt-12 lg:mt-20`}>
          <div className="relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl p-8 sm:flex-row sm:items-center sm:p-12" style={{ background: MART_INK, color: MART_TEXT }}>
            <div aria-hidden className="absolute inset-0" style={MART_GRID_BG} />
            <p className="relative max-w-md text-3xl font-bold leading-tight sm:text-4xl" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em' }}>{t('featuredPicks')}</p>
            <Link to={`/${username}/products`} className="relative inline-flex h-12 shrink-0 items-center rounded-[var(--theme-radius-btn)] px-7 text-sm font-semibold no-underline transition-transform hover:-translate-y-0.5" style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)', boxShadow: '0 12px 40px -12px rgb(245 166 35 / 0.6)' }}>
              {t('heroBrowse')}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ── COCOA-STORY (Boutique Artisan) ───────────────────────────────────────
  if (aboutVariant === 'cocoa-story') {
    const gallery = (shop.aboutImages ?? []).slice(1, 5);
    const values = shop.homeTrustEnabled ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()).slice(0, 4) : [];
    const CREAM = '#f7ead4';

    return (
      <main className="flex-1 pb-16 lg:pb-28">
        {/* Banner */}
        <section className={`${containerClass} pt-5 lg:pt-8`}>
          <header
            className="relative isolate flex min-h-[22rem] items-end overflow-hidden rounded-[var(--theme-radius-card)] sm:min-h-[28rem] lg:min-h-[34rem]"
            style={{ background: 'color-mix(in srgb, var(--theme-primary) 42%, #1a0f07)' }}
          >
            {heroImage ? (
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
            ) : null}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgb(74 48 27 / 0.92) 0%, rgb(86 57 33 / 0.6) 45%, rgb(96 66 40 / 0.1) 100%), linear-gradient(0deg, rgb(26 15 7 / 0.5), rgb(26 15 7 / 0) 55%)',
              }}
            />
            <div className="relative max-w-2xl p-7 sm:p-12 lg:p-16">
              <h1
                className="text-[2.5rem] font-semibold leading-[1.03] sm:text-6xl lg:text-7xl"
                style={{ color: CREAM, fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em', textWrap: 'balance' as never }}
              >
                {aboutTitleText}
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed sm:text-base" style={{ color: 'rgb(247 234 212 / 0.84)' }}>
                {heroImage
                  ? t('aboutSubtitleImage', { shopName: shop.shopName })
                  : t('aboutSubtitlePlain', { shopName: shop.shopName })}
              </p>
            </div>
          </header>
        </section>

        {/* Story */}
        <section className={`${containerClass} mt-14 grid gap-8 lg:mt-24 lg:grid-cols-12 lg:gap-14`}>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p
                className="text-3xl font-semibold leading-tight sm:text-4xl"
                style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
              >
                {shop.shopName}
              </p>
              <span className="mt-4 block h-1 w-14 rounded-full" style={{ background: 'var(--theme-primary)' }} aria-hidden />
            </div>
          </div>
          <article className="lg:col-span-8">
            {aboutContentHtml ? (
              <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className={`max-w-[42rem] text-[17px] leading-8 sm:text-lg sm:leading-9 ${SHOP_RICH_TEXT_BODY_CLASS}`}
                style={{ color: 'var(--theme-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
              />
            ) : (
              <p className="py-6 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                {t('aboutEmpty')}
              </p>
            )}
          </article>
        </section>

        {/* Studio images — staggered */}
        {gallery.length > 0 && (
          <section className={`${containerClass} mt-14 lg:mt-24`}>
            <div className={`grid gap-4 lg:gap-5 ${gallery.length === 1 ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {gallery.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className={`overflow-hidden rounded-[var(--theme-radius-card)] ${i % 2 === 1 ? 'lg:mt-12' : ''}`}
                  style={{ background: 'var(--theme-surface-secondary)' }}
                >
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className={`w-full object-cover ${gallery.length === 1 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Values (from the store's trust badges) */}
        {values.length > 0 && (
          <section className={`${containerClass} mt-16 lg:mt-24`}>
            <ul
              className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--theme-radius-card)] sm:grid-cols-2 lg:grid-cols-4"
              style={{ background: 'var(--theme-border)' }}
            >
              {values.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-3.5 px-6 py-6" style={{ background: 'var(--theme-surface-secondary)' }}>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
                  >
                    <TrustBadgeTypeIcon type={resolveTrustBadgeType(b.icon)} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    {getLocalizedTrustLabel(b, lang)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Closing call-to-action */}
        <section className={`${containerClass} mt-16 lg:mt-24`}>
          <div
            className="flex flex-col items-start justify-between gap-6 rounded-[var(--theme-radius-card)] p-8 sm:flex-row sm:items-center sm:p-12"
            style={{ background: 'color-mix(in srgb, var(--theme-primary) 38%, #1a0f07)' }}
          >
            <p
              className="max-w-md text-3xl font-semibold leading-tight sm:text-4xl"
              style={{ color: CREAM, fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
            >
              {t('newlyDroppedTitle')}
            </p>
            <Link
              to={`/${username}/products`}
              className="inline-flex shrink-0 rounded-[var(--theme-radius-btn)] px-7 py-3.5 text-sm font-semibold no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: CREAM, color: '#2b1b10' }}
            >
              {t('heroBrowse')}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ── VARIANT 0: ORGANIC-JOURNAL (Pacific Fresh Wellness Editorial) ────────
  if (aboutVariant === 'organic-journal') {
    return (
      <main className="flex-1 pb-14 lg:pb-24">
        {/* Editorial Top Section */}
        <section className={`${containerClass} pt-8 lg:pt-16 max-w-4xl mx-auto text-center`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-theme-border bg-theme-primary-light text-theme-primary text-xs font-bold uppercase tracking-widest mb-5">
            <Leaf className="w-3.5 h-3.5" />
            <span>Our Botanical Ethos</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-theme-text leading-[1.15] mb-6"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              letterSpacing: 'var(--theme-heading-spacing)',
            }}
          >
            {aboutTitleText}
          </h1>
          <p className="text-base sm:text-lg text-theme-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('aboutSubtitlePlain', { shopName: shop.shopName })}
          </p>

          {heroImage && (
            <div className="mt-10 lg:mt-14 relative overflow-hidden rounded-[var(--theme-radius-card)] border border-theme-border shadow-[var(--theme-shadow-card)] group">
              <img
                src={heroImage}
                alt={shop.shopName}
                className="w-full h-auto max-h-[560px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-6 inset-x-6 flex items-center justify-between text-white/90 text-xs sm:text-sm backdrop-blur-md bg-black/30 p-3.5 rounded-full border border-white/15">
                <span className="font-semibold">🌿 Mindfully Harvested & Handcrafted</span>
                <span>{shop.shopName} Archive</span>
              </div>
            </div>
          )}
        </section>

        {/* Botanical Core Pillars */}
        <section className={`${containerClass} pt-10 lg:pt-16 max-w-5xl mx-auto`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Leaf, title: 'Clean Formulas', desc: '100% pure, natural, and free from synthetic additives.' },
              { icon: Heart, title: 'Cruelty-Free', desc: 'Ethically crafted with complete respect for nature.' },
              { icon: ShieldCheck, title: 'Eco Packaging', desc: 'Recyclable, compostable, and planet-conscious materials.' },
              { icon: Award, title: 'Master Artisan', desc: 'Small-batch created for uncompromising potency.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface shadow-sm flex flex-col gap-2.5 transition-all hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-theme-text">{item.title}</h4>
                <p className="text-xs text-theme-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Journal Story Section */}
        <section className={`${containerClass} pt-10 lg:pt-16 max-w-3xl mx-auto`}>
          <article
            className="rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface p-6 sm:p-10 lg:p-14 shadow-[var(--theme-shadow-card)] relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-theme-primary/20 via-theme-primary to-theme-primary/20" />
            {aboutContentHtml ? (
              <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className={`text-base sm:text-lg leading-relaxed ${SHOP_RICH_TEXT_BODY_CLASS}`}
                style={{ color: 'var(--theme-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
              />
            ) : (
              <p className="text-center text-sm lg:text-base text-theme-text-muted py-6">
                {t('aboutEmpty')}
              </p>
            )}
          </article>
        </section>
      </main>
    );
  }

  if (aboutVariant === 'story-first') {
    return (
      <main className="flex-1 pb-12 lg:pb-20">
        <section className={`${containerClass} pt-6 lg:pt-12 text-center max-w-4xl mx-auto`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-theme-badge border border-theme-border bg-theme-primary-light text-theme-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {t('aboutBadge')}
          </div>
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-theme-text leading-tight mb-4"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              letterSpacing: 'var(--theme-heading-spacing)',
              textTransform: 'var(--theme-heading-transform)' as any,
            }}
          >
            {aboutTitleText}
          </h1>
          <p className="text-base sm:text-lg text-theme-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('aboutSubtitlePlain', { shopName: shop.shopName })}
          </p>

          {heroImage && (
            <div className="mt-8 lg:mt-12 relative overflow-hidden rounded-theme-card border border-theme-border shadow-theme-card group">
              <img
                src={heroImage}
                alt={shop.shopName}
                className="w-full h-auto max-h-[520px] object-cover object-center transition-theme group-hover:scale-105 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>
          )}
        </section>

        <section className={`${containerClass} pt-8 lg:pt-14 max-w-3xl mx-auto`}>
          <article
            className="rounded-theme-card border border-theme-border bg-theme-surface p-6 sm:p-10 lg:p-14 shadow-theme-card relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-theme-primary to-transparent opacity-40" />
            {aboutContentHtml ? (
              <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className={`text-base sm:text-lg leading-relaxed ${SHOP_RICH_TEXT_BODY_CLASS}`}
                style={{ color: 'var(--theme-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
              />
            ) : (
              <p className="text-center text-sm lg:text-base text-theme-text-muted py-6">
                {t('aboutEmpty')}
              </p>
            )}
          </article>
        </section>
      </main>
    );
  }

  // ── VARIANT 2: SPLIT-IMAGE (Lookbook, Editorial & Catalog) ───────────────
  if (aboutVariant === 'split-image') {
    return (
      <main className="flex-1 pb-10 lg:pb-16">
        <section className={`${containerClass} pt-6 lg:pt-12`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Image Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface shadow-theme-card">
                {heroImage ? (
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={heroImage}
                      alt={shop.shopName}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/5] w-full flex flex-col items-center justify-center p-8 text-center bg-theme-primary-light text-theme-primary">
                    <BookOpen className="w-12 h-12 mb-3 opacity-80" />
                    <span
                      className="text-xl font-bold tracking-tight"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {shop.shopName}
                    </span>
                  </div>
                )}
                <div className="p-4 sm:p-5 border-t border-theme-border bg-theme-surface-secondary/50 flex items-center justify-between text-xs text-theme-text-muted">
                  <span className="font-semibold uppercase tracking-wider">{t('aboutBadge')}</span>
                  <span>{shop.shopName}</span>
                </div>
              </div>
            </div>

            {/* Narrative Column */}
            <div className="lg:col-span-7">
              <div className="rounded-theme-card border border-theme-border bg-theme-surface p-6 sm:p-10 lg:p-12 shadow-theme-card">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-theme-badge border border-theme-border bg-theme-primary-light text-theme-primary text-xs font-semibold mb-4">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  {t('aboutLabel')}
                </div>
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-theme-text leading-tight mb-6"
                  style={{
                    fontFamily: 'var(--theme-font-heading)',
                    letterSpacing: 'var(--theme-heading-spacing)',
                    textTransform: 'var(--theme-heading-transform)' as any,
                  }}
                >
                  {aboutTitleText}
                </h1>
                {aboutContentHtml ? (
                  <div
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    className={`text-sm sm:text-base lg:text-lg leading-relaxed ${SHOP_RICH_TEXT_BODY_CLASS}`}
                    style={{ color: 'var(--theme-text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
                  />
                ) : (
                  <p className="text-sm lg:text-base text-theme-text-muted">
                    {t('aboutEmpty')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── VARIANT 3: MINIMAL-CLEAN (Default classic layout) ────────────────────
  return (
    <main className="flex-1 pb-8 max-lg:pb-8 lg:pb-14">
      <section className={`${containerClass} pt-4 max-lg:pt-4 lg:pt-8`}>
        <header
          className="relative overflow-hidden border"
          style={{
            borderRadius: 'var(--theme-radius-card)',
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
            boxShadow: 'var(--theme-shadow-card)',
          }}
        >
          {heroImage ? (
            <div className="relative w-full aspect-[16/10] lg:aspect-[12/5]">
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
              <div className="absolute inset-0 flex max-w-2xl flex-col justify-end p-5 sm:p-8 lg:p-12">
                <p
                  className="mb-2 inline-flex w-fit items-center gap-2 border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm lg:mb-4 lg:px-3 lg:py-1 lg:text-xs"
                  style={{
                    color: aboutHeroTextColor,
                    borderRadius: 'var(--theme-radius-badge)',
                  }}
                >
                  {t('aboutBadge')}
                </p>
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                  style={{
                    color: aboutHeroTextColor,
                    fontFamily: 'var(--theme-font-heading)',
                    letterSpacing: 'var(--theme-heading-spacing)',
                    textTransform: 'var(--theme-heading-transform)' as any,
                  }}
                >
                  {aboutTitleText}
                </h1>
                <p
                  className="mt-2 max-w-xl text-xs sm:text-sm lg:text-base opacity-90"
                  style={{ color: aboutHeroTextColor }}
                >
                  {t('aboutSubtitleImage', { shopName: shop.shopName })}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-10 lg:p-12">
              <p
                className="mb-3 inline-flex items-center gap-2 border px-3 py-1 text-xs font-semibold"
                style={{
                  borderRadius: 'var(--theme-radius-badge)',
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary)',
                }}
              >
                {t('aboutLabel')}
              </p>
              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontFamily: 'var(--theme-font-heading)',
                  letterSpacing: 'var(--theme-heading-spacing)',
                  textTransform: 'var(--theme-heading-transform)' as any,
                }}
              >
                {aboutTitleText}
              </h1>
              <p
                className="mt-2 max-w-2xl text-sm lg:text-base leading-relaxed"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {t('aboutSubtitlePlain', { shopName: shop.shopName })}
              </p>
            </div>
          )}
        </header>
      </section>

      <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
        <article
          className="w-full border p-6 sm:p-8 lg:p-10"
          style={{
            borderRadius: 'var(--theme-radius-card)',
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
            boxShadow: 'var(--theme-shadow-card)',
          }}
        >
          {aboutContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-sm lg:text-lg leading-relaxed ${SHOP_RICH_TEXT_BODY_CLASS}`}
              style={{ color: 'var(--theme-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
            />
          ) : (
            <p className="text-sm lg:text-base" style={{ color: 'var(--theme-text-muted)' }}>
              {t('aboutEmpty')}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
