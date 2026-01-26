export { config as ProductGridEdit, category } from './product-grid.edit.puck';
export { config as ProductGridRender } from './product-grid.render.puck';
export { ProductGrid, productGridDefaultProps } from '@/components/product/product-grid';
export type { ProductGridViewProps, ProductGridColumns } from '@/components/product/product-grid';

// Async and skeleton components for Suspense streaming
export { ProductGridAsync } from './product-grid-async';
export { ProductGridSkeleton } from './product-grid-skeleton';

// Shared utilities for product fetching
export {
  fetchProducts,
  fetchProductsByIds,
  extractProductIds,
  getProductImageUrl,
} from './shared';