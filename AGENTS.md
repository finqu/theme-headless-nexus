# theme-headless-nexus

Finqu headless Next.js 16 storefront (Nexus). Every public URL is resolved with GraphQL `resourceByPath`, then rendered by a Puck template or a `templates/` fallback.

This file is the source of truth for agents. **This repo’s code wins** over generic Finqu skill snippets (do not use `new StorefrontClient` or `FINQU_STORE_DOMAIN` here).

## Commands

```bash
pnpm install
pnpm dev              # finqu storefront dev --components=./blocks
pnpm build
pnpm start
pnpm format
pnpm format:check
pnpm typecheck
```

Package manager is **pnpm**. Do not add npm lockfiles.

## Non-obvious architecture

- Locale handling lives in `proxy.ts` (Next.js 16), not `middleware.ts`. It sets `x-locale` and `x-pathname` on the request.
- Catch-all storefront route: `app/(site)/[...slug]/page.tsx`. Home is `app/page.tsx`.
- `resourceByPath` returns string IDs. SDK helpers expect numbers — `parseInt(id, 10)` at the boundary.
- Prefer `@finqu/storefront-sdk/server` and `@finqu/storefront-sdk/react` helpers. Custom GraphQL belongs in `lib/queries/` only for gaps (routing, store, CMS, policies).
- Server client: `createFinquServerClient` in `lib/storefront.ts` with `FINQU_STOREFRONT_URL` + `FINQU_SECRET_KEY`.
- Browser client: `FinquProvider` in `app/providers.tsx` with `NEXT_PUBLIC_FINQU_STOREFRONT_URL` + `NEXT_PUBLIC_FINQU_PUBLIC_KEY`.
- Cache with `cachePresets` + `withLocale`. Never wrap GraphQL in REST route handlers.
- Puck blocks live in `blocks/` as `*.puck.tsx`. Never edit `.storefront/` (CLI-generated).
- Checkout is hosted: send the shopper to `cart.checkoutUrl`. Do not build a payment form.
- Cart state already exists (`CartProvider`, drawer, add-to-cart). The cart _page_ template is still a stub.
- Visual editor is `/editor`, gated by `finqu_editor_token` in `proxy.ts`.

## Env vars (as used in code)

| Name                                                     | Where                      |
| -------------------------------------------------------- | -------------------------- |
| `FINQU_STOREFRONT_URL`                                   | Server GraphQL endpoint    |
| `FINQU_SECRET_KEY`                                       | Server SDK secret          |
| `NEXT_PUBLIC_FINQU_STOREFRONT_URL`                       | Browser GraphQL endpoint   |
| `NEXT_PUBLIC_FINQU_PUBLIC_KEY`                           | `FinquProvider` public key |
| `FINQU_EDITOR_SIGNING_KEY` / `FINQU_HEADLESS_SECRET_KEY` | Editor JWT                 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN`                  | Production Puck storage    |

Copy from `.env.example`. Never commit `.env.local`.

## Boundaries

**Always**

- RSC-first; `'use client'` only for interactivity.
- shadcn/ui + Tailwind 4. Match existing layout/product/cart patterns.
- Parallel independent fetches (`Promise.all`). Use Suspense for below-the-fold data.
- Register new resource UIs in `templates/index.tsx`.
- After adding Puck blocks, rely on `pnpm dev` to regenerate `.storefront/`.

**Ask first**

- New environment variables, checkout/payment changes, deleting Puck storage, major dependency upgrades.

**Never**

- Commit secrets, `.env.local`, or `.storefront/`.
- Invent REST wrappers for Storefront GraphQL.
- Mutate arrays with `.sort()`; use `.toSorted()`.

## Skills

Load in this order when relevant:

1. `finqu-router` — confirm this is a headless Next.js storefront.
2. `finqu-headless` + `finqu-storefront-api` — platform GraphQL/SDK (then apply this file’s overrides).
3. `ecommerce-pages` — implement the next storefront page from the backlog.
4. `keep-modern` — dependency and framework hygiene.
5. `vercel-react-best-practices` — React/Next performance.

Human docs: `README.md`. API: [developers.finqu.com](https://developers.finqu.com).
