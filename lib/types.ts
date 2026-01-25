import type { Product } from '@finqu/storefront-types';

/**
 * Minimal product data needed for product listing cards.
 * Based on Product type but only includes fields used in grid/list views.
 */
export type ProductListItem = Pick<
  Product,
  | 'id'
  | 'handle'
  | 'title'
  | 'shortDescription'
  | 'featuredImage'
  | 'defaultOrSelectedVariant'
  | 'variants'
  | 'isAvailable'
>;

/**
 * Minimal variant data for listing display (price, image, URL).
 */
export type ProductListVariant = Pick<
  NonNullable<Product['defaultOrSelectedVariant']>,
  'price' | 'originalPrice' | 'url' | 'featuredImage' | 'image'
>;
