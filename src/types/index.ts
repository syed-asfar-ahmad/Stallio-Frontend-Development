export type ProductOption = { name: string; choices: string[]; choicePriceModifiers?: number[]; required?: boolean };

export type Product = {
  id: string;
  name: string;
  nameEs?: string | null;
  nameAr?: string | null;
  description: string;
  descriptionEs?: string | null;
  descriptionAr?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number | null;
  inStock?: boolean;
  isVisible?: boolean;
  image?: string | null;
  imagePublicId?: string | null;
  images?: string[] | null;
  imagePublicIds?: string[] | null;
  options?: ProductOption[] | null;
  optionsEs?: ProductOption[] | null;
  optionsAr?: ProductOption[] | null;
  allowCustomerMessage?: boolean;
  customerMessageLabel?: string | null;
  customerMessageLabelEs?: string | null;
  customerMessageLabelAr?: string | null;
  category?: string | null;
  isFeatured?: boolean;
  createdAt?: string;
};

export type ShopTrustBadge = { label: string; labelEs?: string | null; labelAr?: string | null; icon?: string };
export type ShopTestimonial = {
  name: string;
  nameEs?: string | null;
  nameAr?: string | null;
  text: string;
  textEs?: string | null;
  textAr?: string | null;
  rating?: number;
};
export type ShopAvailabilitySlot = {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  enabled: boolean;
  openTime: string;
  closeTime: string;
};

export type ShopCategory = {
  name: string;
  nameEs?: string | null;
  nameAr?: string | null;
  slug: string;
  image?: string | null;
  visible?: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  expiresAt?: string | null;
  active?: boolean;
  createdAt?: string;
};

export type OrderFulfillmentStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string | null;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    productImage?: string | null;
    selectedOptions?: Record<string, string>;
    customerMessage?: string | null;
  }[];
  subtotalAmount?: number;
  deliveryAmount?: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalAmount: number;
  isRead?: boolean;
  pendingPayment?: boolean;
  sellerPaymentDetails?: string;
  paidAt?: string | null;
  fulfillmentStatus?: OrderFulfillmentStatus;
  trackingNumber?: string;
  isManual?: boolean;
  createdAt: string;
};

export type FooterSocialLink = { platform: string; url: string };

export type DashboardNotificationKind = 'order_new' | 'message_new' | 'support_chat_new';

export type DashboardNotification = {
  id: string;
  kind: DashboardNotificationKind | string;
  payload: Record<string, unknown>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type Shop = {
  username: string;
  shopName: string;
  description?: string;
  logo: string | null;
  country?: string | null;
  currency?: string | null;
  plan?: 'basic' | 'business' | null;
  themeConfig?: import('../themes').ShopThemeConfig | null;
  aboutEnabled?: boolean;
  aboutTitle?: string;
  aboutTitleEs?: string | null;
  aboutTitleAr?: string | null;
  aboutContent?: string;
  aboutContentEs?: string | null;
  aboutContentAr?: string | null;
  aboutImages?: string[];
  aboutTextColor?: string;
  refundEnabled?: boolean;
  refundContent?: string;
  refundContentEs?: string | null;
  refundContentAr?: string | null;
  categoriesEnabled?: boolean;
  categories?: ShopCategory[];
  footerEnabled?: boolean;
  footerLogo?: string | null;
  footerTitle?: string;
  footerDescription?: string;
  footerDescriptionEs?: string | null;
  footerDescriptionAr?: string | null;
  footerSocialLinks?: FooterSocialLink[];
  footerCopyright?: string;
  footerAddress?: string;
  footerAddressEs?: string | null;
  footerAddressAr?: string | null;
  footerPhone?: string;
  footerEmail?: string;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementTextEs?: string | null;
  announcementTextAr?: string | null;
  deliveryEnabled?: boolean;
  deliveryType?: 'fixed' | 'free';
  deliveryFee?: number;
  freeDeliveryThreshold?: number | null;
  deliveryNote?: string;
  deliveryNoteEs?: string | null;
  deliveryNoteAr?: string | null;
  deliveryEta?: string;
  deliveryCodEnabled?: boolean;
  shopLangEsEnabled?: boolean;
  shopLangArEnabled?: boolean;
  shopTagline?: string;
  shopTaglineEs?: string | null;
  shopTaglineAr?: string | null;
  homeHeroEnabled?: boolean;
  homeHeroTitle?: string;
  homeHeroTitleEs?: string | null;
  homeHeroTitleAr?: string | null;
  homeHeroSubtitle?: string;
  homeHeroSubtitleEs?: string | null;
  homeHeroSubtitleAr?: string | null;
  homeHeroImage?: string | null;
  homeTrustEnabled?: boolean;
  homeTrustBadges?: ShopTrustBadge[];
  homeReviewsEnabled?: boolean;
  homeReviews?: ShopTestimonial[];
  availabilityEnabled?: boolean;
  availability24Hours?: boolean;
  availabilityHours?: ShopAvailabilitySlot[];
};
