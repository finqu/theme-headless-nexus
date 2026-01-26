'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu as MenuIcon, ChevronRight, ChevronLeft, User } from 'lucide-react';
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
    <div>
      {/* Announcement Bar */}
      <div className="flex h-10 items-center justify-center border-b text-sm sm:px-6 lg:px-8">
        Get free delivery on orders over $100
      </div>

      <header className="sticky top-10 bg-white">
        <nav aria-label="Top" className="x-4 border-b sm:px-6 lg:px-8">
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
                                <User className="h-5 w-5" />
                                Sign in
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link
                                href={routes?.accountRegisterUrl || '#'}
                                className="block px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                              >
                                Create account
                              </Link>
                            </SheetClose>
                          </div>
                        </>
                      )}

                      {currencies.length > 1 && selectedCurrency && (
                        <>
                          <Separator />
                          <div className="px-6 py-4">
                            <span className="text-sm text-gray-500">Currency</span>
                            <p className="mt-1 font-medium text-gray-900">
                              {selectedCurrency.name} ({selectedCurrency.isoCode})
                            </p>
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
              <NavigationMenu className="ml-8 hidden lg:flex">
                <NavigationMenuList>
                  {visibleLinks.map((link, index) => {
                    const hasChildren = link.links && link.links.length > 0;

                    if (hasChildren) {
                      return (
                        <NavigationMenuItem key={`nav-${index}`}>
                          <NavigationMenuTrigger>{link.title}</NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="grid w-[600px] gap-3 p-6 md:w-[800px] md:grid-cols-3">
                              {link.links?.map((section, sectionIndex) => (
                                <div key={`section-${index}-${sectionIndex}`}>
                                  {section.url ? (
                                    <Link
                                      href={section.url}
                                      target={section.target || undefined}
                                      className="mb-3 block text-sm font-semibold text-gray-900 hover:text-indigo-600"
                                    >
                                      {section.title}
                                    </Link>
                                  ) : (
                                    <p className="mb-3 text-sm font-semibold text-gray-900">
                                      {section.title}
                                    </p>
                                  )}
                                  {section.links && section.links.length > 0 && (
                                    <ul className="space-y-2">
                                      {section.links.map((item, itemIndex) => (
                                        <li key={`item-${index}-${sectionIndex}-${itemIndex}`}>
                                          <NavigationMenuLink asChild>
                                            <Link
                                              href={item.url || '#'}
                                              target={item.target || undefined}
                                              className="block text-sm text-gray-600 hover:text-gray-900"
                                            >
                                              {item.title}
                                            </Link>
                                          </NavigationMenuLink>
                                        </li>
                                      ))}
                                    </ul>
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
                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                          <Link href={link.url || '#'}>{link.title}</Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  })}

                  {/* Overflow "More" dropdown */}
                  {overflowLinks.length > 0 && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>More</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="w-48 p-2">
                          {overflowLinks.map((link, index) => (
                            <li key={`overflow-${index}`}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={link.url || '#'}
                                  target={link.target || undefined}
                                  className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                  {link.title}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Right side actions */}
              <div className="ml-auto flex items-center gap-2">
                {/* Account links - Desktop */}
                {store?.customerAccountsEnabled && (
                  <div className="hidden lg:flex lg:items-center lg:gap-4">
                    <Link
                      href={routes?.accountLoginUrl || '#'}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Sign in
                    </Link>
                    <span aria-hidden="true" className="h-5 w-px bg-gray-200" />
                    <Link
                      href={routes?.accountRegisterUrl || '#'}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Create account
                    </Link>
                    <span aria-hidden="true" className="h-5 w-px bg-gray-200" />
                  </div>
                )}

                {/* Currency selector - Desktop */}
                {currencies.length > 1 && selectedCurrency && (
                  <div className="hidden lg:block">
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      {selectedCurrency.isoCode}
                    </Button>
                  </div>
                )}

                {/* Search */}
                <SearchIcon />

                {/* Cart */}
                <CartIcon />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Cart Drawer - rendered once, controlled by cart context */}
      <CartDrawer cartUrl={routes?.cartUrl ?? undefined} />
    </div>
  );
}
