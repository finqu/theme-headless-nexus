import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getTemplateConfig } from '@/lib/puck-storage';
import { TemplateType } from '@/lib/template-types';
import { SiteLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Blog page renderer
 * Uses the blog template (with per-slug override support)
 */
export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;

  const templateData = await getTemplateConfig(TemplateType.BLOG, slug, 'published');

  if (!templateData) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Blog Template Not Configured</h1>
            <p className="text-muted-foreground mt-2">
              Please set up a blog template in the editor.
            </p>
            <a
              href={`/editor?mode=template&type=blog`}
              className="bg-primary text-primary-foreground mt-4 inline-block rounded-md px-4 py-2"
            >
              Configure Template
            </a>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Render config={config} data={templateData} />
    </SiteLayout>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  return {
    title: slug,
  };
}
