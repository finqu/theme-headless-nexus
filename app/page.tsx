import { headers } from 'next/headers';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig } from '@/lib/puck-storage';
import { SiteLayout } from '@/components/layout';

/**
 * Home page - renders the published "home" page config
 * If no config exists, shows a welcome message with link to editor
 *
 * The locale is read from middleware headers (x-locale) and used
 * for the editor link to ensure proper locale context.
 */
export default async function HomePage() {
  // Read locale from middleware headers
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  const data = await getPageConfig('home', 'published');

  if (!data) {
    return (
      <SiteLayout>
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
    <SiteLayout>
      <Render config={config} data={data} />
    </SiteLayout>
  );
}
