import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontServer } from '@/lib/storefront';
import { store } from '@finqu/storefront-lib/server';
import { NavbarClient } from './NavbarClient';

interface NavbarProps {
  menuHandle: string;
}

/**
 * Server component that fetches menu data and renders the navbar
 */
export async function Navbar({ menuHandle }: NavbarProps) {
  // Fetch menu and store info in parallel
  const [menu, storeInfo] = await Promise.all([
    fetchMenuWithLinks(menuHandle),
    store(storefrontServer, {}).catch(() => null),
  ]);

  return (
    <NavbarClient
      menu={menu}
      storeName={storeInfo?.name || undefined}
      logoUrl={storeInfo?.logo || undefined}
    />
  );
}
