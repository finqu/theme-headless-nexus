import { notFound } from 'next/navigation';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig } from '@/lib/puck-storage';
import { SiteLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Dynamic page renderer for static pages
 * Fetches Puck config from storage and renders the page
 *
 * Examples:
 * - /about -> slug = ['about']
 * - /company/team -> slug = ['company', 'team']
 */
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug.join('/');

  const data = await getPageConfig(pageSlug, 'published');

  if (!data) {
    notFound();
  }

  return (
    <SiteLayout>
      <Render config={config} data={data} />
    </SiteLayout>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug.join('/');

  const data = await getPageConfig(pageSlug, 'published');

  if (!data) {
    return {};
  }

  // Use root props for metadata if available
  const title = (data.root?.props as Record<string, unknown>)?.title as string;

  return {
    title: title || pageSlug,
  };
}
