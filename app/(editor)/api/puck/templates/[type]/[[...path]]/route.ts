import { NextRequest, NextResponse } from 'next/server';
import { authenticateEditorRequest } from '@/lib/auth';
import { isValidTemplateType, parseTemplateType, type TemplateType } from '@/lib/template-types';
import {
  getTemplateConfig,
  getTemplateDraft,
  saveTemplateDraft,
  publishTemplate,
  resetTemplateOverride,
  listTemplateOverrides,
  hasUnpublishedChanges,
} from '@/lib/puck/storage';

interface RouteParams {
  params: Promise<{ type: string; path?: string[] }>;
}

/**
 * Parse the route path to extract type, slug, and action
 *
 * Routes:
 * - /api/puck/templates/[type] - Default template
 * - /api/puck/templates/[type]/[slug] - Slug-specific override
 * - /api/puck/templates/[type]/[slug]/reset - Reset override to default
 * - /api/puck/templates/[type]/overrides - List all overrides
 */
function parseRoutePath(
  type: string,
  path?: string[]
): {
  type: TemplateType;
  slug?: string;
  action?: 'reset' | 'overrides';
} | null {
  if (!isValidTemplateType(type)) {
    return null;
  }

  const templateType = parseTemplateType(type);

  if (!path || path.length === 0) {
    // /api/puck/templates/[type] - Default template
    return { type: templateType };
  }

  if (path.length === 1) {
    if (path[0] === 'overrides') {
      // /api/puck/templates/[type]/overrides
      return { type: templateType, action: 'overrides' };
    }
    // /api/puck/templates/[type]/[slug]
    return { type: templateType, slug: path[0] };
  }

  if (path.length === 2 && path[1] === 'reset') {
    // /api/puck/templates/[type]/[slug]/reset
    return { type: templateType, slug: path[0], action: 'reset' };
  }

  return null;
}

/**
 * GET /api/puck/templates/[type]/[[...path]]
 *
 * Routes:
 * - GET /api/puck/templates/product - Get default product template
 * - GET /api/puck/templates/product?draft=true - Get draft version
 * - GET /api/puck/templates/product/fancy-shoes - Get template for specific product
 * - GET /api/puck/templates/product/overrides - List all product template overrides
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { type, path } = await params;
  const parsed = parseRoutePath(type, path);

  if (!parsed) {
    return NextResponse.json({ error: 'Invalid template type or path' }, { status: 400 });
  }

  // Handle list overrides
  if (parsed.action === 'overrides') {
    const overrides = await listTemplateOverrides(parsed.type);
    return NextResponse.json({
      type: parsed.type,
      overrides: overrides.map((slug) => ({
        slug,
        editUrl: `/editor?mode=template&type=${parsed.type}&slug=${slug}`,
      })),
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const wantDraft = searchParams.get('draft') === 'true';

  // Draft access requires authentication
  if (wantDraft) {
    const auth = await authenticateEditorRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Get draft with inheritance info
    const result = await getTemplateDraft(parsed.type, parsed.slug);

    return NextResponse.json({
      data: result.data,
      meta: {
        type: parsed.type,
        slug: parsed.slug || null,
        version: 'draft',
        isInherited: result.isInherited,
        hasOverride: result.hasOverride,
        hasUnpublishedChanges: result.data
          ? await hasUnpublishedChanges(parsed.type, parsed.slug)
          : false,
      },
    });
  }

  // Get published version
  const data = await getTemplateConfig(parsed.type, parsed.slug, 'published');

  if (!data) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({
    data,
    meta: {
      type: parsed.type,
      slug: parsed.slug || null,
      version: 'published',
    },
  });
}

/**
 * PUT /api/puck/templates/[type]/[[...path]]
 * Save template draft (auto-save)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { type, path } = await params;
  const parsed = parseRoutePath(type, path);

  if (!parsed || parsed.action) {
    return NextResponse.json({ error: 'Invalid template type or path' }, { status: 400 });
  }

  try {
    const data = await request.json();
    await saveTemplateDraft(parsed.type, data, parsed.slug);

    return NextResponse.json({
      success: true,
      message: 'Draft saved',
    });
  } catch (error) {
    console.error('Failed to save template draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

/**
 * POST /api/puck/templates/[type]/[[...path]]
 * Publish template OR reset override
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { type, path } = await params;
  const parsed = parseRoutePath(type, path);

  if (!parsed) {
    return NextResponse.json({ error: 'Invalid template type or path' }, { status: 400 });
  }

  // Handle reset action
  if (parsed.action === 'reset') {
    if (!parsed.slug) {
      return NextResponse.json({ error: 'Cannot reset default template' }, { status: 400 });
    }

    try {
      await resetTemplateOverride(parsed.type, parsed.slug);
      return NextResponse.json({
        success: true,
        message: 'Template override reset to default',
      });
    } catch (error) {
      console.error('Failed to reset template:', error);
      return NextResponse.json({ error: 'Failed to reset template' }, { status: 500 });
    }
  }

  // Publish action
  try {
    const success = await publishTemplate(parsed.type, parsed.slug);

    if (!success) {
      return NextResponse.json({ error: 'No draft to publish' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Template published',
    });
  } catch (error) {
    console.error('Failed to publish template:', error);
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }
}

/**
 * DELETE /api/puck/templates/[type]/[slug]
 * Delete a template override (revert to default)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { type, path } = await params;
  const parsed = parseRoutePath(type, path);

  if (!parsed || !parsed.slug) {
    return NextResponse.json({ error: 'Can only delete slug-specific overrides' }, { status: 400 });
  }

  try {
    await resetTemplateOverride(parsed.type, parsed.slug);

    return NextResponse.json({
      success: true,
      message: 'Template override deleted',
    });
  } catch (error) {
    console.error('Failed to delete template override:', error);
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
  }
}
