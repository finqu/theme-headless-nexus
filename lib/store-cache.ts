import { unstable_cache } from 'next/cache';
import { storefrontClient, cachePresets } from './storefront';
import {
  STORE_QUERY,
  LOCALES_QUERY,
  type StoreQueryResponse,
  type LocalesQueryResponse,
} from './queries';
import type { Locale } from '@finqu/storefront-types';

// Re-export Locale type for convenience
export type { Locale };

/**
 * Store information including available locales
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
