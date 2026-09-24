import { useShop } from '../../context/ShopContext';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { getLocalizedRefundContent } from '../../lib/shopContentLanguages';
import { prepareShopAboutHtml, SHOP_RICH_TEXT_BODY_CLASS } from '../../lib/prepareShopAboutHtml';

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

export default function ShopRefundPage() {
  const { shop } = useShop();
  const { t, lang } = useShopLanguage();

  if (!shop) return null;

  const refundContentHtml = getLocalizedRefundContent(shop, lang);

  return (
    <main className="flex-1 pb-8 max-lg:pb-8 lg:pb-14">
      <section className={`${containerClass} pt-4 max-lg:pt-4 lg:pt-8`}>
        <header className="overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface p-5 shadow-theme-card max-lg:p-5 sm:p-10 lg:p-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-theme-badge border border-theme-border bg-theme-primary-light px-3 py-1 text-xs font-semibold text-theme-primary max-lg:mb-3 lg:mb-4">
            {t('returnExchangeBadge')}
          </p>
          <h1 className="text-2xl max-lg:leading-snug font-bold leading-tight tracking-tight text-theme-text sm:text-4xl lg:text-5xl">
            {t('returnExchangePolicy')}
          </h1>
          <p className="mt-2 max-lg:mt-2 max-w-2xl text-sm text-theme-text-muted lg:mt-3 lg:text-base">
            {t('returnExchangeSubtitle', { shopName: shop.shopName })}
          </p>
        </header>
      </section>

      <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
        <article className="w-full rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 sm:p-8 lg:p-10">
          {refundContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-sm max-lg:text-sm text-theme-text-secondary lg:text-lg ${SHOP_RICH_TEXT_BODY_CLASS}`}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(refundContentHtml) }}
            />
          ) : (
            <p className="text-sm text-theme-text-muted lg:text-base">{t('returnExchangeEmpty')}</p>
          )}
        </article>
      </section>
    </main>
  );
}
