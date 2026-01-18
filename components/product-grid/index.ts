export { config as ProductGridEdit, category } from './product-grid.edit.puck';
export { config as ProductGridRender } from './product-grid.render.puck';
export { ProductGrid, productGridDefaultProps } from '../ui/product-grid';
export type { ProductGridViewProps, ProductGridColumns } from '../ui/product-grid';

// Shared utilities for product fetching
export {
  PRODUCTS_QUERY,
  fetchProducts,
  fetchProductsByIds,
  extractProductIds,
  getProductImageUrl,
} from './shared';