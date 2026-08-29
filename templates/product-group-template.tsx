import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProductGroup } from '@finqu/storefront-types';
import { ProductBreadcrumb } from '@/components/product/product-breadcrumb';
import { ProductGrid } from '@/components/product/product-grid';
import { GradientBorder } from '@/components/shared';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  CATEGORY_SORT_OPTIONS,
  PRODUCTS_PER_PAGE,
  buildCategoryQuery,
  categoryHref,
  getProductGroupListing,
  parseSearchParam,
  resolveCategorySort,
  type ProductGroupWithProducts,
} from '@/lib/product-group';
import { ProductGroupSort } from './product-group-sort';

interface ProductGroupTemplateProps {
  id: number;
  locale: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

const MAX_PAGE_WALK = 50;

/**
 * Category (product group) fallback when no published Puck template exists.
 * Fetches via getProductGroup + getProductGroupWithProducts and reuses the catalog grid.
 */
export async function ProductGroupTemplate({
  id,
  locale,
  searchParams,
}: ProductGroupTemplateProps) {
  const sort = resolveCategorySort(parseSearchParam(searchParams?.sort));
  const pageParam = parseInt(parseSearchParam(searchParams?.page) ?? '1', 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  let listing: ProductGroupWithProducts | null;
  try {
    listing = await getProductGroupListing({
      id,
      locale,
      first: PRODUCTS_PER_PAGE,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
    });
  } catch (error) {
    console.error('Failed to fetch product group:', error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error loading category</h1>
          <p className="mt-2 text-gray-600">
            There was a problem loading this category. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!listing) {
    notFound();
  }

  let category = listing;

  try {
    const walkTo = Math.min(page, MAX_PAGE_WALK);
    for (let current = 1; current < walkTo; current += 1) {
      const nextCursor = category.products.pageInfo.endCursor;
      if (!category.products.pageInfo.hasNextPage || !nextCursor) {
        break;
      }
      const nextPage = await getProductGroupListing({
        id,
        locale,
        first: PRODUCTS_PER_PAGE,
        after: nextCursor,
        sortKey: sort.sortKey,
        reverse: sort.reverse,
      });
      if (!nextPage) {
        break;
      }
      category = nextPage;
    }

    const title = category.title || 'Category';
    const products = category.products.nodes ?? [];
    const totalCount = category.products.totalCount ?? category.productsCount ?? products.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
    const children = (category.productGroups ?? []).filter(
      (child): child is ProductGroup & { title: string } => Boolean(child?.title)
    );
    const ancestors = (category.breadcrumbs ?? []).filter(
      (crumb) => crumb?.title && crumb.id !== category.id
    );

    return (
      <div className="@container relative min-h-[60vh] w-full">
        <div className="relative px-4 py-4 @sm:px-6">
          <GradientBorder position="top" />
          <ProductBreadcrumb
            items={[
              { label: 'Products', href: '/products' },
              ...ancestors.map((crumb) => ({
                label: crumb.title!,
                href: categoryHref(crumb),
              })),
            ]}
            currentPage={title}
          />
          <GradientBorder position="bottom" />
        </div>

        <div className="px-4 py-6 @sm:px-6">
          <div className="flex flex-col gap-4 @sm:flex-row @sm:items-start @sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 @sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalCount} {totalCount === 1 ? 'product' : 'products'}
              </p>
              {category.description ? (
                <div
                  className="prose prose-sm prose-gray mt-4 max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: category.description }}
                />
              ) : null}
            </div>
            <ProductGroupSort options={CATEGORY_SORT_OPTIONS} value={sort.value} />
          </div>

          {children.length > 0 ? (
            <nav aria-label="Subcategories" className="mt-6 flex flex-wrap gap-2">
              {children.map((child) => {
                const href = categoryHref(child);
                const label = `${child.title}${
                  child.productsCount != null ? ` (${child.productsCount})` : ''
                }`;
                if (!href) {
                  return (
                    <span
                      key={child.id ?? child.handle ?? child.title}
                      className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700"
                    >
                      {label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={child.id ?? child.handle ?? href}
                    href={href}
                    className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        <ProductGrid
          products={products}
          columns={4}
          showPrice
          showDescription={false}
          emptyMessage="No products found in this category."
        />

        {totalPages > 1 ? (
          <CategoryPagination page={page} totalPages={totalPages} sort={sort.value} />
        ) : null}
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch product group page:', error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error loading category</h1>
          <p className="mt-2 text-gray-600">
            There was a problem loading this category. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

function CategoryPagination({
  page,
  totalPages,
  sort,
}: {
  page: number;
  totalPages: number;
  sort: string;
}) {
  const pages: number[] = [];
  const add = (n: number) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) {
      pages.push(n);
    }
  };
  add(1);
  add(page - 1);
  add(page);
  add(page + 1);
  add(totalPages);
  const orderedPages = [...pages].sort((a, b) => a - b);

  const items: ReactNode[] = [];
  for (let i = 0; i < orderedPages.length; i += 1) {
    const n = orderedPages[i];
    const prev = orderedPages[i - 1];
    if (prev && n - prev > 1) {
      items.push(
        <PaginationItem key={`ellipsis-${prev}-${n}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    items.push(
      <PaginationItem key={`page-${n}`}>
        <PaginationLink href={buildCategoryQuery({ page: n, sort })} isActive={n === page}>
          {n}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <div className="relative px-4 py-3 @sm:px-6">
      <GradientBorder position="top" />
      <Pagination aria-label="Pagination Navigation">
        <PaginationContent>
          {page > 1 ? (
            <PaginationItem>
              <PaginationPrevious href={buildCategoryQuery({ page: page - 1, sort })} />
            </PaginationItem>
          ) : null}
          {items}
          {page < totalPages ? (
            <PaginationItem>
              <PaginationNext href={buildCategoryQuery({ page: page + 1, sort })} />
            </PaginationItem>
          ) : null}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
