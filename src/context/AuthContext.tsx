import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type User = {
  id: string;
  email: string;
  role?: 'seller' | 'admin';
  plan?: 'basic' | 'business' | null;
  themeConfig?: import('../themes').ShopThemeConfig | null;
  username: string;
  shopName: string;
  logo?: string | null;
  country?: string | null;
  currency?: string | null;
  aboutEnabled?: boolean;
  aboutTitle?: string;
  aboutTitleEs?: string;
  aboutTitleAr?: string;
  aboutContent?: string;
  aboutContentEs?: string;
  aboutContentAr?: string;
  aboutImages?: string[];
  aboutTextColor?: string;
  refundEnabled?: boolean;
  refundContent?: string;
  refundContentEs?: string;
  refundContentAr?: string;
  categoriesEnabled?: boolean;
  categories?: { name: string; slug: string; image?: string; nameEs?: string; nameAr?: string }[];
  footerEnabled?: boolean;
  footerLogo?: string | null;
  footerTitle?: string;
  footerDescription?: string;
  footerDescriptionEs?: string;
  footerDescriptionAr?: string;
  footerSocialLinks?: { platform: string; url: string }[];
  footerCopyright?: string;
  footerAddress?: string;
  footerAddressEs?: string;
  footerAddressAr?: string;
  footerPhone?: string;
  footerEmail?: string;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementTextEs?: string;
  announcementTextAr?: string;
  deliveryEnabled?: boolean;
  deliveryType?: 'fixed' | 'free';
  deliveryFee?: number;
  freeDeliveryThreshold?: number | null;
  deliveryNote?: string;
  deliveryNoteEs?: string;
  deliveryNoteAr?: string;
  deliveryEta?: string;
  deliveryCodEnabled?: boolean;
  shopLangEsEnabled?: boolean;
  shopLangArEnabled?: boolean;
  shopTagline?: string;
  shopTaglineEs?: string;
  shopTaglineAr?: string;
  homeHeroEnabled?: boolean;
  homeHeroTitle?: string;
  homeHeroTitleEs?: string;
  homeHeroTitleAr?: string;
  homeHeroSubtitle?: string;
  homeHeroSubtitleEs?: string;
  homeHeroSubtitleAr?: string;
  homeHeroImage?: string | null;
  homeHeroImagePublicId?: string | null;
  homeTrustEnabled?: boolean;
  homeTrustBadges?: { label: string; labelEs?: string; labelAr?: string; icon?: string }[];
  homeReviewsEnabled?: boolean;
  homeReviews?: { name: string; nameEs?: string; nameAr?: string; text: string; textEs?: string; textAr?: string; rating?: number }[];
  availabilityEnabled?: boolean;
  availability24Hours?: boolean;
  availabilityHours?: { day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'; enabled: boolean; openTime: string; closeTime: string }[];
  defaultProductOptions?: { name: string; choices: string[]; choicePriceModifiers?: number[]; required?: boolean }[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; role?: 'seller' | 'admin'; code?: string; email?: string }>;
  signup: (data: { email: string; password: string; username: string; shopName: string; country?: string; currency?: string }) => Promise<{ error?: string; requiresEmailVerification?: boolean; email?: string; emailDeliveryFailed?: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<{ error?: string }>;
  resendVerification: (email: string) => Promise<{ error?: string }>;
  logout: () => void;
  fetchUser: () => Promise<User | null>;
  replaceUser: (user: User) => void;
  deleteAccount: (confirmPhrase: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'stallio_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (): Promise<User | null> => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await fetch(`${API_BASE}/api/user`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = (await res.json()) as User;
        if (data.username) {
          const localThemeId = localStorage.getItem(`stallio_theme_${data.username}`);
          const localThemeConfig = localStorage.getItem(`stallio_theme_config_${data.username}`);
          if (!data.themeConfig && localThemeConfig) {
            try {
              data.themeConfig = JSON.parse(localThemeConfig);
            } catch {}
          }
          if (!data.themeConfig && localThemeId) {
            data.themeConfig = { version: 1, themeId: localThemeId as import('../themes').ThemeId };
          }
        }
        setUser(data);
        setToken(t);
        return data;
      }

      const data = await res.json().catch(() => ({} as { code?: string; error?: string }));
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
      if (res.status === 403 && data.code === 'DASHBOARD_SUSPENDED') {
        sessionStorage.setItem('dashboard_suspended', '1');
      }
      return null;
    } catch {
      setUser(null);
      setToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403 && data.code === 'DASHBOARD_SUSPENDED') {
        return {
          error:
            data.error ||
            'Your seller dashboard access has been suspended. Please contact support.',
        };
      }
      if (res.status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
        return {
          error: data.error || 'Verify your email before signing in.',
          code: 'EMAIL_NOT_VERIFIED',
          email: data.email,
        };
      }
      return { error: data.error || 'Login failed' };
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setToken(data.token);
    const role: 'seller' | 'admin' = data.user?.role === 'admin' ? 'admin' : 'seller';
    return { role };
  };

  const signup = async (signupData: {
    email: string;
    password: string;
    username: string;
    shopName: string;
    country?: string;
    currency?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Signup failed' };
    if (data.requiresEmailVerification || !data.token) {
      return {
        requiresEmailVerification: true,
        email: data.email || signupData.email.trim().toLowerCase(),
        emailDeliveryFailed: data.emailDeliveryFailed,
      };
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setToken(data.token);
    return {};
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Verification failed' };
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setToken(data.token);
    return {};
  };

  const resendVerification = async (email: string) => {
    const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Could not resend code' };
    return {};
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  const replaceUser = (next: User) => {
    setUser(next);
  };

  const deleteAccount = async (confirmPhrase: string) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return { error: 'Not signed in' };
    const res = await fetch(`${API_BASE}/api/user`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ confirmPhrase }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || 'Could not delete account' };
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, verifyEmail, resendVerification, logout, fetchUser, replaceUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
