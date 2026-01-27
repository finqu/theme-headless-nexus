'use client';

import { useState, useCallback } from 'react';
import type { ProductListItem } from '@/lib/types';
import { ProductGrid } from '@/components/product/product-grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProducts } from '@/blocks/product-grid/shared';

interface SortOption {
  label: string;
  value: string;
  sortKey?: string;
  reverse?: boolean;
}

interface ProductsCatalogClientProps {
  initialProducts: ProductListItem[];
  totalCount: number;
  hasNextPage: boolean;
  endCursor?: string;
  sortOptions: SortOption[];
  pageTitle: string;
  categoryHandle?: string;
  productsPerPage: number;
  locale: string;
}

export function ProductsCatalogClient({
  initialProducts,
  totalCount,
  hasNextPage: initialHasNextPage,
  endCursor: initialEndCursor,
  sortOptions,
  pageTitle,
  categoryHandle,
  productsPerPage,
  locale,
}: ProductsCatalogClientProps) {
  const [products, setProducts] = useState<ProductListItem[]>(initialProducts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [sortValue, setSortValue] = useState('featured');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Handle sort change
  const handleSortChange = useCallback(
    async (value: string) => {
      setSortValue(value);
      setIsLoading(true);

      try {
        // In a real implementation, you'd pass sortKey and reverse to the query
        // For now, we'll just refetch and rely on the API default sorting
        const newProducts = await fetchProducts({
          first: productsPerPage,
        });
        setProducts(newProducts);
        setHasNextPage(newProducts.length >= productsPerPage);
        setEndCursor(undefined);
      } catch (error) {
        console.error('Failed to sort products:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [productsPerPage]
  );

  return (
    <>
      {/* Header with title and sort */}
      <div className="px-4 py-6 @sm:px-6">
        <div className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 @sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by
            </label>
            <Select value={sortValue} onValueChange={handleSortChange}>
              <SelectTrigger id="sort" className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div>
          <ProductGridSkeleton count={productsPerPage} />
        </div>
      ) : products.length === 0 ? (
        <div className="p-12">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} columns={4} showPrice showDescription={false} />
      )}
    </>
  );
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Skeleton className="aspect-3/4 w-full" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
