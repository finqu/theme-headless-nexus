import { NextResponse } from 'next/server';
import { getLayoutSettings } from '@/lib/layout-settings';
import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { getStoreData } from '@/lib/store-cache';

/**
 * GET /api/layout/editor-data
 * Fetch all layout data needed for the Puck editor
 * Returns layout settings, navbar menu, footer menu, and store data
 *
 * Query params:
 * - locale: Optional locale code (e.g., 'fi', 'en') to fetch localized data
 */
export async function GET(request: Request) {
    try {
        // Parse locale from query params
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'en';

        // Fetch layout settings first to get menu handles
        const layoutSettings = await getLayoutSettings();

        // Fetch menus and store data in parallel
        const [navbarMenu, footerMenu, storeData] = await Promise.all([
            fetchMenuWithLinks(layoutSettings.navbar.menuHandle, locale),
            fetchMenuWithLinks(layoutSettings.footer.menuHandle, locale),
            getStoreData(locale),
        ]);

        return NextResponse.json({
            layoutSettings,
            navbarMenu,
            footerMenu,
            storeData,
        });
    } catch (error) {
        console.error('Failed to fetch editor layout data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch editor layout data' },
            { status: 500 }
        );
    }
}
