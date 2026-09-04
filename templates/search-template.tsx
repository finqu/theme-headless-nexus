import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Search } from 'lucide-react';
import {
  getCatalogProducts,
  type FinquServerClient,
  type GraphQLVariables,
  type ServerFetchOptions,
} from '@finqu/storefront-sdk/server';
import type { Product } from '@finqu/storefront-types';
import { ProductGrid } from '@/components/product/product-grid';
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
import { getDefaultLocale } from '@/lib/locale';
import { cachePresets, storefrontClient, withLocale } from '@/lib/storefront';

interface SearchTemplateProps {
  locale: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

const SEARCH_RESULTS_LIMIT = 24;
const SEARCH_SKELETON_ITEMS = Array.from({ length: 8 }, (_, index) => index);

function getSearchQuery(searchParams: SearchTemplateProps['searchParams']): string {
  const value = searchParams?.q;
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim() ?? '';
}

/**
 * The SDK helper does not expose server fetch options, so provide a thin
 * locale-aware client that applies the catalog cache preset to its query.
 */
function createSearchClient(locale: string): FinquServerClient {
  const defaultOptions = withLocale(locale, cachePresets.products);

  return {
    query<T = unknown>(
      document: string,
      variables?: GraphQLVariables,
      options?: ServerFetchOptions
    ) {
      return storefrontClient.query<T>(document, variables, options ?? defaultOptions);
    },
    mutate<T = unknown>(document: string, variables?: GraphQLVariables) {
      return storefrontClient.mutate<T>(document, variables);
    },
  };
}

/**
 * Server-rendered product search fallback.
 * The GET form keeps the current localized route while the result list streams in.
 */
export async function SearchTemplate({ locale, searchParams }: SearchTemplateProps) {
  const query = getSearchQuery(searchParams);
  const defaultLocale = await getDefaultLocale();
  const homeHref = locale.toLowerCase() === defaultLocale.toLowerCase() ? '/' : `/${locale}`;

  return (
    <div className="min-h-[60vh] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={homeHref} className="flex items-center">
                  <Home aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Search</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>
        </div>

        <form method="get" role="search" className="mb-10">
          <div className="relative mx-auto max-w-xl">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <Input
              id="product-search"
              type="search"
              name="q"
              placeholder="Search products..."
              defaultValue={query}
              className="py-6 pr-24 pl-12 text-base"
            />
            <Button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2" size="sm">
              Search
            </Button>
          </div>
        </form>

        {query ? (
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults locale={locale} query={query} />
          </Suspense>
        ) : (
          <SearchState
            title="What are you looking for?"
            description="Enter a search term above to find products."
          />
        )}
      </div>
    </div>
  );
}

async function SearchResults({ locale, query }: { locale: string; query: string }) {
  let products: Product[];
  let totalCount: number;

  try {
    const result = await getCatalogProducts<Product>(createSearchClient(locale), {
      query,
      first: SEARCH_RESULTS_LIMIT,
    });
    products = result.catalog.products.nodes ?? [];
    totalCount = result.catalog.products.totalCount ?? products.length;
  } catch (error) {
    console.error('Failed to load search results:', error);
    return (
      <SearchState
        role="alert"
        title="Search is temporarily unavailable"
        description="There was a problem loading results. Please try again later."
      />
    );
  }

  if (products.length === 0) {
    return (
      <SearchState
        title="No results found"
        description="Try searching for something else or check your spelling."
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-gray-500">
        {totalCount} {totalCount === 1 ? 'result' : 'results'} found
      </p>
      <ProductGrid products={products} columns={4} showPrice showDescription={false} />
    </>
  );
}

function SearchState({
  title,
  description,
  role = 'status',
}: {
  title: string;
  description: string;
  role?: 'alert' | 'status';
}) {
  return (
    <div role={role} className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <Search aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
      <h2 className="mt-4 text-lg font-medium text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading search results">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SEARCH_SKELETON_ITEMS.map((item) => (
          <div key={item} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <Skeleton className="aspect-3/4 w-full" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
