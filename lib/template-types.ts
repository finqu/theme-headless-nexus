/**
 * Supported template types for Puck editor
 * Each type represents a different entity that can have customized layouts
 */
export const TemplateType = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  ARTICLE: 'article',
  BLOG: 'blog',
  MANUFACTURER: 'manufacturer',
  PAGE: 'page',
  CART: 'cart',
  CATALOG: 'catalog',
  WISHLIST: 'wishlist',
} as const;

export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType];

/**
 * All valid template type values
 */
export const TEMPLATE_TYPES = Object.values(TemplateType);

/**
 * Check if a string is a valid template type
 */
export function isValidTemplateType(value: string): value is TemplateType {
  return TEMPLATE_TYPES.includes(value as TemplateType);
}

/**
 * Get template type from string with validation
 * @throws Error if the type is invalid
 */
export function parseTemplateType(value: string): TemplateType {
  if (!isValidTemplateType(value)) {
    throw new Error(
      `Invalid template type: "${value}". Valid types are: ${TEMPLATE_TYPES.join(', ')}`
    );
  }
  return value;
}

/**
 * Human-readable labels for template types
 */
export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  [TemplateType.PRODUCT]: 'Product',
  [TemplateType.CATEGORY]: 'Category',
  [TemplateType.ARTICLE]: 'Article',
  [TemplateType.BLOG]: 'Blog',
  [TemplateType.MANUFACTURER]: 'Manufacturer',
  [TemplateType.PAGE]: 'Page',
  [TemplateType.CART]: 'Cart',
  [TemplateType.CATALOG]: 'Catalog',
  [TemplateType.WISHLIST]: 'Wishlist',
};
