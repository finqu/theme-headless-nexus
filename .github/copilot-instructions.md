# Copilot Instructions for theme-headless-nexus

## Project Overview

A **Finqu headless e-commerce storefront** built with Next.js 16 and Puck visual editor. This is a theme that connects to Finqu's storefront API for products, categories, and content, with a visual page builder for merchants.

## Architecture

### Core Data Flow

1. **Middleware** ([middleware.ts](middleware.ts)) detects locale from URL prefix, strips it, and passes `x-locale` header
2. **Dynamic routing** ([app/[...slug]/page.tsx](app/[...slug]/page.tsx)) uses `resourceByPath` API to resolve any URL to a resource type (product, category, page, etc.)
3. **Template system** matches resource types to Puck templates via [lib/template-types.ts](lib/template-types.ts)
4. **Storage** auto-selects Redis (production) or file-based (local) backend via [lib/storage/index.ts](lib/storage/index.ts)

### Key Libraries

- **@finqu/storefront-sdk**: Server-side and React GraphQL client with hooks (server, react, graphql entry points)
- **@finqu/storefront-types**: TypeScript types for Finqu API (Product, Cart, Category, etc.)
- **@puckeditor/core**: Visual page builder with draft/publish workflow
- **shadcn/ui + Radix**: UI components (config in [components.json](components.json))

## Puck Component Pattern

Components follow a **dual-file pattern** for editor vs render modes:

```
components/product-grid/
├── product-grid.edit.puck.tsx   # 'use client' - interactive editor with pickers
├── product-grid.render.puck.tsx # Server-side - resolveData for fresh API data
├── shared.ts                    # Shared fetch logic
└── index.ts                     # Re-exports
```

**Simple components** use single file: `components/hero.puck.tsx`

### Creating a Puck Component

1. Export `category` string for sidebar grouping
2. Export `config: ComponentConfig<Props>` with fields, defaultProps, render
3. CLI auto-generates [.storefront/puck.\*.config.tsx](.storefront/) - **never edit these**

```tsx
// components/my-component.puck.tsx
import { type ComponentConfig } from '@finqu/storefront-sdk';

export const category = 'Marketing';

export const config: ComponentConfig<Props> = {
  label: 'My Component',
  fields: {
    /* field definitions */
  },
  defaultProps: {
    /* defaults */
  },
  render: ({ prop }) => <div>{prop}</div>,
};
```

## Storefront Client Usage

**Do NOT create REST API endpoints to wrap GraphQL queries.** Use `@finqu/storefront-sdk` directly.

```tsx
// Server Components - use singleton client from lib/storefront
import { storefrontClient, cachePresets, withLocale } from '@/lib/storefront';
import { getProduct, getCatalogProducts } from '@finqu/storefront-sdk/server';

// Using SDK helpers
const { product } = await getProduct(storefrontClient, { handle: 'my-product' });

// Fetch products from the catalog (supports filtering, sorting, pagination)
const result = await getCatalogProducts(storefrontClient, { first: 10, query: 'search term' });
const products = result.catalog.products.nodes;
const totalCount = result.catalog.products.totalCount;
const filters = result.catalog.products.filters;

// Custom queries with locale-specific caching
import { STORE_QUERY, type StoreQueryResponse } from '@/lib/queries';
const data = await storefrontClient.query<StoreQueryResponse>(
  STORE_QUERY,
  undefined,
  withLocale('fi', cachePresets.static)
);

// Client Components - use hooks from @finqu/storefront-sdk/react
import { useProduct, useCatalogProducts, useCart, useCreateCart } from '@finqu/storefront-sdk/react';
```

## Locale Handling

- Default locale has no URL prefix (`/products`)
- Non-default locales have prefix (`/sv/produkter`)
- Client components use `useLocale()` hook from [lib/locale-context.tsx](lib/locale-context.tsx)

## Commands

```bash
pnpm dev              # Start dev server (runs finqu storefront dev first)
pnpm build            # Build (runs finqu storefront build && next build)
pnpm lint             # ESLint
pnpm format           # Prettier format all files
```

## Key Directories

- `app/editor/` - Puck editor UI (page & template editing)
- `app/api/puck/` - API routes for saving/publishing Puck data
- `components/ui/` - shadcn primitives
- `components/*.puck.tsx` - Puck visual components
- `data/` - Local file storage for Puck configs (dev only)
- `.storefront/` - Auto-generated Puck configs (do not edit)

## Environment Variables

- `FINQU_STOREFRONT_URL` / `NEXT_PUBLIC_FINQU_STOREFRONT_URL` - API endpoint
- `FINQU_STOREFRONT_TOKEN` / `NEXT_PUBLIC_FINQU_STOREFRONT_TOKEN` - Auth token
- `UPSTASH_REDIS_REST_URL` - Enables Redis storage (production)
