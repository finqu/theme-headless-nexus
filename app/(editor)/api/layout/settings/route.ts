import { NextRequest, NextResponse } from 'next/server';
import {
  getLayoutSettings,
  updateLayoutSettings,
  type LayoutSettings,
} from '@/lib/layout-settings';

/**
 * GET /api/layout/settings
 * Fetch current layout settings
 */
export async function GET() {
  try {
    const settings = await getLayoutSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get layout settings:', error);
    return NextResponse.json({ error: 'Failed to get layout settings' }, { status: 500 });
  }
}

/**
 * PUT /api/layout/settings
 * Update layout settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LayoutSettings>;
    const updated = await updateLayoutSettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update layout settings:', error);
    return NextResponse.json({ error: 'Failed to update layout settings' }, { status: 500 });
  }
}
