import { Navbar, Footer } from '@/components/layout';
import { getLayoutSettings } from '@/lib/layout-settings';

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Locale for fetching localized content */
  locale: string;
}

/**
 * Site layout wrapper with navbar and footer
 * Used for all public-facing pages (not the editor)
 *
 * @param locale - Required locale for fetching localized menu content
 */
export async function SiteLayout({ children, locale }: SiteLayoutProps) {
  const settings = await getLayoutSettings();

  return (
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
  );
}
