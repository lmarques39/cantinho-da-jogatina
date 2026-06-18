# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start development server (http://localhost:3000)
npm run build        # production build
npm run lint         # ESLint via Next.js
npm run import:wordpress  # import product data from scripts/wordpress-export.json into Supabase
```

No test suite is configured. TypeScript is the only static check (`tsc --noEmit` via `tsconfig.json`).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 3
- **Supabase** (`@supabase/ssr`) — Postgres + Auth (RLS enabled)
- **EasyPay** — payment gateway (Multibanco, MB WAY, card)
- **Zustand** — cart state, persisted to `localStorage` under key `cantinho-carrinho`
- **Zod** — input validation in API route handlers

## Architecture

### Supabase client hierarchy

Three separate clients in `src/lib/supabase/server.ts` — choose carefully:

| Function | Use when |
|---|---|
| `createClient()` | Server Components, Route Handlers that need the user's session (respects RLS) |
| `createPublicClient()` | Public data (products, categories) — no session, no RLS for authenticated policies |
| `createServiceRoleClient()` | Trusted server code only (order creation, webhooks) — bypasses RLS entirely |

The browser client lives in `src/lib/supabase/client.ts`. **Never import `createServiceRoleClient` in a Client Component.**

### Data layer

`src/lib/data/products.ts` contains all Supabase queries. Products are fetched with a large nested `PRODUCT_SELECT` string (categories, tags, attributes, images, variations via junction tables). Filtering by `productType` and `brand` happens **in memory after fetching** because these depend on category/attribute joins that don't map cleanly to SQL predicates — pagination is applied only after the in-memory filter.

### Taxonomy / filter system

`src/lib/taxonomy.ts` maps the raw 23-category WordPress hierarchy into two independent filter axes:

1. **Product Type**: `jogos | jogos-soltos | consolas | acessorios` (from category slugs)
2. **Brand**: `playstation | xbox | nintendo | pc | retro` (from `pa_plataforma` attribute; Retro categories override specific platform)

When adding or renaming categories/platforms, update the constants in `taxonomy.ts`.

### Authentication

Supabase Auth with PKCE flow. The `src/middleware.ts` guards `/checkout` — unauthenticated users are redirected to `/login?next=/checkout`. The `/auth/callback` route must be excluded from middleware (it's in the matcher exclusion list). Auth state is propagated via cookies using `getAll`/`setAll` (not the deprecated `get`/`set` API).

### Checkout / payment flow

1. Client POSTs to `POST /api/checkout` with cart items + customer + address
2. Route handler (service role) creates the order in Supabase with status `pending`
3. Calls EasyPay API (`src/lib/easypay/client.ts`) to get a payment manifest
4. Browser uses the manifest to show EasyPay's embedded checkout UI
5. EasyPay calls `POST /api/webhooks/easypay` on payment confirmation — only here does the order become `paid`

**Never trust the client-side payment callback for critical logic** (stock reduction, confirmation emails).

### Shipping cost rule

Currently hardcoded in `src/app/api/checkout/route.ts`: free shipping for orders ≥ €50, otherwise €4.99.

## Environment variables

Copy `.env.example` to `.env.local`. Required:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server-side only
EASYPAY_ACCOUNT_ID
EASYPAY_API_KEY
EASYPAY_ENV                    # 'test' or 'prod'
NEXT_PUBLIC_SITE_URL
```

## Database schema

Single migration at `supabase/migrations/0001_initial_schema.sql`. Key tables: `products`, `product_variations`, `product_categories`, `product_tags`, `product_attribute_values`, `categories`, `attributes`, `attribute_values`, `product_images`, `orders`, `order_items`, `customers`, `addresses`, `pages`.

All product filtering relies on junction tables. Product `status` is either `'publish'` or `'draft'` — only published products are shown publicly.

### Shop URL query params

`/loja` and `GET /api/produtos` (used for "load more" pagination) share the same Portuguese param names:

| Param | Values |
|---|---|
| `tipo` | `jogos \| jogos-soltos \| consolas \| acessorios` |
| `marca` | `playstation \| xbox \| nintendo \| pc \| retro` |
| `plataforma` | platform slug (e.g. `ps5`, `xbox-one`) |
| `estado` | condition tag slug |
| `pesquisa` | free-text search |
| `ordenar` | `newest \| price_asc \| price_desc \| title_asc` |
| `pagina` | page number (integer, default 1) |

`/loja/page.tsx` exports `dynamic = 'force-dynamic'` so filter changes re-render server-side without caching.

### Institutional pages

Legal/policy pages (`/politica-de-privacidade`, `/termos-e-condicoes`, etc.) pull their content from the `pages` table via `renderInstitutionalPage(slug)` in `src/lib/pages.tsx`. Content can be raw HTML (from the WordPress import) or plain text — the helper detects and converts as needed.

### Design system

Custom Tailwind tokens defined in `tailwind.config.js` and driven by CSS variables in `src/app/globals.css`:

- **`ink-*`** (50–950) — the main neutral scale. It **inverts between themes**: `ink-50` is dark text in light mode and near-white in dark mode; `ink-800` is white in light mode and the dark teal page background in dark mode. The CSS variables swap automatically, so **never add `dark:` prefix to `ink-*` classes** — the tokens already handle it.
- **`cartridge-*`** — amber/gold accent (primary CTAs, highlights). Also theme-adaptive.
- **`leaf-*`** — green (e.g. in-stock badges). Static values.
- **`signal-*`** — red (errors, destructive actions). Static values.
- `darkMode: 'class'` — toggled by adding `.dark` to `<html>` (see `src/components/layout/theme-toggle.tsx`).
- `@/` in imports maps to `src/`.

## Image hosting

Product images currently point to the old WordPress domain (`cantinhodajogatina.shop`). New images should go to Supabase Storage (bucket `product-images`). The `next.config.js` allowlist includes `**.supabase.co`, `cantinhodajogatina.shop`, and `lh3.googleusercontent.com` (Google profile photos).
