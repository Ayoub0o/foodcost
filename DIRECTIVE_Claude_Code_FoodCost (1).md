# AGENT LAUNCH DIRECTIVE — FoodCost by PixPlat
**Audience:** Claude Code (autonomous coding agent)
**Companion document:** `PRD_FoodCost_by_PixPlat.md` (product truth — read it in full before any task)
**Status:** Execution-ready. Follow phases in order. Do not skip acceptance criteria.

---

## 0. Mission & Reading Order

Build FoodCost by PixPlat: a bilingual (EN/FR) self-serve food cost management micro-SaaS at `pixplat.com/foodcost`, priced at $12/mo with a 14-day full trial, whose core differentiator is the **instant cost-propagation engine** (ingredient price change → all affected recipes recalculated → threshold alerts).

Reading order before writing any code:
1. `PRD_FoodCost_by_PixPlat.md` — full read (vision, scope, anti-scope, SEO, pricing).
2. The **Bringer 2 template folder** — full inventory pass (see §2).
3. This directive.

**Non-negotiables (repeat of PRD hard rules):**
- All public/marketing pages server-rendered (SSG/SSR). Zero client-side-only indexable content.
- Costing engine = pure, framework-free TypeScript library with ≥90% test coverage.
- Bringer 2 governs all public UI. Never redesign from scratch. Never alter the template's global structure.
- Anti-scope: no inventory, no purchasing, no invoice OCR, no POS sync, no accounting (MVP).
- All money in integer cents; all quantities normalized to base units (g / ml / unit).

---

## 1. Stack & Project Setup

- **Framework:** Next.js (App Router, TypeScript strict). Deployed under the `/foodcost` base path of pixplat.com (configure `basePath` or reverse-proxy route — confirm with existing PixPlat infra before Phase 1; fallback: subdomain with 301-safe plan, but subdirectory is the default per PRD).
- **DB/Auth:** Supabase (Postgres, Auth, Row Level Security, Storage for photos/exports).
- **Payments:** Stripe (Checkout, Billing Portal, webhooks).
- **Email:** Resend + React Email templates.
- **i18n:** next-intl, routes `/foodcost/en/...` and `/foodcost/fr/...` with hreflang pairs; default locale detection by `Accept-Language`, persisted per user.
- **Exports:** exceljs (xlsx), Playwright/Chromium print pipeline or react-pdf (PDF technical sheets).
- **Analytics:** Plausible (or GA4 if PixPlat standard) + Google Search Console verification.
- **Testing:** Vitest (unit — costing kernel mandatory), Playwright (E2E golden paths).
- **Repo layout:**

```
/apps/web                 → Next.js app (marketing + product + admin)
  /app/[locale]/(marketing)   → Bringer 2 pages (home, features, pricing, tools, templates, vs, blog)
  /app/[locale]/(app)         → authenticated user dashboard
  /app/[locale]/(admin)       → platform admin (role-gated)
  /app/api                    → route handlers (webhooks, exports, cron)
/packages/costing-engine  → pure TS library (the kernel)
/packages/ui              → wrappers around Bringer 2 components + shadcn/ui for app
/content/blog/{en,fr}     → MDX articles (see §9)
/content/help/{en,fr}     → MDX help-center articles (see §8)
/bringer2                 → untouched template source (read-only reference)
DEVIATIONS.md             → every extension beyond Bringer 2 variants, justified
```

- **Environment variables (declare in `.env.example`):** `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `RESEND_API_KEY`, `CRON_SECRET`, `ADMIN_EMAILS` (bootstrap allowlist).

---

## 2. Bringer 2 Workflow (mandatory, before any marketing page)

Three passes, in order, with written artifacts:

1. **Inventory pass** → produce `bringer2/INVENTORY.md`: catalog every page model and every section variant (id, file path, purpose, structure, notable props/slots). Cover: Home Page models, Features sections, Blog models (listing + article), CTA variants, Testimonials, FAQ, Pricing/tables, headers/footers, and any auth/utility pages the template ships.
2. **Selection pass** → produce `bringer2/MAPPING.md`: for every marketing page in PRD §9 AND each homepage section S1–S12, record the chosen variant and why.
3. **Assembly pass** → build pages by composing selected variants with FoodCost content (EN + FR).

New blocks are allowed ONLY where PRD flags them (embedded mini-calculator S5, sourced price-comparison table S7) and must live inside a Bringer 2 section shell using template tokens. Log each in `DEVIATIONS.md`.

**Blog display rule:** the blog listing page and article page MUST use Bringer 2's blog models as-is (choose the variant closest to a content-marketing blog with categories and author block). Do not invent a custom blog layout.

---

## 3. Data Model (Supabase / Postgres)

Create via versioned SQL migrations. All tables RLS-enabled.

```
profiles            id (=auth.users.id), full_name, locale, created_at,
                    is_platform_admin boolean default false
