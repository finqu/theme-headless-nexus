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
interface ProductGridProps extends Omit<ProductGridViewProps, 'products' | 'headerLink'> {
  /** Product IDs stored in Puck data (lightweight) */
  selectedProductIds?: number[];
  /** Header link href (for editor) */
  headerLinkHref?: string;
  /** Header link label (for editor) */
  headerLinkLabel?: string;
  /** Show gradient border at the top */
  gradientBorderTop?: boolean;
  /** Show gradient border after the header */
  gradientBorderAfterHeader?: boolean;
  /** Show gradient border at the bottom */
  gradientBorderBottom?: boolean;
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
    gradientBorderTop: false,
    gradientBorderAfterHeader: false,
    gradientBorderBottom: false,
  },
  render: ({
    title,
    headerLinkHref,
    headerLinkLabel,
    selectedProductIds,
    columns,
    showPrice,
    showDescription,
    gradientBorderTop,
    gradientBorderAfterHeader,
    gradientBorderBottom,
  }) => {
    const headerLink =
      headerLinkHref && headerLinkLabel
        ? { href: headerLinkHref, label: headerLinkLabel }
        : undefined;

    // No products selected - render empty state immediately
    if (!selectedProductIds || selectedProductIds.length === 0) {
      return (
        <ProductGridSkeleton
          title={title}
          headerLink={headerLink}
          columns={columns}
          isEmpty
          gradientBorderTop={gradientBorderTop}
          gradientBorderAfterHeader={gradientBorderAfterHeader}
          gradientBorderBottom={gradientBorderBottom}
        />
      );
    }

    return (
      <Suspense
        fallback={
          <ProductGridSkeleton
            title={title}
            headerLink={headerLink}
            columns={columns}
            count={selectedProductIds.length}
            gradientBorderTop={gradientBorderTop}
            gradientBorderAfterHeader={gradientBorderAfterHeader}
            gradientBorderBottom={gradientBorderBottom}
          />
        }
      >
        <ProductGridAsync
          title={title}
          headerLink={headerLink}
          productIds={selectedProductIds}
          columns={columns}
          showPrice={showPrice}
          showDescription={showDescription}
          gradientBorderTop={gradientBorderTop}
          gradientBorderAfterHeader={gradientBorderAfterHeader}
          gradientBorderBottom={gradientBorderBottom}
        />
      </Suspense>
    );
  },
};
