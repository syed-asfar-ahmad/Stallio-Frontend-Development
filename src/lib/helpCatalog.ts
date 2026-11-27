export type HelpCategoryId = 'account' | 'access' | 'billing';

export type HelpArticleCopy = {
  title: string;
  excerpt: string;
  intro: string;
  steps: string[];
};

export type HelpArticleMeta = {
  slug: string;
  category: HelpCategoryId;
  /** Extra English search terms; localized title/excerpt/steps are also searched. */
  keywords: string[];
  related: string[];
};

export const HELP_CATEGORY_IDS: HelpCategoryId[] = ['account', 'access', 'billing'];

export const HELP_ARTICLES: HelpArticleMeta[] = [
  {
    slug: 'delete-account',
    category: 'account',
    keywords: ['delete', 'close account', 'remove shop', 'permanently delete', 'settings'],
    related: ['restore-account', 'cancel-or-change-plan'],
  },
  {
    slug: 'restore-account',
    category: 'account',
    keywords: ['restore', 'recover', 'undelete', 'deleted account', 'bring back'],
    related: ['delete-account', 'login-issues'],
  },
  {
    slug: 'account-suspended',
    category: 'account',
    keywords: ['suspended', 'suspension', 'blocked', 'dashboard suspended', 'shop offline'],
    related: ['after-suspension', 'billing-problems'],
  },
  {
    slug: 'after-suspension',
    category: 'account',
    keywords: ['appeal', 'contact support', 'unsuspend', 'reactivate', 'what next'],
    related: ['account-suspended', 'billing-problems'],
  },
  {
    slug: 'login-issues',
    category: 'access',
    keywords: ['login', 'sign in', 'cannot login', 'wrong password', 'email', 'verify'],
    related: ['reset-password', 'account-suspended'],
  },
  {
    slug: 'reset-password',
    category: 'access',
    keywords: ['password', 'forgot', 'reset', 'change password', 'email link'],
    related: ['login-issues', 'restore-account'],
  },
  {
    slug: 'cancel-or-change-plan',
    category: 'billing',
    keywords: ['cancel', 'upgrade', 'downgrade', 'subscription', 'plan', 'monthly', 'yearly', 'trial'],
    related: ['billing-problems', 'request-refund'],
  },
  {
    slug: 'billing-problems',
    category: 'billing',
    keywords: ['billing', 'payment', 'charged', 'invoice', 'card', 'double charge', 'failed payment'],
    related: ['request-refund', 'cancel-or-change-plan', 'account-suspended'],
  },
  {
    slug: 'request-refund',
    category: 'billing',
    keywords: ['refund', 'money back', 'subscription fee', 'refund policy'],
    related: ['billing-problems', 'cancel-or-change-plan'],
  },
];