workspaces          id, name, currency (CAD|USD|EUR), locale, target_food_cost_pct
                    (default 30.00), vat_mode (ht|ttc), trial_ends_at, plan
                    (trialing|pro|studio|locked), owner_id, created_at, deleted_at
memberships         workspace_id, user_id, role (owner|member) — MVP: owner only,
                    table exists for V2 seats
ingredients         id, workspace_id, name, supplier_name, purchase_qty numeric,
                    purchase_unit, purchase_price_cents int, base_unit (g|ml|unit),
                    density_or_unit_weight numeric null, yield_pct numeric default 100,
                    allergens text[], archived_at, created_at, updated_at
ingredient_price_history  id, ingredient_id, price_cents, recorded_at, source
                    (manual|csv_import)
recipes             id, workspace_id, name, category, type (dish|sub_recipe),
                    portions numeric, menu_price_cents int null, photo_url,
                    prep_steps jsonb, archived_at, created_at, updated_at
recipe_items        id, recipe_id, ingredient_id null, sub_recipe_id null
                    (exactly one non-null; CHECK constraint), qty numeric, unit
recipe_cost_cache   recipe_id PK, total_cost_cents, cost_per_portion_cents,
                    food_cost_pct numeric null, margin_cents null, status
                    (green|orange|red|no_price), computed_at
alerts              id, workspace_id, recipe_id, type (threshold_crossed),
                    old_pct, new_pct, triggered_by_ingredient_id, created_at,
                    acknowledged_at
exports_log         id, workspace_id, user_id, kind (recipe_book|profitability|
                    catalog|tech_sheet_pdf), file_path, status, created_at
subscriptions       workspace_id PK, stripe_customer_id, stripe_subscription_id,
                    status, price_id, current_period_end, cancel_at_period_end
support_tickets     id, workspace_id null, user_id null, email, subject, body,
                    status (open|pending|resolved), priority, assigned_admin_id,
                    created_at, updated_at
support_messages    id, ticket_id, author (user|admin), admin_id null, body,
                    created_at
audit_log           id, actor_user_id, action, target_type, target_id, meta jsonb,
                    created_at   — REQUIRED for: admin impersonation, deletions,
                    plan changes, data exports
announcements       id, title, body, level (info|warning), active, locale,
                    starts_at, ends_at   — admin-managed banner
