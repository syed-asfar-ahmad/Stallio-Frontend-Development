import type { ComponentType } from 'react';
import type { Product, Shop } from '../../../../types';
import type { HomeSectionId } from '../../../../themes';
import TrustBadgesSection from './TrustBadgesSection';
import BrandStorySection from './BrandStorySection';
import CategoriesSection from './CategoriesSection';
import FeaturedProductsSection from './FeaturedProductsSection';
import ProductGridSection from './ProductGridSection';
import ReviewsSection from './ReviewsSection';

export type HomeSectionProps = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
  gridColsClass: string;
};

export const HOME_SECTION_REGISTRY: Partial<Record<HomeSectionId, ComponentType<HomeSectionProps>>> = {
  'trust-badges': TrustBadgesSection,
  'brand-story': BrandStorySection,
  categories: CategoriesSection,
  'featured-products': FeaturedProductsSection,
  'product-grid': ProductGridSection,
  reviews: ReviewsSection,
};