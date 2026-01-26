import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared';
import type { ProductGridColumns } from '@/components/product/product-grid';

interface ProductGridSkeletonProps {
  title?: string;
  columns?: ProductGridColumns;
  count?: number;
  isEmpty?: boolean;
}

const gridCols: Record<ProductGridColumns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Skeleton loading state for ProductGrid.
 * Shows placeholder cards while products are being fetched.
 */
export function ProductGridSkeleton({
  title,
  columns = 3,
  count = 3,
  isEmpty = false,
}: ProductGridSkeletonProps) {
  if (isEmpty) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          {title && <h2 className="mb-8 text-2xl font-bold">{title}</h2>}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
            <EmptyState
              title="No products selected. Click to select products from your store."
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
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
