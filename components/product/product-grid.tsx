import Link from 'next/link';
import type { ProductListItem } from '@/lib/types';
import { ProductListCard } from '@/components/product/product-list-card';
import { EmptyState, GradientBorder } from '@/components/shared';

export type ProductGridColumns = 2 | 3 | 4;

export interface ProductGridViewProps {
  title?: string;
  headerLink?: {
    href: string;
    label: string;
  };
  products?: ProductListItem[];
  columns?: ProductGridColumns;
  showPrice?: boolean;
  showDescription?: boolean;
  emptyMessage?: string;
  /** Show gradient border at the top of the section */
  gradientBorderTop?: boolean;
  /** Show gradient border after the header */
  gradientBorderAfterHeader?: boolean;
  /** Show gradient border at the bottom of the section */
  gradientBorderBottom?: boolean;
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
  2: 'grid-cols-1 @xl:grid-cols-2',
  3: 'grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3',
  4: 'grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-4',
};

export function ProductGrid({
  title,
  headerLink,
  products,
  columns = productGridDefaultProps.columns,
  showPrice = productGridDefaultProps.showPrice,
  showDescription = productGridDefaultProps.showDescription,
  emptyMessage = 'No products selected. Click to select products from your store.',
  gradientBorderTop = false,
  gradientBorderAfterHeader = false,
  gradientBorderBottom = false,
}: ProductGridViewProps) {
  const headerContent = (title || headerLink) && (
    <div className="relative grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 @sm:px-6">
      {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
      {headerLink && (
        <Link href={headerLink.href} className="font-mono text-sm hover:underline">
          {headerLink.label}
        </Link>
      )}
      {gradientBorderAfterHeader && <GradientBorder position="bottom" />}
    </div>
  );

  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <section className="@container relative w-full">
        {gradientBorderTop && <GradientBorder position="top" />}
        {headerContent}
        <div className="p-12">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
            <EmptyState title={emptyMessage} className="text-gray-500" />
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
      <div className={`grid ${gridCols[columns]}`}>
        {products.map((product, index) => {
          const totalItems = products.length;
          const itemsInLastRow = totalItems % columns || columns;
          const isLastRow = index >= totalItems - itemsInLastRow;
          const isLastItem = index === totalItems - 1;

          // Determine if this is the last item in its row at different breakpoints
          const isLastInRowXl = (index + 1) % 2 === 0; // 2 cols at @xl breakpoint
          const isLastInRow4xl = (index + 1) % columns === 0; // Last in row at @4xl breakpoint

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
            <div key={product.id} className={borderClasses}>
              <ProductListCard
                product={product}
                showPrice={showPrice}
                showDescription={showDescription}
              />
            </div>
          );
        })}
      </div>
      {gradientBorderBottom && <GradientBorder position="bottom" />}
    </section>
  );
}
