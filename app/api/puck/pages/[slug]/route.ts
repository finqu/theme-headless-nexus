import { NextRequest, NextResponse } from 'next/server';
import { authenticateEditorRequest } from '@/lib/auth';
import {
  getPageConfig,
  savePageDraft,
  publishPage,
  deletePage,
  hasUnpublishedChanges,
} from '@/lib/puck-storage';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/puck/pages/[slug]
 * Get a page config by slug
 *
 * Query params:
 * - draft=true: Get draft version instead of published
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const wantDraft = searchParams.get('draft') === 'true';

  // Draft access requires authentication
  if (wantDraft) {
    const auth = await authenticateEditorRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }
  }

  const version = wantDraft ? 'draft' : 'published';
  const data = await getPageConfig(slug, version);

  if (!data) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  // Include metadata about draft status
  const hasChanges = wantDraft ? await hasUnpublishedChanges('page' as any, slug) : false;

  return NextResponse.json({
    data,
    meta: {
      slug,
      version,
      hasUnpublishedChanges: hasChanges,
    },
  });
}

/**
 * PUT /api/puck/pages/[slug]
 * Save page draft (auto-save)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const data = await request.json();
    await savePageDraft(slug, data);

    return NextResponse.json({
      success: true,
      message: 'Draft saved',
    });
  } catch (error) {
    console.error('Failed to save page draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

/**
 * POST /api/puck/pages/[slug]
 * Publish page (copy draft to published)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const success = await publishPage(slug);

    if (!success) {
      return NextResponse.json({ error: 'No draft to publish' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Page published',
    });
  } catch (error) {
    console.error('Failed to publish page:', error);
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }
}

/**
 * DELETE /api/puck/pages/[slug]
 * Delete a page (both draft and published)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { slug } = await params;

  try {
    await deletePage(slug);

    return NextResponse.json({
      success: true,
      message: 'Page deleted',
    });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
