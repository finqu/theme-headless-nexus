/**
 * GraphQL query for fetching products from the catalog.
 * Uses the catalog entry point which provides access to filters and total counts.
 * Shared between edit and render Puck components.
 */
export const CATALOG_PRODUCTS_QUERY = /* GraphQL */ `
  query GetCatalogProducts(
    $first: Int = 20
    $after: String
    $query: String
    $sortKey: ProductSortKey
    $reverse: Boolean = false
  ) {
    catalog {
      productsCount
      products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
        nodes {
          handle
          id
          title
          shortDescription
          isAvailable
          featuredImage {
            url
            alt
          }
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
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query for fetching a single product by ID.
 * Used for fetching individual products efficiently.
 */
export const PRODUCT_BY_ID_QUERY = /* GraphQL */ `
  query GetProductById($id: ID!) {
    product(id: $id) {
      handle
      id
      title
      shortDescription
      isAvailable
      featuredImage {
        url
        alt
      }
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
      }
    }
  }
`;

interface ProductByIdQueryResult {
  product: {
    handle: string;
    id: number;
    title: string;
    shortDescription: string | null;
    isAvailable: boolean;
    featuredImage: {
      url: string;
      alt: string | null;
    } | null;
    defaultOrSelectedVariant: {
      id: number;
      title: string;
      sku: string | null;
      price: number;
      originalPrice: number | null;
      url: string;
      featuredImage: {
        url: string;
        alt: string | null;
      } | null;
    } | null;
  } | null;
}
