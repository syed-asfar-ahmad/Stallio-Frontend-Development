import React, { createContext, useContext, useMemo } from 'react';
import type { ThemeId, ThemeTokens, ThemeLayoutSettings, ShopThemeConfig } from './types';
import { resolveShopTheme, type ResolvedTheme } from './resolver';
import { useTheme } from '../context/ThemeContext';

interface StorefrontThemeContextValue {
  themeId: ThemeId;
  tokens: ThemeTokens;
  layout: ThemeLayoutSettings;
  resolvedTheme: ResolvedTheme;
}

const StorefrontThemeContext = createContext<StorefrontThemeContextValue | null>(null);

export interface StorefrontThemeProviderProps {
  config?: ShopThemeConfig | null;
  colorMode?: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const StorefrontThemeProvider: React.FC<StorefrontThemeProviderProps> = ({
  config,
  colorMode,
  children,
  className = '',
  as: Component = 'div',
}) => {
  let appThemeMode: 'light' | 'dark' = 'light';
  try {
    const themeCtx = useTheme();
    if (themeCtx?.resolved) {
      appThemeMode = themeCtx.resolved;
    }
  } catch {}

  const activeMode = colorMode || appThemeMode;

  const resolved = useMemo(() => {
    return resolveShopTheme(config, activeMode);
  }, [config, activeMode]);


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
        className={`storefront-theme-root theme-${resolved.themeId} theme-mode-${resolved.mode} ${className}`}
        style={{
          ...resolved.cssVariables,
          colorScheme: resolved.mode,
        } as React.CSSProperties}
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
