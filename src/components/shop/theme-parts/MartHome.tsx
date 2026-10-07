import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useStorefrontTheme } from '../../../themes';
import { useShopLanguage } from '../../../context/ShopLanguageContext';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../lib/trustBadgeIcons';
import { getLocalizedReviewName, getLocalizedReviewText, getLocalizedTrustLabel } from '../../../lib/shopContentLanguages';
import { getProductImageDisplayUrl } from '../../../lib/productImageUrl';
import ShopReviewsSection from '../ShopReviewsSection';
import Hero from './Hero';
import ProductCard from './ProductCard';
import {
  MART_DEEP,
  MART_ORANGE,
  MART_ORANGE_INK,
  MART_TEXT,
  MART_TINTS,
  MartPromoBanner,
  MartSectionHeader,
} from './mart/MartParts';
import type { Product, Shop, ShopCategory } from '../../../types';
import type { HomeSectionId } from '../../../themes/types';

const DEFAULT_SECTIONS: HomeSectionId[] = ['hero', 'featured', 'categories', 'products', 'collections', 'trust', 'reviews'];
const GRID5 = 'grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5';
type Tab = 'new' | 'best' | 'offers';

const discountOf = (p: Product) => (p.compareAtPrice != null && p.compareAtPrice > p.price ? (p.compareAtPrice - p.price) / p.compareAtPrice : 0);

