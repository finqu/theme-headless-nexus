import { storefrontClient, cachePresets, withLocale } from './storefront';
import {
  MENU_QUERY,
  type MenuQueryResponse,
} from './queries';
import type { Menu, Link } from '@finqu/storefront-types';

// Re-export types for convenience
export type { Menu, Link };

// Backwards compatibility alias
export type MenuLink = Link;

/**
 * Menu with full link structure (alias for backwards compatibility)
 */
export type MenuWithLinks = Menu;

/**
 * Fetch a menu with its full link structure
 *
 * @param handle - Menu handle to fetch
 * @param locale - Locale for localized menu content
 */
export async function fetchMenuWithLinks(
  handle: string,
  locale: string
): Promise<Menu | null> {
  try {
    const result = await storefrontClient.query<MenuQueryResponse>(
      MENU_QUERY,
      { handle },
      withLocale(locale, cachePresets.static)
    );
    return result.menu;
  } catch (error) {
    console.error(`Failed to fetch menu "${handle}":`, error);
    return null;
  }
}
