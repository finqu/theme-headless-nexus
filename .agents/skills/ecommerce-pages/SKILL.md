---
name: ecommerce-pages
description: Implements the next Finqu storefront page from the Nexus backlog using Storefront GraphQL and existing SDK helpers. Use when adding category, cart, CMS, search, account, auth, blog, or manufacturer pages, replacing PlaceholderTemplate, or when asked to ship basic ecommerce pages incrementally.
---

# Ecommerce pages

Implement **one backlog item per change**. Do not bundle unrelated pages.

Read [backlog.md](backlog.md) first and pick the highest incomplete slice.

## Procedure

1. Confirm the `ResourceKind` in `templates/index.tsx` and how `app/(site)/[...slug]/page.tsx` routes it.
2. Prefer SDK helpers over new GraphQL:

   | Page     | Helper / query                                                         |
   | -------- | ---------------------------------------------------------------------- |
   | Product  | `getProduct`                                                           |
   | Catalog  | `getCatalogProducts`                                                   |
   | Category | `getProductGroup` / `getProductGroupWithProducts`                      |
   | Cart     | `useCart` + `CartProvider` (already wired)                             |
   | CMS page | `PAGE_BY_ID_QUERY` in `lib/queries/content.ts`                         |
   | Article  | `ARTICLE_BY_ID_QUERY`                                                  |
   | Policy   | `POLICY_QUERY`                                                         |
   | Customer | `getCustomerByToken`, `getCustomerOrders`, `customerAccessTokenCreate` |

3. Server-render the page shell. Isolate interactivity (`'use client'`) in existing components under `components/product`, `components/cart`, `components/auth`.
4. Register the renderer in `templates/index.tsx`. Remove the `PlaceholderTemplate` for that kind.
5. Handle empty, loading, and error states. Use `notFound()` only when the resource is missing.
6. Include locale-aware links from `resource.alternates` / `getLocale()`. Pass `cachePresets` + `withLocale`.
7. Verify: `pnpm typecheck`, `pnpm format`, and exercise the route in the browser when a storefront is running.

## Constraints

- Checkout stays external (`cart.checkoutUrl`).
- Do not add REST wrappers for GraphQL.
- Do not invent fields — inspect `@finqu/storefront-types` and existing fragments.
- Match current visual language (Tailwind 4, shadcn/ui, existing spacing/typography).
- Update [backlog.md](backlog.md) status when a slice ships.

## Docs

- Storefront API: https://developers.finqu.com/reference/storefront/1.1.0
- Product: https://developers.finqu.com/reference/storefront/1.1.0/objects/product
- ProductGroup: https://developers.finqu.com/reference/storefront/1.1.0/objects/product-group
- Cart: https://developers.finqu.com/reference/storefront/1.1.0/objects/cart
