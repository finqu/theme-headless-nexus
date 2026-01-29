import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig } from '@/lib/puck/storage';
import { getResourceByPath } from '@/lib/resource-resolver';
import { getLocale, getPathname } from '@/lib/locale';
import { SiteLayout } from '@/components/layout';
import { redirect } from 'next/navigation';

/**
 * Home page - renders the published "home" page config
 *
 * This page uses resourceByPath to verify the root path resolves to HOME type,
 * ensuring consistency with the rest of the routing system.
 *
 * The locale and pathname are determined from middleware headers.
 *
 * If no Puck config exists, shows a welcome message with link to editor.
 */
export default async function HomePage() {
  // Get locale and path from middleware headers
  const [locale, path] = await Promise.all([getLocale(), getPathname()]);

  // Verify root path resolves to HOME and get alternates for locale switcher
  const resource = await getResourceByPath(path, locale);

  // The root path should always resolve to HOME type
  // If it doesn't, something is misconfigured, but we continue anyway
  if (resource && resource.type !== 'HOME') {
    console.warn(
      `Root path "/" resolved to "${resource.type}" instead of "HOME". ` +
        'This may indicate a routing configuration issue.'
    );
  } else if (resource && resource.type === 'HOME' && !resource.id) {
    // Redirect to hreflang alternate
    const alternate = resource.alternates?.find((alt) => alt.hreflang === locale);
    if (alternate) {
      redirect(alternate.url);
    }
  }

  const data = await getPageConfig(resource?.id ?? 'home', 'published');

  if (!data) {
    return (
      <SiteLayout locale={locale} alternates={resource?.alternates}>
        <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold">Welcome to Nexus</h1>
            <p className="mb-8 text-gray-600">
              Your headless storefront is ready. Start by creating your home page in the editor.
            </p>
            <a
              href={`/editor?mode=page&slug=home&locale=${locale}`}
              className="bg-primary text-primary-foreground inline-block rounded-sm px-6 py-3 hover:opacity-90"
            >
              Open Editor
            </a>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout locale={locale} alternates={resource?.alternates}>
      <Render config={config} data={data} />
    </SiteLayout>
  );
}
