import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';
import { getTemplateConfig } from '@/lib/puck-storage';
import { getResourceByPath, type ResourceType } from '@/lib/resource-resolver';
import { getTemplateTypeForResource } from '@/lib/template-types';
import { getStoreInfo } from '@/lib/store-cache';
import { SiteLayout } from '@/components/layout';
import { SystemPage } from '@/components/system-pages';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Get locale from middleware headers.
 *
 * The middleware parses locale from URL (e.g., /en/products -> locale: en)
 * and rewrites the URL to strip the locale prefix (/en/products -> /products).
 * The detected locale is passed via the x-locale header.
 *
 * @returns The locale from middleware, or store's default locale as fallback
 */
async function getLocaleFromHeaders(): Promise<string> {
  const headersList = await headers();
  const localeHeader = headersList.get('x-locale');

  if (localeHeader) {
    return localeHeader;
  }

  // Fallback to store's default locale
  const storeInfo = await getStoreInfo();
  return storeInfo.defaultLocale;
}

/**
 * Dynamic page renderer using Finqu's resourceByPath API.
 *
 * This component handles all URL routing by:
 * 1. Reading locale from x-locale header (set by middleware)
 * 2. Middleware already strips locale prefix from URL, so slug is the path
 * 3. Resolving the URL path to a resource type and ID via resourceByPath
 * 4. Routing to the appropriate renderer based on resource type:
 *    - Templatable resources (product, category, page, etc.) -> Puck templates
 *    - System pages (login, cart, account, etc.) -> Dedicated components
 *    - NOT_FOUND -> 404 page
 *
 * The resourceByPath results are aggressively cached (1 hour) since URL mappings
 * rarely change. This enables fast, locale-aware routing without repeated API calls.
 *
 * Examples:
 * - /en/products/shirt -> middleware sets x-locale: en, slug: ['products', 'shirt']
 * - /tuotteet/paita -> middleware sets x-locale: fi (default), slug: ['tuotteet', 'paita']
 */
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Get locale from middleware header (middleware already parsed from URL)
  const locale = await getLocaleFromHeaders();
  // Build path from slug (locale prefix already stripped by middleware)
  const path = '/' + slug.join('/');

  // Resolve path to resource type and ID
  const resource = await getResourceByPath(path, locale);

  // Handle not found or failed resolution
  if (!resource || resource.type === 'NOT_FOUND') {
    notFound();
  }

  // Check if this resource type uses Puck templates
  const templateType = getTemplateTypeForResource(resource.type);

  if (templateType && resource.id) {
    // Templatable resource with ID - use Puck template system
    // Try slug-specific override first, then fall back to default template
    const data = await getTemplateConfig(templateType, resource.id, 'published');

    if (!data) {
      // No template configured - show placeholder or notFound
      // For now, fall through to system page handler which will show a placeholder
    } else {
      return (
        <SiteLayout locale={locale}>
          <Render config={config} data={data} />
        </SiteLayout>
      );
    }
  }

  // Handle as system page (login, cart, account, etc.)
  // Or templatable resource without custom template yet
  return (
    <SiteLayout locale={locale}>
      <SystemPage
        type={resource.type}
        id={resource.id ?? undefined}
        locale={locale}
      />
    </SiteLayout>
  );
}

/**
 * Generate metadata for the page based on resource type
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  // Get locale from middleware header
  const locale = await getLocaleFromHeaders();
  // Build path from slug (locale prefix already stripped by middleware)
  const path = '/' + slug.join('/');

  // Resolve path to resource type and ID
  const resource = await getResourceByPath(path, locale);

  if (!resource || resource.type === 'NOT_FOUND') {
    return {};
  }

  // Generate title based on resource type
  const title = getPageTitle(resource.type, path);

  // Check for Puck template with custom metadata
  const templateType = getTemplateTypeForResource(resource.type);

  if (templateType && resource.id) {
    const data = await getTemplateConfig(templateType, resource.id, 'published');

    if (data) {
      const puckTitle = (data.root?.props as Record<string, unknown>)?.title as string;
      if (puckTitle) {
        return { title: puckTitle };
      }
    }
  }

  return { title };
}

/**
 * Generate a default page title based on resource type
 */
function getPageTitle(type: ResourceType, path: string): string {
  const titles: Partial<Record<ResourceType, string>> = {
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
    PRIVACY_POLICY: 'Privacy Policy',
    SHIPPING_POLICY: 'Shipping Policy',
    REFUND_POLICY: 'Refund Policy',
    TERMS_AND_CONDITIONS: 'Terms and Conditions',
  };

  return titles[type] || path.split('/').pop() || 'Page';
}
