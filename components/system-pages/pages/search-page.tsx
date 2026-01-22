'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, ChevronRight, Home } from 'lucide-react';
import type { Product } from '@finqu/storefront-types';
import { useLocale } from '@/lib/locale-context';
import { ProductGrid } from '@/components/product-grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { fetchProducts } from '@/blocks/product-grid/shared';

interface SearchPageProps {
  locale: string;
}

/**
 * Search page component.
 * Fetches and displays search results based on URL query parameter.
 */
export function SearchPage({ locale: serverLocale }: SearchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocale();
  const activeLocale = locale || serverLocale;

  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch results when query param changes
  useEffect(() => {
    if (!queryParam.trim()) {
      setResults([]);
      setHasSearched(false);
      setTotalCount(0);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const products = await fetchProducts({
          query: queryParam.trim(),
          first: 24,
        });
        setResults(products);
        setTotalCount(products.length);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [queryParam, activeLocale]);

  // Sync input with URL param
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  const hrefForProduct = useCallback(
    (product: Product) => (product.handle ? `/products/${product.handle}` : undefined),
    []
  );

  return (
    <div className="min-h-[60vh] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Search</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {queryParam ? `Search results for "${queryParam}"` : 'Search'}
          </h1>
          {hasSearched && !isLoading && (
            <p className="mt-2 text-sm text-gray-500">
              {totalCount} {totalCount === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              name="q"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-6 pl-12 pr-24 text-base"
            />
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" size="sm">
              Search
            </Button>
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <Skeleton className="aspect-3/4 w-full" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try searching for something else or check your spelling.
            </p>
          </div>
        ) : results.length > 0 ? (
          <ProductGrid
            products={results}
            columns={4}
            showPrice
            showDescription={false}
            hrefForProduct={hrefForProduct}
          />
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">What are you looking for?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Enter a search term above to find products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
