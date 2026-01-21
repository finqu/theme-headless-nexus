import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { createServerClientWithLocale } from '@/lib/storefront';
import { store, currencies, routes } from '@finqu/storefront-lib/server';
import { NavbarClient } from './navbar-client';

interface NavbarProps {
  menuHandle: string;
  locale: string;
}

/**
 * Server component that fetches menu data, store info, and currencies
 */
export async function Navbar({ menuHandle, locale }: NavbarProps) {
  const client = createServerClientWithLocale(locale);

  // Fetch menu, store info, and currencies in parallel
  const [menu, storeInfo, routesData, currencyList] = await Promise.all([
    fetchMenuWithLinks(menuHandle, locale),
    store(client, {}).catch(() => null),
    routes(client, {}).catch(() => null),
    currencies(client, {}).catch(() => null),
  ]);

  return (
    <NavbarClient
      menu={menu}
      storeInfo={storeInfo}
      routes={routesData}
      currencies={currencyList ? (Array.isArray(currencyList) ? currencyList : [currencyList]) : []}
    />
  );
}
