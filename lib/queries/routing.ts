/**
 * Routing Queries
 *
 * Queries for URL resolution and route mapping.
 * The resourceByPath query is the foundation of Finqu's dynamic URL routing.
 *
 * Types are imported from @finqu/storefront-types.
 */

import type {
  Resource,
  ResourceKind,
  Routes,
  ResourceByPathVariables,
} from '@finqu/storefront-types';

// Re-export types for convenience
export type { Resource, ResourceKind, ResourceByPathVariables };

/**
 * Query to resolve a URL path to a resource type, ID, and alternates.
 * This is the foundation of Finqu's dynamic URL routing system.
 */
export const RESOURCE_BY_PATH_QUERY = /* GraphQL */ `
  query ResourceByPath($path: String!) {
    resourceByPath(path: $path) {
      type
      id
      alternates {
        hreflang
        path
        url
      }
    }
  }
`;

export interface ResourceByPathResponse {
  resourceByPath: Resource | null;
}

/**
 * Query for store navigation URLs (cart, account, etc.)
 */
export const STORE_ROUTES_QUERY = /* GraphQL */ `
  query StoreRoutes {
    routes {
      rootUrl
      cartUrl
      catalogUrl
      accountUrl
      accountEditUrl
      accountLoginUrl
      accountLogoutUrl
      accountRegisterUrl
      accountPasswordRecoverUrl
      accountPasswordChangeUrl
      accountOrdersUrl
      accountWishlistUrl
      searchUrl
    }
  }
`;

export interface StoreRoutesQueryResponse {
  routes: Routes;
}
