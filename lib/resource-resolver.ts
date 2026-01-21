import { unstable_cache } from 'next/cache';
import type { Resource, ResourceType } from '@finqu/storefront-lib';
import { createServerClientWithLocale } from './storefront';

// Re-export types for convenience
export type { Resource, ResourceType };

/**
 * GraphQL query to resolve a URL path to a resource type and ID.
 * This is the foundation of Finqu's dynamic URL routing system.
 */
const RESOURCE_BY_PATH_QUERY = `
  query ResourceByPath($path: String!) {
    resourceByPath(path: $path) {
      type
      id
    }
  }
`;

/**
 * Response type for the resourceByPath query
 */
interface ResourceByPathResponse {
  resourceByPath: Resource | null;
}

/**
 * Fetch resource information for a given path.
 * This is the uncached version - use getResourceByPath for cached results.
 *
 * @param path - URL path without locale prefix (e.g., "/products/my-product")
 * @param locale - ISO language code for localized path resolution
 * @returns Resource with type and optional ID, or null if not found
 */
async function fetchResourceByPath(
  path: string,
  locale: string
): Promise<Resource | null> {
  const client = createServerClientWithLocale(locale);

  try {
    const response = await client.execute<ResourceByPathResponse>(
      RESOURCE_BY_PATH_QUERY,
      { path }
    );

    return response.resourceByPath;
  } catch (error) {
    console.error(`Failed to resolve resource for path "${path}":`, error);
    return null;
  }
}

/**
 * Get resource information for a URL path with aggressive caching.
 *
 * This is the primary function for URL routing. It resolves any URL path
 * to a resource type (product, category, page, etc.) and optional ID.
 *
 * Caching strategy:
 * - Results are cached for 1 hour (3600 seconds)
 * - Cache is keyed by path + locale combination
 * - Can be invalidated via 'resource-paths' tag
 *
 * @param path - URL path without locale prefix (e.g., "/products/my-product")
 * @param locale - ISO language code for localized path resolution
 * @returns Resource with type and optional ID, or null if resolution fails
 *
 * @example
 * ```tsx
 * const resource = await getResourceByPath('/tuotteet/sininen-paita', 'fi');
 * // resource = { type: 'PRODUCT', id: '123' }
 *
 * const category = await getResourceByPath('/categories/clothing', 'en');
 * // category = { type: 'PRODUCT_GROUP', id: '456' }
 *
 * const cart = await getResourceByPath('/cart', 'en');
 * // cart = { type: 'CART', id: null }
 * ```
 */
export const getResourceByPath = unstable_cache(
  async (path: string, locale: string): Promise<Resource | null> => {
    return fetchResourceByPath(path, locale);
  },
  ['resource-by-path'],
  {
    revalidate: 3600, // 1 hour - URL paths rarely change
    tags: ['resource-paths'],
  }
);

/**
 * Resource types that represent content with customizable templates.
 * These types have associated IDs and can use Puck editor templates.
 */
export const TEMPLATABLE_RESOURCE_TYPES: ResourceType[] = [
  'PRODUCT',
  'PRODUCT_GROUP',
  'PAGE',
  'ARTICLE',
  'MANUFACTURER',
];

/**
 * Resource types that represent system pages without specific IDs.
 * These are handled by dedicated components rather than templates.
 */
export const SYSTEM_RESOURCE_TYPES: ResourceType[] = [
  'HOME',
  'LOGIN',
  'LOGOUT',
  'REGISTER',
  'ACCOUNT',
  'ACCOUNT_EDIT',
  'ACCOUNT_ORDERS',
  'ACCOUNT_WISHLIST',
  'CHANGE_PASSWORD',
  'RECOVER_PASSWORD',
  'RESET_PASSWORD',
  'CART',
  'CHECKOUT',
  'SEARCH',
  'BLOG',
  'PRODUCTS',
  'PRIVACY_POLICY',
  'SHIPPING_POLICY',
  'REFUND_POLICY',
  'TERMS_AND_CONDITIONS',
];

/**
 * Check if a resource type uses Puck templates
 */
export function isTemplatableResource(type: ResourceType): boolean {
  return TEMPLATABLE_RESOURCE_TYPES.includes(type);
}

/**
 * Check if a resource type is a system page
 */
export function isSystemResource(type: ResourceType): boolean {
  return SYSTEM_RESOURCE_TYPES.includes(type);
}
