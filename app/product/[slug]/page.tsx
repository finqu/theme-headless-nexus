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
 * Product page renderer
 * Uses the product template (with per-slug override support)
 * and fetches product data from the Storefront API
 */
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Get the Puck template config (checks for slug override, falls back to default)
  const templateData = await getTemplateConfig(TemplateType.PRODUCT, slug, 'published');

  if (!templateData) {
    // No template configured - you might want to render a default layout
    // or show a message that the template needs to be set up
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product Template Not Configured</h1>
            <p className="text-muted-foreground mt-2">
              Please set up a product template in the editor.
            </p>
            <a
              href={`/editor?mode=template&type=product`}
              className="bg-primary text-primary-foreground mt-4 inline-block rounded-md px-4 py-2"
            >
              Configure Template
            </a>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // TODO: Fetch product data from Storefront API
  // const product = await storefrontServer.getProduct({ handle: slug });
  //
  // For now, pass slug as context that components can use
  // In a real implementation, you'd pass product data to Puck components

  return (
    <SiteLayout>
      <Render config={config} data={templateData} />
    </SiteLayout>
  );
}

/**
 * Generate metadata from product data
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  // TODO: Fetch product for metadata
  // const product = await storefrontServer.getProduct({ handle: slug });

  return {
    title: slug, // Replace with product.title
  };
}
