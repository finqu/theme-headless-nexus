import Link from 'next/link';
import type { Menu, Link as MenuLink } from '@finqu/storefront-types';
import type { StoreData } from '@/lib/context-providers/store-context';
import { NewsletterForm } from './newsletter-form';
import { LocaleSwitcher } from './locale-switcher';
import { GradientBorder } from '../shared';

interface FooterProps {
  menu: Menu | null;
  storeData: StoreData;
  tagline: string;
  copyrightText: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  isEditing?: boolean;
}

/**
 * Server component that renders the footer.
 * Menu and store data are passed from SiteLayout (server-rendered for SEO).
 */
export function Footer({
  menu,
  storeData,
  tagline,
  copyrightText,
  twitterUrl,
  facebookUrl,
  linkedinUrl,
  isEditing = false,
}: FooterProps) {
  const { store, locales } = storeData;
  const storeName = store?.name || 'Store';
  const logoUrl = store?.logo;
  const currentYear = new Date().getFullYear();

  // Parse copyright text with placeholders
  const parsedCopyright = copyrightText
    .replace('{year}', String(currentYear))
    .replace('{storeName}', storeName);

  // Distribute menu links into 3 columns
  const menuLinks = menu?.links || [];
  const columns = distributeToColumns(menuLinks, 3);

  return (
    <footer className="bg-background relative">
      <GradientBorder position="top" />
      <div className="px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:divide-x">
          {/* Left section: Logo, tagline, newsletter */}
          <div className="space-y-4 py-6 lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-block">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
              ) : (
                <LogoPlaceholder />
              )}
            </Link>

            {/* Tagline */}
            <p className="text-muted-foreground max-w-sm text-sm">{tagline}</p>

            {/* Newsletter */}
            <NewsletterForm />
          </div>

          {/* Menu columns */}
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4 py-6">
              {column.map((link, linkIndex) => (
                <div key={`${link.title}-${linkIndex}`} className="space-y-3">
                  {/* Column header (top-level link title) */}
                  <h3 className="text-foreground text-sm font-semibold">{link.title}</h3>
                  {/* Child links */}
                  {link.links && link.links.length > 0 && (
                    <ul className="space-y-2">
                      {link.links.map((child, childIndex) => (
                        <li key={`${child.url}-${childIndex}`}>
                          <Link
                            href={child.url || '#'}
                            target={child.target || undefined}
                            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* If no children, the header itself is a link */}
                  {(!link.links || link.links.length === 0) && link.url && (
                    <Link
                      href={link.url}
                      target={link.target || undefined}
                      className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
                    >
                      View all →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
          <p className="text-muted-foreground text-sm">{parsedCopyright}</p>

          {/* Locale switcher and social icons */}
          <div className="flex items-center gap-4">
            <LocaleSwitcher locales={locales} isEditing={isEditing} />
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Distribute menu links across columns
 * First 3 top-level links go to separate columns
 * Additional links fill remaining space
 */
function distributeToColumns(links: MenuLink[], numColumns: number): MenuLink[][] {
  const columns: MenuLink[][] = Array.from({ length: numColumns }, () => []);

  links.forEach((link, index) => {
    const colIndex = index % numColumns;
    columns[colIndex].push(link);
  });

  return columns.filter((col) => col.length > 0);
}

/**
 * Simple logo placeholder
 */
function LogoPlaceholder() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <path
        d="M16 2L2 9L16 16L30 9L16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M2 23L16 30L30 23" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 16L16 23L30 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Twitter/X icon
 */
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Facebook icon
 */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * LinkedIn icon
 */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
        clipRule="evenodd"
      />
    </svg>
  );
}
