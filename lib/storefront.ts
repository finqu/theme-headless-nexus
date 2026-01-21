import { createServerClient } from '@finqu/storefront-lib/server';
import { createStorefrontClient } from '@finqu/storefront-lib';

/**
 * Server-side Storefront client
 * Use this in Server Components and API routes for data fetching
 *
 * Features:
 * - Automatic request deduplication
 * - Next.js cache integration
 * - Type-safe GraphQL operations
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { storefrontServer } from '@/lib/storefront';
 * import { productByHandle } from '@finqu/storefront-lib/server';
 *
 * export default async function ProductPage({ params }) {
 *   const product = await productByHandle(storefrontServer, { handle: params.slug });
 *   return <div>{product?.title}</div>;
 * }
 * ```
 */
export const storefrontServer = createServerClient({
  baseUrl: process.env.FINQU_STOREFRONT_URL!,
  token: process.env.FINQU_STOREFRONT_TOKEN,
  next: {
    revalidate: 60, // Cache for 60 seconds by default
  },
});

/**
 * Create a locale-aware server-side Storefront client
 * Use this when you need to fetch data for a specific locale
 *
 * @param language - ISO 639-1 language code (e.g., 'fi', 'en', 'sv')
 * @returns A StorefrontClient configured with the specified locale
 *
 * @example
 * ```tsx
 * const client = createServerClientWithLocale('fi');
 * const products = await products(client, { first: 10 });
 * // Products will be returned in Finnish
 * ```
 */
export function createServerClientWithLocale(language?: string) {
  return createServerClient({
    baseUrl: process.env.FINQU_STOREFRONT_URL!,
    token: process.env.FINQU_STOREFRONT_TOKEN,
    storeContext: language ? { language } : undefined,
    next: {
      revalidate: 60,
    },
  });
}

/**
 * Client-side Storefront client factory
 * Use this to create a client instance for the StorefrontProvider
 *
 * @example
 * ```tsx
 * // In providers.tsx
 * const client = createClientSideStorefront();
 * <StorefrontProvider client={client}>
 *   {children}
 * </StorefrontProvider>
 * ```
 */
export function createClientSideStorefront() {
  return createStorefrontClient({
    baseUrl: process.env.NEXT_PUBLIC_FINQU_STOREFRONT_URL!,
    token: process.env.NEXT_PUBLIC_FINQU_STOREFRONT_TOKEN,
  });
}
