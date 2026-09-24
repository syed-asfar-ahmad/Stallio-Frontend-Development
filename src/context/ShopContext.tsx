import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { Product, Shop } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface ShopContextValue {
  shop: Shop | null;
  products: Product[];
  loading: boolean;
  username: string;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopDataProvider({ children }: { children: ReactNode }) {
  const { username = '' } = useParams<{ username: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setShop(null);
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.shop) {
          const localThemeId = localStorage.getItem(`stallio_theme_${username}`);
          const localThemeConfig = localStorage.getItem(`stallio_theme_config_${username}`);
          let parsedConfig = undefined;
          if (localThemeConfig) {
            try {
              parsedConfig = JSON.parse(localThemeConfig);
            } catch {}
          }
          const effectiveShop = {
            ...data.shop,
            themeConfig: data.shop.themeConfig || parsedConfig || (localThemeId ? { version: 1, themeId: localThemeId } : undefined),
          };
          setShop(effectiveShop);
          setProducts(data.products || []);
        } else {
          setShop(null);
          setProducts([]);
        }
      })
      .catch(() => {
        setShop(null);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    document.title = shop?.shopName ?? 'Stallio';
    return () => {
      document.title = 'Stallio';
    };
  }, [shop?.shopName]);

  return (
    <ShopContext.Provider value={{ shop, products, loading, username }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopDataProvider');
  }
  return ctx;
}
