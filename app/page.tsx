import { headers } from 'next/headers';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig } from '@/lib/puck-storage';
import { getResourceByPath } from '@/lib/resource-resolver';
import { getStoreInfo } from '@/lib/store-cache';
import { SiteLayout } from '@/components/layout';

/**
 * Home page - renders the published "home" page config
 *
 * This page uses resourceByPath to verify the root path resolves to HOME type,
 * ensuring consistency with the rest of the routing system.
 *
 * The locale is determined from the x-locale header set by middleware.
 * Middleware parses locale from URL (e.g., /en -> locale: en, rewrite to /)
 * and passes it via headers. Falls back to store's default locale.
 *
 * If no Puck config exists, shows a welcome message with link to editor.
 */
export default async function HomePage() {
  // Get locale from middleware header (set during URL rewrite)
  const headersList = await headers();
  const storeInfo = await getStoreInfo();
  const locale = headersList.get('x-locale') || storeInfo.defaultLocale;
  // Verify root path resolves to HOME (for consistency with routing system)
  // This also warms the cache for the root path
  const resource = await getResourceByPath('/', locale);

  // The root path should always resolve to HOME type
  // If it doesn't, something is misconfigured, but we continue anyway
  if (resource && resource.type !== 'HOME') {
    console.warn(
      `Root path "/" resolved to "${resource.type}" instead of "HOME". ` +
        'This may indicate a routing configuration issue.'
    );
  }

  const data = await getPageConfig('home', 'published');

  if (!data) {
    return (
      <SiteLayout locale={locale}>
        <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold">Welcome to Horizon</h1>
            <p className="mb-8 text-gray-600">
              Your headless storefront is ready. Start by creating your home page in the editor.
            </p>
            <a
              href={`/editor?mode=page&slug=home&locale=${locale}`}
              className="bg-primary text-primary-foreground inline-block rounded-md px-6 py-3 hover:opacity-90"
            >
              Open Editor
            </a>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout locale={locale}>
      <Render config={config} data={data} />
    </SiteLayout>
  );
}
