import { NextResponse } from 'next/server';
import { listPageIds } from '@/lib/puck/storage';
import { storefrontClient, cachePresets, withLocale } from '@/lib/storefront';
import { PAGES_QUERY, type PagesQueryResponse } from '@/lib/queries';

/**
 * Page item returned by the API
 */
interface PageItem {
  id: string; // Finqu's stable page ID
  slug: string; // Current locale's URL slug (for display/preview)
  title: string;
  editUrl: string;
  source: 'local' | 'storefront';
}

/**
 * GET /api/puck/pages
 * List all pages from both local storage and Storefront API
 *
 * Pages are identified by Finqu's stable page ID, which remains consistent
 * across all localized versions of a page.
 *
 * Query params:
 * - locale: Optional locale code (e.g., 'fi', 'en') to fetch pages for that locale.
 *           When specified, only pages that have translations in that locale are returned.
 */
export async function GET(request: Request) {
  try {
    // Parse locale from query params
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || '';

    // Create cache options
    const cacheOptions = locale
      ? withLocale(locale, cachePresets.static)
      : cachePresets.static;

    // Fetch local page IDs and storefront pages in parallel
    const [localPageIds, storefrontPagesResult] = await Promise.all([
      listPageIds(),
      storefrontClient.query<PagesQueryResponse>(PAGES_QUERY, { first: 100 }, cacheOptions).catch((err) => {
        console.error('Failed to fetch storefront pages:', err);
        return null;
      }),
    ]);

    // Create a set of local page IDs for quick lookup
    const localPageIdSet = new Set(localPageIds);

    // Build storefront pages list (these are the source of truth for page metadata)
    const storefrontPages: PageItem[] = [];
    const storefrontPageIdSet = new Set<string>();

    if (storefrontPagesResult?.pages?.edges) {
      for (const edge of storefrontPagesResult.pages.edges) {
        const page = edge?.node;

        if (page?.id && page?.handle) {
          // Convert numeric ID to string for consistent storage key usage
          const pageId = String(page.id);
          storefrontPageIdSet.add(pageId);

          // Determine if this page has a local Puck config
          const hasLocalConfig = localPageIdSet.has(pageId);

          storefrontPages.push({
            id: pageId,
            slug: page.handle,
            title: page.title || page.handle.charAt(0).toUpperCase() + page.handle.slice(1),
            editUrl: `/editor?mode=page&id=${pageId}`,
            source: hasLocalConfig ? 'local' : 'storefront',
          });
        }
      }
    }

    // Add any local pages that aren't in the storefront (orphaned configs)
    // These might be pages that were deleted from Finqu but still have Puck configs
    const orphanedPages: PageItem[] = localPageIds
      .filter((pageId) => !storefrontPageIdSet.has(pageId))
      .map((pageId) => ({
        id: pageId,
        slug: pageId, // Use ID as slug since we don't have the actual slug
        title: `Page ${pageId}`,
        editUrl: `/editor?mode=page&id=${pageId}`,
        source: 'local' as const,
      }));

    // Merge pages: storefront pages first, then orphaned local pages
    const allPages = [...storefrontPages, ...orphanedPages];

    return NextResponse.json({
      pages: allPages,
    });
  } catch (error) {
    console.error('Failed to list pages:', error);
    return NextResponse.json({ error: 'Failed to list pages' }, { status: 500 });
  }
}