export default function MartHome({
  shop,
  products,
  username,
  containerClass,
}: {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
}) {
  const { layout } = useStorefrontTheme();
  const { t, lang, categoryName } = useShopLanguage();
  const [dealFilter, setDealFilter] = useState<string>('all');
  const [tab, setTab] = useState<Tab>('best');

  const visible = useMemo(() => products.filter((p) => p.isVisible !== false), [products]);
  const categories = useMemo(
    () => (shop.categories ?? []).filter((c) => (c as ShopCategory).visible !== false),
    [shop.categories],
  );
  const showCategories = Boolean(shop.categoriesEnabled && categories.length > 0);
  const withImage = categories.filter((c) => c.image);
  const countOf = (slug: string) => visible.filter((p) => (p.category ?? '') === slug).length;

  // Weekly deals: discounted products first, then featured, then everything.
  const dealsPool = useMemo(() => {
    const deals = visible.filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a));
    if (deals.length > 0) return deals;
    const featured = visible.filter((p) => p.isFeatured);
    return featured.length > 0 ? featured : visible;
  }, [visible]);
  const dealCategories = categories.filter((c) => dealsPool.some((p) => p.category === c.slug)).slice(0, 6);
  const dealItems = (dealFilter === 'all' ? dealsPool : dealsPool.filter((p) => p.category === dealFilter)).slice(0, 5);

  const popular = useMemo(() => {
    const ids = new Set(dealsPool.slice(0, 5).map((p) => p.id));
    const rest = visible.filter((p) => !ids.has(p.id));
    return (rest.length >= 5 ? rest : visible).slice(0, 10);
  }, [visible, dealsPool]);

  const tabItems = useMemo(() => {
    const list = [...visible];
    if (tab === 'new') list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    else if (tab === 'offers') list.sort((a, b) => discountOf(b) - discountOf(a));
    else list.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || discountOf(b) - discountOf(a));
    return list.slice(0, 8);
  }, [visible, tab]);

  const trust = shop.homeTrustEnabled && layout.showTrustBadges ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()) : [];
  const reviews = (shop.homeReviewsEnabled && layout.showReviewsSection
    ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
    : []
  ).map((r) => ({ ...r, name: getLocalizedReviewName(r, lang), text: getLocalizedReviewText(r, lang) }));

  const sections = layout.homeSections?.length ? layout.homeSections : DEFAULT_SECTIONS;
  const promoCats = (withImage.length >= 3 ? withImage.slice(-3) : withImage).slice(0, 3);
  const bannerCat = withImage[1] ?? withImage[0];
  const tileCat = withImage[2] ?? withImage[0];
  const tileImage = tileCat?.image ?? visible.find((p) => p.image)?.image ?? null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'new', label: t('newArrivals') },
    { id: 'best', label: t('bestSeller') },
    { id: 'offers', label: t('bestOffers') },
  ];

  return (
    <div className="flex flex-col pb-14 lg:pb-20">
      {sections.map((id, idx) => {
        switch (id) {
          case 'hero':
            return <Hero key="hero" shop={shop} username={username} containerClass={containerClass} />;

          case 'featured':
            if (dealsPool.length === 0) return null;
            return (
              <section key="deals" className="mt-10 py-10 lg:mt-14 lg:py-14" style={{ background: MART_DEEP }}>
                <div className={containerClass}>
                  <MartSectionHeader
                    tone="dark"
                    title={t('weeklyBestDeals')}
                    action={{ to: `/${username}/products`, label: t('viewAll') }}
                  />
                  {dealCategories.length > 1 && (
                    <div className="-mt-2 mb-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label={t('weeklyBestDeals')}>
                      {[{ slug: 'all', label: t('allFilter') }, ...dealCategories.map((c) => ({ slug: c.slug, label: categoryName(c) }))].map((chip) => {
                        const on = dealFilter === chip.slug;
                        return (
                          <button
                            key={chip.slug}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => setDealFilter(chip.slug)}
                            className="shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                            style={
                              on
                                ? { background: MART_ORANGE, borderColor: MART_ORANGE, color: MART_ORANGE_INK }
                                : { background: 'transparent', borderColor: 'rgb(255 255 255 / 0.3)', color: MART_TEXT }
                            }
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className={`grid ${GRID5}`}>
                    {dealItems.map((p) => (
                      <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                    ))}
                  </div>

                  {promoCats.length > 0 && (
                    <div className={`mt-6 grid gap-4 ${promoCats.length === 1 ? '' : promoCats.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      {promoCats.map((c, i) => (
                        <MartPromoBanner
                          key={c.slug}
                          title={categoryName(c)}
                          caption={`${countOf(c.slug)} ${countOf(c.slug) === 1 ? t('categoryProduct') : t('categoryProducts')}`}
                          image={c.image}
                          to={`/${username}/category/${c.slug}`}
                          tint={MART_TINTS[(i + 2) % MART_TINTS.length]}
                          cta={t('shopNow')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );

          case 'categories':
            if (!showCategories) return null;
            return (
              <section key="cats" className={`${containerClass} mt-14 lg:mt-20`} aria-label={t('dealsByCategory')}>
                <MartSectionHeader center title={t('dealsByCategory')} body={t('dealsByCategoryBody')} />
                <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-3 [scrollbar-width:none] sm:gap-8 lg:flex-wrap lg:justify-center [&::-webkit-scrollbar]:hidden">
                  {categories.slice(0, 8).map((c) => (
                    <Link key={c.slug} to={`/${username}/category/${c.slug}`} className="group flex w-24 shrink-0 flex-col items-center gap-3 no-underline sm:w-28">
                      <span
                        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 transition-all group-hover:-translate-y-1 group-hover:border-[var(--theme-secondary)] sm:h-28 sm:w-28"
                        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
                      >
                        {c.image ? <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <ShoppingBag className="h-7 w-7" aria-hidden />}
                      </span>
                      <span className="text-center text-xs font-semibold leading-tight sm:text-[13px]" style={{ color: 'var(--theme-text-primary)' }}>
                        {categoryName(c)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );

          case 'products':
            return (
              <section key="popular" className={`${containerClass} mt-14 lg:mt-20`}>
                <MartSectionHeader center title={t('popularProducts')} body={t('popularProductsBody')} />
                {popular.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{t('homeNoProducts')}</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${GRID5}`}>
                      {popular.map((p) => (
                        <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                      ))}
                    </div>
                    <div className="mt-9 flex justify-center">
                      <Link
                        to={`/${username}/products`}
                        className="inline-flex h-10 items-center rounded-full border px-8 text-xs font-semibold no-underline transition-colors hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary-contrast)]"
                        style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
                      >
                        {t('loadMore')}
                      </Link>
                    </div>
                  </>
                )}
              </section>
            );

          case 'collections':
            if (visible.length === 0) return null;
            return (
              <div key="showcase">
                {bannerCat && (
                  <section className={`${containerClass} mt-14 lg:mt-20`}>
                    <Link
                      to={`/${username}/category/${bannerCat.slug}`}
                      className="group relative isolate flex min-h-[12rem] items-center overflow-hidden rounded-xl no-underline sm:min-h-[14rem]"
                      style={{ background: 'linear-gradient(100deg, color-mix(in srgb, var(--theme-primary) 18%, var(--theme-surface)) 0%, color-mix(in srgb, var(--theme-primary) 6%, var(--theme-surface)) 100%)' }}
                    >
                      <img
                        src={bannerCat.image as string}
                        alt=""
                        loading="lazy"
                        className="absolute inset-y-0 start-0 h-full w-1/2 object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                        style={{ WebkitMaskImage: `linear-gradient(${lang === 'ar' ? 90 : 270}deg, transparent 0%, #000 45%)`, maskImage: `linear-gradient(${lang === 'ar' ? 90 : 270}deg, transparent 0%, #000 45%)` }}
                      />
                      <div className="relative z-10 ms-auto flex w-1/2 flex-col items-center gap-3 p-6 text-center">
                        <p className="text-2xl font-extrabold uppercase leading-tight sm:text-4xl" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}>
                          {categoryName(bannerCat)}
                        </p>
                        <span className="inline-flex h-9 items-center rounded-md border bg-white px-5 text-[11px] font-semibold text-[#101c1a]" style={{ borderColor: 'var(--theme-border)' }}>
                          {t('shopNow')}
                        </span>
                      </div>
                    </Link>
                  </section>
                )}

                <section className={`${containerClass} mt-12 lg:mt-16`}>
                  <div className="mb-7 flex justify-center gap-6 sm:gap-9" role="tablist" aria-label={t('popularProducts')}>
                    {tabs.map((tb) => {
                      const on = tab === tb.id;
                      return (
                        <button
                          key={tb.id}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          onClick={() => setTab(tb.id)}
                          className="relative pb-1.5 text-sm font-semibold transition-colors"
                          style={{ color: on ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}
                        >
                          {tb.label}
                          <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-opacity" style={{ background: 'var(--theme-primary)', opacity: on ? 1 : 0 }} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
                    <Link
                      to={tileCat ? `/${username}/category/${tileCat.slug}` : `/${username}/products`}
                      className="group relative isolate flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-xl p-5 no-underline lg:row-span-2 lg:min-h-0"
                      style={{ background: MART_DEEP }}
                    >
                      {tileImage ? (
                        <img
                          src={tileCat?.image ? tileImage : getProductImageDisplayUrl(tileImage)}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                        />
                      ) : null}
                      <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgb(8 46 41 / 0.92) 0%, rgb(8 46 41 / 0.1) 70%)' }} />
                      <div className="relative">
                        <p className="text-lg font-bold leading-tight" style={{ color: MART_TEXT, fontFamily: 'var(--theme-font-heading)' }}>
                          {tileCat ? categoryName(tileCat) : shop.shopName}
                        </p>
                        <span className="mt-2 inline-block text-xs font-semibold underline underline-offset-4" style={{ color: MART_ORANGE }}>{t('shopNow')}</span>
                      </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:col-span-4">
                      {tabItems.map((p) => (
                        <ProductCard key={`${tab}-${p.id}`} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            );

          case 'trust':
            if (trust.length === 0) return null;
            return (
              <section key="trust" className={`${containerClass} mt-14 lg:mt-20`} aria-label={t('trustTitle')}>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {trust.map((b, i) => (
                    <li key={`${b.label}-${i}`} className="flex items-center gap-3.5 rounded-xl px-5 py-4" style={{ background: 'var(--theme-primary-light)' }}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--theme-surface)', color: 'var(--theme-primary)' }}>
                        <TrustBadgeTypeIcon type={resolveTrustBadgeType(b.icon)} className="h-[18px] w-[18px]" />
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{getLocalizedTrustLabel(b, lang)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'reviews':
            if (reviews.length === 0) return null;
            return (
              <div key={`reviews-${idx}`} className="mt-14 lg:mt-20">
                <ShopReviewsSection reviews={reviews} containerClass={containerClass} />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
