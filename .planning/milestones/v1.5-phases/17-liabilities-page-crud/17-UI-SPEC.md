---
phase: 17
slug: liabilities-page-crud
status: approved
shadcn_initialized: true
preset: "shadcn default, baseColor zinc, cssVariables"
source: context-sync
reviewed_at: 2026-05-02
---

# Phase 17 — UI Design Contract

> Visual and interaction contract for **Liabilities Page CRUD**. Extends the existing shadcn/Tailwind app; no new registries or design systems.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (`components.json` — `style: default`, `baseColor: zinc`, `cssVariables: true`) |
| Preset | Default registry; `rsc: false` — client components only |
| Component library | Radix primitives via shadcn |
| Icon library | lucide-react (e.g. `Plus` on primary CTA) |
| Font | Inherit from app shell / `index.css` (no new font for this phase) |

---

## Spacing Scale

Declared values (multiples of 4; match Gold/Bank list + `PageHeader` gaps):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight inline gaps, icon to label |
| sm | 8px | `Separator`, compact rows |
| md | 16px | Default card padding, form field stack (`space-y-4` where Gold uses it) |
| lg | 24px | Block gap between major regions (meta → banner → list) where Gold/Bank use larger separation |
| xl | 32px | Section separation (if needed) |
| 2xl | 48px | — |
| 3xl | 64px | — |

**Exceptions:** `PageHeader` uses `gap-3` (12px) — **allowed** as an existing layout pattern, not a new arbitrary token. Card internal spacing matches `GoldPage` / `BankSavingsPage` (`Card` / `CardContent`).

---

## Typography

| Role | Size | Weight | Line height | Notes |
|------|------|--------|-------------|--------|
| Page title | 20px (`text-xl`) | 600 | 1.2 | `PageHeader` `<h1>` (existing) |
| Body | 16px (`text-base`) | 400 | 1.5 | Card body, sheet body |
| Label | 14px (`text-sm`) | 400 | 1.4 | `Label`, form labels |
| Muted / helper | 12px (`text-xs`) | 400 | 1.5 | Banner line; aggregates use `text-sm` (14px) — same weight, one step smaller role optional via `text-xs` only for banner |

**Weights:** 400 and 600 only (two weights). Semibold for page title; regular elsewhere unless title.

**Font sizes (max four):** 12, 14, 16, 20 px.

---

## Color (60 / 30 / 10)

Semantic roles use **CSS variables** from `src/index.css` / Tailwind (`hsl(var(--token))`):

| Role | Token | Usage |
|------|-------|--------|
| Dominant (~60%) | `--background` | Main content surface behind lists |
| Secondary (~30%) | `--card`, `--sidebar`, `--muted` | Loan cards, sidebar, aggregate/meta strips |
| Accent (~10%) | `--primary` (+ foreground) | **Primary button** (`Add loan`, sheet submit when using default variant), **focus ring** (`ring`), **active sidebar nav item** (existing sidebar pattern) |
| Destructive | `--destructive` | Inline delete confirmation **Yes**, destructive borders on invalid fields |

**Accent reserved for:** primary CTA buttons on this page, focus-visible rings on interactive controls, active navigation state (via existing sidebar). **Not** for every link or secondary outline button — secondary actions use `variant="outline"` / `secondary` without consuming accent.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary page CTA | **Add loan** (`Plus` + label; matches Gold/Bank) |
| Sheet submit (add) | **Save loan** |
| Sheet submit (edit) | **Save changes** |
| Saving state | **Saving…** (disabled button) |
| Empty state heading | **No loans yet** |
| Empty state body | Short line prompting the user to add a standalone loan (same **tone** as Gold empty state — helpful, not “No data found”) |
| Save failure (add/edit) | **Could not save. Check that the app is running and try again.** (match `GoldPage` `setSaveError`) |
| Delete / persist failure | **Could not delete. Check that the app is running and try again.** (match `GoldPage` delete path) |
| Zod / field errors | Use resolver messages; invalid fields: `border-destructive` + message under field (Gold pattern) |
| Destructive inline confirm | First click: show **Confirm delete?** with **Yes** / **Cancel**; **Yes** carries destructive styling |

---

## Registry Safety

