---
name: finqu-headless
description: 'Headless storefront development with Next.js, Storefront SDK, and Puck visual editor'
---

# Finqu Headless Storefront

## When to use

Use this skill when:

- Creating a new headless storefront with Next.js
- Using the Storefront SDK (`@finqu/storefront-sdk`)
- Building or customizing Puck visual editor components
- Setting up customer authentication in a headless storefront
- Configuring data fetching, caching, or multi-locale support

## Inputs required

- **Project root**: path to the storefront project
- **Finqu account**: merchant account with storefront API key (prefixed `fq_`)
- **Node.js 18+**: required runtime

## Procedure

### 0) Choose your starting point

**Option A — Use the CLI:**

```bash
npm install -g @finqu/cli
finqu sign-in
finqu storefront init
npm run dev
```

**Option B — Start from scratch:**

```bash
npx create-next-app@latest my-storefront
cd my-storefront
npm install @finqu/storefront-sdk
```

**Option C — Use the create command:**

```bash
pnpm create @finqu/storefront my-storefront
cd my-storefront
pnpm install
pnpm dev
```

### 1) Configure the SDK

Get your API key from Channel settings in Finqu admin (keys start with `fq_`).

```typescript
import { StorefrontClient } from '@finqu/storefront-sdk';

const client = new StorefrontClient({
    storeDomain: 'your-store.finqu.com',
    apiKey: process.env.FINQU_STOREFRONT_API_KEY,
});
```

**Never hardcode the API key** — use environment variables.

Read: `references/storefront-sdk.md`

### 2) Data fetching

1. Use the SDK's GraphQL client for fetching products, collections, cart, etc.
2. Server client (`@finqu/storefront-sdk/server`) supports Next.js ISR caching
3. React hooks (`@finqu/storefront-sdk/react`) for client components
4. Cache presets: `static`, `products`, `dynamic`

Read: `references/data-fetching.md`

### 3) Visual editing with Puck

1. Define components using `defineComponent` helper from the SDK
2. Components are self-contained with props, rendering, and editor config
3. Register components in the Puck configuration
4. Pages are editable via the visual editor in the admin

Read: `references/visual-editing.md`

### 4) Customer authentication

1. Customers authenticate via the Storefront GraphQL API
2. Use `customerAccessTokenCreate` mutation to get tokens
3. Include customer access token in subsequent requests
4. Handle token renewal and deletion

### 5) Environment variables

Set up required environment variables for the storefront.

Read: `references/environment-variables.md`

### 6) Development workflow

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
```

## Verification

- `pnpm dev` starts without errors
- Products load from the Storefront API
- Cart operations work (add, update, remove)
- Customer login/registration functions correctly
- Visual editor renders and saves page changes
- Multi-locale switching works (if configured)
- Build completes without errors: `pnpm build`

## Failure modes / debugging

- **API key error**: Verify key starts with `fq_`, check environment variable is set
- **Products not loading**: Confirm store domain and API key match the correct channel
- **CORS errors**: Ensure storefront domain is allowed in channel settings
- **Build failures**: Check TypeScript errors, verify SDK version compatibility
- **Puck editor not loading**: Ensure visual editing is configured and admin routes are accessible

## Escalation

- See [Storefront overview](https://developers.finqu.com/build-with-finqu/storefront/overview.md.txt)
- See [Storefront SDK docs](https://developers.finqu.com/build-with-finqu/storefront/storefront-sdk.md.txt)
- See [Storefront GraphQL API reference](https://developers.finqu.com/reference/storefront/1.1.0.md.txt)
