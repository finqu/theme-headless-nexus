import { NextResponse } from 'next/server';
import { TEMPLATE_TYPES, TEMPLATE_TYPE_LABELS } from '@/lib/template-types';

/**
 * GET /api/puck/templates
 * List all available template types
 */
export async function GET() {
  const types = TEMPLATE_TYPES.map((type) => ({
    type,
    label: TEMPLATE_TYPE_LABELS[type],
    defaultEditUrl: `/editor?mode=template&type=${type}`,
  }));

  return NextResponse.json({ types });
}
