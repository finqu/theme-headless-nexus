/**
 * Routing Queries
 *
 * Queries for URL resolution and route mapping.
 * The resourceByPath query is the foundation of Finqu's dynamic URL routing.
 */

import type { Alternate, ResourceType, Routes } from '@finqu/storefront-types';

/**
 * Resource information returned by path resolution
 */
export interface Resource {
    /** The type of resource (PRODUCT, PRODUCT_GROUP, PAGE, etc.) */
    type: ResourceType;
    /** The ID of the resource, if applicable */
    id: string | null;
    /** Alternate language versions of this resource */
    alternates?: Alternate[];
}

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

export interface ResourceByPathVariables {
    path: string;
}

export interface ResourceByPathResponse {
    resourceByPath: Resource | null;
}

/**
 * Query for store navigation URLs (cart, account, etc.)
 */
export const STORE_ROUTES_QUERY = /* GraphQL */ `
  query StoreRoutes {
    storeRoutes {
      rootUrl
      cartUrl
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
    storeRoutes: Routes | null;
}

/**
 * Query for all available routes in the store (sitemap)
 * Useful for sitemap generation or pre-rendering
 */
export const ROUTES_QUERY = /* GraphQL */ `
  query Routes($types: [String!]) {
    routes(types: $types) {
      path
      type
      id
      updatedAt
    }
  }
`;

export interface Route {
    path: string;
    type: ResourceType;
    id: string | null;
    updatedAt: string | null;
}

export interface RoutesQueryVariables {
    types?: string[];
}

export interface RoutesQueryResponse {
    routes: Route[];
}
