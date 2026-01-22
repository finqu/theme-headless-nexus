import { Navbar, Footer } from '@/components/layout';
import { getLayoutSettings } from '@/lib/layout-settings';
import { AlternatesProvider, type Alternate } from '@/lib/alternates-context';
import { StoreProvider } from '@/lib/store-context';
import { getStoreData } from '@/lib/store-cache';
import { fetchMenuWithLinks } from '@/lib/menu-queries';

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Locale for fetching localized content */
  locale: string;
  /** Alternate locale URLs from resourceByPath */
  alternates?: Alternate[];
}

/**
 * Site layout wrapper with navbar and footer
 * Used for all public-facing pages (not the editor)
 *
 * Loads store data once and provides it via StoreProvider to all children.
 * Menus and store data are fetched server-side for SEO.
 *
 * @param locale - Required locale for fetching localized menu content
 * @param alternates - Optional alternates for locale switching
 */
export async function SiteLayout({ children, locale, alternates = [] }: SiteLayoutProps) {
  const [settings, storeData] = await Promise.all([getLayoutSettings(), getStoreData(locale)]);

  // Fetch menus in parallel
  const [navbarMenu, footerMenu] = await Promise.all([
    fetchMenuWithLinks(settings.navbar.menuHandle, locale),
    fetchMenuWithLinks(settings.footer.menuHandle, locale),
  ]);

  return (
    <StoreProvider value={storeData}>
      <AlternatesProvider alternates={alternates}>
        <div className="flex min-h-screen flex-col">
          <Navbar menu={navbarMenu} storeData={storeData} />
          <main className="flex-1">{children}</main>
          <Footer
            menu={footerMenu}
            storeData={storeData}
            tagline={settings.footer.tagline}
            copyrightText={settings.footer.copyrightText}
            twitterUrl={settings.footer.twitterUrl}
            facebookUrl={settings.footer.facebookUrl}
            linkedinUrl={settings.footer.linkedinUrl}
          />
        </div>
      </AlternatesProvider>
    </StoreProvider>
  );
}
