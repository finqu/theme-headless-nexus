---
name: keep-modern
description: Incrementally upgrades this Nexus Next.js storefront — dependencies, Next.js/React, Finqu SDK, Puck, Tailwind, shadcn, and agent skills — without large unrelated refactors. Use when asked to keep the project up to date, bump packages, apply framework migrations, refresh Finqu skills, or modernize patterns.
---

# Keep modern

One concern per change. Prefer a small PR that compiles over a wide rewrite.

## Procedure

1. Read `package.json` and `skills-lock.json`. Note current `next`, `react`, `@finqu/storefront-sdk`, `@finqu/storefront-types`, `@puckeditor/core`, `tailwindcss`.
2. Choose **one** track:

   | Track            | What to do                                                                                                                                                       |
   | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | Patch/minor deps | `pnpm update` within ranges; review changelog; run `pnpm typecheck` + `pnpm format`.                                                                             |
   | Next.js          | Follow https://nextjs.org/docs/app/guides/upgrading and run official codemods. Keep `proxy.ts` (do not reintroduce `middleware.ts` unless Next requires it).     |
   | Finqu SDK/types  | Diff exports in `node_modules/@finqu/storefront-sdk`. Update helpers/queries; do not paper over breaks with `any`.                                               |
   | Agent skills     | `npx skills add Finqu/skills --skill finqu-router --skill finqu-headless --skill finqu-storefront-api --skill finqu-cli -y` then re-apply `AGENTS.md` overrides. |
   | Format gate      | The repo currently fails `pnpm format:check` on many existing files. A dedicated format-only PR that makes CI possible is in scope.                              |
   | Performance      | Apply one high-impact rule from `vercel-react-best-practices` (waterfalls, `optimizePackageImports` for `lucide-react`, serialization).                          |
   | UI kit           | Add shadcn components via the project `components.json` (New York, RSC, Tailwind 4).                                                                             |

3. Do not bump a major without reading the migration guide.
4. Keep env var **names used in code** in sync across `.env.example`, `AGENTS.md`, and `README.md`.
5. Leave checkout hosted. Leave `.storefront/` generated.
6. Format only files you touched. Do not mass-reformat the repo unless this run is the Format gate track. Run `pnpm typecheck` if `.storefront/` exists. Smoke home, product, and cart drawer when the app can boot.

## Out of scope unless requested

- Visual redesigns
- New product features (use `ecommerce-pages` instead)
- Rewriting working Puck storage adapters
