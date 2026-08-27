# Mutations

Common Storefront GraphQL API mutations for modifying data.

## Cart Mutations

**Create cart:**

```graphql
mutation {
    cartCreate(input: { lines: [{ productVariantId: "VARIANT_ID", quantity: 1 }] }) {
        cart {
            id
            lines(first: 10) {
                edges {
                    node {
                        id
                        quantity
                    }
                }
            }
        }
        userErrors {
            field
            message
        }
    }
}
```

**Add lines to cart:**

```graphql
mutation {
    cartLinesAdd(cartId: "CART_ID", lines: [{ productVariantId: "VARIANT_ID", quantity: 2 }]) {
        cart {
            id
        }
        userErrors {
            field
            message
        }
    }
}
```

**Update cart lines:**

```graphql
mutation {
    cartLinesUpdate(cartId: "CART_ID", lines: [{ id: "LINE_ID", quantity: 3 }]) {
        cart {
            id
        }
        userErrors {
            field
            message
        }
    }
}
```

**Remove cart lines:**

```graphql
mutation {
    cartLinesRemove(cartId: "CART_ID", lineIds: ["LINE_ID"]) {
        cart {
            id
        }
        userErrors {
            field
            message
        }
    }
}
```

**Apply discount code:**

```graphql
mutation {
    cartDiscountCodesUpdate(cartId: "CART_ID", discountCodes: ["SUMMER20"]) {
        cart {
            id
            discountCodes {
                code
                applicable
            }
        }
        userErrors {
            field
            message
        }
    }
}
```

**Update buyer identity:**

```graphql
mutation {
    cartBuyerIdentityUpdate(cartId: "CART_ID", buyerIdentity: { email: "customer@example.com", countryCode: "FI" }) {
        cart {
            id
        }
        userErrors {
            field
            message
        }
    }
}
```

**Update cart note:**

```graphql
mutation {
    cartNoteUpdate(cartId: "CART_ID", note: "Please gift wrap") {
        cart {
            id
            note
        }
        userErrors {
            field
            message
        }
    }
}
```

## Customer Mutations

- `customerAccessTokenCreate` — Login (see authentication reference)
- `customerAccessTokenDelete` — Logout
- `customerAccessTokenRenew` — Refresh token
- `customerCreate` — Register new customer
- `customerUpdate` — Update customer profile (requires `@storeContext` with `customerAccessToken`)

**Update customer:**

```graphql
mutation @storeContext(customerAccessToken: "TOKEN") {
    customerUpdate(input: {
        firstName: "John"
        lastName: "Doe"
        phone: "+1234567890"
    }) {
        customer {
            id
            firstName
            lastName
            phone
        }
        customerUserErrors {
            field
            message
        }
    }
}
```

## Handling userErrors

All mutations return a `userErrors` array. Always check it:

```typescript
const result = await client.mutate(CART_LINES_ADD, { cartId, lines });

if (result.cartLinesAdd.userErrors.length > 0) {
    for (const error of result.cartLinesAdd.userErrors) {
        console.error(`${error.field}: ${error.message}`);
    }
}
```

## Full Reference

- [cartCreate](https://developers.finqu.com/reference/storefront/1.1.0/mutations/cart-create.md.txt)
- [cartLinesAdd](https://developers.finqu.com/reference/storefront/1.1.0/mutations/cart-lines-add.md.txt)
- [cartLinesUpdate](https://developers.finqu.com/reference/storefront/1.1.0/mutations/cart-lines-update.md.txt)
- [cartLinesRemove](https://developers.finqu.com/reference/storefront/1.1.0/mutations/cart-lines-remove.md.txt)
- [cartDiscountCodesUpdate](https://developers.finqu.com/reference/storefront/1.1.0/mutations/cart-discount-codes-update.md.txt)
- [customerUpdate](https://developers.finqu.com/reference/storefront/1.1.0/mutations/customer-update.md.txt)
