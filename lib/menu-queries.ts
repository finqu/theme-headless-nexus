import { menu } from '@finqu/storefront-lib/server';
import { storefrontServer } from './storefront';

/**
 * Menu link type with nested links support
 */
export interface MenuLink {
    title?: string | null;
    url?: string | null;
    type?: string | null;
    target?: string | null;
    links?: MenuLink[] | null;
}

/**
 * Menu with full link structure
 */
export interface MenuWithLinks {
    handle?: string | null;
    title?: string | null;
    levels?: number | null;
    links?: MenuLink[] | null;
}

/**
 * GraphQL query for menu with nested links (2 levels deep)
 */
export const MENU_WITH_LINKS_QUERY = `
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

/**
 * Fetch a menu with its full link structure
 * Cached for 5 minutes
 */
export async function fetchMenuWithLinks(
    handle: string
): Promise<MenuWithLinks | null> {
    try {
        const result = await menu(
            storefrontServer,
            { handle },
            {
                query: MENU_WITH_LINKS_QUERY,
            }
        );
        return result as MenuWithLinks;
    } catch (error) {
        console.error(`Failed to fetch menu "${handle}":`, error);
        return null;
    }
}
