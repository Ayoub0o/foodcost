# DEVIATIONS

Every extension beyond Bringer 2 variants, justified. New blocks are allowed
**only** where the PRD flags them, must live inside a Bringer 2 section shell,
and must reuse the template's tokens (colors, typography, spacing, radii).

| # | Deviation | Location | PRD authority | Justification |
|---|---|---|---|---|
| D1 | Embedded mini food-cost calculator (S5) | Homepage section shell | PRD §9 S5 (flagged) | No Bringer variant offers an interactive calculator; built inside a Bringer section using template tokens |
| D2 | Sourced price-comparison table (S7) | Homepage + `/vs/*`, inside `pricing.html` shell | PRD §9 S7, §10 legal guardrail | Template pricing table is decorative; a factual, sourced comparison with retrieval dates is required |
| D3 | Auth pages (login/signup, magic-link) | `(app)` route group | DIRECTIVE §4 (template ships no auth model) | Minimal pages built in the Bringer section shell with template tokens |
| D4 | In-app dashboard UI (shadcn/ui) | `(app)` / `(admin)` route groups | PRD §12 (dashboard may use shadcn/ui) | Adopts Bringer 2 color tokens + Inter typography for brand continuity |
| D5 | Tailwind theme from Bringer tokens | `apps/web/tailwind.config.ts` | DIRECTIVE §2/§12 | Design tokens extracted from `bringer/css/config.css`; no visual redesign |
| D6 | SEO schema + `ToolPageLayout` components live in `apps/web/src/components` | `apps/web/src/components/{seo,tools}` | DIRECTIVE §9-A | Consolidation into `packages/ui` deferred to avoid a second JSX build target during Phase 1; components are self-contained and portable |
| D7 | Free PDF export via browser print-to-PDF | `FoodCostCalculator` + print CSS in `globals.css` | PRD FR-7 (free PDF export) | MVP approach with zero deps; server PDF pipeline (Playwright/react-pdf) reserved for the paid technical-sheet export |
| D8 | Benchmark infographic as inline branded SVG | `BenchmarkInfographic.tsx` | PRD §9-A A3 (≥1 original infographic) | Rendered inline with Bringer tokens + accessible title; `ImageObject.contentUrl` points to the page anchor until a static PNG/SVG asset file is generated |
| D9 | Templates lead-magnet page with email gate | `(marketing)/templates` + `marketing_leads` table (migration 0004) | PRD §9 (templates lead-magnet) | Built in a Bringer section shell; email captured via server action using the service-role client (no anon RLS write); downloads are static CSV files under `/public/templates` (Excel/Sheets-compatible) — server-generated XLSX/PDF reserved for later |
| D10 | In-app dashboard built with plain Tailwind + Bringer tokens (not shadcn/ui) | `(app)/*`, `components/app/*` | §6 (D4 allowed shadcn/ui) | Kept a single styling system (Bringer tokens) to avoid a second component library and design drift; sidebar, drawers and the live cost panel reuse the marketing tokens |
| D11 | `is_sample` flag for the seeded demo menu | migration 0005; `ingredients`/`recipes` | §5.2 (sample workspace badged "Example — delete anytime") | A boolean marker lets the UI badge sample rows and enables one-click bulk cleanup later |
| D12 | Contextual help as an in-app slide-over (launch articles inline) | `components/app/HelpSlideOver.tsx` | §5.4/§5.6 | The full `/help` MDX Help Center with client-side search is deferred; the slide-over ships the per-page launch articles now so no field is unexplained |
| D13 | Transactional emails as Resend HTTP stubs (no React Email package yet) | `lib/email.ts`, cron `/api/cron/trial` | §5.7 / §11 Phase 3 | Plain-text Resend API calls with console stubs when `RESEND_API_KEY` is unset; React Email templates deferred to Phase 6 polish |
| D14 | Stripe webhook idempotency via `stripe_webhook_events` table | migration 0007, `/api/stripe/webhook` | §11 (replay-safe webhooks) | Event ids stored as PK; Admin Ops lists events (manual Stripe CLI replay) |
| D15 | Admin UI in plain Tailwind + Bringer tokens (not shadcn) | `(admin)/*` | §7 (shadcn allowed) | Same rationale as D10 — single styling system |
| D16 | Impersonation via httpOnly cookie + read-only mutations | `fc_impersonate_workspace`, `isWorkspaceReadOnly` | §7.2 | Avoids minting a second Auth session; banner + audit on start/end |
| D17 | Blog/help as MDX+frontmatter loaded via gray-matter (not full MDX runtime) | `content/**`, `react-markdown` | §9 | File-based content with Bringer-token article layout; full MDX components deferred |
| D18 | Comparison pages use TS data modules for sourced tables | `content/vs/competitors.ts` | §9 / S7 | Frontmatter-equivalent source URLs + retrieval dates; quarterly edit = data change |
| D19 | Portability export is JSON (+ separate xlsx reports), not a single zip | `/api/exports/data`, Reports | §10 | Beta ships audited JSON dump of workspace tables; zip packaging deferred |
| D20 | Sentry via `@sentry/nextjs` with silent local builds | `sentry.*.config.ts`, `instrumentation*.ts` | §11 Phase 6 | No-op without DSN; sourcemaps only when `SENTRY_AUTH_TOKEN` is set |
| D21 | Partial unique index: one active workspace per owner | migration `0009` | §5.2 / race on first login | Concurrent dashboard loads were creating duplicate workspaces; unique index + re-select on conflict |

> Update this table whenever a new block is introduced. The Bringer template
> global structure is never altered.
