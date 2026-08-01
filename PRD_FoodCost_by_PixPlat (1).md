# Product Requirement Document (PRD)

**Project Name:** FoodCost by PixPlat
**Product Type:** Micro-SaaS — Food cost management & recipe costing dashboard
**Host:** `pixplat.com/foodcost` (subdirectory of pixplat.com to inherit domain authority and backlinks — do NOT deploy on a new domain)
**Languages:** Bilingual EN / FR from day one (hreflang implemented)
**Marketing site & product presentation UI:** MUST be built using the **Bringer 2 template** as the base (see §12)

---

## 1. Product Vision

Independent restaurants lose 3–5 points of margin every year because their recipe costs live in outdated spreadsheets, supplier prices drift silently, and menu prices are set by intuition. Existing solutions are built for restaurant groups (meez, MarketMan, Apicbase, Octogone): sold through demos, priced opaquely, and over-featured for a single-location operator.

**FoodCost by PixPlat is the self-serve food cost dashboard for independent restaurants, cafés, caterers, and food trucks.** A chef-owner signs up without talking to anyone, builds their first costed recipe in under 15 minutes, sees the exact food cost % and margin of every dish, and exports a clean Excel report for their accountant. No POS required. No supplier integration required. No demo call.

**North-star metric:** number of restaurants with ≥5 costed recipes and ≥1 Excel export in the last 30 days (activation + retained value).

**Strategic fit:** FoodCost shares the audience, brand, and domain of PixPlat (digital menus). The two products form a loop: *cost your menu in FoodCost → publish it with the PixPlat editor* and vice-versa. Every backlink earned by either product strengthens both.

---

## 2. Positioning

**Category:** Recipe costing & food cost management (not inventory, not ERP, not accounting).

**One-liner (EN):** "Know the real cost and margin of every dish on your menu — in 15 minutes, without a demo call."
**One-liner (FR):** « Connaissez le coût matière et la marge réelle de chaque plat de votre carte — en 15 minutes, sans rendez-vous commercial. »

**Positioning statement:** For independent restaurant operators (1–3 locations) who need to control food costs but find meez/Octogone/MarketMan too heavy, too expensive, or demo-gated, FoodCost is a self-serve dashboard that calculates recipe costs, food cost %, and dish profitability, with one-click Excel exports. Unlike enterprise suites, it is transparent in pricing, instant to adopt, bilingual FR/EN, and requires zero integrations to deliver value on day one.

**Against each competitor:**

| Competitor | Their position | Our wedge |
|---|---|---|
| meez | Recipe system of record for multi-unit groups; demo-gated pricing; explicitly limited to English-speaking US/Canada markets | Self-serve, transparent price, FR+EN, built for 1 location |
| Octogone | Full ops suite (recipes, inventory, IoT, HR) for QC/CA market; demo-only, no public pricing, product in transition | Focused single job (costing), instant signup, free tool entry point |
| MarketMan / Apicbase | Inventory-led F&B management for chains | No inventory prerequisite — costing works standalone |
| Excel / free templates | Free but error-prone, no price updates, no dashboard | Same simplicity, live recalculation, profitability analytics, cleaner exports than their own spreadsheet |

**What FoodCost deliberately is NOT (anti-scope):** not an inventory/stock system, not purchasing/ordering, not invoice OCR (V3 at earliest), not multi-warehouse, not accounting, not staff scheduling. Saying no to these is the moat against feature-bloat drift.

---

## 3. Personas

**P1 — Karim, chef-owner of an independent restaurant (primary).**
45 covers, 25-dish menu, 1 location. Does his costing "roughly" in a spreadsheet updated 18 months ago. Feels margins shrinking with food inflation but cannot say which dishes are the problem. Buys software with a credit card if the price is clear and under ~$50/mo; will never book a demo. Success = "I know my 5 least profitable dishes and fixed them."

**P2 — Julie, pastry chef / caterer / dark-kitchen operator (secondary).**
Produces in batches, sells B2B and at events. Needs batch costing, portion math, and per-order quotes. Excel exports are mandatory for her accountant. Highly price-sensitive; enters through the free calculator.

**P3 — Marc, F&B consultant / small agency (tertiary, growth channel).**
Manages costing for 5–15 client restaurants. Wants one login, multiple workspaces, exportable client reports with his branding. He is the B2B2C multiplier (mirrors the PixPlat agency motion). Served in V2, not MVP.

