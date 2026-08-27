# Data Fetching

How to fetch and cache data from the Finqu Storefront GraphQL API in headless storefronts.

## Server-Side Fetching (Recommended)

Use the server client for pages and server components:

```typescript
import { createServerClient } from '@finqu/storefront-sdk/server';

const client = createServerClient({
    storeDomain: process.env.FINQU_STORE_DOMAIN,
    apiKey: process.env.FINQU_STOREFRONT_API_KEY,
    cache: 'products',
});

// In a server component or page
const product = await client.getProduct({ id: '123' });
```

## Cache Presets

| Preset     | Behavior                                   | Use for                                  |
| ---------- | ------------------------------------------ | ---------------------------------------- |
| `static`   | Long-lived cache, revalidates infrequently | Store info, menus, policies              |
| `products` | Medium cache with ISR                      | Products, categories, manufacturers      |
| `dynamic`  | No cache, always fresh                     | Cart, customer data, real-time inventory |

## Client-Side Fetching

Use React hooks for interactive components:

```tsx
import { useProduct, useCart, useAddToCart } from '@finqu/storefront-sdk/react';

function ProductPage({ productId }) {
    const { data: product, loading } = useProduct(productId);
    const { data: cart } = useCart();
    const [addToCart] = useAddToCart();

    const handleAdd = () => addToCart({ productId, quantity: 1 });

    if (loading) return <div>Loading...</div>;
    return <div>{product.title}</div>;
}
```

## GraphQL Fragments

The SDK provides reusable fragments for common object types:

- **Product fragments** — Core fields + variants, options, images
- **Cart fragments** — Lines, discounts, totals
- **Customer fragments** — Profile, addresses
- **ProductGroup fragments** — Category with nested products

## Custom Queries

For operations not covered by built-in SDK methods:

```typescript
import { useFinquQuery } from '@finqu/storefront-sdk/react';

const CUSTOM_QUERY = `
  query GetStoreInfo {
    store {
      name
      currency { code }
    }
  }
`;

function StoreInfo() {
  const { data } = useFinquQuery(CUSTOM_QUERY);
  return <div>{data?.store?.name}</div>;
}
```

## Full Reference

- [Storefront SDK](https://developers.finqu.com/build-with-finqu/storefront/storefront-sdk.md.txt)
- [Storefront API reference](https://developers.finqu.com/reference/storefront/1.1.0.md.txt)
