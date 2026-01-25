import type { ResourceKind } from '@/lib/resource-resolver';

interface PlaceholderTemplateProps {
  type: ResourceKind;
  id?: number;
  title?: string;
  message?: string;
  templateType?: string;
  showEditorLink?: boolean;
}

/**
 * Generic placeholder template for pages that haven't been fully implemented yet.
 * Shows the page type and provides helpful information for development.
 */
export function PlaceholderTemplate({
  type,
  id,
  title,
  message,
  templateType,
  showEditorLink,
}: PlaceholderTemplateProps) {
  const displayTitle = title || formatResourceKind(type);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <div className="mb-4 text-6xl text-gray-300">{getIconForType(type)}</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{displayTitle}</h1>
        {id && <p className="mb-2 text-sm text-gray-500">ID: {id}</p>}
        {message && <p className="mb-6 text-gray-600">{message}</p>}
        {!message && (
          <p className="mb-6 text-gray-600">This page is coming soon. Check back later!</p>
        )}
        {showEditorLink && templateType && (
          <a
            href={`/editor?mode=template&type=${templateType}${id ? `&slug=${id}` : ''}`}
            className="bg-primary text-primary-foreground inline-block rounded-md px-6 py-3 hover:opacity-90"
          >
            Create Template
          </a>
        )}
        {showEditorLink && !templateType && type && (
          <a
            href={`/editor?mode=template&type=${type.toLowerCase().replace('_', '-')}${id ? `&slug=${id}` : ''}`}
            className="bg-primary text-primary-foreground inline-block rounded-md px-6 py-3 hover:opacity-90"
          >
            Create Template
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Format resource type for display
 */
function formatResourceKind(type: ResourceKind): string {
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get an emoji icon for the resource type
 */
function getIconForType(type: ResourceKind): string {
  const icons: Partial<Record<ResourceKind, string>> = {
    LOGIN: '🔐',
    LOGOUT: '👋',
    REGISTER: '📝',
    ACCOUNT: '👤',
    ACCOUNT_EDIT: '✏️',
    ACCOUNT_ORDERS: '📦',
    ACCOUNT_WISHLIST: '❤️',
    CHANGE_PASSWORD: '🔑',
    RECOVER_PASSWORD: '📧',
    RESET_PASSWORD: '🔄',
    CART: '🛒',
    CHECKOUT: '💳',
    SEARCH: '🔍',
    BLOG: '📰',
    PRODUCTS: '🛍️',
    PRODUCT: '📦',
    PRODUCT_GROUP: '📁',
    PAGE: '📄',
    ARTICLE: '📰',
    MANUFACTURER: '🏭',
    PRIVACY_POLICY: '🔒',
    SHIPPING_POLICY: '🚚',
    REFUND_POLICY: '💰',
    TERMS_AND_CONDITIONS: '📋',
    HOME: '🏠',
    NOT_FOUND: '❓',
  };

  return icons[type] || '📄';
}