---

## 4. MVP Scope (Functional Requirements)

**FR-1 — Auth & Onboarding.** Supabase Auth (Magic Link + Google OAuth). Onboarding wizard: (1) restaurant name, currency (CAD/USD/EUR), language; (2) create first ingredients — manual entry OR CSV import OR pick from a starter library of ~300 common ingredients with editable placeholder prices; (3) build first recipe; (4) see first food cost % → "aha" moment under 15 minutes. Demo workspace pre-filled with a sample menu ("Burger Maison" fully costed) so the dashboard is never empty.

**FR-2 — Ingredient catalog (the "mercuriale").** CRUD ingredients: name, supplier (free text), purchase format (e.g., 5 kg case), purchase price, unit of measure, automatic unit conversions (kg↔g, L↔ml, unit↔g via density/weight field), yield / trim-loss % (perte de coupe), allergen tags (14 EU + 9 US majors, bilingual labels). Price history is stored on every price change (feeds V2 analytics). CSV import/export.

**FR-3 — Recipe builder (fiches techniques).** Recipe = ingredients + quantities + optional sub-recipes (one level of nesting in MVP: sauces, doughs, bases). Auto-calculated: total cost, cost per portion (with trim-loss applied), suggested price at target food cost %, actual food cost % from menu price, gross margin $ and %. Recipe metadata: category, portions/yield, prep steps (simple rich text), photo. Allergens roll up automatically from ingredients. Recipe multiplier (×N portions for events/banquets). Printable technical sheet (clean A4 print CSS).

**FR-4 — Profitability dashboard.** Global view: average food cost % across menu, total theoretical margin, top 5 / bottom 5 dishes by margin, dishes above target threshold (default 30%, configurable, with green/orange/red badges). Recipe list sortable/filterable by cost, margin, food cost %, category. "What changed" panel: recipes whose cost moved after an ingredient price update.

**FR-5 — Price-change propagation (the core magic).** Updating one ingredient price instantly recalculates every recipe and sub-recipe that uses it, and flags impacted dishes whose food cost % crossed the target threshold. This single behavior is the #1 reason to leave Excel; it must be flawless and visibly instant.

**FR-6 — Excel & PDF exports.** One-click exports: (a) full recipe book (one sheet per recipe + summary sheet), (b) profitability report (all dishes: cost, price, FC%, margin, status), (c) ingredient catalog with price history. Formats: .xlsx (formatted: headers, currency, conditional color on FC%) and PDF for technical sheets. Exports are a paid-tier feature and a primary upgrade trigger.

**FR-7 — Free public calculator (Trojan Horse, SEO).** `pixplat.com/foodcost/calculator` (+ `/fr/calculateur-food-cost`): client-side, no login, add ingredients/quantities/prices → cost per portion, FC%, suggested price. Functional requirements: currency selector (CAD/USD/EUR/GBP minimum), buy-unit → use-unit automatic conversion, target FC% and portions inputs, free PDF export. CTA on result & on "Download PDF": "Save this recipe and track all your dishes — start your free trial" (the one action no standalone calculator site can offer). The page itself must follow the Tool Page Content Template defined in §9 (SEO Addendum) — it is a ~2,000-word content asset, not a bare widget. This page ships in Sprint 1 and is the first URL submitted to Google.

**FR-8 — Paywall.** Stripe Checkout subscription. 14-day full-featured trial → Pro at $12/mo (no freemium tier; the free public calculator in FR-7 is the permanent free entry point). At trial end: workspace read-only + data export always available. (Pricing details in §10.)

---

## 5. V2 Features (months 4–8)

