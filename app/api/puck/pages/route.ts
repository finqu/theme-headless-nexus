import { NextRequest, NextResponse } from 'next/server';
import { listPages } from '@/lib/puck-storage';

/**
 * GET /api/puck/pages
 * List all pages
 */
export async function GET() {
  try {
    const pages = await listPages();

    return NextResponse.json({
      pages: pages.map((slug) => ({
        slug,
        editUrl: `/editor?mode=page&slug=${slug}`,
      })),
    });
  } catch (error) {
    console.error('Failed to list pages:', error);
    return NextResponse.json({ error: 'Failed to list pages' }, { status: 500 });
  }
}
