'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale, Currency, Routes, StoreInfo as StoreInfoType } from '@finqu/storefront-types';

/**
 * Store basic info - subset of StoreInfo we fetch
 */
export type StoreBasicInfo = Pick<
  StoreInfoType,
  'name' | 'logo' | 'favicon' | 'customerAccountsEnabled'
>;

/**
 * Complete store data loaded once and available throughout the app
 */
export interface StoreData {
  /** Basic store information (name, logo, etc.) */
  store: StoreBasicInfo | null;
  /** Available locales */
  locales: Locale[];
  /** Default locale code (first available) */
  defaultLocale: string;
  /** Available currencies */
  currencies: Currency[];
  /** Store navigation routes (cart, account, etc.) */
  routes: Routes | null;
}

const StoreContext = createContext<StoreData | null>(null);

/**
 * Provider for store context.
 * Should wrap the entire app in SiteLayout.
 *
 * @example
 * ```tsx
 * // In SiteLayout (server component)
 * const storeData = await getStoreData(locale);
 * return (
 *   <StoreProvider value={storeData}>
 *     {children}
 *   </StoreProvider>
 * );
 * ```
 */
export function StoreProvider({ value, children }: { value: StoreData; children: ReactNode }) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/**
 * Hook to access store data.
 * Must be used within a StoreProvider.
 *
 * @throws Error if used outside of StoreProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { store, currencies, routes } = useStore();
 *   return <div>Store: {store?.name}</div>;
 * }
 * ```
 */
export function useStore(): StoreData {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

/**
 * Hook to access store data, returning null if not available.
 * Use this when the component may be rendered outside of a StoreProvider.
 */
export function useStoreOptional(): StoreData | null {
  return useContext(StoreContext);
}
