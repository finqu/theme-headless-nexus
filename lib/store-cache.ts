import { unstable_cache } from 'next/cache';
import { storefrontServer } from './storefront';
import { store, LOCALES_QUERY } from '@finqu/storefront-lib/server';

/**
 * Locale information from the store
 */
export interface Locale {
  isoCode: string;
  endonymName: string;
  name: string;
  primary: boolean;
  rootUrl: string;
}

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
      store(storefrontServer, {}).catch(() => null),
      storefrontServer
        .execute<{ locales: Locale[] }>(LOCALES_QUERY)
        .catch(() => ({ locales: [] })),
    ]);

    const locales = localesData?.locales || [];
    // First available locale is the default (not "primary")
    const defaultLocale = locales[0]?.isoCode || 'en';

    return {
      locales,
      defaultLocale,
      storeName: storeData?.name || 'Store',
      logoUrl: storeData?.logo || undefined,
    };
  },
  ['store-info'],
  { revalidate: 300, tags: ['store-info'] }
);

/**
 * Check if a code matches a known locale (case-insensitive)
 */
export function isKnownLocale(code: string, locales: Locale[]): boolean {
  return locales.some((l) => l.isoCode.toLowerCase() === code.toLowerCase());
}

/**
 * Find a locale by its ISO code (case-insensitive)
 */
export function findLocale(code: string, locales: Locale[]): Locale | undefined {
  return locales.find((l) => l.isoCode.toLowerCase() === code.toLowerCase());
}
