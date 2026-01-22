import type { ComponentConfig } from '@puckeditor/core';
import type { Product } from '@finqu/storefront-types';
import {
  ProductGrid,
  productGridDefaultProps,
  type ProductGridViewProps,
} from '@/components/product-grid';
import { fetchProductsByIds } from './shared';

/**
 * Props for the ProductGrid Puck component.
 * Stores product IDs for persistence; full products are resolved at render time.
 */
interface ProductGridProps extends Omit<ProductGridViewProps, 'products'> {
  /** Product IDs stored in Puck data (lightweight) */
  selectedProductIds?: number[];
  /** Full product objects resolved from IDs (populated by resolveData) */
  selectedProducts?: Product[];
}

/**
 * Component category for the Puck editor sidebar
 */
export const category = 'E-commerce';

/**
 * Puck component configuration (render-only version).
 * Uses resolveData to fetch fresh product data from the API at render time.
 */
export const config: ComponentConfig<ProductGridProps> = {
  label: 'Product Grid',
  defaultProps: {
    ...productGridDefaultProps,
    selectedProductIds: [],
  },
  resolveData: async ({ props }) => {
    const { selectedProductIds, selectedProducts, ...rest } = props;

    // If we already have products (e.g., from edit mode), extract IDs and re-fetch fresh data
    const ids =
      selectedProductIds && selectedProductIds.length > 0
        ? selectedProductIds
        : selectedProducts?.map((p) => p.id).filter((id): id is number => id != null) || [];

    if (ids.length === 0) {
      return { props: { ...rest, selectedProductIds: [], selectedProducts: [] } };
    }

    // Fetch fresh product data from the API
    const freshProducts = await fetchProductsByIds(ids);

    return {
      props: {
        ...rest,
        selectedProductIds: ids,
        selectedProducts: freshProducts,
      },
    };
  },
  render: ({ title, selectedProducts, columns, showPrice, showDescription }) => (
    <ProductGrid
      title={title}
      products={selectedProducts}
      columns={columns}
      showPrice={showPrice}
      showDescription={showDescription}
      hrefForProduct={(product) => (product.handle ? `/product/${product.handle}` : undefined)}
    />
  ),
};
