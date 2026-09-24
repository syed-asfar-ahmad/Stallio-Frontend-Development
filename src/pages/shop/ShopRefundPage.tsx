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
        <header className="overflow-hidden rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-brand-50/40 to-brand-50/40 p-5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-brand-950/30 dark:to-brand-950/20 max-lg:p-5 sm:p-10 lg:rounded-3xl lg:p-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-700/50 dark:bg-brand-950/50 dark:text-brand-300 max-lg:mb-3 lg:mb-4">
            {t('returnExchangeBadge')}
          </p>
          <h1 className="text-2xl max-lg:leading-snug font-bold leading-tight tracking-tight text-stone-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            {t('returnExchangePolicy')}
          </h1>
          <p className="mt-2 max-lg:mt-2 max-w-2xl text-sm text-stone-600 dark:text-zinc-400 lg:mt-3 lg:text-base">
            {t('returnExchangeSubtitle', { shopName: shop.shopName })}
          </p>
        </header>
      </section>

      <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
        <article className="w-full rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-white p-4 shadow-sm max-lg:p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-8 lg:rounded-3xl lg:p-10">
          {refundContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-sm max-lg:text-sm text-stone-700 dark:text-zinc-300 lg:text-lg ${SHOP_RICH_TEXT_BODY_CLASS}`}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(refundContentHtml) }}
            />
          ) : (
            <p className="text-sm text-stone-500 dark:text-zinc-400 lg:text-base">{t('returnExchangeEmpty')}</p>
          )}
        </article>
      </section>
    </main>
  );
}
