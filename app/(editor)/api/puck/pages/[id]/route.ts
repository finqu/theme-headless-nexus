import { NextRequest, NextResponse } from 'next/server';
import { authenticateEditorRequest } from '@/lib/auth';
import {
  getPageConfig,
  savePageDraft,
  publishPage,
  deletePage,
  hasPageUnpublishedChanges,
} from '@/lib/puck/storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/puck/pages/[id]
 * Get a page config by Finqu page ID
 *
 * The ID parameter is Finqu's stable page ID, which remains consistent
 * across all localized versions of a page.
 *
 * Query params:
 * - draft=true: Get draft version instead of published
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: pageId } = await params;
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
  const data = await getPageConfig(pageId, version);

  if (!data) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  // Include metadata about draft status
  const hasChanges = wantDraft ? await hasPageUnpublishedChanges(pageId) : false;

  return NextResponse.json({
    data,
    meta: {
      pageId,
      version,
      hasUnpublishedChanges: hasChanges,
    },
  });
}

/**
 * PUT /api/puck/pages/[id]
 * Save page draft (auto-save)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: pageId } = await params;

  try {
    const data = await request.json();
    await savePageDraft(pageId, data);

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
 * POST /api/puck/pages/[id]
 * Publish page (copy draft to published)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: pageId } = await params;

  try {
    const success = await publishPage(pageId);

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
 * DELETE /api/puck/pages/[id]
 * Delete a page (both draft and published)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateEditorRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: pageId } = await params;

  try {
    await deletePage(pageId);

    return NextResponse.json({
      success: true,
      message: 'Page deleted',
    });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
