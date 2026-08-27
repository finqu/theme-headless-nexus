# Storefront SDK

A TypeScript SDK for building custom Finqu storefronts with GraphQL, React hooks, and Puck visual editor support.

## Installation

```bash
pnpm add @finqu/storefront-sdk
```

### Optional Peer Dependencies

```bash
pnpm add graphql graphql-request    # For GraphQL client
pnpm add @apollo/client react       # For React hooks
pnpm add @puckeditor/core           # For Puck visual editor
pnpm add @finqu/storefront-types    # For typed responses
```

## SDK Modules

| Import Path                     | Use Case                           | Environment       |
| ------------------------------- | ---------------------------------- | ----------------- |
| `@finqu/storefront-sdk`         | Puck component types and utilities | Universal         |
| `@finqu/storefront-sdk/graphql` | Framework-agnostic GraphQL client  | Universal         |
| `@finqu/storefront-sdk/server`  | Server-side client with caching    | Server only       |
| `@finqu/storefront-sdk/react`   | React hooks with Apollo            | Client components |

## GraphQL Client (Public)

```typescript
import { createStorefrontClient } from '@finqu/storefront-sdk/graphql';

const client = createStorefrontClient({
    storeDomain: 'your-store.finqu.com',
    apiKey: process.env.FINQU_STOREFRONT_API_KEY,
});
```

## Server Client (Next.js Optimized)

```typescript
import { createServerClient } from '@finqu/storefront-sdk/server';

const client = createServerClient({
    storeDomain: 'your-store.finqu.com',
    apiKey: process.env.FINQU_STOREFRONT_API_KEY,
    cache: 'products', // Cache preset: 'static' | 'products' | 'dynamic'
});
```

## React Hooks

Wrap your app with the provider:

```tsx
import { FinquProvider } from '@finqu/storefront-sdk/react';

function App({ children }) {
    return <FinquProvider config={{ storeDomain: '...', apiKey: '...' }}>{children}</FinquProvider>;
}
```

### Available Hooks

**Products:**

- `useProduct(id)` — Fetch single product
- `useProductByHandle(handle)` — Fetch product by handle
- `useCatalogProducts(options)` — Fetch product listings
- `useCatalogProductsLazy()` — Lazy-loaded product listings

**Cart:**

- `useCart(id)` — Fetch cart
- `useCreateCart()` — Create new cart
- `useAddToCart()` — Add items to cart
- `useRemoveFromCart()` — Remove items
- `useApplyDiscountCode()` — Apply discount codes

**Categories:**

- ProductGroup hooks for category operations

**Navigation:**

- `useNavigationMenu(handle)` — Fetch navigation menus

**Generic:**

- `useFinquQuery(query, variables)` — Custom queries
- `useFinquLazyQuery(query)` — Lazy custom queries
- `useFinquMutation(mutation)` — Custom mutations

## GraphQL Operations

Pre-built operations available from the SDK:

- **Products**: `getProduct`, `getProductByHandle`, `getCatalogProducts`
- **Cart**: `getCart`, `createCart`, `addToCart`, `updateCartLines`, `removeFromCart`, `applyDiscountCode`
- **ProductGroups**: Category operations
- **Navigation**: Menu operations
- **Server-only**: Operations requiring authentication

## Puck Visual Editor

Define components using the `defineComponent` helper:

```typescript
import { defineComponent } from '@finqu/storefront-sdk';

export const HeroBanner = defineComponent({
  name: 'HeroBanner',
  fields: {
    title: { type: 'text', label: 'Title' },
    image: { type: 'custom', label: 'Image' },
  },
  render: ({ title, image }) => (
    <div className="hero-banner">
      <h1>{title}</h1>
    </div>
  ),
});
```

## Full Reference

See the [Storefront SDK documentation](https://developers.finqu.com/build-with-finqu/storefront/storefront-sdk.md.txt) for complete API details.
