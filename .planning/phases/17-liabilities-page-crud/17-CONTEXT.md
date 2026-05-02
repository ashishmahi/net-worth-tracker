# Phase 17: Liabilities Page CRUD - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

New `LiabilitiesPage.tsx` wired into the existing SPA section-switch pattern — extend `SectionKey`, `NAV_ITEMS`, and `SECTION_COMPONENTS`. Full CRUD (add/edit/delete) for standalone loans using `data.liabilities[]`. Schema (`LiabilityItemSchema`) and calc utilities (`liabilityCalcs.ts`) are already in place from Phases 14–15.

**Architecture note:** The app uses a section-switching SPA (no React Router). Navigation is `useState<SectionKey>` + `onSelect` callback. The Phase 16 disambiguation hint in `PropertyPage.tsx` was correctly implemented as plain text (not a `<Link>`). Phase 17 follows the same SPA pattern.

</domain>

<decisions>
## Implementation Decisions

### List View Layout
- **D-01:** One card per loan — matches GoldPage / BankSavingsPage pattern. Each card shows: loan type badge + label (header row), lender · EMI (secondary row), outstanding balance (prominent), Edit and inline-delete actions.
- **D-02:** Page-level aggregate shows **two totals**: "Total outstanding: ₹X" and "Total EMI: ₹Y/month". Both computed at render time from `data.liabilities` — never stored.
- **D-03:** Loan type badges use **uniform secondary style** (not color-coded per type). Consistent with existing badge usage; label text (Home / Car / Personal / Other) provides the differentiation.

### Delete Behavior
- **D-04:** Inline confirm step — clicking the delete button replaces the card's action row with "Confirm delete? [Yes] [Cancel]". No modal required. Gives users a safety net without the overhead of a dialog.

### Disambiguation Banner (LIAB-06)
- **D-05:** **Persistent page banner** — always visible at the top of the Liabilities page, above the loan list (and above the empty state). Renders regardless of whether the list is empty or populated.
- **D-06:** **Plain text only** — no navigation link to the Property section. Copy should be short and directive: _"For loans tied to a specific property (home loan, builder payment), use the Property section."_ Matches the tone of the existing hint in `PropertyPage.tsx` (line 423).

### Sidebar Navigation (INFRA-03)
- **D-07:** `'liabilities'` is inserted **after `'property'`** in `NAV_ITEMS` — thematic pairing (assets then their debt counterpart). Sidebar order becomes: … Property → **Liabilities** → Bank Savings → Retirement → Settings.

### Claude's Discretion
- Form field order inside the Sheet (suggested: label → loan type → outstanding balance → lender → EMI) — follow the pattern of shortest-to-fullest required/optional grouping
- Exact Tailwind spacing between card sections — match GoldPage card spacing
- Lender placeholder copy (e.g. "e.g. HDFC Bank")
- EMI placeholder copy (e.g. "e.g. 32,000")
- Helper text wording for optional fields — match tone in PropertyPage

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Closest CRUD Pattern (primary reference)
- `src/pages/GoldPage.tsx` — Sheet-based add/edit, React Hook Form + Zod, card list, `openAdd` / `openEdit` / `onSubmit` pattern to replicate

### SPA Navigation Pattern
- `src/components/AppSidebar.tsx` — `SectionKey` type, `NAV_ITEMS` array to extend; insert `'liabilities'` after `'property'`
- `src/App.tsx` — `SECTION_COMPONENTS` record to extend; add `liabilities: LiabilitiesPage`

### Schema & Calc Utilities
- `src/types/data.ts` — `LiabilityItemSchema` (fields: `label`, `outstandingInr`, `loanType`, `lender?`, `emiInr?`); `LiabilityItem` type
- `src/lib/liabilityCalcs.ts` — `sumLiabilitiesInr(data)` for page total; import for aggregate display
- `src/lib/financials.ts` — `createId`, `nowIso`, `parseFinancialInput`, `roundCurrency`
- `src/context/AppDataContext.tsx` — `useAppData()` hook; `data.liabilities[]` is the live array

### Existing Pages for Secondary Reference
- `src/pages/BankSavingsPage.tsx` — Another clean card-list CRUD page
- `src/pages/PropertyPage.tsx` line 423 — Disambiguation hint copy/tone reference

### Requirements
- `.planning/REQUIREMENTS.md` §LIAB-01–06, INFRA-03 — Exact success criteria for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetFooter` — shadcn Sheet already used in GoldPage; import identically
- `Card`, `CardContent` — card pattern from GoldPage / BankSavingsPage
- `Badge` — already used in GoldPage for karat labels; use for `loanType`
- `useAppData()` — provides `data` and `saveData`
- `createId`, `nowIso`, `parseFinancialInput`, `roundCurrency` — all from `src/lib/financials.ts`
- `PageHeader` — `src/components/PageHeader.tsx`; used by every page

### Established Patterns
- Form: React Hook Form + `zodResolver` + local string state for currency inputs, parsed to number on submit
- Sheet reset before open: `reset({…})` in `openAdd()` and `openEdit()` to avoid stale values (Pitfall 3 in GoldPage comments)
- Save flow: `setSaving(true)` → mutate array immutably → `saveData()` → `setSaving(false)` in finally
- Inline delete state: replicate the "confirm" two-step using a local `deletingId` state variable (set to item.id on first click, cleared on cancel, execute on confirm)
- Currency inputs: `type="text" inputMode="decimal"`, parsed with `parseFinancialInput()`

### Integration Points
- `SectionKey` in `AppSidebar.tsx` — add `'liabilities'` to the union type
- `NAV_ITEMS` in `AppSidebar.tsx` — insert `{ key: 'liabilities', label: 'Liabilities' }` after the `property` entry
- `SECTION_COMPONENTS` in `App.tsx` — add `liabilities: LiabilitiesPage`
- `data.liabilities` (AppData) — the mutable array; save via `saveData({ ...data, liabilities: [...] })`

</code_context>

<specifics>
## Specific Ideas

- Disambiguation banner copy: _"For loans tied to a specific property (home loan, builder payment), use the Property section."_ — mirrors the existing PropertyPage hint tone (plain, directive, no jargon)
- Inline delete confirm replaces the action row only for the item being deleted, not the entire card
- Page totals display format should match how other pages show aggregates (e.g. `₹45,00,000` in en-IN locale, 0 decimal places for whole numbers)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-liabilities-page-crud*
*Context gathered: 2026-05-02*
