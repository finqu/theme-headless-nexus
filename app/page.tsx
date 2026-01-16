import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig } from '@/lib/puck-storage';

/**
 * Home page - renders the published "home" page config
 * If no config exists, shows a welcome message with link to editor
 */
export default async function HomePage() {
  const data = await getPageConfig('home', 'published');

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-4xl font-bold">Welcome to Horizon</h1>
          <p className="mb-8 text-gray-600">
            Your headless storefront is ready. Start by creating your home page in the editor.
          </p>
          <a
            href="/editor?mode=page&slug=home"
            className="bg-primary text-primary-foreground inline-block rounded-md px-6 py-3 hover:opacity-90"
          >
            Open Editor
          </a>
        </div>
      </div>
    );
  }

  return <Render config={config} data={data} />;
}
