# FoodCost by PixPlat

Bilingual (EN/FR) self-serve **food cost management** micro-SaaS served at
`pixplat.com/foodcost`. Core differentiator: the **instant cost-propagation
engine** — an ingredient price change instantly recalculates every affected
recipe and flags threshold crossings.

> Product truth: `PRD_FoodCost_by_PixPlat (1).md`. Execution plan:
> `DIRECTIVE_Claude_Code_FoodCost (1).md`.

## Monorepo layout

```
apps/web                 → Next.js App Router app (marketing + product + admin)
packages/costing-engine  → pure, framework-free TypeScript costing kernel (≥90% coverage)
content/blog|help        → MDX articles (EN/FR) — added in later phases
bringer/                 → untouched Bringer 2 template (read-only reference) + INVENTORY/MAPPING
scripts/                 → CI guards (e.g. no service-role key in client bundle)
DEVIATIONS.md            → every extension beyond Bringer 2 variants, justified
```

## Requirements

- Node ≥ 20 (developed on Node 24), npm workspaces.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Stripe / Resend keys

# Costing kernel
npm run test --workspace packages/costing-engine
npm run test:coverage --workspace packages/costing-engine

# Web app (served under /foodcost)
npm run dev --workspace apps/web       # http://localhost:3000/foodcost/en
npm run build --workspace apps/web
```

## Root scripts

| Script | Purpose |
|---|---|
| `npm run test` | Run tests across all workspaces |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run build` | Build all workspaces |
| `npm run check:no-service-key` | CI guard: service-role key must never reach the client bundle |

## Hard rules (from PRD/DIRECTIVE)

- All public/marketing pages are server-rendered (SSG/SSR); no client-only indexable content.
- The costing engine is a pure TS library with ≥90% test coverage (currently ~97%).
- Bringer 2 governs public UI — reuse variants, never redesign; log extensions in `DEVIATIONS.md`.
- All money in integer cents; all quantities normalized to base units (g / ml / unit).
- Anti-scope (MVP): no inventory, purchasing, invoice OCR, POS sync, or accounting.

## Status

Phase 0 (Foundations) in progress: monorepo, costing kernel + tests, Next.js
App Router + Tailwind (Bringer tokens) + next-intl (EN/FR under `/foodcost`),
`.env.example`, CI service-key guard, Bringer inventory/mapping. Next: Supabase
schema migrations and auth flows.
