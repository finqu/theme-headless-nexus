/**
 * Navigation Queries
 *
 * Queries for menus and navigation structures.
 * These are cached as static content since they rarely change.
 */

import type { Menu } from '@finqu/storefront-types';

/**
 * Query for a single menu by handle with nested links (3 levels deep)
 */
export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      handle
      title
      levels
      links {
        title
        url
        type
        target
        links {
          title
          url
          type
          target
          links {
            title
            url
            type
            target
          }
        }
      }
    }
  }
`;

export interface MenuQueryVariables {
    handle: string;
}

export interface MenuQueryResponse {
    menu: Menu | null;
}

/**
 * Query for multiple menus at once
 * Useful for fetching header and footer menus in a single request
 */
export const MENUS_QUERY = /* GraphQL */ `
  query Menus($handles: [String!]!) {
    menus(handles: $handles) {
      handle
      title
      levels
      links {
        title
        url
        type
        target
        links {
          title
          url
          type
          target
          links {
            title
            url
            type
            target
          }
        }
      }
    }
  }
`;

export interface MenusQueryVariables {
    handles: string[];
}

export interface MenusQueryResponse {
    menus: Menu[];
}
