import React, { createContext, useContext, useMemo } from 'react';
import type { ThemeId, ThemeTokens, ThemeLayoutSettings, ShopThemeConfig } from './types';
import { resolveShopTheme, type ResolvedTheme } from './resolver';

interface StorefrontThemeContextValue {
  themeId: ThemeId;
  tokens: ThemeTokens;
  layout: ThemeLayoutSettings;
  resolvedTheme: ResolvedTheme;
}

const StorefrontThemeContext = createContext<StorefrontThemeContextValue | null>(null);

export interface StorefrontThemeProviderProps {
  themeId?: string | null;
  config?: ShopThemeConfig | null;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const StorefrontThemeProvider: React.FC<StorefrontThemeProviderProps> = ({
  themeId,
  config,
  children,
  className = '',
  as: Component = 'div',
}) => {
  const resolved = useMemo(() => {
    return resolveShopTheme(themeId, config);
  }, [themeId, config]);

  const contextValue = useMemo<StorefrontThemeContextValue>(() => {
    return {
      themeId: resolved.themeId,
      tokens: resolved.tokens,
      layout: resolved.layout,
      resolvedTheme: resolved,
    };
  }, [resolved]);

  return (
    <StorefrontThemeContext.Provider value={contextValue}>
      <Component
        className={`storefront-theme-root theme-${resolved.themeId} ${className}`}
        style={resolved.cssVariables as React.CSSProperties}
      >
        {children}
      </Component>
    </StorefrontThemeContext.Provider>
  );
};

export function useStorefrontTheme(): StorefrontThemeContextValue {
  const context = useContext(StorefrontThemeContext);
  if (!context) {
    throw new Error('useStorefrontTheme must be used within a StorefrontThemeProvider');
  }
  return context;
}
