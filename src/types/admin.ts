import type { ProductOption, ShopAvailabilitySlot, ShopTestimonial, ShopTrustBadge } from './index';

export type ChartPoint = { label: string; value: number };

export type AdminNotificationKind = 'new_signup' | 'subscription_due_tomorrow' | 'support_chat_new';

export type AdminNotification = {
  id: string;
  kind: AdminNotificationKind;
  sellerId: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type AdminNotificationsResponse = {
  unreadCount: number;
  notifications: AdminNotification[];
};

export type SubscriptionPlan = 'monthly' | 'yearly';

export type AdminSubscriptionPayment = {
  id: string;
  plan: SubscriptionPlan;
  amount: number;
  paidAt: string;
  subscriptionNextDueAt?: string | null;
  subscriptionPlan?: SubscriptionPlan;
};

export type SubscriptionBillingStatus =
  | 'never_paid'
  | 'paid_this_month'
  | 'overdue'
  | 'due'
  | 'upcoming';

export type AdminSubscriptionSellerRow = {
  id: string;
  email: string;
  username: string;
  shopName: string;
  subscriptionPlan: SubscriptionPlan | null;
  subscriptionNextDueAt: string | null;
  lastPaidAt: string | null;
  lastPlan: SubscriptionPlan | null;
  lastAmount: number | null;
  paidThisMonth: boolean;
  billingStatus: SubscriptionBillingStatus;
};

export type AdminSubscriptionHistoryRow = {
  id: string;
  userId: string;
  shopName: string;
  username: string;
  email: string;
  plan: SubscriptionPlan;
  amount: number;
  paidAt: string;
};

export type AdminSubscriptionsPage = {
  summary: {
    monthLabel: string;
    paidThisMonth: number;
    dueCount: number;
    overdueCount: number;
    neverPaid: number;
    upcomingCount: number;
    totalRevenue: number;
  };
  sellers: AdminSubscriptionSellerRow[];
  sellersTotal: number;
  sellersPage: number;
  sellersLimit: number;
  history: AdminSubscriptionHistoryRow[];
  historyTotal: number;
  historyPage: number;
  historyLimit: number;
};

export type AdminStats = {
  range: string;
  totalSellers: number;
  totalSellersAllTime?: number;
  suspendedSellers: number;
  orders: number;
  messages: number;
  platformRevenue: number;
  subscriptionRevenue: number;
  subscriptionPayments: number;
  newSellers: number;
  charts: {
    revenueByDay: ChartPoint[];
    ordersByDay: ChartPoint[];
    signupsByDay: ChartPoint[];
    subscriptionByDay: ChartPoint[];
  };
  recentSignups: {
    id: string;
    email: string;
    shopName: string;
    username: string;
    suspended: boolean;
    dashboardSuspended?: boolean;
    createdAt: string;
  }[];
  recentSignupsTotal: number;
  recentSignupsPage: number;
  recentSignupsLimit: number;
};

export type AdminSeller = {
  id: string;
  email: string;
  username: string;
  shopName: string;
  country: string | null;
  currency: string | null;
  logo: string | null;
  suspended: boolean;
  dashboardSuspended: boolean;
  productCount: number;
  orderCount: number;
  subscriptionPaid: boolean;
  subscriptionLastPaidAt: string | null;
  subscriptionLastPlan: SubscriptionPlan | null;
  subscriptionLastAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSellerDetail = AdminSeller & {
  aboutEnabled: boolean;
  categoriesEnabled: boolean;
  footerEnabled: boolean;
  deliveryEnabled: boolean;
  announcementEnabled: boolean;
  messageCount: number;
  revenue: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string | null;
  sellerId: string;
  shopName: string;
  username: string;
  sellerEmail: string;
  createdAt: string;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productName: string; quantity: number; price: number }[];
  subtotalAmount?: number;
  deliveryAmount?: number;
  totalAmount: number;
  pendingPayment: boolean;
  fulfillmentStatus: string;
  shopName: string;
  username: string;
  sellerEmail: string;
  sellerId: string;
  createdAt: string;
};

export type AdminMessageSource = 'shop' | 'marketing';

export type AdminMessage = {
  id: string;
  source: AdminMessageSource;
  subject: string | null;
  customerName: string;
  customerEmail: string;
  message: string;
  responded: boolean;
  shopName: string;
  username: string;
  sellerEmail: string;
  createdAt: string;
};

export type Paginated<T> = {
  total: number;
  page: number;
  limit: number;
} & T;

export type AdminSellerShopFields = {
  aboutEnabled: boolean;
  aboutTitle: string;
  aboutTitleEs?: string;
  aboutTitleAr?: string;
  aboutContent: string;
  aboutContentEs?: string;
  aboutContentAr?: string;
  aboutImages: string[];
  aboutTextColor: string;
  categoriesEnabled: boolean;
  categories: {
    name: string;
    nameEs?: string;
    nameAr?: string;
    slug: string;
    image?: string;
    visible?: boolean;
  }[];
  footerEnabled: boolean;
  footerLogo: string | null;
  footerTitle: string;
  footerDescription: string;
  footerDescriptionEs?: string;
  footerDescriptionAr?: string;
  footerSocialLinks: { platform: string; url: string }[];
  footerCopyright: string;
  footerAddress: string;
  footerAddressAr?: string;
  footerAddressEs?: string;
  footerPhone: string;
  footerEmail: string;
  availabilityEnabled: boolean;
  availability24Hours: boolean;
  availabilityHours: ShopAvailabilitySlot[];
  announcementEnabled: boolean;
  announcementText: string;
  announcementTextEs?: string;
  announcementTextAr?: string;
  deliveryEnabled: boolean;
  deliveryType: 'fixed' | 'free';
  deliveryFee: number;
  freeDeliveryThreshold: number | null;
  deliveryNote: string;
  deliveryNoteEs?: string;
  deliveryNoteAr?: string;
  deliveryEta: string;
  deliveryCodEnabled: boolean;
  shopLangEsEnabled: boolean;
  shopLangArEnabled: boolean;
  refundEnabled: boolean;
  refundContent: string;
  refundContentEs?: string;
  refundContentAr?: string;
  shopTagline: string;
  shopTaglineEs?: string;
  shopTaglineAr?: string;
  homeHeroEnabled: boolean;
  homeHeroTitle: string;
  homeHeroTitleEs?: string;
  homeHeroTitleAr?: string;
  homeHeroSubtitle: string;
  homeHeroSubtitleEs?: string;
  homeHeroSubtitleAr?: string;
  homeHeroImage: string | null;
  homeHeroImagePublicId: string | null;
  homeTrustEnabled: boolean;
  homeTrustBadges: ShopTrustBadge[];
  homeReviewsEnabled: boolean;
  homeReviews: ShopTestimonial[];
  logoPublicId: string | null;
};

export type AdminSellerFull = {
  seller: {
    id: string;
    email: string;
    username: string;
    shopName: string;
    country: string | null;
    currency: string | null;
    logo: string | null;
    suspended: boolean;
    dashboardSuspended: boolean;
    subscriptionPlan: SubscriptionPlan | null;
    subscriptionNextDueAt: string | null;
    createdAt: string;
    updatedAt: string;
  } & AdminSellerShopFields;
  stats: {
    productCount: number;
    orderCount: number;
    messageCount: number;
    revenue: number;
    subscriptionRevenue: number;
  };
  subscriptionPayments: AdminSubscriptionPayment[];
  charts: {
    revenueByDay: ChartPoint[];
    ordersByDay: ChartPoint[];
  };
  products: {
    id: string;
    name: string;
    nameEs?: string;
    nameAr?: string;
    description: string;
    descriptionEs?: string;
    descriptionAr?: string;
    price: number;
    image: string | null;
    images: string[];
    category: string | null;
    options: ProductOption[];
    optionsEs?: ProductOption[];
    optionsAr?: ProductOption[];
    allowCustomerMessage: boolean;
    customerMessageLabel: string | null;
    customerMessageLabelEs?: string | null;
    customerMessageLabelAr?: string | null;
    createdAt: string;
  }[];
  orders: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: { productName: string; quantity: number; price: number }[];
    totalAmount: number;
    pendingPayment: boolean;
    fulfillmentStatus: string;
    createdAt: string;
  }[];
  messages: {
    id: string;
    customerName: string;
    customerEmail: string;
    message: string;
    responded: boolean;
    createdAt: string;
  }[];
};
