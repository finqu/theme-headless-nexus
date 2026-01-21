import { getStoreInfo, type Locale } from './store-cache';

export type { Locale };

/**
 * Result of locale detection from URL path
 */
export interface LocaleDetectionResult {
  /** The detected locale code */
  locale: string;
  /** The path with locale prefix removed (if any) */
  pathWithoutLocale: string;
  /** Whether this is the default locale (no URL prefix) */
  isDefault: boolean;
}

/**
 * Detect locale from URL path segments.
 *
 * The first path segment is checked against known locales.
 * If it matches a non-default locale, that locale is used and the segment is stripped.
 * Otherwise, the default locale is used and the path remains unchanged.
 *
 * @example
 * ```tsx
 * // Store has locales: ['fi', 'en', 'sv'], default is 'fi'
 *
 * detectLocaleFromPath('/se/produkter')
 * // -> { locale: 'sv', pathWithoutLocale: '/produkter', isDefault: false }
 *
 * detectLocaleFromPath('/about')
 * // -> { locale: 'fi', pathWithoutLocale: '/about', isDefault: true }
 *
 * detectLocaleFromPath('/')
 * // -> { locale: 'fi', pathWithoutLocale: '/', isDefault: true }
 * ```
 */
export async function detectLocaleFromPath(
  pathname: string
): Promise<LocaleDetectionResult> {
  const storeInfo = await getStoreInfo();
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Check if first segment is a known locale (but not the default)
  const matchedLocale = storeInfo.locales.find(
    (l) =>
      l.isoCode.toLowerCase() === firstSegment &&
      l.isoCode !== storeInfo.defaultLocale
  );

  if (matchedLocale) {
    const pathWithoutLocale = '/' + segments.slice(1).join('/') || '/';
    return {
      locale: matchedLocale.isoCode,
      pathWithoutLocale,
      isDefault: false,
    };
  }

  return {
    locale: storeInfo.defaultLocale,
    pathWithoutLocale: pathname,
    isDefault: true,
  };
}

/**
 * Build a localized URL path.
 * Default locale has no prefix, others get /{locale}/path
 *
 * @example
 * ```tsx
 * // Store has default locale 'fi'
 *
 * buildLocalizedPath('/about', 'fi')
 * // -> '/about' (no prefix for default)
 *
 * buildLocalizedPath('/about', 'en')
 * // -> '/en/about'
 *
 * buildLocalizedPath('/', 'sv')
 * // -> '/sv'
 * ```
 */
export async function buildLocalizedPath(
  path: string,
  locale: string
): Promise<string> {
  const storeInfo = await getStoreInfo();

  // Default locale has no prefix
  if (locale === storeInfo.defaultLocale) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Synchronous version of buildLocalizedPath when you already have store info
 */
export function buildLocalizedPathSync(
  path: string,
  locale: string,
  defaultLocale: string
): string {
  if (locale === defaultLocale) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}
