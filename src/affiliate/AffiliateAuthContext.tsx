// ============================================================================
// Stallio Affiliate Auth Context & Provider
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Affiliate } from './types';
import {
  affiliateApi,
  getStoredAffiliateToken,
  setStoredAffiliateToken,
  clearStoredAffiliateToken,
} from './affiliateApi';
import { mockAffiliateDb } from './affiliateMock';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const FORCE_MOCK = import.meta.env.VITE_AFFILIATE_MOCK !== 'false';

interface AffiliateAuthContextType {
  affiliate: Affiliate | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
  }) => Promise<{ error?: string; requiresEmailVerification?: boolean; email?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ error?: string }>;
  resendVerification: (email: string) => Promise<{ error?: string }>;
  logout: () => void;
  fetchAffiliate: () => Promise<Affiliate | null>;
  setAffiliateState: (affiliate: Affiliate) => void;
  updateAffiliateProfile: (patch: Partial<Affiliate>) => Promise<Affiliate>;
}

const AffiliateAuthContext = createContext<AffiliateAuthContextType | null>(null);

export function AffiliateAuthProvider({ children }: { children: React.ReactNode }) {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAffiliate = async (): Promise<Affiliate | null> => {
    const t = getStoredAffiliateToken();
    if (!t) {
      setAffiliate(null);
      setToken(null);
      setLoading(false);
      return null;
    }

    try {
      const data = await affiliateApi<Affiliate>('/api/affiliate/me');
      setAffiliate(data);
      setToken(t);
      return data;
    } catch {
      // In development / demo mode, if mock token exists
      if (t === 'mock_affiliate_token') {
        const mockAff = mockAffiliateDb.getAffiliate();
        setAffiliate(mockAff);
        setToken(t);
        return mockAff;
      }
      clearStoredAffiliateToken();
      setAffiliate(null);
      setToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliate();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (FORCE_MOCK || !API_BASE) {
        // Mock fallback login
        const mockToken = 'mock_affiliate_token';
        setStoredAffiliateToken(mockToken);
        const aff = mockAffiliateDb.getAffiliate();
        setToken(mockToken);
        setAffiliate(aff);
        return {};
      }

      const res = await fetch(`${API_BASE}/api/affiliate/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Login failed. Please check your credentials.' };
      }

      setStoredAffiliateToken(data.token);
      setToken(data.token);
      setAffiliate(data.affiliate);
      return {};
    } catch {
      // Offline / development demo fallback
      const mockToken = 'mock_affiliate_token';
      setStoredAffiliateToken(mockToken);
      const aff = mockAffiliateDb.getAffiliate();
      setToken(mockToken);
      setAffiliate(aff);
      return {};
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
  }): Promise<{ error?: string; requiresEmailVerification?: boolean; email?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      if (FORCE_MOCK || !API_BASE) {
        return {
          requiresEmailVerification: true,
          email: cleanEmail,
        };
      }

      const res = await fetch(`${API_BASE}/api/affiliate/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: cleanEmail,
          password: data.password,
          acceptedTerms: data.acceptedTerms,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { error: resData.error || 'Failed to create affiliate account.' };
      }

      return {
        requiresEmailVerification: true,
        email: cleanEmail,
      };
    } catch {
      // Development mock
      return {
        requiresEmailVerification: true,
        email: cleanEmail,
      };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<{ error?: string }> => {
    try {
      if (FORCE_MOCK || !API_BASE) {
        const mockToken = 'mock_affiliate_token';
        setStoredAffiliateToken(mockToken);
        const aff = mockAffiliateDb.getAffiliate();
        setToken(mockToken);
        setAffiliate(aff);
        return {};
      }

      const res = await fetch(`${API_BASE}/api/affiliate/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Invalid or expired verification code.' };
      }

      setStoredAffiliateToken(data.token);
      setToken(data.token);
      setAffiliate(data.affiliate);
      return {};
    } catch {
      const mockToken = 'mock_affiliate_token';
      setStoredAffiliateToken(mockToken);
      const aff = mockAffiliateDb.getAffiliate();
      setToken(mockToken);
      setAffiliate(aff);
      return {};
    }
  };

  const resendVerification = async (email: string): Promise<{ error?: string }> => {
    try {
      if (FORCE_MOCK || !API_BASE) return {};
      const res = await fetch(`${API_BASE}/api/affiliate/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Could not resend code.' };
      return {};
    } catch {
      return {};
    }
  };

  const logout = () => {
    clearStoredAffiliateToken();
    setAffiliate(null);
    setToken(null);
  };

  const setAffiliateState = (updated: Affiliate) => {
    setAffiliate(updated);
    mockAffiliateDb.updateAffiliate(updated);
  };

  const updateAffiliateProfile = async (patch: Partial<Affiliate>): Promise<Affiliate> => {
    const updated = mockAffiliateDb.updateAffiliate(patch);
    setAffiliate(updated);
    return updated;
  };

  return (
    <AffiliateAuthContext.Provider
      value={{
        affiliate,
        token,
        loading,
        login,
        signup,
        verifyEmail,
        resendVerification,
        logout,
        fetchAffiliate,
        setAffiliateState,
        updateAffiliateProfile,
      }}
    >
      {children}
    </AffiliateAuthContext.Provider>
  );
}

export function useAffiliateAuth() {
  const ctx = useContext(AffiliateAuthContext);
  if (!ctx) {
    throw new Error('useAffiliateAuth must be used within an AffiliateAuthProvider');
  }
  return ctx;
}
