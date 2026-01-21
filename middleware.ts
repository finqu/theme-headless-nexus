import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStoreInfo } from '@/lib/store-cache';

/**
 * Use Node.js runtime to access the cached GraphQL client directly.
 * This allows us to use @finqu/storefront-lib without creating a REST API.
 */
export const runtime = 'nodejs';

/**
 * Paths that should skip locale detection and handling.
 * These paths work independently of the locale system.
 */
const SKIP_PATHS = ['/api/', '/editor', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml'];

/**
 * Middleware for locale detection from URL path.
 *
 * This middleware:
 * 1. Detects the locale from the first path segment (e.g., /se/produkter -> 'se')
 * 2. Strips the locale prefix from the URL (rewrites /se/produkter -> /produkter)
 * 3. Sets x-locale and x-default-locale headers for downstream components
 *
 * Default locale has no prefix:
 * - /about -> default locale, path stays /about
 * - /se/about -> 'se' locale, path becomes /about
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip locale handling for certain paths
  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Get cached store info (uses @finqu/storefront-lib directly)
  const storeInfo = await getStoreInfo();

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Detect locale from path (non-default locales only have prefix)
  const matchedLocale = storeInfo.locales.find(
    (l) =>
      l.isoCode.toLowerCase() === firstSegment &&
      l.isoCode !== storeInfo.defaultLocale
  );

  const locale = matchedLocale?.isoCode || storeInfo.defaultLocale;
  const pathWithoutLocale = matchedLocale
    ? '/' + segments.slice(1).join('/') || '/'
    : pathname;

  // Rewrite URL to strip locale prefix, pass locale via headers
  const response = NextResponse.rewrite(new URL(pathWithoutLocale, request.url));
  response.headers.set('x-locale', locale);
  response.headers.set('x-default-locale', storeInfo.defaultLocale);

  return response;
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