```

**RLS policy pattern:** workspace-scoped tables readable/writable only by members of that workspace (`exists (select 1 from memberships m where m.workspace_id = X and m.user_id = auth.uid())`); platform admins bypass via `is_platform_admin` checked in a security-definer function; every admin bypass write must also insert into `audit_log`.

---

## 4. Authentication & Authorization

- **Methods:** Supabase Auth — Magic Link (primary) + Google OAuth. No passwords in MVP.
- **Flows to implement and E2E-test:** signup → email verify (magic link is both), login, logout, session refresh, account email change, account deletion (see §10).
- **Auth pages:** use Bringer 2's auth/utility page models if present; otherwise minimal pages in the template shell (log in DEVIATIONS.md).
- **Roles:**
  - `user` (default): access to own workspace(s) only.
  - `workspace owner`: billing + settings + deletion for that workspace.
  - `platform admin` (`profiles.is_platform_admin`): access to `/admin` area. Bootstrap: any email in `ADMIN_EMAILS` env gets the flag on first login; afterwards managed from the admin panel itself.
- **Route protection:** middleware — `(app)` requires session; `(admin)` requires session + admin flag; server actions re-verify (never trust middleware alone). Locked workspaces (trial expired, unpaid) get read-only mode: GET allowed, mutations rejected server-side with upgrade prompt; data export always allowed.
- **Security baseline:** all mutations via server actions with zod validation; rate-limit auth endpoints and support form (Upstash Ratelimit or Supabase built-in); CSRF-safe by construction (server actions); no service-role key in client bundles (CI check).

---

## 5. Onboarding & Usage Guidance (the "user understands the product without support" system)

At $12/mo, support tickets destroy margin (PRD §10). This section is MVP acceptance criteria, not polish.

1. **Signup wizard (4 steps, skippable after step 1):** workspace name + currency + language → target food cost % (default 30, explained in one sentence) → first ingredients (three paths: manual quick-add, CSV import with downloadable sample file, or pick from the ~300-item starter library with editable placeholder prices) → build first recipe with inline coaching. Goal: first food cost % visible in <15 minutes.
2. **Sample workspace:** every new account includes a pre-built demo menu ("Burger Maison" + 4 dishes, fully costed, clearly badged "Example — delete anytime") so no screen is ever empty.
3. **Empty states:** every module has an illustrated empty state with one primary action and one "Learn how" link to the matching help article.
4. **Contextual help:** `?` tooltips on every non-obvious field (yield %, density, HT/TTC, target FC%); a persistent "Help" button opening a slide-over with (a) search over help articles, (b) the 3 articles relevant to the current page, (c) "Contact support" as last resort.
5. **Product checklist widget:** dismissible card on Overview — "Add 5 ingredients / Create 3 recipes / Set a menu price / Try an export" with progress; drives activation metric (5 costed recipes).
6. **Help Center:** `/foodcost/help` — MDX articles in `content/help/{en,fr}`, rendered with a Bringer 2 content/blog layout, indexed by on-site search (simple client-side index is fine). Launch set (write these as real content, both languages): Getting started; Importing ingredients via CSV; Understanding yield & trim loss; How costs propagate & alerts; Pricing a dish (HT vs TTC); Exports; Billing & trial; Exporting/deleting your data.
7. **Onboarding emails (Resend):** D0 welcome + quick-start; D3 "your first export"; D10 trial reminder with value recap (dishes costed, margin insights); D13 final reminder; D14 lock notice with export link. All bilingual, matching user locale.

---

## 6. User Dashboard — module-by-module build spec

Shell: app layout with sidebar (Overview, Ingredients, Recipes, Profitability, Reports, Settings), workspace switcher (single workspace in MVP, component ready for V2), locale switcher, help button, trial-status pill.

1. **Overview:** KPI cards (avg FC%, total theoretical margin, dishes over threshold, ingredients count); "What changed" feed (latest price changes + impacted recipes + delta); alerts list with acknowledge action; onboarding checklist card.
2. **Ingredients:** data table (search, sort, filter by supplier/allergen/archived); create/edit drawer with live unit-conversion preview ("5 kg case at $45 → $0.90/100 g; after 12% trim → $1.02/100 g usable"); price edit triggers the propagation engine and shows a toast summarizing impact ("3 recipes updated, 1 crossed threshold — view"); price-history sparkline per ingredient; CSV import (mapping UI, dry-run preview, error report) and export.
3. **Recipes:** card + table views; editor with ingredient/sub-recipe picker, quantities with unit select, live right-rail cost panel (total, per portion, suggested price at target FC%, actual FC%, margin, status badge) recomputing on every keystroke via the kernel (client-side call of the same pure library — single source of truth); prep steps rich text; photo upload (Supabase Storage, compressed); allergen roll-up display; recipe multiplier control; "Print technical sheet" (A4 print CSS + PDF download).
4. **Profitability:** ranking table of all dishes (cost, price, FC%, margin $ and %, status) with category filter; top-5 / bottom-5 widgets; threshold badge legend; distribution mini-chart of FC% across menu. (V2 placeholders: menu-engineering quadrant, simulator — build nav stubs hidden behind a feature flag.)
5. **Reports & Exports:** three export cards (Profitability report, Recipe book, Ingredient catalog) per PRD §8 specs; async generation via route handler + `exports_log`, progress state, download from Storage with signed URL; history list.
6. **Settings:** workspace (name, currency, locale, target FC%, VAT mode HT/TTC with one-paragraph explainer); billing (plan, trial countdown, Stripe Billing Portal link, invoices); data & privacy (full data export, delete workspace, delete account — see §10); profile (name, email, language).

**Costing kernel contract (`packages/costing-engine`):** pure functions — `normalizeQty`, `unitCost(ingredient)`, `effectiveUnitCost(ingredient /* yield-adjusted */)`, `costRecipe(recipeGraph)` (handles one-level sub-recipes; detect and reject cycles), `foodCostPct`, `suggestedPrice(target)`, `statusFor(pct, target)`, `propagate(ingredientId, graph) → {recipeId, before, after, crossedThreshold}[]`. Deterministic, side-effect free; DB write-back and alert creation live in a thin server-side service that consumes kernel output. Tests: conversions (kg/g/L/ml/unit/density), yield math, nesting, threshold crossings both directions, rounding (banker's-safe on cents), cycle rejection, property-based fuzz on conversions.

---

## 7. Admin Dashboard (`/admin`, platform-admin only)

Purpose: run the business solo. Build with shadcn/ui + Bringer 2 tokens. Modules:

1. **Overview:** MRR, active trials, trial→paid conversion, active workspaces (7/30d), activation rate (≥5 costed recipes), open tickets count, failed webhooks count.
2. **Customers:** table of workspaces (owner email, plan, status, trial end, recipes count, last active); detail view with subscription info, usage stats, and actions: extend trial (+7d), comp plan, lock/unlock, **impersonate** (read-only session banner "Viewing as X", every access written to `audit_log`), send password-less login link.
3. **Support queue:** see §8 — ticket list with filters, conversation thread view, canned responses (stored snippets, bilingual), status/priority/assign controls.
4. **Blog CMS:** see §9 — list of MDX posts with frontmatter status; "New post" scaffolding action; preview links. (No WYSIWYG in MVP — content workflow is file-based to match the existing PixPlat article production pipeline.)
5. **Help Center management:** same file-based listing for `content/help`.
6. **Announcements:** CRUD on `announcements` → renders as dismissible banner in user app (locale-aware).
7. **Audit log viewer:** filterable table; impersonations, deletions, plan changes, data exports.
8. **Ops:** Stripe webhook event log (last 100, replay button), export queue health, cron last-run status.

---

## 8. Support Management

Philosophy: deflect first (help center + contextual help, §5), then ticket.

- **User side:** "Contact support" form (inside the help slide-over and on `/foodcost/help/contact`): subject, category (billing|bug|question|data), message, auto-attached context (workspace id, plan, locale, current page). Public marketing pages get a lighter form (email + message) for pre-sales. Rate-limited; honeypot field.
- **Pipeline:** form → `support_tickets` + `support_messages` row → Resend notification to admin → replies from admin panel are emailed to the user (reply-to threading via ticket id token in address or subject tag `[FC-1234]`); inbound user email replies are out of scope for MVP (users reply via the emailed link to a ticket page, magic-link authed).
- **SLAs (self-imposed, displayed nowhere, tracked in admin):** first response <24h business days.
- **Statuses:** open → pending (waiting on user) → resolved (auto-close after 7 days pending).
- **Canned responses:** bilingual snippets manageable in admin; insert-and-edit into reply box.
- **Feedback loop (hard rule from PRD):** admin can tag a ticket with `product-gap`; a monthly view groups tags — recurring topics are treated as P1 product bugs, not documentation tasks.

---

## 9. Blog (SEO engine) — file-based, Bringer 2 rendering

- **Content source:** MDX in `content/blog/{en,fr}/slug.mdx`. Frontmatter: `title, description, slug, locale, translationOf (slug pairing for hreflang), category (one of the FoodCost clusters), tags, publishedAt, updatedAt, author, coverImage, draft`.
- **Rendering:** listing page = Bringer 2 blog-listing model (with category filter); article page = Bringer 2 article model (author block, TOC if the variant offers it, related posts = same category, 3 max). SSG with `generateStaticParams`; ISR acceptable.
- **SEO per article (automated in the layout, not per-post manual work):** BlogPosting schema, canonical, hreflang pair from `translationOf`, OG/Twitter tags, `og:locale` matching page language (explicit fix for the known PixPlat og:locale mismatch), breadcrumbs (Home → Blog → Category → Post) with BreadcrumbList schema, reading time, dated "last updated".
- **Cross-linking rule enforced in a lint script:** every article must contain ≥1 internal link to a tool page and ≥1 to a product/feature page; CI warns otherwise.
- **Launch content:** the 8 Sprint-4 articles from PRD §11 exist as MDX before Phase 5 sign-off; blog listing must never ship empty.
- **RSS + sitemap:** locale-aware sitemap.xml including blog, help, tools, templates, vs pages; submitted to Search Console.

---

## 9-A. SEO Implementation Requirements (from PRD §9-A — mandatory)

**Reusable schema components (build once in `packages/ui`, use everywhere):** `<FaqSchema>`, `<HowToSchema>`, `<BreadcrumbSchema>`, `<ArticleSchema>`, `<OrganizationSchema>` (with `sameAs`: pixplat.com, PixPlat YouTube channel, social profiles), `<SoftwareApplicationSchema>`, `<ImageObjectSchema>`, `<VideoObjectSchema>`. All JSON-LD, server-rendered, validated in CI with a schema-lint step.

**Tool Page Content Template:** implement as a composable page layout (`ToolPageLayout`) enforcing the 10 blocks of PRD §9-A A1 in order (hero, stats strip, calculator, features grid ×6, HowTo steps, formulas block, benchmarks table + infographic, audiences, FAQ ≥7, final CTA). Formulas rendered as text/HTML, never images. Every tool page is an instance of this layout — no ad-hoc tool pages.

**Pages added by the addendum (build in Phase 5 unless noted):**
- `/tools/menu-cost-calculator` (Tier 1 variant; same engine, distinct copy targeting "menu cost/menu price").
- `/guides/average-food-cost-percentage-by-restaurant-type` (+ FR) — standalone benchmarks page with HTML table + named infographic.
- `/tools/pour-cost-calculator` + `/guides/pour-cost` (+ FR "coût matière bar") — beverage vertical; the costing kernel must therefore support volume-first workflows (bottle ml → pour ml) with no code change (verify with a kernel test).
- `/foodcost/about` (entity page) + author bio page(s); every guide/article renders an author block with link.

**Media & assets pipeline:** each tool/guide page requires ≥1 original infographic — SVG/PNG generated from a shared branded chart template (Bringer 2 tokens), descriptive kebab-case filename, keyword-bearing alt, ImageObject markup. Video embeds: lazy-loaded YouTube embed component with VideoObject schema; video production itself is a human task — the component ships with a `videoId` prop left null until provided.

**AI-search visibility:** serve `/foodcost/llms.txt` (product description + key page index, kept in repo); every guide opens with a 40–55-word definitional paragraph component (`<Definition>`); named statistics always carry a source link.

**Internal-link activation (cross-repo launch-week task):** produce `INTERNAL_LINKS_PLAN.md` mapping each of the ~20 existing PixPlat blog articles to 1–2 contextual links toward /foodcost pages with suggested anchors (varied, descriptive, never repeated exact-match sitewide). Flag clearly: edits to the main PixPlat site content are executed in the PixPlat repo/CMS, not this codebase — the plan file is the deliverable here. Blog cross-linking lint (§9) extended to check anchor-text variety.

**Programmatic publishing gate (anti-doorway):** programmatic guide pages have `draft: true` by default; a publish script validates the PRD §9-A A7 bar (unique costed example table present, pre-filled calculator link present, ≥300 words non-templated body) and refuses publication otherwise; releases in batches of ≤10; `SEO_BATCH_LOG.md` records each batch date for the operator's Search Console verification.

**Measurement plumbing:** Search Console + sitemap submission (Phase 1); a simple `/admin` Ops card linking GSC; no built-in rank tracker (operator uses an external one); "last updated" dates rendered on all guides and comparison pages; comparison-table source URLs + retrieval dates stored as frontmatter so the quarterly re-verification is a content edit, not a code change.

The operator is Montréal-based serving CA/US/EU users → design for **Quebec Law 25 + GDPR** simultaneously (strictest common denominator).

- **Data inventory (document in `PRIVACY_IMPLEMENTATION.md`):** account data (email, name), workspace business data (ingredients, recipes, prices), billing (delegated to Stripe — store only customer/subscription ids), support content, analytics (cookieless Plausible preferred → no consent banner needed for analytics; if GA4 is imposed, implement a consent banner gating it).
- **Portability:** Settings → "Export all my data": generates a zip (JSON of all workspace tables + the three xlsx reports) via the export pipeline; available in ALL states including locked/trial-expired (PRD guarantee).
- **Deletion:** two-step (type workspace name to confirm) → soft-delete (`deleted_at`, hidden everywhere) → hard purge by cron after 30 days (row deletion + Storage files + Stripe customer deletion request); account deletion cascades to owned workspaces; support tickets anonymized (email → `deleted-user`); every deletion audited.
- **Retention:** price history and business data kept while account active; exports files purged from Storage after 30 days; audit log 24 months.
- **Transactional vs marketing email:** onboarding/billing emails are transactional (no consent needed); any newsletter/marketing requires an explicit opt-in checkbox (unchecked by default) and one-click unsubscribe.
- **Pages to ship (marketing shell):** Privacy Policy and Terms (EN/FR) — generate solid drafts flagged `<!-- LEGAL REVIEW REQUIRED -->`; cookie/consent banner only if a consent-requiring tool is present.
- **Backups:** Supabase PITR enabled; weekly logical dump to separate storage; restore procedure documented in `RUNBOOK.md`.

---

## 11. Payments & Billing Logic

- Stripe products: `pro_monthly` ($12), `pro_yearly` ($120). Checkout from Settings/Billing and from trial banners; Billing Portal for card/cancel/invoices.
- Trial: `trial_ends_at = created_at + 14d`, full features, no card required. Cron (daily, `CRON_SECRET`-protected route): D10/D13 emails, D14 → `plan = locked` + lock email with export link.
- Webhooks (idempotent — store processed event ids): `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed` (dunning: Stripe Smart Retries on + in-app banner; lock after final failure). Webhook failures surface in Admin → Ops.
- Locked state UX: read-only banner with single CTA; exports and data deletion still functional.

---

## 12. Execution Phases & Acceptance Criteria

**Phase 0 — Foundations (PRD Sprint 0).** Repo, CI (typecheck, lint, tests, no-service-key-in-client check), Supabase migrations for full §3 schema, auth flows working, i18n scaffold, Bringer 2 INVENTORY.md + MAPPING.md complete. ✅ Accept: a user can sign up EN or FR and land on an empty (sample-filled) workspace.

**Phase 1 — Trojan Horse (Sprint 1).** Free public calculator (EN+FR) built as the first `ToolPageLayout` instance — full 10-block content template per §9-A (~2,000 words per language, HowTo + FAQ + ImageObject schema, formulas as text, benchmarks table + infographic, currency selector, buy/use unit conversion, free PDF export, "save this recipe" trial CTA) + homepage assembled from MAPPING (all 12 sections, real copy at PRD densities) + templates lead-magnet page + `llms.txt` + sitemap/robots/Search Console. ✅ Accept: Lighthouse SEO ≥95 on home & calculator; schema-lint green; both indexed-ready; calculator works without JS errors on mobile; all indexable content present with JS disabled.

**Phase 2 — Core product (Sprint 2).** Kernel with full test suite; Ingredients + Recipes modules; onboarding wizard + sample workspace + empty states + help slide-over with launch help articles. ✅ Accept: E2E "signup → 3 ingredients → 1 recipe → correct FC% shown" green; kernel coverage ≥90%.

**Phase 3 — Money & the differentiator (Sprint 3).** Propagation engine end-to-end (price edit → cache recompute → alerts → Overview feed → toast), Profitability module, exports (3 kinds), Stripe trial/paywall/lock cycle, transactional emails. ✅ Accept: E2E "price change crosses threshold → alert visible → xlsx export contains updated numbers" green; webhook replay-safe.

**Phase 4 — Admin & support.** Admin modules 1–3 + 6–8, support pipeline with email loop, audit log. ✅ Accept: admin can find a customer, extend a trial, answer a ticket (user receives email), and every sensitive action appears in the audit log.

**Phase 5 — SEO wave 1 & content ops (Sprint 4).** Blog system + 8 launch articles, help center full launch set, comparison pages (/vs/ ×4 with sourced pricing table + frontmatter source dates), addendum pages (§9-A: /tools/menu-cost-calculator, benchmarks standalone guide, pour-cost tool + guide with kernel volume-workflow test, /about + author pages), programmatic guides framework + first batch of ≤10 pages through the publishing gate, `INTERNAL_LINKS_PLAN.md` for the existing PixPlat articles, privacy/terms. ✅ Accept: cross-linking + anchor-variety lint passes; hreflang validates; publishing gate rejects a deliberately thin test page; comparison tables show sources + retrieval dates; zero pages with duplicate titles; every guide opens with a `<Definition>` block and renders author + last-updated.

**Phase 6 — Beta hardening.** Error tracking (Sentry), RUNBOOK.md, admin Ops checks, load-test export queue, accessibility pass (keyboard + contrast on app), final QA checklist below.

**Global Definition of Done:** all public pages SSR/SSG and bilingual with hreflang; kernel ≥90% coverage (including beverage volume-workflow tests); E2E golden paths green (signup/onboarding, costing, propagation+alert, export, upgrade, lock, support ticket, admin impersonation-with-audit, data export, deletion); schema-lint green across all page types; every tool page is a `ToolPageLayout` instance; programmatic publishing gate operational; `llms.txt` served; `INTERNAL_LINKS_PLAN.md`, `SEO_BATCH_LOG.md`, DEVIATIONS.md, PRIVACY_IMPLEMENTATION.md and RUNBOOK.md written; no Bringer 2 structural modifications.
