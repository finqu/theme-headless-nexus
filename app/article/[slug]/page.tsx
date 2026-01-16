import { notFound } from 'next/navigation';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getTemplateConfig } from '@/lib/puck-storage';
import { TemplateType } from '@/lib/template-types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Article page renderer
 * Uses the article template (with per-slug override support)
 */
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const templateData = await getTemplateConfig(TemplateType.ARTICLE, slug, 'published');

  if (!templateData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Article Template Not Configured</h1>
          <p className="text-muted-foreground mt-2">
            Please set up an article template in the editor.
          </p>
          <a
            href={`/editor?mode=template&type=article`}
            className="bg-primary text-primary-foreground mt-4 inline-block rounded-md px-4 py-2"
          >
            Configure Template
          </a>
        </div>
      </div>
    );
  }

  return <Render config={config} data={templateData} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  return {
    title: slug,
  };
}
