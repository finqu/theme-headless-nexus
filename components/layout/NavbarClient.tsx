'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuLink, MenuWithLinks } from '@/lib/menu-queries';

interface NavbarClientProps {
  menu: MenuWithLinks | null;
  storeName?: string;
  logoUrl?: string;
}

export function NavbarClient({ menu, storeName = 'Store', logoUrl }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const links = menu?.links || [];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold">{storeName}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {links.map((link, index) => (
              <NavMenuItem key={`${link.url}-${index}`} link={link} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>{storeName}</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-4">
              {links.map((link, index) => (
                <MobileNavItem
                  key={`mobile-${link.url}-${index}`}
                  link={link}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/**
 * Desktop navigation menu item
 */
function NavMenuItem({ link }: { link: MenuLink }) {
  const hasChildren = link.links && link.links.length > 0;

  if (hasChildren) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger>{link.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            {link.links!.map((child, index) => (
              <li key={`${child.url}-${index}`}>
                <NavigationMenuLink asChild>
                  <Link
                    href={child.url || '#'}
                    target={child.target || undefined}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none'
                    )}
                  >
                    <div className="text-sm leading-none font-medium">{child.title}</div>
                    {/* Nested items shown as subtext */}
                    {child.links && child.links.length > 0 && (
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {child.links.map((sub) => sub.title).join(', ')}
                      </p>
                    )}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <Link href={link.url || '#'} target={link.target || undefined} legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          {link.title}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}

/**
 * Mobile navigation menu item with collapsible children
 */
function MobileNavItem({
  link,
  onNavigate,
  depth = 0,
}: {
  link: MenuLink;
  onNavigate: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = link.links && link.links.length > 0;

  if (hasChildren) {
    return (
      <div className={cn('flex flex-col', depth > 0 && 'ml-4')}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="hover:text-primary flex items-center justify-between py-2 text-left font-medium"
        >
          {link.title}
          <span className={cn('transition-transform', expanded && 'rotate-180')}>▼</span>
        </button>
        {expanded && (
          <div className="flex flex-col gap-2 border-l pl-4">
            {link.links!.map((child, index) => (
              <MobileNavItem
                key={`${child.url}-${index}`}
                link={child}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={link.url || '#'}
      target={link.target || undefined}
      onClick={onNavigate}
      className={cn(
        'text-muted-foreground hover:text-primary py-2 transition-colors',
        depth > 0 && 'ml-4'
      )}
    >
      {link.title}
    </Link>
  );
}
