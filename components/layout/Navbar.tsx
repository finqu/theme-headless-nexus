import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontClient, cachePresets, withLocale } from '@/lib/storefront';
import {
  STORE_QUERY,
  CURRENCIES_QUERY,
  STORE_ROUTES_QUERY,
  type StoreQueryResponse,
  type CurrenciesQueryResponse,
  type StoreRoutesQueryResponse,
} from '@/lib/queries';
import { NavbarClient } from './navbar-client';

interface NavbarProps {
  menuHandle: string;
  locale: string;
}

/**
 * Server component that fetches menu data, store info, and currencies
 */
export async function Navbar({ menuHandle, locale }: NavbarProps) {
  const cacheOptions = withLocale(locale, cachePresets.static);

  // Fetch menu, store info, routes, and currencies in parallel
  const [menu, storeData, routesData, currencyData] = await Promise.all([
    fetchMenuWithLinks(menuHandle, locale),
    storefrontClient
      .query<StoreQueryResponse>(STORE_QUERY, undefined, cacheOptions)
      .catch(() => ({ store: null })),
    storefrontClient
      .query<StoreRoutesQueryResponse>(STORE_ROUTES_QUERY, undefined, cacheOptions)
      .catch(() => ({ storeRoutes: null })),
    storefrontClient
      .query<CurrenciesQueryResponse>(CURRENCIES_QUERY, undefined, cacheOptions)
      .catch(() => ({ currencies: [] })),
  ]);

  return (
    <NavbarClient
      menu={menu}
      storeInfo={storeData.store}
      routes={routesData.storeRoutes}
      currencies={currencyData.currencies}
    />
  );
}
