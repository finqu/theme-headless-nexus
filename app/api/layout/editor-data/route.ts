import { NextResponse } from 'next/server';
import { getLayoutSettings } from '@/lib/layout-settings';
import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontServer } from '@/lib/storefront';
import { store } from '@finqu/storefront-lib/server';

/**
 * GET /api/layout/editor-data
 * Fetch all layout data needed for the Puck editor
 * Returns layout settings, navbar menu, footer menu, and store info
 */
export async function GET() {
    try {
        // Fetch layout settings first to get menu handles
        const layoutSettings = await getLayoutSettings();

        // Fetch menus and store info in parallel
        const [navbarMenu, footerMenu, storeInfo] = await Promise.all([
            fetchMenuWithLinks(layoutSettings.navbar.menuHandle),
            fetchMenuWithLinks(layoutSettings.footer.menuHandle),
            store(storefrontServer, {}).catch(() => null),
        ]);

        return NextResponse.json({
            layoutSettings,
            navbarMenu,
            footerMenu,
            storeName: storeInfo?.name || 'Store',
            logoUrl: storeInfo?.logo || undefined,
        });
    } catch (error) {
        console.error('Failed to fetch editor layout data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch editor layout data' },
            { status: 500 }
        );
    }
}
