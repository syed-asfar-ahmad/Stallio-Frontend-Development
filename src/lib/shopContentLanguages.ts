export type ShopContentLang = 'en' | 'es' | 'ar';

export const SHOP_CONTENT_LANGUAGES: {
  id: ShopContentLang;
  label: string;
  short: string;
  dir?: 'rtl';
}[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'es', label: 'Español', short: 'ES' },
  { id: 'ar', label: 'العربية', short: 'AR', dir: 'rtl' },
];

export type LocalizedCategory = {
  name: string;
  nameEs?: string | null;
  nameAr?: string | null;
};

export function getLocalizedCategoryName(category: LocalizedCategory, lang: ShopContentLang): string {
  if (lang === 'es') {
    const es = category.nameEs?.trim();
    if (es) return es;
  }
  if (lang === 'ar') {
    const ar = category.nameAr?.trim();
    if (ar) return ar;
  }
  return category.name;
}

export function categoryHasTranslation(category: LocalizedCategory, lang: ShopContentLang): boolean {
  if (lang === 'en') return Boolean(category.name?.trim());
  if (lang === 'es') return Boolean(category.nameEs?.trim());
  return Boolean(category.nameAr?.trim());
}

export type LocalizedProduct = {
  name: string;
  nameEs?: string | null;
  nameAr?: string | null;
  description?: string;
  descriptionEs?: string | null;
  descriptionAr?: string | null;
};

export function getLocalizedProductName(product: LocalizedProduct, lang: ShopContentLang): string {
  if (lang === 'es') {
    const es = product.nameEs?.trim();
    if (es) return es;
  }
  if (lang === 'ar') {
    const ar = product.nameAr?.trim();
    if (ar) return ar;
  }
  return product.name;
}

type LocalizedCustomerMessageLabel = {
  customerMessageLabel?: string | null;
  customerMessageLabelEs?: string | null;
  customerMessageLabelAr?: string | null;
};

export function getLocalizedCustomerMessageLabel(
  product: LocalizedCustomerMessageLabel,
  lang: ShopContentLang,
  fallback: string,
): string {
  if (lang === 'es') {
    const es = product.customerMessageLabelEs?.trim();
    if (es) return es;
  }
  if (lang === 'ar') {
    const ar = product.customerMessageLabelAr?.trim();
    if (ar) return ar;
  }
  const en = product.customerMessageLabel?.trim();
  return en || fallback;
}

export function getLocalizedProductDescription(product: LocalizedProduct, lang: ShopContentLang): string {
  if (lang === 'es') {
    const es = product.descriptionEs?.trim();
    if (es) return es;
  }
  if (lang === 'ar') {
    const ar = product.descriptionAr?.trim();
    if (ar) return ar;
  }
  return product.description ?? '';
}

export function productHasTranslation(product: LocalizedProduct, lang: ShopContentLang): boolean {
  if (lang === 'en') return Boolean(product.name?.trim());
  if (lang === 'es') return Boolean(product.nameEs?.trim());
  return Boolean(product.nameAr?.trim());
}

export function getLocalizedText(
  en: string | undefined | null,
  es: string | null | undefined,
  ar: string | null | undefined,
  lang: ShopContentLang,
): string {
  if (lang === 'es') {
    const v = es?.trim();
    if (v) return v;
  }
  if (lang === 'ar') {
    const v = ar?.trim();
    if (v) return v;
  }
  return (en ?? '').trim();
}

export type LocalizedTrustBadge = {
  label: string;
  labelEs?: string | null;
  labelAr?: string | null;
  icon?: string;
};

export function getLocalizedTrustLabel(badge: LocalizedTrustBadge, lang: ShopContentLang): string {
  return getLocalizedText(badge.label, badge.labelEs, badge.labelAr, lang);
}

export type LocalizedTestimonial = {
  name: string;
  nameEs?: string | null;
  nameAr?: string | null;
  text: string;
  textEs?: string | null;
  textAr?: string | null;
  rating?: number;
};

export function getLocalizedReviewName(review: LocalizedTestimonial, lang: ShopContentLang): string {
  return getLocalizedText(review.name, review.nameEs, review.nameAr, lang);
}

export function getLocalizedReviewText(review: LocalizedTestimonial, lang: ShopContentLang): string {
  return getLocalizedText(review.text, review.textEs, review.textAr, lang);
}

export type LocalizedAbout = {
  aboutTitle?: string | null;
  aboutTitleEs?: string | null;
  aboutTitleAr?: string | null;
  aboutContent?: string | null;
  aboutContentEs?: string | null;
  aboutContentAr?: string | null;
};

export function getLocalizedAboutTitle(about: LocalizedAbout, lang: ShopContentLang): string {
  return getLocalizedText(about.aboutTitle, about.aboutTitleEs, about.aboutTitleAr, lang);
}

export function getLocalizedAboutContent(about: LocalizedAbout, lang: ShopContentLang): string {
  return getLocalizedText(about.aboutContent, about.aboutContentEs, about.aboutContentAr, lang);
}

export type LocalizedRefund = {
  refundContent?: string | null;
  refundContentEs?: string | null;
  refundContentAr?: string | null;
};

export function getLocalizedRefundContent(refund: LocalizedRefund, lang: ShopContentLang): string {
  return getLocalizedText(refund.refundContent, refund.refundContentEs, refund.refundContentAr, lang);
}

