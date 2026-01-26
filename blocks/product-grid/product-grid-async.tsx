import { ProductGrid, type ProductGridColumns } from '@/components/product/product-grid';
import { fetchProductsByIds } from './shared';

interface ProductGridAsyncProps {
  title?: string;
  productIds: number[];
  columns?: ProductGridColumns;
  showPrice?: boolean;
  showDescription?: boolean;
}

/**
 * Async server component that fetches products and renders the grid.
 * Used with Suspense to allow streaming - the page shell renders immediately
 * while this component fetches product data.
 */
export async function ProductGridAsync({
  title,
  productIds,
  columns,
  showPrice,
  showDescription,
}: ProductGridAsyncProps) {
  const products = await fetchProductsByIds(productIds);

  return (
    <ProductGrid
      title={title}
      products={products}
      columns={columns}
      showPrice={showPrice}
      showDescription={showDescription}
    />
  );
}
