'use client';

import * as React from 'react';
import Link from 'next/link';
import type { MenuLink, MenuWithLinks } from '@/lib/menu-queries';
import {
  ElDialog,
  ElDialogBackdrop,
  ElDialogPanel,
  ElTabGroup,
  ElTabList,
  ElTabPanels,
  ElPopover,
  ElPopoverGroup,
} from '@tailwindplus/elements/react';

interface Currency {
  id?: number | string | null;
  name?: string | null;
  symbol?: string | null;
  isoCode?: string | null;
}

interface NavbarClientProps {
  menu: MenuWithLinks | null;
  storeName?: string;
  logoUrl?: string;
  currencies?: Currency[];
  isEditing?: boolean;
}

const MAX_VISIBLE_LINKS = 4;

export function NavbarClient({
  menu,
  storeName = 'Store',
  logoUrl,
  currencies = [],
  isEditing = false,
}: NavbarClientProps) {
  const allLinks = menu?.links || [];
  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency | null>(
    currencies[0] || null
  );

  // Limit visible root-level links to MAX_VISIBLE_LINKS, put rest under "More"
  const visibleLinks = allLinks.slice(0, MAX_VISIBLE_LINKS);
  const overflowLinks = allLinks.slice(MAX_VISIBLE_LINKS);

  // Separate visible links with children (mega menu) from simple links
  const megaMenuLinks = visibleLinks.filter((link) => link.links && link.links.length > 0);
  const simpleLinks = visibleLinks.filter((link) => !link.links || link.links.length === 0);

  // For mobile menu, use all links
  const allMegaMenuLinks = allLinks.filter((link) => link.links && link.links.length > 0);
  const allSimpleLinks = allLinks.filter((link) => !link.links || link.links.length === 0);

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <ElDialog>
        <dialog id="mobile-menu" className="backdrop:bg-transparent lg:hidden">
          <ElDialogBackdrop className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0" />
          <div tabIndex={0} className="fixed inset-0 flex focus:outline-none">
            <ElDialogPanel className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full">
              <div className="flex px-4 pt-5 pb-2">
                <button
                  type="button"
                  command="close"
                  commandfor="mobile-menu"
                  className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                >
                  <span className="absolute -inset-0.5"></span>
                  <span className="sr-only">Close menu</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className="size-6"
                  >
                    <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Links */}
              {allMegaMenuLinks.length > 0 && (
                <ElTabGroup className="mt-2 block">
                  <div className="border-b border-gray-200">
                    <ElTabList className="-mb-px flex space-x-8 px-4">
                      {allMegaMenuLinks.map((link, index) => (
                        <button
                          key={`mobile-tab-${index}`}
                          className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 aria-selected:border-indigo-600 aria-selected:text-indigo-600"
                        >
                          {link.title}
                        </button>
                      ))}
                    </ElTabList>
                  </div>
                  <ElTabPanels>
                    {allMegaMenuLinks.map((link, tabIndex) => (
                      <div
                        key={`mobile-panel-${tabIndex}`}
                        hidden={tabIndex !== 0}
                        className="space-y-10 px-4 pt-10 pb-8"
                      >
                        {link.links?.map((section, sectionIndex) => (
                          <div key={`mobile-section-${tabIndex}-${sectionIndex}`}>
                            <p
                              id={`mobile-heading-${tabIndex}-${sectionIndex}`}
                              className="font-medium text-gray-900"
                            >
                              {section.title}
                            </p>
                            {section.links && section.links.length > 0 && (
                              <ul
                                role="list"
                                aria-labelledby={`mobile-heading-${tabIndex}-${sectionIndex}`}
                                className="mt-6 flex flex-col space-y-6"
                              >
                                {section.links.map((item, itemIndex) => (
                                  <li
                                    key={`mobile-item-${tabIndex}-${sectionIndex}-${itemIndex}`}
                                    className="flow-root"
                                  >
                                    <Link
                                      href={item.url || '#'}
                                      target={item.target || undefined}
                                      className="-m-2 block p-2 text-gray-500"
                                    >
                                      {item.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </ElTabPanels>
                </ElTabGroup>
              )}

              {/* Simple Links in Mobile Menu */}
              {allSimpleLinks.length > 0 && (
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {allSimpleLinks.map((link, index) => (
                    <div key={`mobile-simple-${index}`} className="flow-root">
                      <Link
                        href={link.url || '#'}
                        target={link.target || undefined}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        {link.title}
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                <div className="flow-root">
                  <Link href="/account/login" className="-m-2 block p-2 font-medium text-gray-900">
                    Sign in
                  </Link>
                </div>
                <div className="flow-root">
                  <Link
                    href="/account/register"
                    className="-m-2 block p-2 font-medium text-gray-900"
                  >
                    Create account
                  </Link>
                </div>
              </div>

              {/* Currency selector in mobile */}
              {currencies.length > 0 && selectedCurrency && (
                <div className="border-t border-gray-200 px-4 py-6">
                  <button className="-m-2 flex items-center p-2">
                    <span className="ml-3 block text-base font-medium text-gray-900">
                      {selectedCurrency.isoCode}
                    </span>
                    <span className="sr-only">, change currency</span>
                  </button>
                </div>
              )}
            </ElDialogPanel>
          </div>
        </dialog>
      </ElDialog>

      <header className="relative bg-white">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>

        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                command="show-modal"
                commandfor="mobile-menu"
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open menu</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className="size-6"
                >
                  <path
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <span className="sr-only">{storeName}</span>
                  {logoUrl ? (
                    <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
                  ) : (
                    <span className="text-xl font-bold text-gray-900">{storeName}</span>
                  )}
                </Link>
              </div>

              {/* Flyout menus */}
              <ElPopoverGroup className="group/popover-group hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {/* Mega menu items */}
                  {megaMenuLinks.map((link, index) => (
                    <div key={`desktop-mega-${index}`} className="group/popover flex">
                      <div className="relative flex">
                        <button
                          popoverTarget={`desktop-menu-${index}`}
                          className="relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-out group-not-has-open/popover:text-gray-700 group-has-open/popover:text-indigo-600 group-not-has-open/popover:hover:text-gray-800"
                        >
                          {link.title}
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 -bottom-px z-30 h-0.5 bg-transparent duration-200 ease-in group-has-open/popover:bg-indigo-600 group-has-open/popover-group:duration-150 group-has-open/popover-group:ease-out"
                          ></span>
                        </button>
                      </div>
                      <ElPopover
                        id={`desktop-menu-${index}`}
                        popover="auto"
                        className="w-full overflow-visible bg-white text-sm text-gray-500 transition transition-discrete [--anchor-gap:1px] backdrop:bg-transparent open:block data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                      >
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 top-1/2 bg-white shadow-sm"
                        ></div>
                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-16">
                              <div className="grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                {link.links?.map((section, sectionIndex) => (
                                  <div key={`desktop-section-${index}-${sectionIndex}`}>
                                    <p
                                      id={`desktop-heading-${index}-${sectionIndex}`}
                                      className="font-medium text-gray-900"
                                    >
                                      {section.title}
                                    </p>
                                    {section.links && section.links.length > 0 && (
                                      <ul
                                        role="list"
                                        aria-labelledby={`desktop-heading-${index}-${sectionIndex}`}
                                        className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                      >
                                        {section.links.map((item, itemIndex) => (
                                          <li
                                            key={`desktop-item-${index}-${sectionIndex}-${itemIndex}`}
                                            className="flex"
                                          >
                                            <Link
                                              href={item.url || '#'}
                                              target={item.target || undefined}
                                              className="hover:text-gray-800"
                                            >
                                              {item.title}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ElPopover>
                    </div>
                  ))}

                  {/* Simple links */}
                  {simpleLinks.map((link, index) => (
                    <Link
                      key={`desktop-simple-${index}`}
                      href={link.url || '#'}
                      target={link.target || undefined}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {link.title}
                    </Link>
                  ))}

                  {/* More dropdown for overflow links */}
                  {overflowLinks.length > 0 && (
                    <div className="group/popover flex">
                      <div className="relative flex">
                        <button
                          popoverTarget="desktop-more-menu"
                          className="relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-out group-not-has-open/popover:text-gray-700 group-has-open/popover:text-indigo-600 group-not-has-open/popover:hover:text-gray-800"
                        >
                          More
                          <svg
                            className="ml-1 size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 -bottom-px z-30 h-0.5 bg-transparent duration-200 ease-in group-has-open/popover:bg-indigo-600"
                          ></span>
                        </button>
                      </div>
                      <ElPopover
                        id="desktop-more-menu"
                        popover="auto"
                        className="min-w-48 overflow-visible rounded-lg bg-white text-sm text-gray-500 shadow-lg ring-1 ring-gray-900/5 transition transition-discrete [--anchor-gap:8px] backdrop:bg-transparent open:block data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                      >
                        <div className="py-2">
                          {overflowLinks.map((link, index) => (
                            <Link
                              key={`more-link-${index}`}
                              href={link.url || '#'}
                              target={link.target || undefined}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {link.title}
                            </Link>
                          ))}
                        </div>
                      </ElPopover>
                    </div>
                  )}
                </div>
              </ElPopoverGroup>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  <Link
                    href="/account/login"
                    className="text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Sign in
                  </Link>
                  <span aria-hidden="true" className="h-6 w-px bg-gray-200"></span>
                  <Link
                    href="/account/register"
                    className="text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Create account
                  </Link>
                </div>

                {/* Currency selector */}
                {currencies.length > 0 && selectedCurrency && (
                  <div className="hidden lg:ml-8 lg:flex">
                    <button className="flex items-center text-gray-700 hover:text-gray-800">
                      <span className="block text-sm font-medium">{selectedCurrency.isoCode}</span>
                      <span className="sr-only">, change currency</span>
                    </button>
                  </div>
                )}

                {/* Search */}
                <div className="flex lg:ml-6">
                  <Link href="/search" className="p-2 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Search</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className="size-6"
                    >
                      <path
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <Link href="/cart" className="group -m-2 flex items-center p-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                    >
                      <path
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                      0
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
