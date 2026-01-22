import type { ResourceType } from '@/lib/resource-resolver';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';
import { AccountPage } from './pages/account-page';
import { CartPage } from './pages/cart-page';
import { SearchPage } from './pages/search-page';
import { ProductsPage } from './pages/products-page';
import { PolicyPage } from './pages/policy-page';
import { PlaceholderPage } from './pages/placeholder-page';
import { ProductPage } from './pages/product-page';

export interface SystemPageProps {
  type: ResourceType;
  id?: number;
  locale: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * System page router component.
 *
 * Routes to the appropriate system page component based on ResourceType.
 * System pages are pages that don't use the Puck template system,
 * such as login, cart, account pages, etc.
 *
 * For resource types that should have templates but don't yet,
 * a placeholder is shown with a link to create the template.
 */
export function SystemPage({ type, id, locale, searchParams }: SystemPageProps) {
  switch (type) {
    // Authentication pages
    case 'LOGIN':
      return <LoginPage locale={locale} />;
    case 'LOGOUT':
      // Logout is typically handled by middleware/API, not a page
      return <PlaceholderPage type={type} message="Logging out..." />;
    case 'REGISTER':
      return <RegisterPage locale={locale} />;
    case 'RECOVER_PASSWORD':
      return <PlaceholderPage type={type} title="Recover Password" />;
    case 'RESET_PASSWORD':
      return <PlaceholderPage type={type} title="Reset Password" />;
    case 'CHANGE_PASSWORD':
      return <PlaceholderPage type={type} title="Change Password" />;

    // Account pages
    case 'ACCOUNT':
      return <AccountPage locale={locale} section="dashboard" />;
    case 'ACCOUNT_EDIT':
      return <AccountPage locale={locale} section="edit" />;
    case 'ACCOUNT_ORDERS':
      return <AccountPage locale={locale} section="orders" />;
    case 'ACCOUNT_WISHLIST':
      return <AccountPage locale={locale} section="wishlist" />;

    // Shopping pages
    case 'CART':
      return <CartPage locale={locale} />;
    case 'CHECKOUT':
      return (
        <PlaceholderPage type={type} title="Checkout" message="Checkout is handled externally." />
      );

    // Discovery pages
    case 'SEARCH':
      return <SearchPage locale={locale} />;
    case 'BLOG':
      return <PlaceholderPage type={type} title="Blog" templateType="blog" />;
    case 'PRODUCTS':
      return <ProductsPage locale={locale} searchParams={searchParams} />;

    // Policy pages
    case 'PRIVACY_POLICY':
      return <PolicyPage type="privacy" locale={locale} />;
    case 'SHIPPING_POLICY':
      return <PolicyPage type="shipping" locale={locale} />;
    case 'REFUND_POLICY':
      return <PolicyPage type="refund" locale={locale} />;
    case 'TERMS_AND_CONDITIONS':
      return <PolicyPage type="terms" locale={locale} />;

    // Templatable resources without templates yet
    case 'PRODUCT':
      if (id == null) {
        return <PlaceholderPage type={type} message="Product ID is missing." />;
      }
      return <ProductPage id={id} locale={locale} />;
    case 'PRODUCT_GROUP':
    case 'PAGE':
    case 'ARTICLE':
    case 'MANUFACTURER':
      return (
        <PlaceholderPage
          type={type}
          id={id}
          message={`No template configured for this ${type.toLowerCase().replace('_', ' ')}.`}
          showEditorLink
        />
      );

    // Home should be handled by app/page.tsx, not here
    case 'HOME':
      return <PlaceholderPage type={type} title="Home" />;

    // Unknown or not found
    default:
      return <PlaceholderPage type={type} title="Page Not Found" />;
  }
}
