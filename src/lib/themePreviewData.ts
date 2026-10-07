import { SAMPLE_PREVIEWS } from '../themes/sampleData';
import type { ShopThemeConfig, ThemeId } from '../themes/types';
import type { Product, Shop, ShopCategory } from '../types';
import { THEME_PREVIEW_USERNAME } from './themePreviewBridge';

/** Category label for each sample source (matches the products and photo that source provides). */
const SOURCE_LABELS: Record<string, string> = {
  'classic-clean': 'Sport & Active',
  'modern-minimal': 'Style & Home',
  'bold-editorial': 'Streetwear',
  'boutique-artisan': 'Craft & Candles',
  'retail-catalog': 'Audio & Wearables',
  'noir-luxe': 'Watches & Jewelry',
  'pacific-fresh': 'Skincare',
  'studio-grid': 'Desk & Tech',
};

/** Which sample sources to feature first so each theme previews with fitting products. */
const AFFINITY: Record<string, string[]> = {
  'retail-catalog': ['retail-catalog', 'studio-grid', 'noir-luxe', 'classic-clean', 'bold-editorial', 'modern-minimal'],
  'studio-grid': ['studio-grid', 'retail-catalog', 'noir-luxe', 'classic-clean', 'bold-editorial', 'modern-minimal'],
  'pacific-fresh': ['pacific-fresh', 'boutique-artisan', 'modern-minimal', 'noir-luxe', 'classic-clean', 'retail-catalog'],
  'boutique-artisan': ['boutique-artisan', 'pacific-fresh', 'modern-minimal', 'noir-luxe', 'bold-editorial', 'classic-clean'],
  'noir-luxe': ['noir-luxe', 'modern-minimal', 'bold-editorial', 'boutique-artisan', 'pacific-fresh', 'retail-catalog'],
};

const HERO_COPY: Record<string, { title: string; subtitle: string }> = {
  'retail-catalog': { title: 'Everything tech, all in one place', subtitle: 'Headphones, wearables and desk gear at prices that make sense.' },
  'studio-grid': { title: 'Tools for focused work', subtitle: 'Precision-built gear for your desk and your day.' },
  'pacific-fresh': { title: 'Skincare for Everyone', subtitle: 'A fresh, gentle approach to your daily ritual.' },
  'boutique-artisan': { title: 'Crafted pieces that defy the everyday', subtitle: 'Small-batch goods made by hand, chosen with care.' },
  'noir-luxe': { title: 'Quiet luxury, made to last', subtitle: 'Timeless pieces in black, gold and glass.' },
};

const SAMPLE_OPTIONS = {
  finish: [{ name: 'Finish', choices: ['Natural', 'Graphite', 'Sand'], required: true }],
  size: [{ name: 'Size', choices: ['S', 'M', 'L'], required: true }],
};

function ordered(themeId: string): string[] {
  const all = Object.keys(SAMPLE_PREVIEWS);
  const first = AFFINITY[themeId] ?? [themeId, ...all.filter((id) => id !== themeId)];
  return [...first.filter((id) => id in SAMPLE_PREVIEWS), ...all.filter((id) => !first.includes(id))];
}

const slugOf = (sourceId: string) => sourceId;

export interface PreviewStore {
  shop: Shop;
  products: Product[];
}

