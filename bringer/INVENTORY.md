# Bringer 2 — Inventory Pass

> Read-only reference. This catalogs every page model and section variant the
> template ships, so marketing pages can be **assembled** from existing variants
> rather than redesigned. See `MAPPING.md` for the FoodCost selection pass and
> `../DEVIATIONS.md` for any new block created inside a Bringer section shell.

## 1. Global structure (never modified)

- **Header** (`.bringer-header` → `.bringer-header-inner`): left part (logo), middle part (`.bringer-nav` with `.bringer-menu`, sub-menus, `.bringer-menu-divider`), right part (`.bringer-button` CTA). Mobile header (`.bringer-mobile-header-inner`) with `.bringer-mobile-menu-toggler`.
- **Footer**: shared across all pages (socials list, menu columns, copyright).
- **Grid system** ("Shadow Themes Grid", `stg-*`): container width token `--stg-container-width` (1200px), gap tokens, `.stg-row` / `.stg-col-*` responsive columns.
- **Section wrappers** (`<section>`): decorative modifiers `backlight-top` / `backlight-bottom` / `backlight-both`, `divider-top` / `divider-bottom` / `divider-both`, layout modifiers `is-fullwidth` / `is-stretched`, `data-padding` (`none|top|bottom`), appearance hooks `data-appear` / `data-unload`.
- **Design tokens** (`css/config.css`): color scheme (dark `#07090D` body, accent `#3F6EE9`, heading `#F5F7FA`, text `#C5C7CE`), typography (Inter, H1 80px…H6 20px), radii (xs 8 → xl 48), spacings. Mirrored into `apps/web/tailwind.config.ts`.

## 2. Page models

| File | Model | Notable sections |
|---|---|---|
| `index.html`, `index-2.html` | Home 01 | hero type01 (title + social proof + masked media + counters), steps/process (4 numbered `bringer-label` blocks), about split, portfolio, CTA |
| `home02.html` | Home 02 | hero type02, fullwidth stretched media, features, CTA |
| `home03.html` | Home 03 | hero type03, divider sections, fullwidth media strip |
| `home04.html` | Home 04 | hero type04, backlight sections, fullwidth CTA |
| `home05.html` | Home 05 | hero type05, fullwidth stretched, dividers |
| `home06.html` | Home 06 | hero type06, backlight + divider mix |
| `home07.html` | Home 07 | hero type07, multiple backlight sections, fullwidth CTA |
| `home08.html` | Home 08 | hero type08, backlight sections, fullwidth CTA |
| `about-us.html`, `about-me.html`, `team-member.html` | About / team | story splits, counters, team grid |
| `services.html`, `service-details.html` | Services | service list, details, fullwidth stretched media |
| `pricing.html` | Pricing | **pricing/comparison table** (`divider-both tp-is-fullwidth tp-is-stretched`), FAQ, CTA |
| `faq.html` | FAQ | **accordion** (`bringer-accordion`), CTA |
| `testimonials.html` | Testimonials | **testimonial** variants, divider section, CTA |
| `contacts.html` | Contact | contact form (`contact_form.js`), map/info |
| `portfolio-grid.html`, `portfolio-column.html`, `portfolio-slider.html`, `portfolio-infinite-list.html` | Portfolio listings | grid / column / slider / infinite-list variants → **blog-listing candidates** |
| `portfolio-post01.html` … `portfolio-post09.html` | Portfolio single | 9 article-detail layouts → **blog-article candidates** |

## 3. Section variants catalog

- **Hero** — 8 variants: `bringer-hero-type01` … `type08`. type01 = title + social proof + large masked media + floating counters; type02 = centered with bottom gap; others vary media placement and column split. All render an H1 (`.bringer-page-title`) as above-fold indexable text.
- **Steps / process** — numbered blocks with `.bringer-label` ("Step 01…") + `.bringer-highlight` lead-ins (index.html). → HowTo / "How it works".
- **Counters / stats** — `.bringer-counter` (`.bringer-counter-number` with `data-suffix`, `.bringer-counter-label`). → trust/stats strip.
- **Features grid** — column rows of icon + heading + text blocks (home02/04/07/08).
- **Large text / story split** — `.bringer-large-text` intro + two-column narrative (about, home). → problem narrative.
- **Pricing / comparison table** — `pricing.html` fullwidth stretched table. → homepage S7 comparison.
- **Accordion (FAQ)** — `bringer-accordion` (faq.html, pricing.html). → FAQPage sections.
- **Testimonials** — testimonial card variants (`testimonials.html`, star icons in tokens). → E-E-A-T.
- **Blog / portfolio listing** — grid / column / slider / infinite-list.
- **Blog / portfolio article** — 9 post layouts with author/meta blocks.
- **CTA** — fullwidth `backlight-top is-fullwidth` closing sections on nearly every page.
- **Contact form** — `contacts.html` + `js/contact_form.js`.
- **Media blocks** — `.bringer-masked-media`, `.bringer-parallax-media`, `.bringer-lazy` images.
- **Buttons / links** — `.bringer-button`, `.bringer-square-button`, `.bringer-arrow-link`, `.bringer-icon-*`.

## 4. Utility / auth pages

The template ships **no dedicated auth (login/signup) page model**. Auth screens will be built as minimal pages inside the Bringer section shell using template tokens — logged in `../DEVIATIONS.md`.
