import type { Product, Shop } from '../../../types';
import type { ShopProductLinkState } from '../../../lib/shopProductNav';
import type { LucideIcon } from 'lucide-react';

export type ThemeNavLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export type ThemeHeaderProps = {
  shop: Shop;
  username: string;
  navLinks: ThemeNavLink[];
  isNavActive: (to: string) => boolean;
  cartCount: number;
  onOpenCheckout: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  announcements: string[];
  showAnnouncementBar: boolean;
  compactAnnouncement: boolean;
  containerClass: string;
};

export type ThemeHeroProps = {
  shop: Shop;
  username: string;
  containerClass: string;
};

export type ThemeProductCardProps = {
  product: Product;
  shopUsername: string;
  currency?: string | null;
  linkState?: ShopProductLinkState;
};

export type ThemeFooterProps = {
  shop: Shop;
  quickLinks: ThemeNavLink[];
  containerClass: string;
};