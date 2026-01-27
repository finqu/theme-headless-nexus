import type { Product, ProductVariant } from '@finqu/storefront-types';
import type { ProductListItem } from '@/lib/types';

/**
 * Product image and variant utilities
 */

/**
 * Gets the product image URL from a product or product list item
 * @param product - Product or ProductListItem
 * @returns Image URL string or undefined
 */
export function getProductImageUrl(
  product: Product | ProductListItem
): string | undefined {
  const variant = product.defaultOrSelectedVariant;
  const url = variant?.featuredImage?.url || variant?.image?.url;
  return url || undefined;
}

/**
 * Gets the full product image object (with URL and alt text) from a product or product list item
 * @param product - Product or ProductListItem
 * @returns Image object with url and alt, or undefined
 */
export function getProductImage(
  product: Product | ProductListItem
): { url: string; alt?: string | null } | undefined {
  const variant = product.defaultOrSelectedVariant;
  const image = variant?.featuredImage || product.featuredImage;
  if (!image?.url) return undefined;
  return { url: image.url, alt: image.alt };
}

/**
 * Gets the image object from a product variant
 * @param variant - ProductVariant
 * @returns Image object with url and alt, or undefined
 */
export function getVariantImage(
  variant: ProductVariant | null | undefined
): { url: string; alt?: string | null } | undefined {
  if (!variant) return undefined;
  const image = variant.featuredImage || variant.image;
  if (!image?.url) return undefined;
  return { url: image.url, alt: image.alt };
}
