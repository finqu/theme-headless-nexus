import { cache } from 'react';
import type { Alternate } from '@finqu/storefront-types';
import { storefrontClient, cachePresets, withLocale } from './storefront';
import {
  RESOURCE_BY_PATH_QUERY,
  type ResourceByPathResponse,
  type Resource,
  type ResourceKind,
} from './queries';

// Re-export types for convenience
export type { Resource, ResourceKind };

/**
 * Extended resource with alternates for locale switching.
 * This extends the base Resource type to ensure alternates is never null.
 */
export interface ResourceWithAlternates {
  type: Resource['type'];
  id?: string | null;
  alternates?: Alternate[];
}

/**
 * Fetch resource information for a given path.
 * This is the uncached version - use getResourceByPath for cached results.
 *
 * @param path - URL path without locale prefix (e.g., "/products/my-product")
 * @param locale - ISO language code for localized path resolution
 * @returns Resource with type, optional ID, and alternates, or null if not found
 */
async function fetchResourceByPath(
  path: string,
  locale: string
): Promise<ResourceWithAlternates | null> {
  try {
    const response = await storefrontClient.query<ResourceByPathResponse>(
      RESOURCE_BY_PATH_QUERY,
      { path },
      withLocale(locale, cachePresets.static)
    );

    const resource = response.resourceByPath;
    if (!resource) return null;

    // Normalize alternates: convert null to undefined for cleaner API
    return {
      type: resource.type,
      id: resource.id,
      alternates: resource.alternates ?? undefined,
    };
  } catch (error) {
    console.error(`Failed to resolve resource for path "${path}":`, error);
    return null;
  }
}

/**
 * Get resource information for a URL path with request-level caching.
 *
 * This is the primary function for URL routing. It resolves any URL path
 * to a resource type (product, category, page, etc.), optional ID, and alternates.
 *
 * Caching strategy:
 * - Results are deduplicated per request using React.cache
 * - HTTP-level caching is handled by storefrontClient via cachePresets
 *
 * @param path - URL path without locale prefix (e.g., "/products/my-product")
 * @param locale - ISO language code for localized path resolution
 * @returns Resource with type, optional ID, and alternates, or null if resolution fails
 *
 * @example
 * ```tsx
 * const resource = await getResourceByPath('/tuotteet/sininen-paita', 'fi');
 * // resource = { type: 'PRODUCT', id: '123', alternates: [...] }
 *
 * const category = await getResourceByPath('/categories/clothing', 'en');
 * // category = { type: 'PRODUCT_GROUP', id: '456', alternates: [...] }
 *
 * const cart = await getResourceByPath('/cart', 'en');
 * // cart = { type: 'CART', id: null, alternates: [...] }
 * ```
 */
export const getResourceByPath = cache(
  async (path: string, locale: string): Promise<ResourceWithAlternates | null> => {
    return fetchResourceByPath(path, locale);
  }
);