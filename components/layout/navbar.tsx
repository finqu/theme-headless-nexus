import type { Menu } from '@finqu/storefront-types';
import type { StoreData } from '@/lib/context-providers/store-context';
import { NavbarClient } from './navbar-client';

interface NavbarProps {
  menu: Menu | null;
  storeData: StoreData;
}

/**
 * Server component wrapper for navbar.
 * Store data and menu are passed from SiteLayout (server-rendered for SEO).
 */
export function Navbar({ menu, storeData }: NavbarProps) {
  return <NavbarClient menu={menu} storeData={storeData} />;
}
