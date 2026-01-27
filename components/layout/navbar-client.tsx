'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu as MenuIcon, ChevronRight, ChevronLeft, User, LogIn } from 'lucide-react';
import type { Menu, Currency, Link as MenuLink } from '@finqu/storefront-types';
import type { StoreData } from '@/lib/context-providers/store-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { SearchIcon } from '@/components/search';
import { CartIcon, CartDrawer } from '@/components/cart';
import { cn } from '@/lib/utils';

interface NavbarClientProps {
  menu: Menu | null;
  storeData: StoreData;
  isEditing?: boolean;
}

const MAX_VISIBLE_LINKS = 4;

export function NavbarClient({ menu, storeData, isEditing = false }: NavbarClientProps) {
  const { store, routes, currencies } = storeData;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileSubmenu, setMobileSubmenu] = React.useState<MenuLink | null>(null);
  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency | null>(
    currencies[0] || null
  );

  const allLinks = menu?.links || [];
  const storeName = store?.name || 'Store';
  const logoUrl = store?.logo;

  // Limit visible root-level links
  const visibleLinks = allLinks.slice(0, MAX_VISIBLE_LINKS);
  const overflowLinks = allLinks.slice(MAX_VISIBLE_LINKS);

  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  }, []);

  const openSubmenu = React.useCallback((link: MenuLink) => {
    setMobileSubmenu(link);
  }, []);

  const closeSubmenu = React.useCallback(() => {
    setMobileSubmenu(null);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="flex h-10 items-center justify-center border-b text-sm sm:px-4 lg:px-6">
        Get free delivery on orders over $100
      </div>

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
        <nav aria-label="Top" className="x-4 border-b sm:pl-4 lg:pl-6">
          <div className="">
            <div className="flex h-16 items-center">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm p-0">
                  <SheetHeader className="border-b p-4">
                    <SheetTitle>{storeName}</SheetTitle>
                  </SheetHeader>

                  {/* Mobile Menu Content */}
                  <div className="relative h-full overflow-hidden">
                    {/* Main Menu */}
                    <div
                      className={cn(
                        'absolute inset-0 overflow-y-auto transition-transform duration-300',
                        mobileSubmenu ? '-translate-x-full' : 'translate-x-0'
                      )}
                    >
                      <div className="py-4">
                        {allLinks.map((link, index) => {
                          const hasChildren = link.links && link.links.length > 0;

                          if (hasChildren) {
                            return (
                              <button
                                key={`mobile-link-${index}`}
                                onClick={() => openSubmenu(link)}
                                className="flex w-full items-center justify-between px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                              >
                                {link.title}
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </button>
                            );
                          }

                          return (
                            <SheetClose asChild key={`mobile-link-${index}`}>
                              <Link
                                href={link.url || '#'}
                                target={link.target || undefined}
                                className="block px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                              >
                                {link.title}
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>

                      {store?.customerAccountsEnabled && (
                        <>
                          <Separator />
                          <div className="py-4">
                            <SheetClose asChild>
                              <Link
                                href={routes?.accountLoginUrl || '#'}
                                className="flex items-center gap-3 px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                              >
                                <LogIn className="h-5 w-5" strokeWidth={1} />
                                Sign in
                              </Link>
                            </SheetClose>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Submenu Panel - slides in from right */}
                    <div
                      className={cn(
                        'absolute inset-0 overflow-y-auto bg-white transition-transform duration-300',
                        mobileSubmenu ? 'translate-x-0' : 'translate-x-full'
                      )}
                    >
                      {mobileSubmenu && (
                        <>
                          <button
                            onClick={closeSubmenu}
                            className="flex w-full items-center gap-2 border-b px-4 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            <ChevronLeft className="h-5 w-5" />
                            Back
                          </button>
                          <div className="p-4">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                              {mobileSubmenu.title}
                            </h3>
                            {mobileSubmenu.links?.map((section, sectionIndex) => (
                              <div key={`submenu-section-${sectionIndex}`} className="mb-6">
                                {section.url ? (
                                  <SheetClose asChild>
                                    <Link
                                      href={section.url}
                                      target={section.target || undefined}
                                      className="mb-2 block font-medium text-gray-900"
                                    >
                                      {section.title}
                                    </Link>
                                  </SheetClose>
                                ) : (
                                  <p className="mb-2 font-medium text-gray-900">{section.title}</p>
                                )}
                                {section.links && section.links.length > 0 && (
                                  <ul className="space-y-2">
                                    {section.links.map((item, itemIndex) => (
                                      <li key={`submenu-item-${sectionIndex}-${itemIndex}`}>
                                        <SheetClose asChild>
                                          <Link
                                            href={item.url || '#'}
                                            target={item.target || undefined}
                                            className="block py-1 text-gray-600 hover:text-gray-900"
                                          >
                                            {item.title}
                                          </Link>
                                        </SheetClose>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href={routes?.rootUrl || '/'}>
                  <span className="sr-only">{storeName}</span>
                  {logoUrl ? (
                    <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
                  ) : (
                    <span className="text-xl font-bold text-gray-900">{storeName}</span>
                  )}
                </Link>
              </div>

              {/* Desktop Navigation */}
              <NavigationMenu className="relative ml-8 hidden lg:flex">
                <NavigationMenuList>
                  {visibleLinks.map((link, index) => {
                    const hasChildren = link.links && link.links.length > 0;

                    if (hasChildren) {
                      return (
                        <NavigationMenuItem key={`nav-${index}`}>
                          <NavigationMenuTrigger className="font-heading bg-transparent font-normal text-gray-500 hover:bg-transparent data-[state=open]:bg-transparent">
                            {link.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="p-0">
                            <div className="w-[300px] p-0">
                              {link.links?.map((section, sectionIndex) => (
                                <div
                                  key={`section-${index}-${sectionIndex}`}
                                  className="font-heading border-b px-4 py-4 last:mb-0 last:border-b-0"
                                >
                                  {section.url ? (
                                    <Link
                                      href={section.url}
                                      target={section.target || undefined}
                                      className="block text-sm text-gray-500 hover:text-gray-900"
                                    >
                                      {section.title}
                                    </Link>
                                  ) : (
                                    <p className="text-sm text-gray-500">{section.title}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={`nav-${index}`}>
                        <NavigationMenuLink
                          asChild
                          className={cn(
                            navigationMenuTriggerStyle(),
                            'font-heading bg-transparent font-normal text-gray-500 hover:bg-transparent'
                          )}
                        >
                          <Link href={link.url || '#'}>{link.title}</Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Right side actions */}
              <div className="ml-auto flex h-full items-center">
                {/* Account link - Desktop */}
                {store?.customerAccountsEnabled && (
                  <div className="hidden h-full items-center border-l border-gray-200 lg:flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-full w-14 rounded-none text-gray-900 hover:bg-gray-50"
                    >
                      <Link href={routes?.accountLoginUrl || '#'} aria-label="Sign in">
                        <LogIn className="h-5 w-5" strokeWidth={1.5} />
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Search */}
                <div className="flex h-full items-center border-l border-gray-200">
                  <SearchIcon className="w-14 rounded-none text-gray-900 hover:bg-gray-50" />
                </div>

                {/* Cart */}
                <div className="flex h-full items-center border-l border-gray-200">
                  <CartIcon className="w-14 rounded-none text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Cart Drawer - rendered once, controlled by cart context */}
      <CartDrawer cartUrl={routes?.cartUrl ?? undefined} />
    </>
  );
}
