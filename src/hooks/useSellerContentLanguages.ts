import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSellerContentLanguages, hasMultilingualContent } from '../lib/shopLocaleConfig';

export function useSellerContentLanguages() {
  const { user } = useAuth();
  return useMemo(
    () =>
      getSellerContentLanguages({
        shopLangEsEnabled: user?.shopLangEsEnabled,
        shopLangArEnabled: user?.shopLangArEnabled,
      }),
    [user?.shopLangEsEnabled, user?.shopLangArEnabled],
  );
}

export function useSellerMultilingualEnabled() {
  const { user } = useAuth();
  return useMemo(
    () =>
      hasMultilingualContent({
        shopLangEsEnabled: user?.shopLangEsEnabled,
        shopLangArEnabled: user?.shopLangArEnabled,
      }),
    [user?.shopLangEsEnabled, user?.shopLangArEnabled],
  );
}
