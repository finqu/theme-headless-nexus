import { notFound } from 'next/navigation';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getPageConfig, getTemplateConfig } from '@/lib/puck/storage';
import { getResourceByPath, type ResourceKind } from '@/lib/resource-resolver';
import { getTemplateTypeForResource } from '@/lib/template-types';
import { getLocale, getPathname } from '@/lib/locale';
import { SiteLayout } from '@/components/layout';
import { renderTemplate } from '@/templates';
import { getProductGroupById } from '@/lib/product-group';

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Dynamic page renderer using Finqu's resourceByPath API.
 *
 * This component handles all URL routing by:
 * 1. Reading locale and original pathname from middleware headers
 * 2. Resolving the URL path to a resource type and ID via resourceByPath
 * 3. Routing to the appropriate renderer based on resource type:
 *    - Templatable resources (product, category, page, etc.) -> Puck templates
 *    - System pages (login, cart, account, etc.) -> Dedicated components
 *    - NOT_FOUND -> 404 page
 *
 * The resourceByPath results are aggressively cached (1 hour) since URL mappings
 * rarely change. This enables fast, locale-aware routing without repeated API calls.
 *
 * Examples:
 * - /en/products/shirt -> x-pathname: /en/products/shirt, x-locale: en
 * - /tuotteet/paita -> x-pathname: /tuotteet/paita, x-locale: fi (default)
 */
export default async function DynamicPage({ params, searchParams }: PageProps) {
  const slug = '/' + (await params).slug.join('/');
  // Get locale and original path from middleware headers
  const [locale, path] = await Promise.all([getLocale(), getPathname()]);

  // Extract variant query parameter and append to path for resource lookup
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const variantParam = resolvedSearchParams?.v;
  const pathWithVariant =
    variantParam && typeof variantParam === 'string'
      ? `${slug}?v=${variantParam}`
      : variantParam && Array.isArray(variantParam) && variantParam[0]
        ? `${slug}?v=${variantParam[0]}`
        : slug;

  // Resolve path to resource type, ID, and alternates
  const resource = await getResourceByPath(pathWithVariant, locale);

  // Handle not found or failed resolution
  if (!resource || resource.type === 'NOT_FOUND') {
    notFound();
  }

  // Check if this resource type uses Puck templates
  const templateType = getTemplateTypeForResource(resource.type);

  if (templateType === 'page' && resource.id) {
    const data = await getPageConfig(resource.id, 'published');
    if (data) {
      return (
        <SiteLayout locale={locale} alternates={resource.alternates}>
          <Render config={config} data={data} />
        </SiteLayout>
      );
    }
  } else if (templateType && resource.id) {
    // Templatable resource with ID - use Puck template system
    // Try slug-specific override first, then fall back to default template
    const data = await getTemplateConfig(templateType, resource.id, 'published');

    if (data) {
      return (
        <SiteLayout locale={locale} alternates={resource.alternates}>
          <Render config={config} data={data} />
        </SiteLayout>
      );
    }
  }

  // Handle as system page (login, cart, account, etc.)
  // Or templatable resource without custom template yet
  // Parse ID to number if present (API returns IDs as strings, SDK expects numbers)
  const numericId = resource.id ? parseInt(resource.id, 10) : undefined;

  return (
    <SiteLayout locale={locale} alternates={resource.alternates}>
      {renderTemplate(resource.type, {
        locale,
        id: numericId,
        searchParams: resolvedSearchParams,
      })}
    </SiteLayout>
  );
}

/**
 * Generate metadata for the page based on resource type
 */
export async function generateMetadata({ params }: PageProps) {
  // Await params for Next.js 15+ compatibility
  const { slug } = await params;
  // Get locale and original path from middleware headers
  const [locale, path] = await Promise.all([getLocale(), getPathname()]);

  // Resolve path to resource type and ID
  const resource = await getResourceByPath(path, locale);

  if (!resource || resource.type === 'NOT_FOUND') {
    return {};
  }

  const title = getPageTitle(resource.type, path);

  // Build hreflang alternate links from resource alternates
  const alternates: Record<string, string> = {};
  if (resource.alternates) {
    for (const alt of resource.alternates) {
      // Use hreflang as key (e.g., 'en', 'fi', 'x-default')
      alternates[alt.hreflang] = alt.url;
    }
  }

  const templateType = getTemplateTypeForResource(resource.type);
  const groupId =
    resource.type === 'PRODUCT_GROUP' && resource.id ? parseInt(resource.id, 10) : Number.NaN;
  const groupPromise = !Number.isNaN(groupId)
    ? getProductGroupById(groupId, locale).catch(() => null)
    : null;

  if (templateType && resource.id) {
    const data = await getTemplateConfig(templateType, resource.id, 'published');

    if (data) {
      const puckTitle = (data.root?.props as Record<string, unknown>)?.title as string;
      if (puckTitle) {
        return {
          title: puckTitle,
          alternates: { languages: alternates },
        };
      }
    }
  }

  if (groupPromise) {
    const group = await groupPromise;
    if (group) {
      return {
        title: group.seoTitle || group.title || title,
        description: group.seoDescription || undefined,
        keywords: group.seoKeywords || undefined,
        alternates: { languages: alternates },
      };
    }
  }

  return {
    title,
    alternates: { languages: alternates },
  };
}

/**
 * Generate a default page title based on resource type
 */
function getPageTitle(type: ResourceKind, path: string): string {
  const titles: Partial<Record<ResourceKind, string>> = {
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    REGISTER: 'Register',
    ACCOUNT: 'My Account',
    ACCOUNT_EDIT: 'Edit Account',
    ACCOUNT_ORDERS: 'My Orders',
    ACCOUNT_WISHLIST: 'Wishlist',
    CHANGE_PASSWORD: 'Change Password',
    RECOVER_PASSWORD: 'Recover Password',
    RESET_PASSWORD: 'Reset Password',
    CART: 'Shopping Cart',
    CHECKOUT: 'Checkout',
    SEARCH: 'Search',
    BLOG: 'Blog',
    PRODUCTS: 'Products',
    PRODUCT_GROUP: 'Category',
    PRIVACY_POLICY: 'Privacy Policy',
    SHIPPING_POLICY: 'Shipping Policy',
    REFUND_POLICY: 'Refund Policy',
    TERMS_AND_CONDITIONS: 'Terms and Conditions',
  };

  return titles[type] || path.split('/').pop() || 'Page';
}
