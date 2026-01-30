import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, GradientBorder } from '@/components/shared';
import type { ProductGridColumns } from '@/components/product/product-grid';

interface ProductGridSkeletonProps {
  title?: string;
  headerLink?: {
    href: string;
    label: string;
  };
  columns?: ProductGridColumns;
  count?: number;
  isEmpty?: boolean;
  gradientBorderTop?: boolean;
  gradientBorderAfterHeader?: boolean;
  gradientBorderBottom?: boolean;
}

const gridCols: Record<ProductGridColumns, string> = {
  2: 'grid-cols-1 @xl:grid-cols-2',
  3: 'grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3',
  4: 'grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-4',
};

/**
 * Skeleton loading state for ProductGrid.
 * Shows placeholder cards while products are being fetched.
 */
export function ProductGridSkeleton({
  title,
  headerLink,
  columns = 3,
  count = 3,
  isEmpty = false,
  gradientBorderTop = false,
  gradientBorderAfterHeader = false,
  gradientBorderBottom = false,
}: ProductGridSkeletonProps) {
  const headerContent = (title || headerLink) && (
    <div className="relative grid grid-cols-[1fr_auto] items-center gap-4 border-b px-4 py-4 @sm:px-6">
      {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
      {headerLink && (
        <Link href={headerLink.href} className="font-mono text-sm hover:underline">
          {headerLink.label}
        </Link>
      )}
      {gradientBorderAfterHeader && <GradientBorder position="bottom" />}
    </div>
  );

  if (isEmpty) {
    return (
      <section className="@container relative w-full">
        {gradientBorderTop && <GradientBorder position="top" />}
        {headerContent}
        <div className="border-b p-12">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
            <EmptyState
              title="No products selected. Click to select products from your store."
              className="text-gray-500"
            />
          </div>
        </div>
        {gradientBorderBottom && <GradientBorder position="bottom" />}
      </section>
    );
  }

  return (
    <section className="@container relative w-full">
      {gradientBorderTop && <GradientBorder position="top" />}
      {headerContent}
      <div className={`grid border-b ${gridCols[columns]}`}>
        {Array.from({ length: count }).map((_, i) => {
          const totalItems = count;
          const itemsInLastRow = totalItems % columns || columns;
          const isLastRow = i >= totalItems - itemsInLastRow;
          const isLastItem = i === totalItems - 1;

          // Determine if this is the last item in its row at different breakpoints
          const isLastInRowXl = (i + 1) % 2 === 0; // 2 cols at @xl breakpoint
          const isLastInRow4xl = (i + 1) % columns === 0; // Last in row at @4xl breakpoint

          // Build border classes
          // All items get border-r by default
          const borderClasses = [
            'border-r',
            !isLastRow && 'border-b',
            // At @xl breakpoint (2 cols), remove border-r from every 2nd item
            isLastInRowXl && '@xl:border-r-0',
            // At @4xl breakpoint, we need to override @xl for items that should have borders
            // For 3 columns: items 1,2 should have border-r, item 3 should not
            // So if it's the 2nd item (isLastInRowXl), restore border-r at @4xl unless it's also last in row
            columns === 3 && isLastInRowXl && !isLastInRow4xl && '@4xl:border-r',
            // For 3 columns: remove border-r from 3rd, 6th, etc.
            columns === 3 && isLastInRow4xl && '@4xl:border-r-0',
            // For 4 columns: items 1,2,3 should have border-r, item 4 should not
            // So if it's the 2nd item, restore border-r at @4xl
            columns === 4 && isLastInRowXl && !isLastInRow4xl && '@4xl:border-r',
            // For 4 columns: remove border-r from 4th, 8th, etc.
            columns === 4 && isLastInRow4xl && '@4xl:border-r-0',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={i} className={borderClasses}>
              <ProductCardSkeleton />
            </div>
          );
        })}
      </div>
      {gradientBorderBottom && <GradientBorder position="bottom" />}
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <Skeleton className="aspect-square w-full @xl:aspect-3/4" />
      <div className="grid gap-6 p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="mt-auto space-y-1">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
