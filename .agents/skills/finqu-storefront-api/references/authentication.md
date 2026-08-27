# Authentication

How to authenticate with the Finqu Storefront GraphQL API.

## API Key Authentication

All requests require an API key in the `Authorization` header:

```http
Authorization: Bearer fq_your_api_key
```

**Getting your API key:**

1. Log in to the Finqu admin
2. Go to **Channel settings**
3. Create or copy a Storefront API key
4. Keys are prefixed with `fq_` (e.g., `fq_OPmgGrIY...`)

## Customer Authentication

For personalized experiences (customer account, order history, saved addresses):

### 1. Create access token

```graphql
mutation {
    customerAccessTokenCreate(input: { email: "customer@example.com", password: "password" }) {
        customerAccessToken {
            accessToken
            expiresAt
        }
        userErrors {
            field
            message
        }
    }
}
```

### 2. Use token in requests

Pass the customer access token via the `@storeContext` directive for customer-specific queries:

```graphql
query @storeContext(customerAccessToken: "TOKEN") {
  customer {
    id
    firstName
    lastName
    email
  }
}
```

See `store-context.md` for full directive documentation.

### 3. Renew token

```graphql
mutation {
    customerAccessTokenRenew(customerAccessToken: "TOKEN") {
        customerAccessToken {
            accessToken
            expiresAt
        }
        userErrors {
            field
            message
        }
    }
}
```

### 4. Delete token (logout)

```graphql
mutation {
    customerAccessTokenDelete(customerAccessToken: "TOKEN") {
        deletedAccessToken
        userErrors {
            field
            message
        }
    }
}
```

## Customer Registration

```graphql
mutation {
    customerCreate(input: { email: "new@example.com", password: "secure_password", firstName: "Jane", lastName: "Doe" }) {
        customer {
            id
            email
        }
        userErrors {
            field
            message
            code
        }
    }
}
```

## Full Reference

- [Storefront authentication](https://developers.finqu.com/apis-and-tools/storefront/authentication.md.txt)
- [Store context](https://developers.finqu.com/build-with-finqu/storefront/store-context.md.txt)
- [customerAccessTokenCreate mutation](https://developers.finqu.com/reference/storefront/1.1.0/mutations/customer-access-token-create.md.txt)
- [customerCreate mutation](https://developers.finqu.com/reference/storefront/1.1.0/mutations/customer-create.md.txt)
