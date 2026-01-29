import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getStoreInfo } from '@/lib/store-cache';

/**
 * Paths that should skip locale detection and handling.
 * These paths work independently of the locale system.
 */
const SKIP_PATHS = ['/api/', '/editor', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml'];

/**
 * Verify a Finqu editor JWT token
 * @returns true if valid, false otherwise
 */
async function verifyEditorToken(token: string): Promise<boolean> {
  const secretKey = process.env.FINQU_HEADLESS_SECRET_KEY;

  if (!secretKey) {
    console.error('FINQU_HEADLESS_SECRET_KEY is not configured');
    return false;
  }

  try {
    const secret = new TextEncoder().encode(secretKey);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Proxy for locale detection from URL path.
 *
 * This proxy:
 * 1. Detects the locale from the first path segment (e.g., /en/products -> 'en')
 * 2. Strips the locale prefix from the URL (rewrites /en/products -> /products)
 * 3. Sets x-locale and x-pathname headers on the REQUEST for downstream server components
 * 4. Validates finqu_editor_token for editor routes and returns 403 if invalid
 *
 * IMPORTANT: Headers must be set on the REQUEST (not response) for server components
 * to access them via the headers() function.
 *
 * URL is the single source of truth. No redirects.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle editor routes - validate finqu_editor_token
  if (pathname.startsWith('/editor')) {
    const finquToken = searchParams.get('finqu_editor_token');

    // Token is required for all editor access
    if (!finquToken) {
      return new NextResponse(null, { status: 403 });
    }

    // Verify the token
    const isValid = await verifyEditorToken(finquToken);
    if (!isValid) {
      return new NextResponse(null, { status: 403 });
    }

    return NextResponse.next();
  }

  // Skip locale handling for other special paths
  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Get cached store info (uses @finqu/storefront-lib directly)
  const storeInfo = await getStoreInfo();

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Check if URL has a locale prefix (any supported locale)
  const matchedLocale = storeInfo.locales.find(
    (l) => l.isoCode?.toLowerCase() === firstSegment
  );

  // Clone request headers to add our custom headers
  const requestHeaders = new Headers(request.headers);

  if (matchedLocale) {
    // URL has locale prefix - set headers and strip locale from path
    requestHeaders.set('x-locale', matchedLocale.isoCode!);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // No locale prefix - use default locale
  requestHeaders.set('x-locale', storeInfo.defaultLocale!);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
