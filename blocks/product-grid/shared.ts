import type { Product } from '@finqu/storefront-types';
import { createFinquClient, type FinquClient } from '@finqu/storefront-sdk/graphql';
import { getProductImageUrl as getSharedProductImageUrl } from '@/components/shared';
import { CATALOG_PRODUCTS_QUERY, PRODUCT_BY_ID_QUERY } from '@/lib/queries/catalog';

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

interface CatalogProductsQueryResult {
  catalog: {
    productsCount: number | null;
    products: {
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
      };
      totalCount: number | null;
      nodes: Product[];
    };
  };
}

/**
 * Fetches products from the storefront API (client-side).
 * Uses the catalog entry point for product listings.
 * Can optionally filter by product IDs after fetching.
 */
export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { query: searchQuery, first = 50, productIds } = options;

  const client = createClientForBrowser();

  try {
    const result = await client.query<CatalogProductsQueryResult>(CATALOG_PRODUCTS_QUERY, {
      query: searchQuery || undefined,
      first,
    });

    let productList = (result.catalog.products.nodes ?? []) as Product[];

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
 * Fetches a single product by ID.
 * Used internally by fetchProductsByIds for efficient individual fetching.
 */
async function fetchProductById(
  client: FinquClient,
  productId: number
): Promise<Product | null> {
  try {
    const result = await client.query<{
      product: Product | null;
    }>(PRODUCT_BY_ID_QUERY, {
      id: productId.toString(),
    });

    return result.product;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
}

/**
 * Fetches products by their IDs.
 * Fetches each product individually for efficiency.
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

  // Filter out null/undefined IDs
  const validIds = productIds.filter((id): id is number => id != null);
  if (validIds.length === 0) {
    return [];
  }

  const client = createClientForBrowser();

  // Fetch products individually in parallel
  const productPromises = validIds.map((id) => fetchProductById(client, id));
  const products = await Promise.all(productPromises);

  // Filter out null results and maintain order
  const validProducts = products.filter((p): p is Product => p != null);

  // Maintain the order of requested IDs
  const productMap = new Map(validProducts.map((p) => [p.id, p]));
  return validIds
    .map((id) => productMap.get(id))
    .filter((p): p is Product => p != null);
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
 * Re-exports the shared utility for backward compatibility.
 */
export function getProductImageUrl(product: Product): string | undefined {
  return getSharedProductImageUrl(product);
}
