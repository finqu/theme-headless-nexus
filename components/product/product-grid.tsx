import type { ProductListItem } from '@/lib/types';
import { ProductListCard } from '@/components/product/product-list-card';
import { EmptyState } from '@/components/shared';

export type ProductGridColumns = 2 | 3 | 4;

export interface ProductGridViewProps {
  title?: string;
  products?: ProductListItem[];
  columns?: ProductGridColumns;
  showPrice?: boolean;
  showDescription?: boolean;
  emptyMessage?: string;
}

export const productGridDefaultProps: Required<
  Pick<ProductGridViewProps, 'title' | 'columns' | 'showPrice' | 'showDescription'>
> = {
  title: 'Featured Products',
  columns: 3,
  showPrice: true,
  showDescription: false,
};

const gridCols: Record<ProductGridColumns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function ProductGrid({
  title,
  products,
  columns = productGridDefaultProps.columns,
  showPrice = productGridDefaultProps.showPrice,
  showDescription = productGridDefaultProps.showDescription,
  emptyMessage = 'No products selected. Click to select products from your store.',
}: ProductGridViewProps) {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          {title && <h2 className="mb-8 text-2xl font-bold">{title}</h2>}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
            <EmptyState
              title={emptyMessage}
              className="text-gray-500"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && <h2 className="mb-8 text-2xl font-bold tracking-tight">{title}</h2>}
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {products.map((product) => (
            <ProductListCard
              key={product.id}
              product={product}
              showPrice={showPrice}
              showDescription={showDescription}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
