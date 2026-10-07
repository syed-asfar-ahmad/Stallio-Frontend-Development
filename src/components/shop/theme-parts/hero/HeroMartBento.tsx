import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import { MART_TINTS, MartEyebrow } from '../mart/MartParts';
import type { ThemeHeroProps } from '../types';

type Panel = {
  key: string;
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string | null;
  to: string;
  cta: string;
  tint: string;
};

/** One bento panel: text on the leading side, photo fading in from the other (or from the bottom when tall). */
function BentoPanel({
  panel,
  variant,
  className = '',
}: {
  panel: Panel;
  variant: 'wide' | 'tall';
  className?: string;
}) {
  const { lang } = useShopLanguage();
  const dir = lang === 'ar' ? 270 : 90;
  const sideMask = `linear-gradient(${dir}deg, transparent 0%, #000 40%)`;
  const bottomMask = 'linear-gradient(180deg, transparent 0%, #000 34%)';
  const tall = variant === 'tall';

  return (
    <article className={`relative isolate overflow-hidden rounded-xl ${className}`} style={{ background: panel.tint, color: 'var(--theme-text-primary)' }}>
      {panel.image ? (
        <img
          src={panel.image}
          alt=""
          loading="eager"
          className={
            tall
              ? 'absolute inset-x-0 bottom-0 h-[62%] w-full object-cover object-top'
              : 'absolute inset-y-0 end-0 h-full w-[56%] object-cover'
          }
          style={{ WebkitMaskImage: tall ? bottomMask : sideMask, maskImage: tall ? bottomMask : sideMask }}
        />
      ) : null}
      <div className={`relative z-10 flex h-full flex-col items-start gap-3 p-6 sm:p-8 ${tall ? '' : 'justify-center sm:max-w-[58%]'}`}>
        {panel.eyebrow ? <MartEyebrow>{panel.eyebrow}</MartEyebrow> : null}
        <h2
          className={`font-bold leading-[1.1] ${tall ? 'text-2xl sm:text-3xl' : 'text-[1.75rem] sm:text-4xl'}`}
          style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em', textWrap: 'balance' as never }}
        >
          {panel.title}
        </h2>
        {panel.body ? (
          <p className="line-clamp-3 max-w-xs text-[13px] leading-relaxed sm:text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            {panel.body}
          </p>
        ) : null}
        <Link
          to={panel.to}
          className="mt-1 inline-flex h-10 items-center rounded-full px-6 text-xs font-semibold no-underline transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
        >
          {panel.cta}
        </Link>
      </div>
    </article>
  );
}

/**
 * Mart bento hero — a large panel from the store hero, a tall panel and up to two small panels
 * from categories that have photography. Falls back gracefully when there are fewer categories.
 */
export default function HeroMartBento({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang, categoryName } = useShopLanguage();
  const title = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const intro = getLocalizedHomeIntro(shop, lang);
  const image = shop.homeHeroImage ?? null;
  const show = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || intro || image));
  if (!show) return null;

  const extras: Panel[] = (shop.categoriesEnabled ? shop.categories ?? [] : [])
    .filter((c) => c.visible !== false && c.image)
    .slice(0, 3)
    .map((c, i) => ({
      key: c.slug,
      eyebrow: shop.shopName,
      title: categoryName(c),
      image: c.image,
      to: `/${username}/category/${c.slug}`,
      cta: t('shopNow'),
      tint: MART_TINTS[(i + 1) % MART_TINTS.length],
    }));

  const main: Panel = {
    key: 'hero',
    eyebrow: shop.shopName,
    title,
    body: intro || undefined,
    image,
    to: `/${username}/products`,
    cta: t('shopNow'),
    tint: MART_TINTS[0],
  };

  const [tallPanel, smallA, smallB] = extras;

  return (
    <section className={`${containerClass} pt-4 lg:pt-6`}>
      <div className={`grid gap-4 ${tallPanel ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''}`}>
        <div className="flex flex-col gap-4">
          <BentoPanel panel={main} variant="wide" className="min-h-[19rem] lg:min-h-[22.5rem]" />
          {smallA && (
            <div className={`grid gap-4 ${smallB ? 'sm:grid-cols-2' : ''}`}>
              <BentoPanel panel={smallA} variant="wide" className="min-h-[13rem] lg:min-h-[14rem]" />
              {smallB && <BentoPanel panel={smallB} variant="wide" className="min-h-[13rem] lg:min-h-[14rem]" />}
            </div>
          )}
        </div>
        {tallPanel && <BentoPanel panel={tallPanel} variant="tall" className="min-h-[24rem] lg:min-h-0" />}
      </div>
    </section>
  );
}
