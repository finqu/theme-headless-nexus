import type { Product } from '@finqu/storefront-lib/types';
import { storefrontServer } from '@/lib/storefront';
import { products } from '@finqu/storefront-lib/server';

/**
 * GraphQL query for fetching products with all fields needed for ProductGrid rendering.
 * Shared between edit and render Puck components.
 */
export const PRODUCTS_QUERY = `
  query Products($query: String, $limit: Int, $offset: Int, $sort: String, $productGroup: String, $priceMin: Float, $priceMax: Float, $onlyDiscounted: Boolean, $onlyNew: Boolean, $first: Int, $after: String, $last: Int, $before: String, $sortKey: String, $reverse: Boolean) {
    products(query: $query, limit: $limit, offset: $offset, sort: $sort, productGroup: $productGroup, priceMin: $priceMin, priceMax: $priceMax, onlyDiscounted: $onlyDiscounted, onlyNew: $onlyNew, first: $first, after: $after, last: $last, before: $before, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          handle
          id
          title
          shortDescription
          isAvailable
          firstAvailableVariant {
            id
            title
            sku
            price
            originalPrice
            featuredImage {
              url
              alt
            }
            image {
              url
              alt
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export interface FetchProductsOptions {
    query?: string;
    first?: number;
    productIds?: (number | null | undefined)[];
}

/**
 * Fetches products from the storefront API.
 * Can optionally filter by product IDs after fetching.
 */
export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
    const { query: searchQuery, first = 50, productIds } = options;

    try {
        const result = await products(
            storefrontServer,
            {
                query: searchQuery || undefined,
                first,
            },
            { query: PRODUCTS_QUERY }
        );

        let productList = (result.edges?.map((edge) => edge.node).filter(Boolean) || []) as Product[];

        // If specific product IDs are requested, filter and maintain order
        if (productIds && productIds.length > 0) {
            const validIds = new Set(productIds.filter((id): id is number => id != null));
            const productMap = new Map(productList.map((p) => [p.id, p]));

            // Maintain the order of requested IDs
            productList = productIds
                .filter((id): id is number => id != null && productMap.has(id))
                .map((id) => productMap.get(id)!);
        }

        return productList;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

/**
 * Fetches products by their IDs.
 * Useful for rendering saved ProductGrid components with fresh data.
 */
export async function fetchProductsByIds(
    productIds: (number | null | undefined)[]
): Promise<Product[]> {
    if (!productIds || productIds.length === 0) {
        return [];
    }

    // Fetch a larger set to ensure we get all requested products
    return fetchProducts({ first: 100, productIds });
}

/**
 * Extracts product IDs from an array of products.
 * Useful for storing minimal data in Puck component props.
 */
export function extractProductIds(productList: Product[] | undefined): number[] {
    if (!productList || !Array.isArray(productList)) {
        return [];
    }
    return productList.map((p) => p.id).filter((id): id is number => id != null);
}

/**
 * Gets the product image URL from a product.
 */
export function getProductImageUrl(product: Product): string | undefined {
    const variant = product.firstAvailableVariant;
    const url = variant?.featuredImage?.url || variant?.image?.url;
    return url || undefined;
}
