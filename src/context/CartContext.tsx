import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../types';
import type { ShopCartItem } from '../components/shop/CheckoutModal';
import { getLocalizedProductName, shopLangStorageKey, type ShopContentLang } from '../lib/shopContentLanguages';
import { getShopCustomerLanguages } from '../lib/shopLocaleConfig';
import { useShop } from './ShopContext';

export type { ShopCartItem };

export function getEffectivePrice(p: Product, selectedOptions?: Record<string, string> | null): number {
  let price = Number(p.price) || 0;
  if (!selectedOptions || !p.options?.length) return price;
  for (const opt of p.options) {
    const choice = selectedOptions[opt.name];
    if (!choice) continue;
    const idx = (opt.choices || []).indexOf(choice);
    const mods = Array.isArray(opt.choicePriceModifiers) ? opt.choicePriceModifiers : [];
    if (idx >= 0 && idx < mods.length) price += Number(mods[idx]) || 0;
  }
  return Math.round(price * 100) / 100;
}

function cartStorageKey(shopUsername: string) {
  return `stallio-shop-cart:${shopUsername}`;
}

function loadCartFromStorage(shopUsername: string): ShopCartItem[] {
  try {
    const raw = localStorage.getItem(cartStorageKey(shopUsername));
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item): item is ShopCartItem =>
        item != null &&
        typeof item === 'object' &&
        typeof item.productId === 'string' &&
        typeof item.productName === 'string' &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price) &&
        typeof item.quantity === 'number' &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function saveCartToStorage(shopUsername: string, items: ShopCartItem[]) {
  const key = cartStorageKey(shopUsername);
  if (items.length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(items));
  }
}

function getCurrentShopLang(username: string, shop: { shopLangEsEnabled?: boolean; shopLangArEnabled?: boolean } | null): ShopContentLang {
  if (typeof window === 'undefined') return 'en';
  const enabled = getShopCustomerLanguages({
    shopLangEsEnabled: shop?.shopLangEsEnabled,
    shopLangArEnabled: shop?.shopLangArEnabled,
  });
  const stored = localStorage.getItem(shopLangStorageKey(username));
  if (stored === 'es' && enabled.includes('es')) return 'es';
  if (stored === 'ar' && enabled.includes('ar')) return 'ar';
  return 'en';
}

export interface CartContextValue {
  cart: ShopCartItem[];
  cartCount: number;
  showCheckout: boolean;
  orderDone: boolean;
  addToCart: (p: Product, qty?: number, selectedOptions?: Record<string, string> | null, customerMessage?: string | null) => void;
  updateQty: (productId: string, delta: number, selectedOptions?: Record<string, string> | null) => void;
  removeFromCart: (productId: string, selectedOptions?: Record<string, string> | null) => void;
  clearCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setOrderDone: (done: boolean) => void;
  clearOrderDone: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { username, shop } = useShop();
  const [cart, setCart] = useState<ShopCartItem[]>(() => (username ? loadCartFromStorage(username) : []));
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    if (!username) {
      setCart([]);
      return;
    }
    setCart(loadCartFromStorage(username));
  }, [username]);

  useEffect(() => {
    if (!username) return;
    saveCartToStorage(username, cart);
  }, [cart, username]);

  function addToCart(
    p: Product,
    qty: number = 1,
    selectedOptions?: Record<string, string> | null,
    customerMessage?: string | null,
  ) {
    if (p.inStock === false) return;
    if (!Number.isFinite(qty) || qty < 0.001) return;
    const opts = selectedOptions && Object.keys(selectedOptions).length > 0 ? selectedOptions : null;
    const msg = customerMessage?.trim() || null;
    const effectivePrice = getEffectivePrice(p, opts);
    setCart((prev) => {
      const optsKey = JSON.stringify(opts ?? {});
      const existing = prev.find((c) => c.productId === p.id && JSON.stringify(c.selectedOptions ?? {}) === optsKey);
      if (existing) {
        return prev.map((c) =>
          c.productId === p.id && JSON.stringify(c.selectedOptions ?? {}) === optsKey
            ? { ...c, quantity: c.quantity + qty, customerMessage: msg ?? c.customerMessage }
            : c,
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          productName: getLocalizedProductName(p, getCurrentShopLang(username, shop)),
          price: effectivePrice,
          quantity: qty,
          selectedOptions: opts ?? null,
          customerMessage: msg ?? null,
        },
      ];
    });
  }

  function updateQty(productId: string, delta: number, selectedOptions?: Record<string, string> | null) {
    const optsKey = JSON.stringify(selectedOptions ?? {});
    setCart((prev) => {
      const item = prev.find((c) => c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((c) => !(c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey));
      }
      return prev.map((c) =>
        c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey
          ? { ...c, quantity: newQty }
          : c,
      );
    });
  }

  function removeFromCart(productId: string, selectedOptions?: Record<string, string> | null) {
    const optsKey = JSON.stringify(selectedOptions ?? {});
    setCart((prev) => prev.filter((c) => !(c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey)));
  }

  function clearCart() {
    setCart([]);
  }

  function openCheckout() {
    setShowCheckout(true);
  }

  function closeCheckout() {
    setShowCheckout(false);
  }

  function clearOrderDone() {
    setOrderDone(false);
  }

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const value: CartContextValue = {
    cart,
    cartCount,
    showCheckout,
    orderDone,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    openCheckout,
    closeCheckout,
    setOrderDone,
    clearOrderDone,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
