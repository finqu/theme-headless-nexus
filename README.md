# Finqu Headless Commerce Theme

A modern Next.js 16 storefront theme for Finqu headless commerce, featuring an integrated visual page builder powered by [Puck](https://puckeditor.com/).

📚 **For detailed Finqu documentation**, visit [developers.finqu.com](https://developers.finqu.com)

🤖 **For AI coding agents**, start with [AGENTS.md](./AGENTS.md).

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Overview

This theme provides:

- **Dynamic routing** that resolves any URL to a Finqu resource (product, category, page, etc.)
- **Visual page builder** for customizing product pages, category pages, and custom pages
- **Multi-locale support** with automatic locale detection and switching
- **Server-side rendering** with Next.js App Router for optimal performance
- **Type-safe API integration** via `@finqu/storefront-sdk`
- **Component library** built with shadcn/ui and Radix primitives

## Architecture Overview

### Core Data Flow

1. **Request arrives** → Middleware detects locale and strips it from the URL path
2. **Dynamic router** resolves the URL path to a Finqu resource type and ID
3. **Template system** determines which renderer to use based on resource type
4. **Content delivery** → Either Puck template + visual blocks, or dedicated component (login, cart, etc.)

```
URL Request
    ↓
Middleware (locale detection)
    ↓
Dynamic Route Handler [app/(site)/[...slug]/page.tsx]
    ↓
Resource Resolver (resourceByPath API)
    ↓
Template Type Mapper
    ├─→ Templatable (product, category, page) → Puck Templates
    ├─→ System pages (login, cart, account) → Dedicated Components
    └─→ Not Found → 404
```

### Key Directories

| Directory      | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `app/(site)`   | Public storefront pages with dynamic routing             |
| `app/(editor)` | Visual editor UI and template management                 |
| `blocks/`      | Puck visual editor components (product grid, hero, etc.) |
| `components/`  | React UI components organized by feature                 |
| `templates/`   | Resource-specific renderers (product, category, account) |
| `lib/`         | Utilities, queries, and configuration                    |
| `data/`        | Local storage for Puck configs (development)             |
| `.storefront/` | **Auto-generated** Puck editor configs (do not edit)     |

## How Templates Work

Templates define the visual layout for different resource types in the Finqu catalog (products, categories, pages, etc.).

### Supported Template Types

| Type           | Resource         | Usage                     |
| -------------- | ---------------- | ------------------------- |
| `product`      | PRODUCT          | Individual product pages  |
| `category`     | PRODUCT_GROUP    | Category/collection pages |
| `page`         | PAGE, HOME       | Custom pages              |
| `article`      | ARTICLE          | Article/blog post pages   |
| `blog`         | BLOG             | Blog listing pages        |
| `catalog`      | PRODUCTS         | Product catalog pages     |
| `manufacturer` | MANUFACTURER     | Manufacturer pages        |
| `cart`         | CART             | Shopping cart pages       |
| `wishlist`     | ACCOUNT_WISHLIST | Wishlist pages            |

### Creating a Template

Templates are stored in the `templates/` directory and are responsible for rendering a specific resource type:

```tsx
// templates/my-resource-template.tsx
'use client';

import { useProduct } from '@finqu/storefront-sdk/react';
import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.render.config';

interface MyResourceTemplateProps {
  locale: string;
  id: number;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function MyResourceTemplate({ locale, id, searchParams }: MyResourceTemplateProps) {
  // Fetch data via SDK hook
  const { product } = useProduct({ id });

  if (!product) return <div>Loading...</div>;

  // Try to load custom template first, fall back to default
  const data = await getTemplateConfig('my-type', id, 'published');

  return (
    <>
      {/* Render Puck template if one exists */}
      {data && <Render config={config} data={data} />}

      {/* Fallback to dedicated component */}
      {!data && <DefaultMyResourceView product={product} />}
    </>
  );
}
```

### Template Storage & Versions

Templates are stored with two versions:

- **Draft** (`draft`) - In-progress changes in the editor
- **Published** (`published`) - Live version shown to customers

Each template type has:

- **Default template** - Applied to all resources of that type
- **Resource-specific override** - Applied only to specific products/categories

```
Template Key Structure:
- Default:    template:{type}:default:{version}
- Override:   template:{type}:slug:{resourceId}:{version}
- Page:       page:{pageId}:{version}
```

## How Blocks Work

Blocks are Puck visual components that merchants can add and customize in the editor. Each block defines:

1. **Editor configuration** - UI controls for customization
2. **Render function** - How to display the block on the storefront
3. **Category** - Where it appears in the editor sidebar

### Simple Block Example

```tsx
// blocks/hero.puck.tsx
import { type ComponentConfig } from '@puckeditor/core';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

export const category = 'Marketing';

export const config: ComponentConfig<HeroProps> = {
  label: 'Hero Banner',

  fields: {
    title: {
      type: 'text',
      label: 'Title',
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle',
    },
    backgroundImage: {
      type: 'text',
      label: 'Background Image URL (optional)',
    },
  },

  defaultProps: {
    title: 'Welcome to our store',
    subtitle: 'Discover amazing products',
  },

  render: ({ title, subtitle, backgroundImage }) => (
    <div
      className="relative py-24 text-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-2 text-xl text-gray-600">{subtitle}</p>
    </div>
  ),
};
```

### Complex Block with Editor & Render Separation

For blocks that need interactive features in the editor (like product selection), split them into two files:

```
blocks/product-grid/
├── product-grid.edit.puck.tsx    # Editor mode with interactivity
├── product-grid.render.puck.tsx  # Render mode with data fetching
├── shared.ts                     # Shared utilities
└── index.ts                      # Exports
```

**Edit mode** (`*.edit.puck.tsx`) - `'use client'` component:

- Runs in the editor UI
- Can have interactive features (pickers, dialogs)
- Stores lightweight data (IDs, not full objects)
- Has access to editor context

```tsx
'use client';

import { type ComponentConfig } from '@puckeditor/core';

interface ProductGridProps {
  selectedProductIds?: number[]; // Lightweight data
  selectedProducts?: Product[]; // For preview
  title: string;
}

export const config: ComponentConfig<ProductGridProps> = {
  label: 'Product Grid',
  fields: {
    selectedProductIds: {
      type: 'custom',
      render: ({ value, onChange }) => <ProductPickerField value={value} onChange={onChange} />,
    },
    title: {
      type: 'text',
      label: 'Section Title',
    },
  },
  defaultProps: {
    selectedProductIds: [],
    title: 'Featured Products',
  },
  render: ({ selectedProductIds, title }) => {
    return <ProductGridPreview ids={selectedProductIds} title={title} />;
  },
};
```

**Render mode** (`*.render.puck.tsx`) - Server component:

- Runs on the published storefront
- Fetches fresh data from the API
- Uses Suspense for streaming
- No interactive features

```tsx
// Server component by default
import { Suspense } from 'react';
import { type ComponentConfig } from '@puckeditor/core';

interface ProductGridProps {
  selectedProductIds?: number[];
  title: string;
}

export const config: ComponentConfig<ProductGridProps> = {
  label: 'Product Grid',
  defaultProps: {
    selectedProductIds: [],
    title: 'Featured Products',
  },
  render: ({ selectedProductIds, title }) => (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductGridAsync ids={selectedProductIds} title={title} />
    </Suspense>
  ),
};
```

### Block Field Types

The `fields` object in block config defines customizable properties:

```tsx
fields: {
  // Text input
  title: {
    type: 'text',
    label: 'Title',
  },

  // Multi-line text
  description: {
    type: 'textarea',
    label: 'Description',
  },

  // Select dropdown
  alignment: {
    type: 'radio',
    label: 'Text Alignment',
    options: [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
  },

  // Number input
  columns: {
    type: 'number',
    label: 'Grid Columns',
  },

  // Custom component field
  products: {
    type: 'custom',
    render: ({ value, onChange }) => (
      <CustomProductPicker value={value} onChange={onChange} />
    ),
  },
}
```

### Auto-Generated Puck Config

The `.storefront/` directory contains auto-generated Puck editor configurations:

- **`.storefront/puck.edit.config.tsx`** - Editor configuration (all blocks in edit mode)
- **`.storefront/puck.render.config.tsx`** - Render configuration (all blocks in render mode)

**⚠️ Never edit these files manually.** They're regenerated by the build process.

To regenerate them:

```bash
pnpm dev  # Runs finqu storefront dev --components=./blocks
```

The CLI scans the `blocks/` directory for files matching `*.puck.tsx` and generates the configs automatically.

## Data Fetching

### Server Components

Use the Finqu SDK in Server Components for direct API access:

```tsx
// app/my-component.tsx (Server Component)
import { storefrontClient, cachePresets } from '@/lib/storefront';
import { getProduct, getCatalogProducts } from '@finqu/storefront-sdk/server';

export default async function ServerComponent() {
  // Using SDK helper
  const { product } = await getProduct(storefrontClient, {
    handle: 'my-product-slug',
  });

  // Direct query
  const result = await getCatalogProducts(storefrontClient, {
    first: 10,
    query: 'search term',
  });

  const products = result.catalog.products.nodes;
  const totalCount = result.catalog.products.totalCount;

  return <div>{product?.title}</div>;
}
```

### Client Components

Use React hooks for client-side data fetching:

```tsx
'use client';

import { useProduct, useCatalogProducts } from '@finqu/storefront-sdk/react';

export function ClientComponent() {
  const { product, isLoading } = useProduct({
    id: 123,
  });

  const { products } = useCatalogProducts({
    first: 20,
    query: 'shirts',
  });

  return <div>{isLoading ? <div>Loading...</div> : <div>{product?.title}</div>}</div>;
}
```

### Caching Strategy

The SDK provides cache presets for different data types:

```tsx
import { storefrontClient, cachePresets, withLocale } from '@/lib/storefront';

// Long-lived data (1 hour)
const menus = await storefrontClient.query(MENU_QUERY, {}, withLocale('en', cachePresets.static));

// Product data (1 minute)
const products = await storefrontClient.query(PRODUCTS_QUERY, {}, cachePresets.products);

// Dynamic data (no cache)
const cart = await storefrontClient.query(CART_QUERY, {}, cachePresets.dynamic);
```

## Multi-Locale Support

The theme supports multiple locales with automatic detection and URL-based switching.

### Locale Detection

The middleware detects locale from the URL and passes it to the app via headers:

- Default locale has no URL prefix: `/products`
- Non-default locales have prefix: `/sv/produkter`, `/en/products`

### Using Locale in Components

**Server Components:**

```tsx
import { getLocale } from '@/lib/locale';

export default async function ServerComponent() {
  const locale = await getLocale();
  // Use locale for fetching, caching, etc.
}
```

**Client Components:**

```tsx
'use client';

import { useLocale } from '@/lib/context-providers/locale-context';

export function ClientComponent() {
  const { locale } = useLocale();
  // Use locale for client-side logic
}
```

### Locale Switcher

The `LocaleSwitcher` component allows users to change languages:

```tsx
// components/layout/locale-switcher.tsx
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

## Editor Usage

The visual editor is available at `/editor`. It provides:

- **Page Editor** - Customize specific pages by ID
- **Template Editor** - Set default layouts for resource types
- **Draft/Publish Workflow** - Save changes before publishing
- **Viewport Previews** - Test on desktop, tablet, mobile

### Accessing the Editor

1. Navigate to `/editor`
2. Select a template type or page to edit
3. Drag blocks from the sidebar to compose the page
4. Configure each block using the right panel
5. Save as draft or publish live

### Saving Templates

The editor automatically saves changes to storage (Redis in production, file-based locally):

- **Draft version** - In-progress changes
- **Publish version** - Live to customers

API endpoints:

```
POST /api/puck/template/save     # Save draft
POST /api/puck/template/publish  # Publish draft
POST /api/puck/page/save         # Save page draft
POST /api/puck/page/publish      # Publish page
```

## Environment Variables

```bash
# Finqu API Configuration
FINQU_STOREFRONT_URL=https://your-storefront.finqu.dev
FINQU_SECRET_KEY=sk_...

# Public API access (for client-side queries)
NEXT_PUBLIC_FINQU_STOREFRONT_URL=https://your-storefront.finqu.dev
NEXT_PUBLIC_FINQU_PUBLIC_KEY=pk_...

# Redis (optional - enables production storage)
KV_REST_API_URL=https://...
```

### Storage Modes

- **Development** - File-based storage in `data/` directory
- **Production** - Redis storage (when `KV_REST_API_URL` is set)

## Building Custom Blocks

### Block Checklist

- [ ] Create file in `blocks/` matching pattern `*.puck.tsx`
- [ ] Export `category` string
- [ ] Export `config: ComponentConfig<Props>`
- [ ] Define `fields` for editor controls
- [ ] Provide `defaultProps`
- [ ] Implement `render` function
- [ ] Rebuild to generate `.storefront/` configs

### Best Practices

1. **Keep blocks focused** - One responsibility per block
2. **Store lightweight data** - Use IDs instead of full objects
3. **Use Suspense in render mode** - For streaming and loading states
4. **Provide good defaults** - Make blocks usable immediately
5. **Add helpful labels** - Make editor UI self-documenting
6. **Test in the editor** - Verify behavior at different viewports

## Styling

The theme uses Tailwind CSS for styling with shadcn/ui components.

### Tailwind Configuration

- PostCSS 4 with Tailwind CSS 4
- Plugins: `@tailwindcss/postcss`
- Responsive design with mobile-first approach

### Fonts

Three font families are available via CSS variables:

```css
--font-outfit      /* Display font */
--font-geist-sans  /* Sans serif */
--font-geist-mono  /* Monospace */
```

Use in components:

```tsx
<h1 className="font-outfit">Heading</h1>
```

## Commands

```bash
# Development
pnpm dev              # Start dev server with auto-generated Puck configs
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting

# Production
pnpm build            # Build Next.js + regenerate Puck configs
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint
```

## Project Structure

```
theme-headless-nexus/
├── app/
│   ├── (editor)/               # Editor UI and API routes
│   │   ├── api/                # API endpoints for template/page save/publish
│   │   └── editor/             # Puck editor interface
│   ├── (site)/                 # Public storefront
│   │   └── [...slug]/          # Dynamic route for all URLs
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
│
├── blocks/                     # Puck visual components
│   ├── get-started.puck.tsx
│   └── product-grid/           # Complex block with edit/render separation
│       ├── product-grid.edit.puck.tsx
│       ├── product-grid.render.puck.tsx
│       └── shared.ts
│
├── components/                 # React UI components
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # Header, footer, navbar
│   ├── product/                # Product-specific components
│   ├── cart/                   # Shopping cart components
│   ├── auth/                   # Authentication UI
│   ├── search/                 # Search interface
│   ├── editor/                 # Editor-specific UI
│   └── shared/                 # Shared utilities
│
├── templates/                  # Resource type renderers
│   ├── product-template.tsx
│   ├── products-template.tsx
│   ├── account-template.tsx
│   ├── cart-template.tsx
│   └── ...
│
├── lib/
│   ├── storefront.ts           # Finqu SDK client
│   ├── resource-resolver.ts    # URL to resource mapping
│   ├── template-types.ts       # Template type definitions
│   ├── locale.ts               # Locale utilities
│   ├── puck/
│   │   ├── config.tsx          # Puck editor configuration
│   │   └── storage.ts          # Template/page storage
│   ├── storage/                # Storage adapter (Redis/File)
│   ├── context-providers/      # React context providers
│   └── queries/                # GraphQL queries
│
├── data/                       # Local storage (dev only)
│   ├── layout/
│   └── page/
│
├── .storefront/                # Auto-generated Puck configs (DO NOT EDIT)
│   ├── puck.edit.config.tsx
│   └── puck.render.config.tsx
│
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Troubleshooting

### Blocks not appearing in editor

1. Ensure file matches `*.puck.tsx` pattern
2. Check that `config` and `category` are exported
3. Run `pnpm dev` to regenerate `.storefront/` configs
4. Clear browser cache

### Template not showing on storefront

1. Check that `getTemplateConfig()` returns data for your template
2. Verify the template type is in `TEMPLATE_TYPES`
3. Confirm the resource ID matches the Finqu resource ID
4. Check storage backend (Redis/file) has the template data

### Locale not switching

1. Verify middleware is processing the locale header
2. Check that URL has proper locale prefix (e.g., `/sv/...`)
3. Ensure all locales are configured in `lib/locale.ts`

## Contributing

When extending this theme:

1. Follow the block patterns for new visual components
2. Add new templates in `templates/` for new resource types
3. Use the SDK for all Finqu API calls
4. Keep components focused and reusable
5. Test across different viewports

## Support

For questions or issues:

- **Finqu Documentation** - [developers.finqu.com](https://developers.finqu.com)
- **Puck Editor** - [puckeditor.com](https://puckeditor.com)
- **Next.js** - [nextjs.org](https://nextjs.org)
