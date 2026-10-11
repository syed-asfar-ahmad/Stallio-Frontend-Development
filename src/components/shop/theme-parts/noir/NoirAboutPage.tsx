import { Link } from 'react-router-dom';
import type { Shop } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { prepareShopAboutHtml, SHOP_RICH_TEXT_BODY_CLASS } from '../../../../lib/prepareShopAboutHtml';

type Props = {
  shop: Shop;
  username: string;
  aboutTitleText: string;
  aboutContentHtml: string;
  heroImage?: string;
  containerClass: string;
};

export default function NoirAboutPage({ shop, username, aboutTitleText, aboutContentHtml, heroImage, containerClass }: Props) {
  const { t, lang } = useShopLanguage();
  const gallery = (shop.aboutImages ?? []).slice(1, 4);

  return (
    <main className="flex-1 pb-20 lg:pb-32">
      <section className={`${containerClass} pt-12 text-center lg:pt-20`}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.45em]" style={{ color: 'var(--theme-primary)' }}>
          ✦ {shop.shopName}
        </span>
        <h1
          className="mx-auto mt-6 max-w-4xl text-4xl uppercase leading-[1.1] tracking-[0.12em] lg:text-6xl"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', textWrap: 'balance' as never }}
        >
          {aboutTitleText}
        </h1>
        <span className="mx-auto mt-8 block h-px w-24" style={{ background: 'var(--theme-primary)' }} />
      </section>

      {heroImage ? (
        <section className={`${containerClass} mt-14 lg:mt-20`}>
          <div className="relative mx-auto max-w-5xl">
            <span aria-hidden className="absolute -bottom-5 -end-5 h-full w-full border" style={{ borderColor: 'var(--theme-primary)' }} />
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={heroImage} alt={shop.shopName} className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 50%)' }} />
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${containerClass} mt-20 lg:mt-32`}>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:gap-16">
          <div>
            <span className="block text-6xl leading-none" style={{ color: 'var(--theme-primary)', fontFamily: 'var(--theme-font-heading)' }}>“</span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.35em]" style={{ color: 'var(--theme-text-muted)' }}>
              {t('aboutSubtitlePlain', { shopName: shop.shopName })}
            </p>
          </div>
          {aboutContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-base leading-[1.9] lg:text-lg ${SHOP_RICH_TEXT_BODY_CLASS}`}
              style={{ color: 'var(--theme-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
            />
          ) : (
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('aboutEmpty')}</p>
          )}
        </div>
      </section>

      {gallery.length > 0 ? (
        <section className={`${containerClass} mt-20 lg:mt-32`}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {gallery.map((img, i) => (
              <div key={i} className="group relative overflow-hidden border" style={{ borderColor: 'var(--theme-border)' }}>
                <img src={img} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                <span className="absolute start-4 top-4 text-[11px] font-semibold tabular-nums tracking-[0.3em]" style={{ color: 'var(--theme-primary)' }}>
                  0{i + 1}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={`${containerClass} mt-20 text-center lg:mt-32`}>
        <span className="mx-auto mb-8 block h-px w-24" style={{ background: 'var(--theme-primary)' }} />
        <Link
          to={`/${username}/products`}
          className="inline-flex items-center px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] no-underline transition-opacity hover:opacity-85"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
        >
          {t('heroBrowse')}
        </Link>
      </section>
    </main>
  );
}