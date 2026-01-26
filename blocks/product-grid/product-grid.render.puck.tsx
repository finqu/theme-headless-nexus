import { Suspense } from 'react';
import type { ComponentConfig } from '@puckeditor/core';
import {
  productGridDefaultProps,
  type ProductGridViewProps,
  type ProductGridColumns,
} from '@/components/product/product-grid';
import { ProductGridAsync } from './product-grid-async';
import { ProductGridSkeleton } from './product-grid-skeleton';

/**
 * Props for the ProductGrid Puck component.
 * Stores product IDs for persistence; products are fetched at render time via Suspense.
 */
interface ProductGridProps extends Omit<ProductGridViewProps, 'products'> {
  /** Product IDs stored in Puck data (lightweight) */
  selectedProductIds?: number[];
}

/**
 * Component category for the Puck editor sidebar
 */
export const category = 'E-commerce';

/**
 * Puck component configuration (render-only version).
 * Uses Suspense to stream product data, allowing the page to respond faster.
 */
export const config: ComponentConfig<ProductGridProps> = {
  label: 'Product Grid',
  defaultProps: {
    ...productGridDefaultProps,
    selectedProductIds: [],
  },
  render: ({ title, selectedProductIds, columns, showPrice, showDescription }) => {
    // No products selected - render empty state immediately
    if (!selectedProductIds || selectedProductIds.length === 0) {
      return <ProductGridSkeleton title={title} columns={columns} isEmpty />;
    }

    return (
      <Suspense
        fallback={
          <ProductGridSkeleton title={title} columns={columns} count={selectedProductIds.length} />
        }
      >
        <ProductGridAsync
          title={title}
          productIds={selectedProductIds}
          columns={columns}
          showPrice={showPrice}
          showDescription={showDescription}
        />
      </Suspense>
    );
  },
};
