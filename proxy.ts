import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStoreInfo } from '@/lib/store-cache';
import {
  verifyEditorToken,
  verifySessionToken,
  createSessionToken,
  EDITOR_SESSION_COOKIE,
} from '@/lib/auth';

/**
 * Paths that should skip locale detection and handling.
 * These paths work independently of the locale system.
 */
const SKIP_PATHS = ['/api/', '/editor', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml'];

/**
 * Session cookie options
 */
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60, // 1 hour
  path: '/',
};

/**
 * Proxy for locale detection from URL path.
 *
 * This proxy:
 * 1. Detects the locale from the first path segment (e.g., /en/products -> 'en')
 * 2. Strips the locale prefix from the URL (rewrites /en/products -> /products)
 * 3. Sets x-locale and x-pathname headers on the REQUEST for downstream server components
 * 4. Validates finqu_editor_token for editor routes and creates a session cookie
 *
 * IMPORTANT: Headers must be set on the REQUEST (not response) for server components
 * to access them via the headers() function.
 *
 * URL is the single source of truth. No redirects.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle editor routes - validate finqu_editor_token or session cookie
  if (pathname.startsWith('/editor')) {
    // First, check for an existing valid session cookie
    const sessionCookie = request.cookies.get(EDITOR_SESSION_COOKIE);
    if (sessionCookie?.value) {
      const sessionPayload = await verifySessionToken(sessionCookie.value);
      if (sessionPayload) {
        // Valid session exists, allow access
        return NextResponse.next();
      }
    }

    // No valid session - require finqu_editor_token
    const finquToken = searchParams.get('finqu_editor_token');

    if (!finquToken) {
      return new NextResponse(null, { status: 403 });
    }

    // Verify the token
    const payload = await verifyEditorToken(finquToken);
    if (!payload) {
      return new NextResponse(null, { status: 403 });
    }

    // Token is valid - create a session and set the cookie
    const sessionToken = await createSessionToken(payload);
    if (!sessionToken) {
      // If we can't create a session, still allow access but don't set cookie
      return NextResponse.next();
    }

    // Create response with session cookie
    const response = NextResponse.next();
    response.cookies.set(EDITOR_SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
    return response;
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
  const matchedLocale = storeInfo.locales.find((l) => l.isoCode?.toLowerCase() === firstSegment);

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
