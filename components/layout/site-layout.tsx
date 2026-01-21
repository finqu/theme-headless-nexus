import { Navbar, Footer } from '@/components/layout';
import { getLayoutSettings } from '@/lib/layout-settings';
import { AlternatesProvider, type Alternate } from '@/lib/alternates-context';

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
 * @param locale - Required locale for fetching localized menu content
 * @param alternates - Optional alternates for locale switching
 */
export async function SiteLayout({ children, locale, alternates = [] }: SiteLayoutProps) {
  const settings = await getLayoutSettings();

  return (
    <AlternatesProvider alternates={alternates}>
      <div className="flex min-h-screen flex-col">
        <Navbar menuHandle={settings.navbar.menuHandle} locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer
          menuHandle={settings.footer.menuHandle}
          tagline={settings.footer.tagline}
          copyrightText={settings.footer.copyrightText}
          twitterUrl={settings.footer.twitterUrl}
          facebookUrl={settings.footer.facebookUrl}
          linkedinUrl={settings.footer.linkedinUrl}
          locale={locale}
        />
      </div>
    </AlternatesProvider>
  );
}
