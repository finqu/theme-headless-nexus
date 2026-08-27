# Pagination

How cursor-based pagination works in the Finqu Storefront GraphQL API.

## Connection Pattern

All list queries use the GraphQL connection pattern:

```graphql
query {
    products(first: 10, after: "CURSOR") {
        edges {
            node {
                id
                title
            }
            cursor
        }
        pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
        }
    }
}
```

## Pagination Arguments

| Argument | Type   | Description                                |
| -------- | ------ | ------------------------------------------ |
| `first`  | Int    | Number of items from the start             |
| `after`  | String | Cursor to start after (forward pagination) |
| `last`   | Int    | Number of items from the end               |
| `before` | String | Cursor to end before (backward pagination) |

## Iterating Through Pages

```typescript
let hasNextPage = true;
let cursor = null;
const allProducts = [];

while (hasNextPage) {
    const result = await client.query(PRODUCTS_QUERY, {
        first: 50,
        after: cursor,
    });

    const products = result.products.edges.map((edge) => edge.node);
    allProducts.push(...products);

    hasNextPage = result.products.pageInfo.hasNextPage;
    cursor = result.products.pageInfo.endCursor;
}
```

## Best Practices

- Use reasonable page sizes (10–50 items) to balance performance
- Always check `pageInfo.hasNextPage` before requesting the next page
- Use `first`/`after` for forward pagination, `last`/`before` for backward
- Request only needed fields to reduce response size and query complexity

## Full Reference

- [Storefront API pagination](https://developers.finqu.com/apis-and-tools/storefront/pagination.md.txt)
- [PageInfo object](https://developers.finqu.com/reference/storefront/1.1.0/objects/page-info.md.txt)
