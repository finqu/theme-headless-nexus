import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontServer } from '@/lib/storefront';
import { store, currencies } from '@finqu/storefront-lib/server';
import { NavbarClient } from './NavbarClient';

interface NavbarProps {
  menuHandle: string;
}

/**
 * Server component that fetches menu data, store info, and currencies
 */
export async function Navbar({ menuHandle }: NavbarProps) {
  // Fetch menu, store info, and currencies in parallel
  const [menu, storeInfo, currencyList] = await Promise.all([
    fetchMenuWithLinks(menuHandle),
    store(storefrontServer, {}).catch(() => null),
    currencies(storefrontServer, {}).catch(() => null),
  ]);

  return (
    <NavbarClient
      menu={menu}
      storeName={storeInfo?.name || undefined}
      logoUrl={storeInfo?.logo || undefined}
      currencies={currencyList ? (Array.isArray(currencyList) ? currencyList : [currencyList]) : []}
    />
  );
}
