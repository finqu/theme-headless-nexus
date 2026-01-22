/**
 * Storefront Client Configuration
 *
 * This module provides the singleton server-side Finqu client for data fetching.
 * Uses @finqu/storefront-sdk for GraphQL operations with built-in caching.
 *
 * Environment variables:
 * - FINQU_SECRET_KEY: Server-side API key (required)
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { storefrontClient, cachePresets } from '@/lib/storefront';
 * import { getProduct } from '@finqu/storefront-sdk/server';
 *
 * export default async function ProductPage({ params }) {
 *   const { product } = await getProduct(storefrontClient, { handle: params.slug });
 *   return <div>{product?.title}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom query
 * import { storefrontClient, cachePresets } from '@/lib/storefront';
 * import { STORE_QUERY, type StoreQueryResponse } from '@/lib/queries';
 *
 * const data = await storefrontClient.query<StoreQueryResponse>(
 *   STORE_QUERY,
 *   undefined,
 *   cachePresets.static
 * );
 * ```
 */

import {
  createFinquServerClient,
  cachePresets as sdkCachePresets,
  type FinquServerClient,
  type ServerFetchOptions,
} from '@finqu/storefront-sdk/server';

/**
 * Server-side Storefront client singleton
 *
 * Use this in Server Components and API routes for data fetching.
 * Features:
 * - Automatic request deduplication via React cache
 * - Next.js ISR cache integration
 * - Type-safe GraphQL operations
 */
export const storefrontClient: FinquServerClient = createFinquServerClient({
  endpoint: process.env.FINQU_STOREFRONT_URL!,
  secretKey: process.env.FINQU_SECRET_KEY!,
});

/**
 * Re-export cache presets from SDK for convenience
 *
 * Usage:
 * - cachePresets.static: Long-lived data (categories, menus) - 1 hour
 * - cachePresets.products: Product data - 1 minute
 * - cachePresets.dynamic: No cache (cart, auth)
 * - cachePresets.withTags(['tag']): ISR with on-demand revalidation
 */
export const cachePresets = sdkCachePresets;

/**
 * Re-export types for convenience
 */
export type { FinquServerClient, ServerFetchOptions };

/**
 * Create a locale-aware query wrapper
 *
 * This utility helps with locale-specific caching by including
 * the locale in the cache tags.
 *
 * @param locale - ISO language code
 * @returns Cache options with locale-specific tags
 */
export function withLocale(
  locale: string,
  baseOptions: ServerFetchOptions = cachePresets.static
): ServerFetchOptions {
  const tags = [`locale:${locale}`];
  if (baseOptions.next?.tags) {
    tags.push(...baseOptions.next.tags);
  }

  return {
    ...baseOptions,
    next: {
      ...baseOptions.next,
      tags,
    },
  };
}
