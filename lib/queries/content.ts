/**
 * Content Queries
 *
 * Queries for pages, articles, and other CMS content.
 *
 * Types are imported from @finqu/storefront-types.
 */

import type {
  Page,
  Article,
  Policy,
  PageConnection,
  PageVariables,
  PageByHandleVariables,
  ArticleVariables,
} from '@finqu/storefront-types';

// Re-export types for convenience
export type { PageVariables, PageByHandleVariables, ArticleVariables };

/**
 * Query for all pages (paginated)
 */
export const PAGES_QUERY = /* GraphQL */ `
  query Pages($first: Int, $after: String) {
    pages(first: $first, after: $after) {
      nodes {
        id
        title
        handle
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export interface PagesQueryVariables {
  first?: number;
  after?: string;
}

export interface PagesQueryResponse {
  pages: PageConnection;
}

/**
 * Query for a page by ID
 */
export const PAGE_BY_ID_QUERY = /* GraphQL */ `
  query PageById($id: ID!) {
    page(id: $id) {
      id
      title
      handle
      content
      seoTitle
      seoDescription
      createdAt
      updatedAt
    }
  }
`;

export interface PageByIdResponse {
  page: Page | null;
}

/**
 * Query for a page by handle
 */
export const PAGE_BY_HANDLE_QUERY = /* GraphQL */ `
  query PageByHandle($handle: String!) {
    pageByHandle(handle: $handle) {
      id
      title
      handle
      content
      seoTitle
      seoDescription
      createdAt
      updatedAt
    }
  }
`;

export interface PageByHandleResponse {
  pageByHandle: Page | null;
}

/**
 * Query for an article by ID
 */
export const ARTICLE_BY_ID_QUERY = /* GraphQL */ `
  query ArticleById($id: ID!) {
    article(id: $id) {
      id
      title
      handle
      content
      excerpt
      image
      author
      tags
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export interface ArticleByIdResponse {
  article: Article | null;
}

/**
 * Query for a policy by type
 */
export const POLICY_QUERY = /* GraphQL */ `
  query Policy($type: String!) {
    policy(type: $type) {
      title
      content
      type
      updatedAt
    }
  }
`;

export interface PolicyQueryVariables {
  type: string;
}

export interface PolicyQueryResponse {
  policy: Policy | null;
}
