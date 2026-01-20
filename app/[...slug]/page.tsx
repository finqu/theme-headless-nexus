import { notFound } from 'next/navigation';
import { Render } from '@puckeditor/core';
import { pageByHandle } from '@finqu/storefront-lib/server';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig } from '@/lib/puck-storage';
import { storefrontServer } from '@/lib/storefront';
import { SiteLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Dynamic page renderer for Finqu pages with Puck layouts.
 *
 * This component handles localized routes by:
 * 1. Looking up the page in Finqu by its localized handle (URL slug)
 * 2. Getting the stable page ID from Finqu
 * 3. Fetching the Puck layout using the stable ID
 *
 * This ensures the same layout is used across all language versions of a page.
 *
 * Examples:
 * - /about -> looks up "about" -> gets page ID -> fetches Puck config
 * - /fi/tietoa -> looks up "fi/tietoa" -> gets same page ID -> same Puck config
 */
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const pageHandle = slug.join('/');

  // Look up page in Finqu to get the stable page ID
  const page = await pageByHandle(storefrontServer, { handle: pageHandle });

  if (!page?.id) {
    notFound();
  }

  // Convert numeric ID to string for consistent storage key usage
  const pageId = String(page.id);

  // Get Puck layout using the stable page ID
  const data = await getPageConfig(pageId, 'published');

  if (!data) {
    // Page exists in Finqu but has no Puck layout yet
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
  const pageHandle = slug.join('/');

  // Look up page in Finqu to get the stable page ID and metadata
  const page = await pageByHandle(storefrontServer, { handle: pageHandle });

  if (!page?.id) {
    return {};
  }

  // Convert numeric ID to string for consistent storage key usage
  const pageId = String(page.id);

  // Get Puck layout using the stable page ID
  const data = await getPageConfig(pageId, 'published');

  if (!data) {
    return {
      title: page.title || pageHandle,
    };
  }

  // Use root props for metadata if available, fallback to Finqu page title
  const puckTitle = (data.root?.props as Record<string, unknown>)?.title as string;

  return {
    title: puckTitle || page.title || pageHandle,
  };
}