export type LocalizedHomeHero = {
  homeHeroTitle?: string | null;
  homeHeroTitleEs?: string | null;
  homeHeroTitleAr?: string | null;
  homeHeroSubtitle?: string | null;
  homeHeroSubtitleEs?: string | null;
  homeHeroSubtitleAr?: string | null;
  shopTagline?: string | null;
  shopTaglineEs?: string | null;
  shopTaglineAr?: string | null;
};

export function getLocalizedHomeHeroTitle(hero: LocalizedHomeHero, lang: ShopContentLang): string {
  return getLocalizedText(hero.homeHeroTitle, hero.homeHeroTitleEs, hero.homeHeroTitleAr, lang);
}

export function getLocalizedHomeIntro(hero: LocalizedHomeHero, lang: ShopContentLang): string {
  const en = (hero.homeHeroSubtitle?.trim() || hero.shopTagline?.trim() || '');
  const es = hero.homeHeroSubtitleEs?.trim() || hero.shopTaglineEs?.trim();
  const ar = hero.homeHeroSubtitleAr?.trim() || hero.shopTaglineAr?.trim();
  return getLocalizedText(en, es, ar, lang);
}

export function shopLangStorageKey(username: string): string {
  return `stallio-shop-lang-${username}`;
}

export function isContentFieldRequired(_multilingualEnabled: boolean, _formLang: ShopContentLang): boolean {
  return true;
}

export function isSharedFieldLocked(multilingualEnabled: boolean, formLang: ShopContentLang): boolean {
  return multilingualEnabled && formLang !== 'en';
}

export function isSharedFieldRequired(multilingualEnabled: boolean, formLang: ShopContentLang): boolean {
  return !multilingualEnabled || formLang === 'en';
}

export type LocalizedFooter = {
  footerDescription?: string | null;
  footerDescriptionEs?: string | null;
  footerDescriptionAr?: string | null;
  footerAddress?: string | null;
  footerAddressEs?: string | null;
  footerAddressAr?: string | null;
};

export function getLocalizedFooterDescription(footer: LocalizedFooter, lang: ShopContentLang): string {
  return getLocalizedText(footer.footerDescription, footer.footerDescriptionEs, footer.footerDescriptionAr, lang);
}

export function getLocalizedFooterAddress(footer: LocalizedFooter, lang: ShopContentLang): string {
  return getLocalizedText(footer.footerAddress, footer.footerAddressEs, footer.footerAddressAr, lang);
}

export type LocalizedAnnouncements = {
  announcementText?: string | null;
  announcementTextEs?: string | null;
  announcementTextAr?: string | null;
};

export function getLocalizedDeliveryNote(
  shop: { deliveryNote?: string | null; deliveryNoteEs?: string | null; deliveryNoteAr?: string | null },
  lang: ShopContentLang,
): string {
  return getLocalizedText(shop.deliveryNote, shop.deliveryNoteEs, shop.deliveryNoteAr, lang);
}

export function getLocalizedAnnouncementLines(
  delivery: LocalizedAnnouncements,
  lang: ShopContentLang,
): string[] {
  const raw = getLocalizedText(
    delivery.announcementText,
    delivery.announcementTextEs,
    delivery.announcementTextAr,
    lang,
  );
  return raw
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);
}

export type LocalizedProductOption = {
  name: string;
  choices: string[];
  choicePriceModifiers?: number[];
  required?: boolean;
};

export type LocalizedProductWithOptions = LocalizedProduct & {
  options?: LocalizedProductOption[] | null;
  optionsEs?: LocalizedProductOption[] | null;
  optionsAr?: LocalizedProductOption[] | null;
};

export function productOptionsHaveContent(opts: LocalizedProductOption[] | null | undefined): boolean {
  if (!Array.isArray(opts) || opts.length === 0) return false;
  return opts.some((o) => Boolean(o.name?.trim()) && (o.choices ?? []).some((c) => Boolean(String(c).trim())));
}

export function getProductOptionsForLang(
  product: LocalizedProductWithOptions,
  lang: ShopContentLang,
): LocalizedProductOption[] {
  if (lang === 'es') return product.optionsEs ?? [];
  if (lang === 'ar') return product.optionsAr ?? [];
  return product.options ?? [];
}

export type ShopDisplayProductOption = LocalizedProductOption & {
  canonicalName: string;
  canonicalChoices: string[];
};

export function getShopDisplayProductOptions(
  product: LocalizedProductWithOptions,
  lang: ShopContentLang,
): ShopDisplayProductOption[] {
  const en = product.options ?? [];
  const result: ShopDisplayProductOption[] = [];
  en.forEach((enOpt, i) => {
    const canonicalName = String(enOpt.name ?? '').trim();
    const canonicalChoices = (enOpt.choices ?? []).map((c) => String(c).trim()).filter(Boolean);
    if (!canonicalName || canonicalChoices.length === 0) return;

    const tr = lang === 'es' ? product.optionsEs?.[i] : lang === 'ar' ? product.optionsAr?.[i] : null;
    const trName = tr?.name?.trim();
    const displayName = lang !== 'en' && trName ? trName : canonicalName;
    const displayChoices = canonicalChoices.map((enChoice, ci) => {
      const trChoice = tr?.choices?.[ci];
      const trimmed = typeof trChoice === 'string' ? trChoice.trim() : '';
      return lang !== 'en' && trimmed ? trimmed : enChoice;
    });

    result.push({
      name: displayName,
      choices: displayChoices,
      choicePriceModifiers: enOpt.choicePriceModifiers,
      required: enOpt.required,
      canonicalName,
      canonicalChoices,
    });
  });
  return result;
}
