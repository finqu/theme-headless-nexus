import { unstable_cache } from 'next/cache';
import { storefrontClient, cachePresets, withLocale } from './storefront';
import {
  STORE_QUERY,
  LOCALES_QUERY,
  CURRENCIES_QUERY,
  STORE_ROUTES_QUERY,
  type StoreQueryResponse,
  type LocalesQueryResponse,
  type CurrenciesQueryResponse,
  type StoreRoutesQueryResponse,
} from './queries';
import type { Locale, Routes } from '@finqu/storefront-types';
import type { StoreData, StoreBasicInfo } from './store-context';

// Re-export types for convenience
export type { Locale, StoreData, StoreBasicInfo };

/**
 * @deprecated Use StoreData instead
 */
export interface StoreInfo {
  locales: Locale[];
  /** First available locale - used as the default (no URL prefix) */
  defaultLocale: string;
  storeName: string;
  logoUrl?: string;
}

/**
 * Fetch store information including available locales.
 * Results are cached for 5 minutes (300 seconds) using Next.js unstable_cache.
 *
 * This is the SINGLE SOURCE OF TRUTH for store/locale information.
 * The first available locale is used as the default (NOT the "primary" flag).
 *
 * @example
 * ```tsx
 * const storeInfo = await getStoreInfo();
 * console.log(storeInfo.defaultLocale); // 'fi'
 * console.log(storeInfo.locales); // [{ isoCode: 'fi', ... }, { isoCode: 'en', ... }]
 * ```
 */
export const getStoreInfo = unstable_cache(
  async (): Promise<StoreInfo> => {
    const [storeData, localesData] = await Promise.all([
      storefrontClient
        .query<StoreQueryResponse>(STORE_QUERY, undefined, cachePresets.static)
        .catch(() => ({ store: null })),
      storefrontClient
        .query<LocalesQueryResponse>(LOCALES_QUERY, undefined, cachePresets.static)
        .catch(() => ({ locales: [] })),
    ]);

    const locales = localesData?.locales || [];
    // First available locale is the default (not "primary")
    const defaultLocale = locales[0]?.isoCode || 'en';

    return {
      locales,
      defaultLocale,
      storeName: storeData?.store?.name || 'Store',
      logoUrl: storeData?.store?.logo || undefined,
    };
  },
  ['store-info'],
  { revalidate: 300, tags: ['store-info'] }
);

/**
 * Fetch complete store data for the StoreProvider.
 * Loads store info, locales, currencies, and routes in parallel.
 * Results are cached for 5 minutes (300 seconds).
 *
 * Use this in SiteLayout to load all store data once.
 *
 * @param locale - Current locale for locale-specific caching
 *
 * @example
 * ```tsx
 * // In SiteLayout
 * const storeData = await getStoreData(locale);
 * return (
 *   <StoreProvider value={storeData}>
 *     {children}
 *   </StoreProvider>
 * );
 * ```
 */
export async function getStoreData(locale: string): Promise<StoreData> {
  const cacheOptions = withLocale(locale, cachePresets.static);

  const [storeData, localesData, currencyData, routesData] = await Promise.all([
    storefrontClient
      .query<StoreQueryResponse>(STORE_QUERY, undefined, cacheOptions)
      .catch(() => ({ store: null })),
    storefrontClient
      .query<LocalesQueryResponse>(LOCALES_QUERY, undefined, cacheOptions)
      .catch(() => ({ locales: [] })),
    storefrontClient
      .query<CurrenciesQueryResponse>(CURRENCIES_QUERY, undefined, cacheOptions)
      .catch(() => ({ currencies: [] })),
    storefrontClient
      .query<StoreRoutesQueryResponse>(STORE_ROUTES_QUERY, undefined, cacheOptions)
      .catch(() => ({ routes: null as Routes | null })),
  ]);

  const locales = localesData?.locales || [];
  const defaultLocale = locales[0]?.isoCode || 'en';

  return {
    store: storeData.store,
    locales,
    defaultLocale,
    currencies: currencyData.currencies || [],
    routes: routesData.routes,
  };
}
