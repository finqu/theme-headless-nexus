import { getStoreInfo, isKnownLocale } from './store-cache';

/**
 * Result of locale resolution from URL
 */
export interface LocaleResolution {
  /** The resolved locale code (e.g., 'fi', 'en', 'sv') */
  locale: string;
  /** The store's default locale */
  defaultLocale: string;
  /** The URL path with locale prefix stripped (if any) */
  path: string;
  /** Whether the resolved locale is the default */
  isDefault: boolean;
}

/**
 * Resolve locale from URL path segments.
 *
 * This is the SINGLE SOURCE OF TRUTH for locale resolution in server components.
 * It determines the locale from the URL and returns the appropriate path.
 *
 * Rules:
 * - If first segment matches a known locale → use that locale, strip from path
 * - If no locale in URL → use store's default locale
 *
 * @param segments - URL path segments (e.g., ['fi', 'tuotteet', 'paita'] or ['products', 'shirt'])
 * @returns LocaleResolution with locale, path, and metadata
 *
 * @example
 * ```ts
 * // With locale prefix
 * await resolveLocale(['fi', 'tuotteet', 'paita']);
 * // { locale: 'fi', defaultLocale: 'fi', path: '/tuotteet/paita', isDefault: true }
 *
 * // Without locale prefix (uses default)
 * await resolveLocale(['products', 'shirt']);
 * // { locale: 'fi', defaultLocale: 'fi', path: '/products/shirt', isDefault: true }
 *
 * // Root path
 * await resolveLocale([]);
 * // { locale: 'fi', defaultLocale: 'fi', path: '/', isDefault: true }
 * ```
 */
export async function resolveLocale(segments: string[]): Promise<LocaleResolution> {
  const storeInfo = await getStoreInfo();
  const firstSegment = segments[0]?.toLowerCase();

  // Check if first segment is a known locale
  if (firstSegment && isKnownLocale(firstSegment, storeInfo.locales)) {
    const locale = firstSegment;
    const pathSegments = segments.slice(1);
    const path = pathSegments.length > 0 ? '/' + pathSegments.join('/') : '/';

    return {
      locale,
      defaultLocale: storeInfo.defaultLocale,
      path,
      isDefault: locale === storeInfo.defaultLocale,
    };
  }

  // No locale prefix - use default locale
  const path = segments.length > 0 ? '/' + segments.join('/') : '/';

  return {
    locale: storeInfo.defaultLocale,
    defaultLocale: storeInfo.defaultLocale,
    path,
    isDefault: true,
  };
}

/**
 * Get the default locale for the store.
 *
 * Use this when you need just the default locale without URL parsing.
 *
 * @example
 * ```ts
 * const locale = await getDefaultLocale();
 * // 'fi'
 * ```
 */
export async function getDefaultLocale(): Promise<string> {
  const storeInfo = await getStoreInfo();
  return storeInfo.defaultLocale;
}
