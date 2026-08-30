import { cache } from 'react';
import { GET_PRODUCT_GROUP, GET_PRODUCT_GROUP_WITH_PRODUCTS } from '@finqu/storefront-sdk/server';
import type { Product, ProductGroup, ProductSortKey } from '@finqu/storefront-types';
import { cachePresets, storefrontClient, withLocale } from '@/lib/storefront';

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

export interface ProductGroupListing extends ProductGroup {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
    totalCount: number;
    nodes: Product[];
  };
}

interface ProductGroupQueryResult {
  productGroup: ProductGroup | null;
}

interface ProductGroupListingQueryResult {
  productGroup: ProductGroupListing | null;
}

const EMPTY_PRODUCTS: ProductGroupListing['products'] = {
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  totalCount: 0,
  nodes: [],
};

function productGroupCache(locale: string) {
  return withLocale(locale, cachePresets.products);
}

/**
 * Fetch category metadata by numeric ID (from resourceByPath).
 * Deduplicated per request so the template and generateMetadata share one call.
 */
export const getProductGroupById = cache(async (id: number, locale: string) => {
  const { productGroup } = await storefrontClient.query<ProductGroupQueryResult>(
    GET_PRODUCT_GROUP,
    { id },
    productGroupCache(locale)
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
 * Fetch a category listing page. `GET_PRODUCT_GROUP_WITH_PRODUCTS` looks up by handle,
 * so we resolve handle from the resource ID first.
 */
export async function getProductGroupListing(options: {
  id: number;
  locale: string;
  first?: number;
  after?: string;
  sortKey?: ProductSortKey;
  reverse?: boolean;
}): Promise<ProductGroupListing | null> {
  const group = await getProductGroupById(options.id, options.locale);
  if (!group) {
    return null;
  }

  const handle = group.handle ?? String(options.id);

  try {
    const { productGroup } = await storefrontClient.query<ProductGroupListingQueryResult>(
      GET_PRODUCT_GROUP_WITH_PRODUCTS,
      {
        handle,
        first: options.first ?? PRODUCTS_PER_PAGE,
        after: options.after,
        sortKey: options.sortKey,
        reverse: options.reverse ?? false,
      },
      productGroupCache(options.locale)
    );

    if (productGroup) {
      return productGroup;
    }
  } catch (error) {
    console.error('Failed to fetch product group products:', error);
  }

  // Handle lookup can miss even when the ID query succeeded — still render the shell.
  return {
    ...group,
    products: {
      ...EMPTY_PRODUCTS,
      totalCount: group.productsCount ?? 0,
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
    return `/${group.handle.replace(/^\//, '')}`;
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
