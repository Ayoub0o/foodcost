# Bringer 2 — Selection Pass (FoodCost mapping)

> For every marketing page (PRD §9) and each homepage section S1–S12, the chosen
> Bringer 2 variant and why. Assembly composes these variants with FoodCost
> content (EN + FR). New blocks are flagged and logged in `../DEVIATIONS.md`.

## Homepage sections S1–S12 (PRD §9)

| # | Section | Chosen Bringer variant | Why |
|---|---|---|---|
| S1 | Hero | `bringer-hero-type01` (index.html) | Strong above-fold H1 + social proof + counters; fits keyworded H1 + trial CTA |
| S2 | Trust / stats strip | `.bringer-counter` group | Native stat counters for "$12/mo · dishes costed · avg margin" |
| S3 | Problem narrative | Story split (`.bringer-large-text` + two-col, home02) | Migration-intent copy ("Your Excel sheet is 18 months old") |
| S4 | Core features ×4 | Features grid (home04/07) | One H2 per feature block, each links to a feature page |
| S5 | Embedded mini-calculator | **NEW block** in a Bringer section shell | No template variant offers an interactive calculator — see DEVIATIONS |
| S6 | How it works (3 steps) | Steps/process (`.bringer-label`, index.html) | Maps to HowTo schema |
| S7 | Price comparison table | **NEW sourced table** inside `pricing.html` shell | Template pricing table is decorative; a sourced comparison is required — see DEVIATIONS |
| S8 | Benchmark data table | Content/table section (pricing/about shells) | HTML table for FC% by restaurant type |
| S9 | Testimonials | Testimonial variant (testimonials.html) | Real beta users only; no Review schema until genuine |
| S10 | FAQ | `bringer-accordion` (faq.html) | FAQPage schema |
| S11 | Resources teaser | Blog cards (portfolio-grid) | 3 latest guides + 2 tools |
| S12 | Final CTA | Fullwidth CTA (`backlight-top is-fullwidth`) | Trial close + reassurance line |

## Marketing pages (PRD §9)

| Page | Chosen model |
|---|---|
| Home | Home 01 (`index.html`) assembled from S1–S12 above |
| Tool pages (`/calculator`, etc.) | `ToolPageLayout` = hero + counters + **calculator block** + features grid + steps + formulas + benchmark table + audiences + accordion FAQ + CTA |
| Pricing | `pricing.html` model |
| Features | Features grid + story splits |
| Blog listing | `portfolio-grid.html` (grid with categories) |
| Blog article | `portfolio-post01.html` (author/meta + related) |
| Help center | Same blog-content model as article |
| Comparison `/vs/*` | `pricing.html` comparison-table shell + accordion FAQ |
| About | `about-us.html` model |
| Auth (login/signup) | Minimal page in Bringer section shell (no template model — see DEVIATIONS) |
