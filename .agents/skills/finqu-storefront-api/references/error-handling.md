# Error Handling

How to handle errors in the Finqu Storefront GraphQL API.

## Error Types

### 1. GraphQL Errors

Top-level errors in the response `errors` array. These indicate query/syntax problems:

```json
{
    "errors": [
        {
            "message": "Field 'unknownField' doesn't exist on type 'Product'",
            "locations": [{ "line": 3, "column": 5 }]
        }
    ]
}
```

### 2. User Errors (Mutation)

Returned in the mutation payload's `userErrors` array. These indicate validation/business logic issues:

```json
{
    "data": {
        "cartLinesAdd": {
            "cart": null,
            "userErrors": [
                {
                    "field": ["lines", "0", "productVariantId"],
                    "message": "Product variant not found"
                }
            ]
        }
    }
}
```

### 3. HTTP Errors

| Status | Meaning                                    | Action                            |
| ------ | ------------------------------------------ | --------------------------------- |
| 200    | Success (even with GraphQL errors in body) | Check `errors` array              |
| 401    | Invalid API key                            | Verify key starts with `fq_`      |
| 429    | Rate limited                               | Back off, reduce query complexity |
| 5xx    | Server error                               | Retry with exponential backoff    |

## Rate Limits

Rate limits are based on query complexity, not just request count. To reduce complexity:

- Request only the fields you need
- Use reasonable `first`/`last` values
- Avoid deeply nested connections

When rate limited (429), the response includes a structured error. Wait before retrying.

## Best Practices

- Always check both `errors` (query level) and `userErrors` (mutation level)
- Log GraphQL errors for debugging
- Display `userErrors` messages to users (they're actionable)
- Implement retry logic only for transient errors (429, 5xx)

## Full Reference

- [Storefront API error handling](https://developers.finqu.com/apis-and-tools/storefront/error-handling.md.txt)
- [Storefront API rate limits](https://developers.finqu.com/apis-and-tools/storefront/rate-limits.md.txt)
- [UserError object](https://developers.finqu.com/reference/storefront/1.1.0/objects/user-error.md.txt)
