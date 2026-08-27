# Copilot — theme-headless-nexus

Follow the repository root `AGENTS.md`. It is the source of truth for commands, architecture, env vars, and boundaries.

This is a Finqu headless Next.js 16 storefront. URLs resolve through GraphQL `resourceByPath`. Prefer `@finqu/storefront-sdk` over custom REST. Never edit `.storefront/`. Checkout is `cart.checkoutUrl`.
