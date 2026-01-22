import type { Product } from '@finqu/storefront-types';
import { createFinquClient, type FinquClient } from '@finqu/storefront-sdk/graphql';

/**
 * GraphQL query for fetching products with all fields needed for ProductGrid rendering.
 * Shared between edit and render Puck components.
 */
export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($query: String, $limit: Int, $offset: Int, $sort: String, $productGroup: String, $priceMin: Float, $priceMax: Float, $onlyDiscounted: Boolean, $onlyNew: Boolean, $first: Int, $after: String, $last: Int, $before: String, $sortKey: String, $reverse: Boolean) {
    products(query: $query, limit: $limit, offset: $offset, sort: $sort, productGroup: $productGroup, priceMin: $priceMin, priceMax: $priceMax, onlyDiscounted: $onlyDiscounted, onlyNew: $onlyNew, first: $first, after: $after, last: $last, before: $before, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          handle
          id
          title
          shortDescription
          isAvailable
          defaultOrSelectedVariant {
            id
            title
            sku
            price
            originalPrice
            url
            featuredImage {
              url
              alt
            }
            image {
              url
              alt
            }
          },
          variants {
            id,
            url
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

/**
 * Create a client-side Storefront client.
 * Use this for client-side data fetching in browser components.
 *
 * @returns A FinquClient configured for client-side use
 */
export function createClientForBrowser(): FinquClient {
  return createFinquClient({
    endpoint: process.env.NEXT_PUBLIC_FINQU_STOREFRONT_URL!,
    publicKey: process.env.NEXT_PUBLIC_FINQU_PUBLIC_KEY!,
  });
}

export interface FetchProductsOptions {
  query?: string;
  first?: number;
  productIds?: (number | null | undefined)[];
}

interface ProductsQueryResult {
  products: {
    edges: Array<{ node: Product; cursor: string }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    totalCount: number;
  };
}

/**
 * Fetches products from the storefront API (client-side).
 * Can optionally filter by product IDs after fetching.
 */
export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { query: searchQuery, first = 50, productIds } = options;

  const client = createClientForBrowser();

  try {
    const result = await client.query<ProductsQueryResult>(PRODUCTS_QUERY, {
      query: searchQuery || undefined,
      first,
    });

    let productList = (result.products.edges?.map((edge: { node: Product }) => edge.node).filter(Boolean) || []) as Product[];

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
 *
 * @param productIds - Array of product IDs to fetch
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
  const variant = product.defaultOrSelectedVariant;
  const url = variant?.featuredImage?.url || variant?.image?.url;
  return url || undefined;
}
