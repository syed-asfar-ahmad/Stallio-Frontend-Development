import { Link } from 'react-router-dom';
import { Sprout, Leaf, Sun, ShieldCheck, Award, Heart, ArrowRight } from 'lucide-react';
import type { Shop } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { prepareShopAboutHtml, SHOP_RICH_TEXT_BODY_CLASS } from '../../../../lib/prepareShopAboutHtml';
import { PacificPillTag, PacificSourcingPillars } from './PacificParts';

type Props = {
  shop: Shop;
  username: string;
  aboutTitleText: string;
  aboutContentHtml: string;
  heroImage?: string;
  containerClass: string;
};

export default function PacificAboutPage({
  shop,
  username,
  aboutTitleText,
  aboutContentHtml,
  heroImage,
  containerClass,
}: Props) {
  const { t, lang } = useShopLanguage();
  const gallery = (shop.aboutImages ?? []).slice(0, 4);

  return (
    <main className="flex-1 pb-16 lg:pb-28">
      {/* 1. Cinematic Hero */}
      <section className={`${containerClass} pt-6 lg:pt-12 max-w-5xl mx-auto text-center space-y-6`}>
        <div className="flex justify-center">
          <PacificPillTag icon={Sprout}>Our Harvest Manifesto</PacificPillTag>
        </div>
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-theme-text leading-[1.12]"
          style={{
            fontFamily: 'var(--theme-font-heading)',
            letterSpacing: 'var(--theme-heading-spacing)',
            textWrap: 'balance' as never,
          }}
        >
          {aboutTitleText}
        </h1>
        <p className="text-sm sm:text-lg text-theme-text-muted max-w-2xl mx-auto leading-relaxed">
          {heroImage
            ? t('aboutSubtitleImage', { shopName: shop.shopName })
            : t('aboutSubtitlePlain', { shopName: shop.shopName }) ||
              'A dedication to pure artisanal produce, unbroken cold chains, and biological vitality.'}
        </p>

        {/* Hero Image Frame */}
        {heroImage && (
          <div className="mt-8 lg:mt-12 relative overflow-hidden rounded-[var(--theme-radius-card)] border border-theme-border shadow-[var(--theme-shadow-card)] group">
            <img
              src={heroImage}
              alt={shop.shopName}
              className="w-full h-auto max-h-[560px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-6 inset-x-6 flex flex-wrap items-center justify-between text-white/90 text-xs sm:text-sm backdrop-blur-md bg-black/30 p-4 rounded-full border border-white/20">
              <span className="font-bold">🌿 Generational Estates & Regenerative Growers</span>
              <span>{shop.shopName} Archive</span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Core Sourcing Pillars */}
      <section className={`${containerClass} pt-12 lg:pt-20 max-w-5xl mx-auto`}>
        <PacificSourcingPillars />
      </section>

      {/* 3. Main Story Section with Rich Text */}
      <section className={`${containerClass} pt-12 lg:pt-20 max-w-3xl mx-auto`}>
        <article className="rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface p-6 sm:p-12 lg:p-16 shadow-[var(--theme-shadow-card)] relative overflow-hidden space-y-6">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-theme-primary/20 via-theme-primary to-theme-primary/20" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                {shop.shopName} Philosophy
              </h3>
              <p className="text-xs text-theme-text-muted">Uncompromising standards since inception</p>
            </div>
          </div>

          {aboutContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-base sm:text-lg leading-relaxed ${SHOP_RICH_TEXT_BODY_CLASS}`}
              style={{ color: 'var(--theme-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
            />
          ) : (
            <p className="py-6 text-sm text-theme-text-muted">
              {t('aboutEmpty')}
            </p>
          )}
        </article>
      </section>

      {/* 4. Asymmetrical Photo Essay (if gallery available) */}
      {gallery.length > 0 && (
        <section className={`${containerClass} pt-12 lg:pt-20 max-w-6xl mx-auto`}>
          <div className="text-center mb-8">
            <PacificPillTag icon={Sun}>Visual Archive</PacificPillTag>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-normal text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Life on the Partner Estates
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[var(--theme-radius-card)] border border-theme-border shadow-sm group"
                style={{ background: 'var(--theme-surface-secondary)' }}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Closing Call to Action */}
      <section className={`${containerClass} pt-14 lg:pt-24 max-w-4xl mx-auto text-center`}>
        <div
          className="rounded-[var(--theme-radius-card)] p-8 sm:p-12 text-white border shadow-[var(--theme-shadow-card)]"
          style={{
            background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-hover) 100%)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <h2
            className="text-2xl sm:text-4xl font-normal tracking-tight text-white mb-4"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            Experience the True Taste of Artisanal Provisions
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-lg mx-auto mb-6">
            Handcrafted with patience, harvested with care, and delivered to your doorstep.
          </p>
          <Link
            to={`/${username}/products`}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-wider bg-white text-emerald-950 no-underline shadow-lg transition-transform hover:scale-105"
          >
            <span>{t('heroBrowse') || 'Explore Provisions'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  );
}
