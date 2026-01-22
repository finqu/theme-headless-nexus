import { storefrontClient, withLocale, cachePresets } from './storefront';
import { GET_NAVIGATION_MENU } from '@finqu/storefront-sdk/graphql';
import type { Menu } from '@finqu/storefront-types';

interface MenuQueryResponse {
  menu: Menu | null;
}

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
      GET_NAVIGATION_MENU,
      { handle },
      withLocale(locale, cachePresets.static)
    );
    return result.menu;
  } catch (error) {
    console.error(`Failed to fetch menu "${handle}":`, error);
    return null;
  }
}
