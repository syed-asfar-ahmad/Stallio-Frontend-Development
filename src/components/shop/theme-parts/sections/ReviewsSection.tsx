import ShopReviewsSection from '../../ShopReviewsSection';
import { getLocalizedReviewName, getLocalizedReviewText } from '../../../../lib/shopContentLanguages';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import type { Shop } from '../../../../types';

export default function ReviewsSection({ shop, containerClass }: { shop: Shop; containerClass: string }) {
  const { lang } = useShopLanguage();
  const raw = shop.homeReviewsEnabled
    ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
    : [];
  if (raw.length === 0) return null;

  const reviews = raw.map((r) => ({
    ...r,
    name: getLocalizedReviewName(r, lang),
    text: getLocalizedReviewText(r, lang),
  }));
  return <ShopReviewsSection reviews={reviews} containerClass={containerClass} />;
}