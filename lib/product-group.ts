import { cache } from 'react';
import type { Product, ProductGroup, ProductSortKey } from '@finqu/storefront-types';
import { GET_PRODUCT_GROUP, GET_PRODUCT_GROUP_WITH_PRODUCTS } from '@finqu/storefront-sdk/server';
import { storefrontClient, cachePresets, withLocale } from '@/lib/storefront';

export const PRODUCTS_PER_PAGE = 12;

export const CATEGORY_SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest', sortKey: 'created' as const, reverse: true },
  { label: 'Price: Low to High', value: 'price-asc', sortKey: 'price' as const, reverse: false },
  { label: 'Price: High to Low', value: 'price-desc', sortKey: 'price' as const, reverse: true },
  { label: 'A-Z', value: 'alpha-asc', sortKey: 'title' as const, reverse: false },
  { label: 'Z-A', value: 'alpha-desc', sortKey: 'title' as const, reverse: true },
] as const;

export type CategorySortValue = (typeof CATEGORY_SORT_OPTIONS)[number]['value'];

export interface ProductGroupProductsConnection {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
  filters: Array<{
    paramName: string | null;
    label: string | null;
    type: string | null;
    rangeMin: number | null;
    rangeMax: number | null;
    values: Array<{
      paramName: string | null;
      label: string | null;
      count: number | null;
    }> | null;
  }> | null;
  nodes: Product[];
}

export type ProductGroupWithProducts = ProductGroup & {
  products: ProductGroupProductsConnection;
};

interface ProductGroupQueryResponse {
  productGroup: ProductGroup | null;
}

interface ProductGroupWithProductsQueryResponse {
  productGroup: ProductGroupWithProducts | null;
}

/**
 * Fetch category metadata by numeric ID (from resourceByPath).
 * Deduplicated per request so the template and generateMetadata share one call.
 */
export const getProductGroupById = cache(async (id: number, locale: string) => {
  const { productGroup } = await storefrontClient.query<ProductGroupQueryResponse>(
    GET_PRODUCT_GROUP,
    { id },
    withLocale(locale, cachePresets.products)
  );
  return productGroup;
});

export function resolveCategorySort(value: string | undefined): {
  value: CategorySortValue;
  sortKey?: ProductSortKey;
  reverse?: boolean;
} {
  const match = CATEGORY_SORT_OPTIONS.find((option) => option.value === value);
  if (!match) {
    return { value: 'featured' };
  }
  return {
    value: match.value,
    sortKey: 'sortKey' in match ? match.sortKey : undefined,
    reverse: 'reverse' in match ? match.reverse : undefined,
  };
}

/**
 * Fetch a category listing page. `getProductGroupWithProducts` looks up by handle,
 * so we resolve handle from the resource ID first.
 */
export async function getProductGroupListing(options: {
  id: number;
  locale: string;
  first?: number;
  after?: string;
  sortKey?: ProductSortKey;
  reverse?: boolean;
}): Promise<ProductGroupWithProducts | null> {
  const group = await getProductGroupById(options.id, options.locale);
  if (!group) {
    return null;
  }

  const handle = group.handle ?? String(options.id);
  const { productGroup } = await storefrontClient.query<ProductGroupWithProductsQueryResponse>(
    GET_PRODUCT_GROUP_WITH_PRODUCTS,
    {
      handle,
      first: options.first ?? PRODUCTS_PER_PAGE,
      after: options.after,
      sortKey: options.sortKey,
      reverse: options.reverse ?? false,
    },
    withLocale(options.locale, cachePresets.products)
  );

  if (productGroup) {
    return productGroup;
  }

  // Handle lookup can miss even when the ID query succeeded — still render the shell.
  return {
    ...group,
    products: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: group.productsCount ?? 0,
      filters: null,
      nodes: [],
    },
  };
}

export function parseSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function categoryHref(group: Pick<ProductGroup, 'url' | 'handle'>): string | undefined {
  if (group.url) {
    return group.url;
  }
  if (group.handle) {
    return `/${group.handle}`;
  }
  return undefined;
}

export function buildCategoryQuery(options: { page?: number; sort?: string }): string {
  const params = new URLSearchParams();
  if (options.sort && options.sort !== 'featured') {
    params.set('sort', options.sort);
  }
  if (options.page && options.page > 1) {
    params.set('page', String(options.page));
  }
  const query = params.toString();
  return query ? `?${query}` : '?';
}
