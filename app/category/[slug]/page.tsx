import { notFound } from 'next/navigation';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getTemplateConfig } from '@/lib/puck-storage';
import { storefrontServer } from '@/lib/storefront';
import { TemplateType } from '@/lib/template-types';
import { SiteLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Category page renderer
 * Uses the category template (with per-slug override support)
 * and fetches category data from the Storefront API
 */
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Get the Puck template config (checks for slug override, falls back to default)
  const templateData = await getTemplateConfig(TemplateType.CATEGORY, slug, 'published');

  if (!templateData) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Category Template Not Configured</h1>
            <p className="text-muted-foreground mt-2">
              Please set up a category template in the editor.
            </p>
            <a
              href={`/editor?mode=template&type=category`}
              className="bg-primary text-primary-foreground mt-4 inline-block rounded-md px-4 py-2"
            >
              Configure Template
            </a>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // TODO: Fetch category data from Storefront API
  // const category = await storefrontServer.getCategory({ handle: slug });

  return (
    <SiteLayout>
      <Render config={config} data={templateData} />
    </SiteLayout>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  return {
    title: slug, // Replace with category.title
  };
}
