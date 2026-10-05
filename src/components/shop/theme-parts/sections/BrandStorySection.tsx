import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import type { Shop } from '../../../../types';

export default function BrandStorySection({
  shop,
  username,
  containerClass,
}: {
  shop: Shop;
  username: string;
  containerClass: string;
}) {
  const { t } = useShopLanguage();
  if (!shop.shopTagline?.trim()) return null;

  return (
    <section className={`${containerClass} mt-8 lg:mt-14`}>
      <div className="mx-auto max-w-2xl text-center">
        <p
          className="text-lg leading-snug lg:text-2xl"
          style={{
            color: 'var(--theme-text-primary)',
            fontFamily: 'var(--theme-font-heading)',
            fontStyle: 'italic',
          }}
        >
          "{shop.shopTagline}"
        </p>
        {shop.aboutEnabled ? (
          <Link
            to={`/${username}/about`}
            className="mt-4 inline-block text-sm font-semibold no-underline"
            style={{ color: 'var(--theme-primary)' }}
          >
            {t('heroBrowse')}
          </Link>
        ) : null}
      </div>
    </section>
  );
}