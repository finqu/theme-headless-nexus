import { headers } from 'next/headers';
import { getStoreInfo } from './store-cache';

/**
 * Locale information from middleware headers.
 * This is the SINGLE SOURCE OF TRUTH for locale in server components.
 */
export interface LocaleInfo {
  /** Current locale code (e.g., 'fi', 'en', 'sv') */
  locale: string;
  /** Default locale code (first available from store) */
  defaultLocale: string;
  /** Original pathname from the URL (before rewrite) */
  pathname: string;
}

/**
 * Get locale information from middleware headers.
 *
 * This is the SINGLE SOURCE OF TRUTH for locale in server components.
 * The middleware sets x-locale, x-default-locale, and x-pathname headers
 * on the REQUEST based on URL detection.
 *
 * @returns LocaleInfo object with locale, defaultLocale, and pathname
 *
 * @example
 * ```tsx
 * // In a server component or page
 * const { locale, defaultLocale, pathname } = await getLocaleInfo();
 * const products = await fetchProducts(locale);
 * ```
 */
export async function getLocaleInfo(): Promise<LocaleInfo> {
  const headersList = await headers();
  const locale = headersList.get('x-locale');
  const defaultLocale = headersList.get('x-default-locale');
  const pathname = headersList.get('x-pathname') || '/';

  if (locale && defaultLocale) {
    return { locale, defaultLocale, pathname };
  }

  // Fallback to store info if headers not set (edge case)
  const storeInfo = await getStoreInfo();
  return {
    locale: locale || storeInfo.defaultLocale,
    defaultLocale: defaultLocale || storeInfo.defaultLocale,
    pathname,
  };
}

/**
 * Get the current locale from middleware headers.
 *
 * This is the SINGLE SOURCE OF TRUTH for locale in server components.
 * The middleware sets x-locale header based on URL detection.
 *
 * @returns The current locale code (e.g., 'fi', 'en', 'sv')
 *
 * @example
 * ```tsx
 * // In a server component or page
 * const locale = await getLocale();
 * const products = await fetchProducts(locale);
 * ```
 */
export async function getLocale(): Promise<string> {
  const { locale } = await getLocaleInfo();
  return locale;
}

/**
 * Get the default locale from middleware headers.
 *
 * @returns The store's default locale code
 *
 * @example
 * ```ts
 * const defaultLocale = await getDefaultLocale();
 * // 'fi'
 * ```
 */
export async function getDefaultLocale(): Promise<string> {
  const { defaultLocale } = await getLocaleInfo();
  return defaultLocale;
}

/**
 * Get the original pathname from the request.
 *
 * The middleware sets x-pathname header with the original URL path
 * before any rewrites. This is needed for APIs that expect the full
 * path including locale prefix.
 *
 * @returns The original pathname (e.g., '/fi/blogi' or '/blog')
 *
 * @example
 * ```tsx
 * const pathname = await getPathname();
 * const resource = await getResourceByPath(pathname, locale);
 * ```
 */
export async function getPathname(): Promise<string> {
  const { pathname } = await getLocaleInfo();
  return pathname;
}
