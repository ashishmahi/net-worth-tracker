---
phase: 17
status: approved
source: context-sync
---

# Phase 17 — UI Design Contract

## Scope

New page `LiabilitiesPage.tsx`, sidebar entry `'liabilities'` after Property, SPA section wiring in `App.tsx`. Full CRUD on `data.liabilities[]`. No React Router.

## Page shell

- **Header:** `PageHeader` with title **Liabilities**, primary action **Add loan** (or equivalent — match Gold/Bank pattern: `Plus` icon + short label).
- **Meta block (aggregates):** Two lines or a compact block directly under the title area:
  - **Total outstanding:** `sumLiabilitiesInr(data)` formatted `en-IN` currency, 0 decimals when whole.
  - **Total EMI:** sum of optional `emiInr` across standalone liabilities only, label **`₹X/month`** (computed at render — never stored).
- **Banner (LIAB-06 / CONTEXT D-05–D-06):** Always visible **above** the card list and **above** empty state. Plain text, helper tone (`text-sm text-muted-foreground`). **Verbatim copy:**  
  `For loans tied to a specific property (home loan, builder payment), use the Property section.`  
  No links, no navigation callbacks (matches Phase 16 / CONTEXT).

## Loan cards (list)

- **One card per loan** — align spacing with Gold/Bank card lists (`Card` / `CardContent`).
- **Header row:** `Badge variant="secondary"` + human-readable loan type label (**Home** / **Car** / **Personal** / **Other** from `loanType` enum) + user **label** as title text.
- **Secondary row:** Lender (if present) and EMI (if present), e.g. `HDFC Bank · ₹32,000/month` or muted placeholder when missing.
- **Prominent:** Outstanding balance (INR, locale formatted).
- **Actions:** **Edit** (opens Sheet) and **Delete**. Delete uses **inline confirm** (CONTEXT D-04): first click sets confirm UI on that card only — `Confirm delete?` + **Yes** / **Cancel**; Yes removes item and persists.

## Sheet (add/edit)

- **Title:** Add loan / Edit loan.
- **Fields (suggested order):** Label (required) → Loan type (select: Home / Car / Personal / Other) → Outstanding balance (INR, text + `parseFinancialInput`) → Lender (optional text) → EMI (optional, ₹/month, text + `parseFinancialInput` + `roundCurrency`).
- **Patterns:** React Hook Form + Zod resolver; reset in `openAdd` / `openEdit`; currency fields as strings in form state; `saveData` with immutable `liabilities` array update; `createId`, `nowIso`, timestamps on BaseItem fields.

## Empty state (LIAB-05)

- Centered in list area when `data.liabilities.length === 0`: short heading + line prompting to add first loan (tone like Gold empty state).

## Sidebar (INFRA-03)

- **`SectionKey`:** add `'liabilities'`.
- **`NAV_ITEMS`:** insert `{ key: 'liabilities', label: 'Liabilities' }` **immediately after** `property`.
- **`SECTION_COMPONENTS`:** `liabilities: LiabilitiesPage`.

## Accessibility

- Add-loan button: `aria-label`.
- Sheet inputs: `Label` / `htmlFor` / `id`; destructive confirm buttons identifiable.