- **Menu engineering matrix:** manual monthly sales-quantity input per dish (CSV or form) → Stars / Plowhorses / Puzzles / Dogs quadrant with recommendations. (Matches Octogone/meez capability without requiring POS.)
- **Food cost simulator:** sandbox scenarios — ingredient price +X%, portion −10 g, supplier swap — side-by-side comparison before committing (directly answers Octogone's simulator).
- **Price alerts & inflation tracking:** ingredient price history charts; alert when a dish crosses its FC% threshold.
- **Multi-workspace & consultant mode (P3):** multiple restaurants per account, branded PDF reports, per-seat pricing.
- **PixPlat bridge:** import dishes/photos from a PixPlat menu; push updated prices back to the published digital menu. Unique differentiator no competitor can copy.
- **Deeper sub-recipe nesting + batch/production mode** (scale a prep list for the day).

## 6. V3 Features (months 9–18)

- **Invoice import (OCR/AI):** photograph a supplier invoice → ingredient prices update automatically (answers meez invoice scans, self-serve version).
- **POS sales sync** (Square, Lightspeed, Clover) to automate menu-engineering data.
- **Nutrition & regulatory labels** (USDA/CNF databases; INCO-style labels for EU/FR).
- **AI menu advisor:** "raise these 3 prices by $1, replace this ingredient, retire this dish" — narrative recommendations generated from the workspace data.
- **Team seats & roles** (chef vs. manager vs. accountant read-only).

---

## 7. Dashboard Modules (information architecture)

1. **Overview** — KPIs: avg FC%, theoretical margin, dishes over threshold, last price changes and their impact.
2. **Ingredients** — catalog table, price history drawer, CSV import/export, allergen tags.
3. **Recipes** — card/table views, filters, recipe editor, printable technical sheet.
4. **Profitability** — ranking, threshold badges, category breakdown; (V2: menu-engineering quadrant, simulator).
5. **Reports & Exports** — export center with history of generated files.
6. **Settings** — currency, language, target FC%, VAT handling (price incl./excl. tax — critical for FR market where food cost is computed on HT prices), workspace management.

## 8. Reports & Exports (deliverable specs)

- **Profitability report (.xlsx):** columns Dish / Category / Cost per portion / Menu price (HT & TTC) / FC% / Margin $ / Margin % / Status; conditional formatting (≤28% green, 28–35% orange, >35% red); summary tab with category averages.
- **Recipe book (.xlsx + PDF):** one technical sheet per recipe — ingredients, quantities, unit costs, trim loss, steps, allergens, cost/portion, photo.
- **Ingredient catalog (.xlsx):** current prices + 12-month price history columns.
- All exports carry restaurant name, date, and (V2) consultant branding. Generation server-side (SheetJS/exceljs), < 5 s, queued with progress state.

---

## 9. SEO Strategy

**Principles.** All pages server-rendered (Next.js SSR/SSG — no CSR listings; apply the lesson from the PixPlat /blog audit). Bilingual EN/FR with correct hreflang pairs. Article/BlogPosting + FAQPage + SoftwareApplication schema from day one. Internal links between FoodCost cluster and existing PixPlat menu clusters (this becomes cluster C7 in the PixPlat topical map).

**SERP reality (validated July 2026).**
- EN commercial keywords ("food cost software", "recipe costing software") are held by MarketMan, meez, Apicbase — do not target head terms before month 12.
- EN tool/template keywords ("food cost calculator", "recipe costing template excel", "food cost percentage formula") show mixed SERPs including dated, low-authority pages — winnable. Winning format = interactive calculator + formula explanation + worked example + FAQ + downloadable template.
- FR SERPs ("food cost restaurant", "coût matière", "fiche technique cuisine", "logiciel food cost") are led by small recent players (COS Kitchen, RestoPilot, Ratatool, Koust) with modest authority — the priority battlefield. Their winning pattern: step-by-step method, formula, line-by-line costed example dish, FAQ, CTA to their tool.
- Keyword volumes must be re-validated with Google Keyword Planner + Ahrefs free tools before Sprint 1 (action item; volumes below are working estimates, SERP composition is the decision driver).

**Page architecture.**

*Tools (transactional intent, highest priority):*
- /foodcost/calculator + /fr/foodcost/calculateur-food-cost
- /foodcost/food-cost-percentage-calculator ; /fr/…/calcul-cout-matiere
- /foodcost/recipe-cost-calculator ; /fr/…/calcul-cout-recette
- /foodcost/menu-price-calculator ; /fr/…/calcul-prix-vente-restaurant

*Templates (lead magnets):*
- /foodcost/templates/recipe-costing-template-excel ; /fr : modèle fiche technique cuisine (Excel + PDF, email-gated download)
- /foodcost/templates/food-cost-spreadsheet ; per-segment variants (bakery/pâtisserie, catering/traiteur, food truck, bar/cocktails)

*Programmatic long-tail:* /foodcost/guides/food-cost-[cuisine-or-dish] and FR equivalents (pizza, burger, sushi, cocktail bar, boulangerie, traiteur…) — 20–40 pages, each with a worked example and pre-filled calculator link.

*Comparison & alternative pages:* /foodcost/vs/meez, /vs/marketman, /vs/apicbase, /foodcost/meez-alternative, /fr/foodcost/alternative-octogone, /alternative-koust, /alternative-ratatool — honest tables: price transparency, self-serve, single-location fit, FR support.

*Editorial cluster (informational):* how to calculate food cost (pillar EN+FR), fiche technique guide, menu engineering guide, food cost % by restaurant type benchmarks, reduce food waste, pricing psychology for menus. 2 articles/week for the first 3 months, following the existing PixPlat master prompt (named statistics, data tables, keyword density 1.2–1.8%, zero cannibalization vs. existing PixPlat articles).

**Homepage blueprint (VALIDATED requirement: content-rich, SEO-first homepage).**
The homepage is treated as the #1 SEO asset of the product, not a thin conversion page. Target length: 1,800–2,500 words of indexable, server-rendered copy per language. Primary keyword EN: "food cost software" (supporting: recipe costing, food cost calculator, restaurant profitability). Primary FR: "logiciel food cost" (supporting: coût matière, fiche technique cuisine, rentabilité restaurant, calcul marge). Keyword density 1.2–1.8% per the existing PixPlat master prompt; every section maps to one Bringer 2 component variant and one explicit SEO objective:

| # | Section | Bringer 2 component | SEO objective & target queries |
|---|---|---|---|
| S1 | Hero | Home/hero variant | H1 with primary keyword ("Food cost software for independent restaurants" / « Logiciel de food cost pour restaurants indépendants »); subhead containing "recipe costing", "margins", "Excel export"; CTA = 14-day trial. Above-fold indexable text, no text-in-image. |
| S2 | Trust strip (stats: dishes costed, avg margin recovered, "$12/mo — no demo") | Logo/stats bar | Semantic reinforcement + featured-snippet bait on "how much does food cost software cost". |
| S3 | Problem narrative ("Your Excel sheet is 18 months old") | Feature/story split section | Captures "food cost excel template", "food cost spreadsheet problems", « fiche technique excel » — the migration intent. Links to /templates (capture the Excel searcher, then convert). |
| S4 | Core features, 4 blocks, each with its own H2 | Features grid variant | One secondary keyword per H2: (a) "Recipe costing / fiches techniques" ; (b) "Instant cost propagation & alerts" (differentiator, brandable term) ; (c) "Profitability dashboard / rentabilité restaurant" ; (d) "Excel & PDF exports". Each block links to its dedicated feature page. |
| S5 | Embedded mini food cost calculator (functional, 3 ingredients max, "open full calculator" link) | Custom block inside a Bringer 2 section shell | Engagement/dwell time + internal link equity to /calculator tool page; targets "food cost calculator" directly on the homepage. |
| S6 | How it works — 3 steps (add ingredients → build recipes → watch margins) | Steps/process section | Targets "how to calculate food cost" / « comment calculer son coût matière » informational intent; HowTo schema. |
| S7 | **Price comparison table** (VALIDATED requirement) | Pricing/comparison table variant | Targets "meez alternative", "marketman alternative", « alternative octogone », "cheap/affordable food cost software", « logiciel food cost pas cher ». Columns: FoodCost $12/mo (public, self-serve, no demo) vs. competitors — public prices with source+date where they exist, "Pricing not public — demo required" where they don't (§10 legal guardrail). Links to the /vs/ pages for depth. |
| S8 | Benchmark data table: target food cost % by restaurant type (QSR, bistro, gastro, pizzeria, bar…) | Table/content section | Link-magnet + featured-snippet target on "average food cost percentage restaurant" / « food cost moyen restaurant » — the kind of named-statistics content that earns backlinks. |
| S9 | Testimonials | Testimonial variant | E-E-A-T signals. Real beta users only — no fabricated reviews, no Review schema until genuine reviews exist. |
| S10 | FAQ — 8–10 questions | FAQ/accordion variant | FAQPage schema. Long-tail questions: what is food cost, what is a good food cost %, how to price a menu item, « qu'est-ce que le coût matière », « comment fixer le prix d'un plat », does it work without a POS, can I export to Excel. |
| S11 | Resources teaser (3 latest guides + 2 tools) | Blog cards variant | Internal linking into the editorial cluster and tool pages; crawl-depth reduction. |
| S12 | Final CTA | CTA variant | Conversion close: trial CTA + reassurance line ($12/mo, cancel anytime, data exportable). |

H-structure rule: exactly one H1 (S1); S3–S10 carry keyworded H2s; no heading-level skips. Every claim with a number in S2/S8 must be sourced or derived from product data.

**On-page rules.** Primary keyword in title, H1, first 100 words, one H2; FAQ schema on every tool/template page; every editorial page links to one tool page and one product page; every tool page links to signup.

**Link building.** Reuse the existing PixPlat guest-post pipeline but point 50% of new links at /foodcost tool pages; free-tool directories (there are dozens for calculators); FR restaurant-industry blogs and CHR media; the Excel templates themselves embed a backlink.

---

### §9-A. SEO ADDENDUM — Pre-development completeness audit (benchmark: top-ranking pages, July 2026)

**A1. Tool Page Content Template (mandatory for every /tools page).**
Benchmarked against the current #1-structured competitor (menucostcalculator.com, a ~2,000-word single-tool page). Every FoodCost tool page contains, in order: (1) hero — benefit-driven H1 containing the exact tool keyword + "Free · No signup" trust line; (2) stats strip (currencies supported, ideal FC% range, "free"); (3) the interactive calculator itself — currency selector, buy-unit/use-unit conversion, target FC%, portions, free PDF export; (4) features grid (6 blocks, one secondary keyword each: dish costing, price recommendation, margin protection, PDF report, unit conversion, multi-currency); (5) "How to use" — 4 numbered steps (HowTo schema); (6) formulas section — all four formulas displayed as text (not images) with one worked numeric example (snippet target); (7) benchmarks table — FC% by restaurant type, as a real HTML table + a named, alt-texted infographic; (8) "Who uses this" audience block (restaurant, café, food truck, catering, private chef, hospitality students — each is a long-tail modifier); (9) FAQ — 7+ questions with FAQPage schema, answers 40–60 words, definitional first sentence; (10) final CTA — save-your-recipe trial hook. **Our structural advantages to emphasize on-page (gaps of the benchmark): bilingual FR/EN (it has none), real product behind the tool (save/track/propagate — it cannot), E-E-A-T signals (it has a bare first-name author), and no ads.**

**A2. Consolidated keyword → page matrix (tiered).**
- *Tier 1 (launch, transactional):* food cost calculator; menu cost calculator (distinct query — benchmark ranks on it; our calculator page targets "food cost calculator" as primary and a dedicated /tools/menu-cost-calculator variant covers "menu price/menu cost"); recipe cost calculator; food cost percentage calculator; FR: calcul food cost, calcul coût matière, calcul coût de revient d'un plat, calcul prix de vente restaurant.
- *Tier 2 (launch+30d, templates & benchmarks):* recipe costing template excel, food cost spreadsheet, plate cost / portion cost; standalone page **/guides/average-food-cost-percentage-by-restaurant-type** (promoted from homepage S8 to its own URL — snippet & backlink magnet); FR: modèle fiche technique cuisine, food cost moyen restaurant.
- *Tier 3 (NEW vertical — bars & beverage):* **pour cost calculator, beverage cost, cocktail cost calculator, liquor cost percentage** — bars use entirely different vocabulary; zero coverage in the original PRD; low competition, same engine. Pages: /tools/pour-cost-calculator + /guides/pour-cost; FR: coût matière bar / cocktail.
- *Tier 4 (informational cluster additions):* food cost formula; gross profit margin restaurant; how to price a menu; FR: marge brute restaurant, mercuriale cuisine, ratio coût matière. Cannibalization rule: one primary keyword = one URL; the matrix lives in the production tracker and every new page is checked against it.

**A3. SERP features & media strategy.**
- *Featured snippets / PAA:* every guide opens with a 40–55-word definitional paragraph directly under the H1; formulas always in plain text; benchmark data always in HTML tables. Harvest PAA questions per Tier-1 keyword into FAQ blocks.
- *Image SEO:* every tool/guide page gets ≥1 original infographic (benchmarks bar chart, formula visual, propagation diagram) with descriptive filenames (food-cost-percentage-by-restaurant-type.png), alt text containing the keyword, and ImageObject markup — the benchmark competitor visibly earns from this.
- *Video:* leverage the existing PixPlat YouTube channel — one 90-second demo per Tier-1 tool page, embedded with VideoObject schema; video titles mirror page keywords.

**A4. E-E-A-T & entity signals.**
Named author with bio page (restaurant-tech background) on every guide; "Reviewed by" a chef/consultant where possible; /foodcost/about page connecting the product to the PixPlat entity; Organization schema with `sameAs` (PixPlat site, YouTube channel, social profiles); visible "last updated" dates; testimonials only from real beta users (no Review schema until genuine reviews exist — restated).

**A5. AI-search visibility (AI Overviews, LLM assistants).**
The same assets that win snippets win AI citations: clean definitional paragraphs, plain-text formulas, sourced named statistics, HTML tables, FAQ schema. Additionally: publish our own citable data (e.g., aggregate anonymized benchmark stats once user base allows — "average food cost among X independent restaurants"), keep an `llms.txt` at the /foodcost root describing the product and key pages, and ensure all content renders without JS (already a hard rule).

**A6. Internal-link activation from existing PixPlat content (launch-week task, high impact).**
The ~20 existing PixPlat blog articles are updated at FoodCost launch with contextual links to /foodcost pages (menu-pricing and profitability mentions → calculator; template articles → costing templates). FoodCost becomes cluster C7 of the PixPlat topical map with bidirectional hub links. Anchor-text guideline: descriptive and varied ("food cost calculator", "calculate your recipe costs", "coût matière"), never "click here", never one exact-match anchor repeated sitewide.

**A7. Programmatic quality guardrail (anti-doorway).**
A programmatic page (/guides/food-cost-[dish|cuisine]) is published ONLY if it contains: a unique fully-costed worked example (real ingredient table with prices), a pre-filled calculator link, and ≥300 words of non-templated copy. Pages not meeting the bar stay drafts. Programmatic pages are released in batches of 10 max, with Search Console indexation verified between batches.

**A8. Measurement & iteration.**
Weekly: Search Console queries/impressions review per page tier; monthly: rank tracking of the Tier 1–3 matrix (any free/cheap tracker), CTR optimization pass on pages with impressions but CTR <2% (title/meta rewrite); quarterly: content refresh of top pages (update stats, re-verify competitor prices in comparison tables, bump "last updated"). KPI ownership stays in §11.

---

## 10. Business Model

**VALIDATED (product owner decision):** FoodCost is positioned as an accessible micro-SaaS. Radical price accessibility IS the competitive advantage and must be front-and-center on the homepage via comparison tables (see §9, homepage section S7).

- **Pro — $12/mo or $120/yr (CAD; €/US parity pricing):** unlimited recipes & ingredients, propagation engine & threshold alerts, Excel/PDF exports, price history, printable technical sheets.
- **Trial model (validated):** 14-day full-featured free trial, no freemium/lifetime-free tier. Credit card optional at signup; hard limit at trial end (workspace becomes read-only with export of own data always possible — never hold user data hostage).
- **Studio (V2) — $39/mo:** up to 10 workspaces, consultant branding on reports, client read-only links. Targets P3 consultants/agencies. Keeps the "affordable" brand promise even at the top tier.
- Payments: Stripe Checkout + customer portal.
- **Unit economics at $12/mo:** typical SMB churn 4–6%/mo → LTV ≈ $200–300. This is viable ONLY with a near-zero-touch operation. **Hard requirement derived from this price point:** the product must be fully self-serve — onboarding wizard, in-app guidance, help center, and short videos are MVP-quality criteria, not post-launch extras. Every recurring support ticket is a product bug. Target: <1 support contact per 20 active customers per month.
- **Comparison-table legal guardrail:** meez and Octogone do not publish pricing (demo-gated). Never invent or estimate their prices. The comparison column must state "Pricing not public — sales demo required" — factual, verifiable, and it weaponizes their opacity. For competitors with public pricing (MarketMan, Koust, Ratatool, etc.), display the public price with retrieval date and source link, re-checked quarterly.

---

## 11. Development Roadmap

**Sprint 0 (week 1) — Foundations.** Repo, Next.js App Router + Supabase + Stripe skeleton, Bringer 2 template integrated as marketing shell, design tokens extracted, CI/CD, i18n scaffolding (next-intl), analytics (Plausible or GA4) + Search Console.

**Sprint 1 (weeks 2–3) — Trojan Horse.** Free public calculator (EN+FR) live on pixplat.com/foodcost, indexed, with FAQ schema; landing page from Bringer 2; email capture on template download. *Ship marketing before product.*

**Sprint 2 (weeks 4–6) — Core product.** Auth + onboarding wizard, ingredient catalog with conversions & trim loss, recipe builder with live costing, sample workspace.

**Sprint 3 (weeks 7–8) — Money.** Profitability dashboard, price-change propagation + threshold badges, Stripe paywall, Excel/PDF exports.

**Sprint 4 (weeks 9–10) — SEO wave 1.** Templates pages, 4 comparison pages, first 8 editorial articles, programmatic guide framework + first 10 dish/cuisine pages.

**Beta (weeks 10–12).** 15–20 restaurants recruited via PixPlat user base + local Montréal outreach; success criterion: 10 restaurants reach 5+ costed recipes; iterate.

**Months 4–8:** V2 (menu engineering, simulator, consultant mode, PixPlat bridge) driven by beta feedback; SEO wave 2 (remaining programmatic pages, 2 articles/week); target 100 paying customers by month 8.

**KPIs:** organic clicks on /foodcost pages, calculator → signup rate (target 3–5%), signup → activation (5 recipes) ≥ 40%, trial → paid ≥ 8%, MRR.

---

## 12. Technical Directives (for Claude Code)

- **Marketing site & product presentation UI MUST use the Bringer 2 template as the base.** Bringer 2 is delivered as a folder containing all components, sections, and page models, with multiple variants per section type (several Home Page models, several Features sections, several Blog models, several CTA, testimonial, FAQ and other component variants). Mandatory workflow for the agent, in order: (1) **Inventory pass** — walk the entire Bringer 2 folder and produce a written catalog of every page model and section variant (name, purpose, structure) before writing any page; (2) **Selection pass** — for each marketing page in §9 (and each homepage section S1–S12), select the best-fitting existing variant from the catalog and record the mapping; (3) **Assembly pass** — build pages by composing the selected variants with FoodCost content. **Hard rules:** do NOT modify the template's global structure; do NOT recreate UI from scratch; do NOT invent a parallel design system. The goal is to intelligently reuse existing components to accelerate development while preserving visual consistency. Only when no variant fits a required block (e.g., the embedded mini-calculator S5, the sourced comparison table S7) may the agent create a new block — and it must be built inside a Bringer 2 section shell, reusing the template's tokens (colors, typography, spacing), with every such addition documented in a DEVIATIONS.md file. The in-app dashboard may use shadcn/ui but must adopt Bringer 2's color tokens and typography for brand continuity with PixPlat.
- Stack: Next.js (App Router, SSR/SSG for all public pages), TailwindCSS, Supabase (Postgres + Auth + RLS per workspace), Stripe (Checkout + webhooks with idempotency), exceljs/SheetJS for exports, react-pdf or headless Chromium for PDF sheets, next-intl for EN/FR routing with hreflang.
- Data model (core tables): workspaces, users, memberships, ingredients (with unit, purchase_format, price, yield_pct, allergens[]), ingredient_price_history, recipes, recipe_items (ingredient_id OR sub_recipe_id, qty, unit), recipe_versions (optional MVP-lite), exports_log, subscriptions.
- All money as integer cents; all quantities in base units (g/ml/unit) with display conversion; costing engine is a pure, unit-tested function library (this is the product's kernel — 90%+ test coverage required).
- Public pages: no client-side-only rendering of indexable content (hard requirement, per PixPlat /blog CSR lesson); Lighthouse SEO ≥ 95; SoftwareApplication + FAQPage + BreadcrumbList schema; og:locale matching page language.

---

## 13. Risks & Mitigations

- **Volume risk:** keyword estimates unverified → validate with Keyword Planner before Sprint 2; SERP composition already validated as favorable (FR especially).
- **Free-tool competitors (RestoPilot free beta, free templates):** our answer is depth (propagation engine, exports, dashboard) + PixPlat bridge + bilingual polish; monitor RestoPilot's beta-to-paid transition.
- **Data-entry friction (users must type their ingredients):** mitigated by starter library, CSV import, sample workspace; V3 invoice OCR removes it entirely.
- **Scope creep toward inventory/ERP:** enforced anti-scope list in §2; revisit only after 500 paying customers.
- **Support load at $12/mo:** one support ticket can erase a month of margin per customer. Mitigation is product-side: self-serve onboarding, contextual help, and help-center articles are MVP acceptance criteria; recurring ticket topics are treated as P1 product bugs.
- **Comparison-table accuracy:** competitor public prices change; quarterly re-verification task with source links and retrieval dates, and demo-gated competitors are always labeled "pricing not public" rather than estimated.
