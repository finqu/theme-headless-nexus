import { NextResponse } from 'next/server';
import { getLayoutSettings } from '@/lib/layout-settings';
import { fetchMenuWithLinks } from '@/lib/menu-queries';
import { storefrontClient, cachePresets, withLocale } from '@/lib/storefront';
import {
    STORE_QUERY,
    LOCALES_QUERY,
    type StoreQueryResponse,
    type LocalesQueryResponse,
} from '@/lib/queries';
import type { Locale } from '@finqu/storefront-types';

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
        const locale = searchParams.get('locale') || '';

        // Create cache options
        const cacheOptions = locale
            ? withLocale(locale, cachePresets.static)
            : cachePresets.static;

        // Fetch layout settings first to get menu handles
        const layoutSettings = await getLayoutSettings();

        // Fetch menus, store info, and locales in parallel
        // Menus and store info use the locale-aware client for localized content
        const [navbarMenu, footerMenu, storeData, localesData] = await Promise.all([
            fetchMenuWithLinks(layoutSettings.navbar.menuHandle, locale),
            fetchMenuWithLinks(layoutSettings.footer.menuHandle, locale),
            storefrontClient.query<StoreQueryResponse>(STORE_QUERY, undefined, cacheOptions).catch(() => ({ store: null })),
            // Locales query doesn't need locale context - it returns all available locales
            storefrontClient.query<LocalesQueryResponse>(LOCALES_QUERY, undefined, cachePresets.static).catch(() => ({ locales: [] })),
        ]);

        return NextResponse.json({
            layoutSettings,
            navbarMenu,
            footerMenu,
            storeInfo: storeData.store || { name: 'Store' },
            locales: localesData.locales || [],
        });
    } catch (error) {
        console.error('Failed to fetch editor layout data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch editor layout data' },
            { status: 500 }
        );
    }
}
