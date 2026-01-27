import { ProductGrid, type ProductGridColumns } from '@/components/product/product-grid';
import { fetchProductsByIds } from './shared';

interface ProductGridAsyncProps {
  title?: string;
  headerLink?: {
    href: string;
    label: string;
  };
  productIds: number[];
  columns?: ProductGridColumns;
  showPrice?: boolean;
  showDescription?: boolean;
  gradientBorderTop?: boolean;
  gradientBorderAfterHeader?: boolean;
  gradientBorderBottom?: boolean;
}

/**
 * Async server component that fetches products and renders the grid.
 * Used with Suspense to allow streaming - the page shell renders immediately
 * while this component fetches product data.
 */
export async function ProductGridAsync({
  title,
  headerLink,
  productIds,
  columns,
  showPrice,
  showDescription,
  gradientBorderTop,
  gradientBorderAfterHeader,
  gradientBorderBottom,
}: ProductGridAsyncProps) {
  const products = await fetchProductsByIds(productIds);

  return (
    <ProductGrid
      title={title}
      headerLink={headerLink}
      products={products}
      columns={columns}
      showPrice={showPrice}
      showDescription={showDescription}
      gradientBorderTop={gradientBorderTop}
      gradientBorderAfterHeader={gradientBorderAfterHeader}
      gradientBorderBottom={gradientBorderBottom}
    />
  );
}
