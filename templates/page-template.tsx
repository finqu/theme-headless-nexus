import { notFound } from 'next/navigation';
import { PAGE_BY_ID_QUERY, type PageByIdResponse } from '@/lib/queries/content';
import { cachePresets, storefrontClient, withLocale } from '@/lib/storefront';

interface PageTemplateProps {
  id: number;
  locale: string;
}

function PageError() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Error loading page</h1>
        <p className="mt-2 text-gray-600">
          There was a problem loading this page. Please try again later.
        </p>
      </div>
    </div>
  );
}

/**
 * CMS page fallback when no published Puck page config exists.
 * Fetches the static page content from the Storefront API.
 */
export async function PageTemplate({ id, locale }: PageTemplateProps) {
  if (Number.isNaN(id)) {
    notFound();
  }

  let page: PageByIdResponse['page'];

  try {
    const response = await storefrontClient.query<PageByIdResponse>(
      PAGE_BY_ID_QUERY,
      { id },
      withLocale(locale, cachePresets.static)
    );
    page = response.page;
  } catch (error) {
    console.error('Failed to fetch CMS page:', error);
    return <PageError />;
  }

  if (!page) {
    notFound();
  }

  const title = page.title?.trim() || 'Page';
  const content = page.content?.trim();

  return (
    <article className="min-h-[60vh] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
        </header>

        {content ? (
          <div
            className="mt-8 text-base leading-7 text-gray-700 [&_a]:font-medium [&_a]:text-gray-900 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-gray-900 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-600">
            This page does not have any content yet.
          </p>
        )}
      </div>
    </article>
  );
}
