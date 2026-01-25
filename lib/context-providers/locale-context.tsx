'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Locale context value available to client components
 */
export interface LocaleContextValue {
  /** Current locale code (e.g., 'fi', 'en', 'sv') */
  locale: string;
  /** Default locale code (first available from store) */
  defaultLocale: string;
  /** Whether the current locale is the default (no URL prefix) */
  isDefault: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Provider for locale context.
 * Wraps components that need access to the current locale.
 *
 * @example
 * ```tsx
 * // In a layout or page
 * <LocaleProvider locale="fi" defaultLocale="fi">
 *   {children}
 * </LocaleProvider>
 * ```
 */
export function LocaleProvider({
  locale,
  defaultLocale,
  children,
}: {
  locale: string;
  defaultLocale: string;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider
      value={{
        locale,
        defaultLocale,
        isDefault: locale === defaultLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to access the current locale context.
 * Must be used within a LocaleProvider.
 *
 * @throws Error if used outside of LocaleProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { locale, isDefault } = useLocale();
 *   return <div>Current locale: {locale}</div>;
 * }
 * ```
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * Hook to access the current locale context, returning null if not available.
 * Use this when the component may be rendered outside of a LocaleProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const localeContext = useLocaleOptional();
 *   const locale = localeContext?.locale || 'en';
 *   return <div>Current locale: {locale}</div>;
 * }
 * ```
 */
export function useLocaleOptional(): LocaleContextValue | null {
  return useContext(LocaleContext);
}
