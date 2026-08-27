# Store Context

Use the `@storeContext` directive to execute a Storefront GraphQL operation in a specific storefront context. This controls language, country, currency, or authenticates as a customer.

## Supported Arguments

- `language` — Language code for the response, e.g. `fi` or `en`
- `country` — Country code for the storefront context, e.g. `FI` or `SE`
- `currency` — Currency code used in the response, e.g. `EUR` or `SEK`
- `customerAccessToken` — Customer access token for authenticated customer context

## Example: Localized Product Query

```graphql
query GetFinnishProducts @storeContext(language: "fi", country: "FI", currency: "EUR") {
  catalog {
    products {
      edges {
        node {
          id
          title
          price
        }
      }
    }
  }
}
```

## Using customerAccessToken

Retrieve the token with `customerAccessTokenCreate`, then pass it into the directive:

```graphql
mutation CreateCustomerAccessToken {
  customerAccessTokenCreate(input: {
    email: "customer@example.com"
    password: "SecurePassword123"
  }) {
    customerAccessToken {
      accessToken
      expiresAt
    }
  }
}
```

```graphql
query GetPersonalizedCatalog($customerAccessToken: String!) @storeContext(
  language: "fi"
  country: "FI"
  currency: "EUR"
  customerAccessToken: $customerAccessToken
) {
  catalog {
    products {
      edges {
        node {
          id
          title
          price
        }
      }
    }
  }
}
```

Customer-scoped queries like `customer`, `order`, and `orders` require `customerAccessToken` in `@storeContext`.

## Full Reference

- [Store context](https://developers.finqu.com/build-with-finqu/storefront/store-context.md.txt)
- [customerAccessTokenCreate mutation](https://developers.finqu.com/reference/storefront/1.1.0/mutations/customer-access-token-create.md.txt)
- [locales query](https://developers.finqu.com/reference/storefront/1.1.0/queries/locales.md.txt)
