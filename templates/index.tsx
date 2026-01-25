import type { ResourceType } from '@/lib/resource-resolver';
import { PlaceholderTemplate } from './placeholder-template';
import { LoginTemplate } from './login-template';
import { RegisterTemplate } from './register-template';
import { AccountTemplate } from './account-template';
import { CartTemplate } from './cart-template';
import { SearchTemplate } from './search-template';
import { ProductsTemplate } from './products-template';
import { PolicyTemplate } from './policy-template';
import { ProductTemplate } from './product-template';

// Re-export individual templates
export { PlaceholderTemplate } from './placeholder-template';
export { LoginTemplate } from './login-template';
export { RegisterTemplate } from './register-template';
export { AccountTemplate } from './account-template';
export { CartTemplate } from './cart-template';
export { SearchTemplate } from './search-template';
export { ProductsTemplate } from './products-template';
export { PolicyTemplate } from './policy-template';
export { ProductTemplate } from './product-template';

/**
 * Props passed to template renderers.
 * Templates pick what they need from these common props.
 */
export interface TemplateProps {
  locale: string;
  id?: number;
  searchParams?: Record<string, string | string[] | undefined>;
}

type TemplateRenderer = (props: TemplateProps) => React.ReactNode;

/**
 * Registry mapping ResourceType to template renderers.
 *
 * Each renderer receives common TemplateProps and returns the appropriate
 * template component with the props it needs.
 */
const templateRegistry: Partial<Record<ResourceType, TemplateRenderer>> = {
  // Authentication templates
  LOGIN: ({ locale }) => <LoginTemplate locale={locale} />,
  LOGOUT: () => <PlaceholderTemplate type="LOGOUT" message="Logging out..." />,
  REGISTER: ({ locale }) => <RegisterTemplate locale={locale} />,
  RECOVER_PASSWORD: () => (
    <PlaceholderTemplate type="RECOVER_PASSWORD" title="Recover Password" />
  ),
  RESET_PASSWORD: () => <PlaceholderTemplate type="RESET_PASSWORD" title="Reset Password" />,
  CHANGE_PASSWORD: () => <PlaceholderTemplate type="CHANGE_PASSWORD" title="Change Password" />,

  // Account templates
  ACCOUNT: ({ locale }) => <AccountTemplate locale={locale} section="dashboard" />,
  ACCOUNT_EDIT: ({ locale }) => <AccountTemplate locale={locale} section="edit" />,
  ACCOUNT_ORDERS: ({ locale }) => <AccountTemplate locale={locale} section="orders" />,
  ACCOUNT_WISHLIST: ({ locale }) => <AccountTemplate locale={locale} section="wishlist" />,

  // Shopping templates
  CART: ({ locale }) => <CartTemplate locale={locale} />,
  CHECKOUT: () => (
    <PlaceholderTemplate
      type="CHECKOUT"
      title="Checkout"
      message="Checkout is handled externally."
    />
  ),

  // Discovery templates
  SEARCH: ({ locale }) => <SearchTemplate locale={locale} />,
  BLOG: () => <PlaceholderTemplate type="BLOG" title="Blog" templateType="blog" />,
  PRODUCTS: ({ locale, searchParams }) => (
    <ProductsTemplate locale={locale} searchParams={searchParams} />
  ),

  // Policy templates
  PRIVACY_POLICY: ({ locale }) => <PolicyTemplate type="privacy" locale={locale} />,
  SHIPPING_POLICY: ({ locale }) => <PolicyTemplate type="shipping" locale={locale} />,
  REFUND_POLICY: ({ locale }) => <PolicyTemplate type="refund" locale={locale} />,
  TERMS_AND_CONDITIONS: ({ locale }) => <PolicyTemplate type="terms" locale={locale} />,

  // Templatable resources
  PRODUCT: ({ id, locale }) =>
    id != null ? (
      <ProductTemplate id={id} locale={locale} />
    ) : (
      <PlaceholderTemplate type="PRODUCT" message="Product ID is missing." />
    ),
  PRODUCT_GROUP: ({ id }) => (
    <PlaceholderTemplate
      type="PRODUCT_GROUP"
      id={id}
      message="No template configured for this product group."
      showEditorLink
    />
  ),
  PAGE: ({ id }) => (
    <PlaceholderTemplate
      type="PAGE"
      id={id}
      message="No template configured for this page."
      showEditorLink
    />
  ),
  ARTICLE: ({ id }) => (
    <PlaceholderTemplate
      type="ARTICLE"
      id={id}
      message="No template configured for this article."
      showEditorLink
    />
  ),
  MANUFACTURER: ({ id }) => (
    <PlaceholderTemplate
      type="MANUFACTURER"
      id={id}
      message="No template configured for this manufacturer."
      showEditorLink
    />
  ),

  // Home should be handled by app/page.tsx, not here
  HOME: () => <PlaceholderTemplate type="HOME" title="Home" />,
};

/**
 * Render the appropriate template for a given resource type.
 *
 * This replaces the SystemPage component with a simpler function-based approach.
 * Templates are looked up from the registry and rendered with the provided props.
 *
 * @param type - The resource type to render
 * @param props - Common props passed to all templates
 * @returns The rendered template, or a placeholder for unknown types
 */
export function renderTemplate(type: ResourceType, props: TemplateProps): React.ReactNode {
  const renderer = templateRegistry[type];
  if (renderer) {
    return renderer(props);
  }
  return <PlaceholderTemplate type={type} title="Page Not Found" />;
}
