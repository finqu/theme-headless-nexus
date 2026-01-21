import { NextResponse } from 'next/server';
import { getLayoutSettings } from '@/lib/layout-settings';
import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontServer, createServerClientWithLocale } from '@/lib/storefront';
import { store, LOCALES_QUERY } from '@finqu/storefront-lib/server';

/**
 * Locale type from the GraphQL API
 */
interface Locale {
    endonymName: string;
    isoCode: string;
    name: string;
    primary: boolean;
    rootUrl: string;
}

/**
 * GET /api/layout/editor-data
 * Fetch all layout data needed for the Puck editor
 * Returns layout settings, navbar menu, footer menu, store info, and locales
 *
 * Query params:
 * - locale: Optional locale code (e.g., 'fi', 'en') to fetch localized data
 */
export async function GET(request: Request) {
    try {
        // Parse locale from query params
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale');

        // Create locale-aware client if locale is specified
        const client = locale
            ? createServerClientWithLocale(locale)
            : storefrontServer;

        // Fetch layout settings first to get menu handles
        const layoutSettings = await getLayoutSettings();

        // Fetch menus, store info, and locales in parallel
        // Menus and store info use the locale-aware client for localized content
        const [navbarMenu, footerMenu, storeInfo, localesData] = await Promise.all([
            fetchMenuWithLinks(layoutSettings.navbar.menuHandle, client),
            fetchMenuWithLinks(layoutSettings.footer.menuHandle, client),
            store(client, {}).catch(() => null),
            // Locales query doesn't need locale context - it returns all available locales
            storefrontServer.execute<{ locales: Locale[] }>(LOCALES_QUERY).catch(() => ({ locales: [] })),
        ]);

        return NextResponse.json({
            layoutSettings,
            navbarMenu,
            footerMenu,
            storeName: storeInfo?.name || 'Store',
            logoUrl: storeInfo?.logo || undefined,
            locales: localesData?.locales || [],
        });
    } catch (error) {
        console.error('Failed to fetch editor layout data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch editor layout data' },
            { status: 500 }
        );
    }
}
