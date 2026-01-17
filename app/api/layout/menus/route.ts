import { NextResponse } from 'next/server';
import { storefrontServer } from '@/lib/storefront';

// Custom query to get all menus as an array
const MENUS_LIST_QUERY = `
  query Menus {
    menus {
      handle
      title
    }
  }
`;

interface MenuListItem {
    handle?: string | null;
    title?: string | null;
}

/**
 * GET /api/layout/menus
 * Fetch available menus for dropdown selection
 */
export async function GET() {
    try {
        const response = await storefrontServer.execute<{ menus: MenuListItem[] }>(
            MENUS_LIST_QUERY,
            {}
        );

        const menuList = response.menus || [];

        // Map to simple format for dropdown
        const options = menuList.map((menu) => ({
            handle: menu.handle || '',
            title: menu.title || menu.handle || 'Untitled',
        }));

        return NextResponse.json(options);
    } catch (error) {
        console.error('Failed to fetch menus:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menus' },
            { status: 500 }
        );
    }
}
