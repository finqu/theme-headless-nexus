import { NextResponse } from 'next/server';
import { getLayoutSettings } from '@/lib/layout-settings';
import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontServer } from '@/lib/storefront';
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
 */
export async function GET() {
    try {
        // Fetch layout settings first to get menu handles
        const layoutSettings = await getLayoutSettings();

        // Fetch menus, store info, and locales in parallel
        const [navbarMenu, footerMenu, storeInfo, localesData] = await Promise.all([
            fetchMenuWithLinks(layoutSettings.navbar.menuHandle),
            fetchMenuWithLinks(layoutSettings.footer.menuHandle),
            store(storefrontServer, {}).catch(() => null),
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