export function buildPreviewStore(shopName: string, themeConfig: ShopThemeConfig): PreviewStore {
  const themeId = (themeConfig.themeId ?? 'classic-clean') as ThemeId;
  const sources = ordered(themeId);
  const own = SAMPLE_PREVIEWS[themeId] ?? SAMPLE_PREVIEWS[sources[0] as ThemeId];
  const copy = HERO_COPY[themeId] ?? {
    title: `Welcome to ${shopName}`,
    subtitle: 'Discover our latest arrivals and customer favourites.',
  };

  const categories: ShopCategory[] = sources.slice(0, 6).map((id) => ({
    name: SOURCE_LABELS[id] ?? id,
    slug: slugOf(id),
    image: SAMPLE_PREVIEWS[id as ThemeId].heroImage,
    visible: true,
  }));

  const now = Date.now();
  const products: Product[] = [];
  sources.slice(0, 6).forEach((id) => {
    const src = SAMPLE_PREVIEWS[id as ThemeId];
    src.products.forEach((p) => {
      const i = products.length;
      products.push({
        id: `preview-${i + 1}`,
        name: p.name,
        description: [
          `${p.name} — designed with care and built to last.`,
          'Free returns within 30 days.',
          'Secure packaging and fast dispatch.',
          'Backed by our quality promise.',
        ].join('\n'),
        price: p.price,
        compareAtPrice: p.compare > p.price ? p.compare : null,
        image: p.image,
        images: [p.image, src.heroImage],
        category: slugOf(id),
        isVisible: true,
        isFeatured: [0, 1, 2, 5].includes(i),
        inStock: i !== 7,
        stockQuantity: i === 3 ? 3 : i === 7 ? 0 : 24,
        options: i === 1 || i === 4 ? SAMPLE_OPTIONS.finish : i === 6 ? SAMPLE_OPTIONS.size : null,
        createdAt: new Date(now - (i < 4 ? i + 1 : 40 + i) * 86_400_000).toISOString(),
      });
    });
  });

  const hours = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => ({
    day,
    enabled: day !== 'sun',
    openTime: day === 'sat' ? '10:00' : '09:00',
    closeTime: day === 'sat' ? '16:00' : '18:00',
  }));

  const shop: Shop = {
    username: THEME_PREVIEW_USERNAME,
    shopName,
    logo: null,
    country: 'US',
    currency: 'USD',
    plan: 'business',
    themeConfig,
    description: copy.subtitle,
    shopTagline: copy.subtitle,

    homeHeroEnabled: true,
    homeHeroTitle: copy.title,
    homeHeroSubtitle: copy.subtitle,
    homeHeroImage: own.heroImage,

    categoriesEnabled: true,
    categories,

    homeTrustEnabled: true,
    homeTrustBadges: [
      { label: 'Free shipping over $50', icon: 'truck' },
      { label: '30-day easy returns', icon: 'clock' },
      { label: 'Secure checkout', icon: 'shield' },
      { label: 'Quality guaranteed', icon: 'badge' },
    ],
    homeReviewsEnabled: true,
    homeReviews: [
      { name: 'Amelia R.', text: 'Beautiful quality and it arrived earlier than expected. Already ordering again.', rating: 5 },
      { name: 'Daniel K.', text: 'Exactly as pictured. The packaging felt thoughtful and premium.', rating: 5 },
      { name: 'Sofia M.', text: 'Great service and a lovely range. Customer support answered within minutes.', rating: 5 },
      { name: 'Omar H.', text: 'Fast delivery and easy checkout. Highly recommended.', rating: 4 },
    ],

    aboutEnabled: true,
    aboutTitle: 'Our story',
    aboutContent:
      '<p>We started with a simple idea: make shopping feel calm, considered and personal. Every product in our catalogue is chosen for how it looks, how it feels and how long it lasts.</p>' +
      '<p>Behind the shop is a small team that packs every order by hand, answers every message ourselves and keeps improving the range based on what you tell us.</p>' +
      '<p>Thank you for being part of the story — we are glad you are here.</p>',
    aboutImages: [own.heroImage, ...sources.slice(1, 5).map((id) => SAMPLE_PREVIEWS[id as ThemeId].heroImage)],

    announcementEnabled: true,
    announcementText: 'Free shipping on orders over $50 · New arrivals every week',

    footerEnabled: true,
    footerTitle: shopName,
    footerDescription: 'Considered products, honest prices and service that treats you like a neighbour.',
    footerSocialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'facebook', url: 'https://facebook.com' },
      { platform: 'youtube', url: 'https://youtube.com' },
    ],
    footerPhone: '+1 (555) 014-2290',
    footerEmail: 'hello@example.com',
    footerAddress: '24 Market Street, Suite 3, Portland, OR',

    availabilityEnabled: true,
    availability24Hours: false,
    availabilityHours: hours,

    refundEnabled: false,
    deliveryEnabled: false,
    shopLangEsEnabled: false,
    shopLangArEnabled: false,
  };

  return { shop, products };
}

/** Deep links used by the preview toolbar. */
export function getPreviewPaths(themeId: string): { categorySlug: string; productId: string } {
  const sources = ordered(themeId);
  return { categorySlug: slugOf(sources[0]), productId: 'preview-1' };
}
