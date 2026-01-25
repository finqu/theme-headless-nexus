import Link from 'next/link';
import { getCatalogProducts } from '@finqu/storefront-sdk/server';
import type { Product } from '@finqu/storefront-types';
import { storefrontClient } from '@/lib/storefront';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';
import { ProductsCatalogClient } from './products-template-client';

interface ProductsTemplateProps {
  locale: string;
  /** Optional category/product group handle for filtered results */
  categoryHandle?: string;
  /** Optional category title for breadcrumb */
  categoryTitle?: string;
  /** URL search params for pagination and sorting */
  searchParams?: Record<string, string | string[] | undefined>;
}

interface SortOption {
  label: string;
  value: string;
  sortKey?: string;
  reverse?: boolean;
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest', sortKey: 'CREATED_AT', reverse: true },
  { label: 'Price: Low to High', value: 'price-asc', sortKey: 'PRICE', reverse: false },
  { label: 'Price: High to Low', value: 'price-desc', sortKey: 'PRICE', reverse: true },
  { label: 'A-Z', value: 'alpha-asc', sortKey: 'TITLE', reverse: false },
  { label: 'Z-A', value: 'alpha-desc', sortKey: 'TITLE', reverse: true },
];

const PRODUCTS_PER_PAGE = 12;

/**
 * Products catalog template component.
 * Fetches products from Finqu API with optional category filtering and sorting.
 */
export async function ProductsTemplate({
  locale,
  categoryHandle,
  categoryTitle,
  searchParams,
}: ProductsTemplateProps) {
  // Fetch initial products
  let productList: Product[] = [];
  let totalCount = 0;
  let hasNextPage = false;
  let endCursor: string | undefined;
  const currentPageParam = searchParams?.page;
  const currentPage = Array.isArray(currentPageParam)
    ? parseInt(currentPageParam[0] ?? '1', 10)
    : parseInt((currentPageParam as string) ?? '1', 10);
  const page = Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  // Note: SDK uses cursor-based pagination, not offset
  // For offset, we'd need a custom query
  void page;

  try {
    const result = await getCatalogProducts(storefrontClient, {
      first: PRODUCTS_PER_PAGE,
      query: categoryHandle ? `productGroup:${categoryHandle}` : undefined,
    });

    productList = (result.catalog.products.nodes ?? []) as Product[];
    hasNextPage = result.catalog.products.pageInfo?.hasNextPage ?? false;
    endCursor = result.catalog.products.pageInfo?.endCursor ?? undefined;
    totalCount = result.catalog.products.totalCount ?? productList.length;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  const pageTitle = categoryTitle || 'All Products';
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PRODUCTS_PER_PAGE));

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
            {categoryHandle ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/products">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>Products</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Client component for interactive sorting and loading more */}
        <ProductsCatalogClient
          initialProducts={productList}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          endCursor={endCursor}
          sortOptions={SORT_OPTIONS}
          pageTitle={pageTitle}
          categoryHandle={categoryHandle}
          productsPerPage={PRODUCTS_PER_PAGE}
          locale={locale}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination aria-label="Pagination Navigation">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`?page=${page - 1}`} />
                  </PaginationItem>
                )}

                {/* Page numbers with ellipsis */}
                {(() => {
                  const pages: number[] = [];
                  const add = (n: number) => {
                    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
                  };
                  add(1);
                  add(page - 1);
                  add(page);
                  add(page + 1);
                  add(totalPages);
                  pages.sort((a, b) => a - b);

                  const items: React.ReactNode[] = [];
                  for (let i = 0; i < pages.length; i++) {
                    const n = pages[i];
                    const prev = pages[i - 1];
                    if (prev && n - prev > 1) {
                      items.push(
                        <PaginationItem key={`ellipsis-${prev}-${n}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    items.push(
                      <PaginationItem key={`page-${n}`}>
                        <PaginationLink href={`?page=${n}`} isActive={n === page}>
                          {n}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return items;
                })()}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={`?page=${page + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
