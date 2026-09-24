import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import ShopDirRoot from '../../components/shop/ShopDirRoot';

const shopPageClass = 'shop-storefront min-h-screen flex flex-col transition-colors duration-200';

export default function ShopNotFoundPage() {
  const { t } = useShopLanguage();

  return (
    <ShopDirRoot className={`${shopPageClass} items-center justify-center px-4`}>
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">{t('notFoundTitle')}</h1>
        <p className="text-stone-600 mb-6">{t('notFoundBody')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 no-underline"
        >
          {t('notFoundBack')}
        </Link>
      </div>
    </ShopDirRoot>
  );
}