| Registry | Blocks / components | Safety Gate |
|----------|---------------------|-------------|
| shadcn official | `PageHeader`, `Card`, `CardContent`, `Sheet*`, `Button`, `Input`, `Label`, `Badge`, `Separator` (as in Gold/Bank) | not required (official) |
| Third-party | none | n/a |

---

## Visual hierarchy (focal point)

- **List non-empty:** Primary focal is the **stack of loan cards** (outstanding balance is the strongest number per card). **Add loan** in the header is secondary focal.
- **List empty:** Focal shifts to **empty state** copy + **Add loan** in the header.
- **Sheet open:** Focal is the form; title **Add loan** / **Edit loan**.

---

## Scope

New page `LiabilitiesPage.tsx`, sidebar entry `'liabilities'` after Property, SPA section wiring in `App.tsx`. Full CRUD on `data.liabilities[]`. No React Router.

---

## Page shell

- **Header:** `PageHeader` with title **Liabilities**, primary action **Add loan** (match Gold/Bank: `Plus` + short label).
- **Meta block (aggregates):** Directly under the title area:
  - **Total outstanding:** `sumLiabilitiesInr(data)` — `en-IN` currency, 0 decimals when whole.
  - **Total EMI:** sum of optional `emiInr` across standalone liabilities — label **`₹X/month`** (computed at render; never stored).
- **Banner (LIAB-06 / CONTEXT D-05–D-06):** Always visible **above** the card list and **above** empty state. `text-sm text-muted-foreground`. **Verbatim copy:**  
  `For loans tied to a specific property (home loan, builder payment), use the Property section.`  
  No links, no navigation callbacks (Phase 16 alignment).

---

## Loan cards (list)

- **One card per loan** — spacing aligned with Gold/Bank (`Card` / `CardContent`).
- **Header row:** `Badge variant="secondary"` + loan type label (**Home** / **Car** / **Personal** / **Other**) + user **label** as title.
- **Secondary row:** Lender and EMI when present, e.g. `HDFC Bank · ₹32,000/month` or muted when missing.
- **Prominent:** Outstanding balance (INR, locale formatted).
- **Actions:** **Edit** (opens Sheet), **Delete** with **inline confirm** (CONTEXT D-04): `Confirm delete?` + **Yes** / **Cancel** on that card only; **Yes** removes and persists. On delete API failure, show delete error copy in the same place the sheet would show `saveError` if the sheet were open — for list-only delete, use a **dismissible inline alert** at top of list or **per-card** error text (match project’s preferred surface; minimum: same string as Gold delete failure).

---

## Sheet (add/edit)

- **Title:** **Add loan** / **Edit loan**.
- **Fields (order):** Label (required) → Loan type (select: Home / Car / Personal / Other) → Outstanding balance (INR, `parseFinancialInput`) → Lender (optional) → EMI (optional, `parseFinancialInput` + `roundCurrency`).
- **Patterns:** React Hook Form + Zod; `reset` in `openAdd` / `openEdit`; currency as strings in form state; `saveData` with immutable `liabilities` update; `createId`, `nowIso`, BaseItem timestamps.
- **Errors:** `saveError` state in sheet footer area (Gold pattern) for persist failures; clear on open and on new submit attempt.

---

## Empty state (LIAB-05)

- When `data.liabilities.length === 0`: centered in list area; use **No loans yet** + body line from copy table (Gold-like tone).

---

## Sidebar (INFRA-03)

- **`SectionKey`:** add `'liabilities'`.
- **`NAV_ITEMS`:** `{ key: 'liabilities', label: 'Liabilities' }` **immediately after** `property`.
- **`SECTION_COMPONENTS`:** `liabilities: LiabilitiesPage`.

---

## Accessibility

- **Add loan:** `aria-label` e.g. `Add loan`.
- Sheet: `Label` / `htmlFor` / `id`; destructive **Yes** identifiable.

---

## Checker sign-off

| Dimension | Result |
|-----------|--------|
| 1 Copywriting | PASS — specific CTAs; empty/error/destructive paths defined |
| 2 Visuals | PASS — focal hierarchy declared |
| 3 Color | PASS — roles + accent reserved list |
| 4 Typography | PASS — four sizes, two weights, line heights |
| 5 Spacing | PASS — 4px scale + documented `gap-3` exception |
| 6 Registry Safety | PASS — official shadcn only |

**Approval:** 2026-05-02
