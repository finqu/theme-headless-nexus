# Queries

Common Storefront GraphQL API queries for fetching store data.

## Product Queries

**Single product by ID:**

```graphql
query {
    product(id: "PRODUCT_ID") {
        id
        title
        handle
        description
        availableForSale
        variants(first: 10) {
            edges {
                node {
                    id
                    title
                    price
                    availableForSale
                }
            }
        }
        images(first: 5) {
            edges {
                node {
                    url
                    altText
                    width
                    height
                }
            }
        }
    }
}
```

**Product by handle:**

```graphql
query {
    productByHandle(handle: "cool-shirt") {
        id
        title
        # ... same fields as above
    }
}
```

**Product listing with filters:**

```graphql
query {
  products(first: 20, sortKey: TITLE, filters: [...]) {
    edges {
      node {
        id
        title
        handle
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Cart Query

```graphql
query {
    cart(id: "CART_ID") {
        id
        lines(first: 50) {
            edges {
                node {
                    id
                    quantity
                    product {
                        id
                        title
                    }
                }
            }
        }
        estimatedCost {
            totalAmount {
                amount
                currencyCode
            }
        }
    }
}
```

## Store Queries

```graphql
query {
    store {
        name
        description
        currency {
            code
            symbol
        }
    }
    menus(first: 10) {
        edges {
            node {
                id
                handle
                items {
                    title
                    url
                }
            }
        }
    }
}
```

## Customer Query

Requires `@storeContext` with `customerAccessToken`:

```graphql
query @storeContext(customerAccessToken: "TOKEN") {
    customer {
        id
        firstName
        lastName
        email
        orderCount
        orderTotal
        acceptsMarketing
    }
}
```

## Order Queries

Require `@storeContext` with `customerAccessToken`:

**Single order:**

```graphql
query @storeContext(customerAccessToken: "TOKEN") {
    order(id: "ORDER_ID") {
        id
        orderNumber
        totalPrice
        financialStatus
        fulfillmentStatus
        lines {
            id
            quantity
            title
        }
    }
}
```

**Order listing:**

```graphql
query @storeContext(customerAccessToken: "TOKEN") {
    orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
            node {
                id
                orderNumber
                processedAt
                totalPrice
                financialStatus
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}
```

## Other Queries

- `article(id)` / `articles(first)` — Blog articles
- `blog(id)` — Blog details
- `countries` — Available countries
- `currencies` — Available currencies
- `locales` — Available locales
- `manufacturer(id)` / `manufacturers(first)` — Manufacturers
- `menu(id)` / `menus(first)` — Navigation menus
- `page(id)` / `pages(first)` — Content pages
- `paymentMethods` — Available payment methods
- `policies` — Store policies
- `productGroup(id)` / `productGroups(first)` — Categories
- `routes` — URL routing info
- `shippingMethods` — Available shipping methods

## Full Reference

- [All queries (v1.1.0)](https://developers.finqu.com/reference/storefront/1.1.0.md.txt)
- [Product query](https://developers.finqu.com/reference/storefront/1.1.0/queries/product.md.txt)
- [Cart query](https://developers.finqu.com/reference/storefront/1.1.0/queries/cart.md.txt)
- [Store query](https://developers.finqu.com/reference/storefront/1.1.0/queries/store.md.txt)
- [Customer query](https://developers.finqu.com/reference/storefront/1.1.0/queries/customer.md.txt)
- [Order query](https://developers.finqu.com/reference/storefront/1.1.0/queries/order.md.txt)
- [Orders query](https://developers.finqu.com/reference/storefront/1.1.0/queries/orders.md.txt)
