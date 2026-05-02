# Phase 17 — Technical Research

**Phase:** 17 — Liabilities Page CRUD  
**Question answered:** What do we need to know to implement standalone loan CRUD and nav without breaking the SPA model?

## RESEARCH COMPLETE

---

## 1. Navigation model (no router)

- `App.tsx` keeps `activeSection: SectionKey` and renders either `DashboardPage` (with `onNavigate`) or `SECTION_COMPONENTS[activeSection]` **without props** for asset pages.
- Adding a page requires: extend `SectionKey` union in `AppSidebar.tsx`, append/reorder `NAV_ITEMS`, add key to `SECTION_COMPONENTS` in `App.tsx`, lazy-safe default—first paint unchanged if user stays on dashboard.

## 2. Reference CRUD: GoldPage / BankSavingsPage

- **Sheet lifecycle:** `sheetOpen`, `editingId`, `reset()` before open for add vs edit to avoid stale fields (Gold comments Pitfall 3).
- **Persist:** `await saveData({ ...data, … })` with immutable copies of nested arrays; liabilities live at **root** `data.liabilities`, not under `assets`.
- **Delete:** BankSavings `handleDelete` runs from Sheet; for list inline-delete, use local `deletingId` to scope confirm UI to one row (CONTEXT D-04).
- **Empty state:** `Card` with centered text when array length 0.

## 3. Data model (already shipped)

- `LiabilityItemSchema` in `src/types/data.ts`: `label`, `outstandingInr`, `loanType` (`home|car|personal|other`), optional `lender`, optional `emiInr`, plus BaseItem id/timestamps.
- No schema migration this phase — UI only.

## 4. Aggregates

- **Total outstanding:** `sumLiabilitiesInr(data)` from `src/lib/liabilityCalcs.ts` — reuse.
- **Total EMI:** Not exported yet. Recommend **`sumStandaloneLiabilitiesEmiInr(data)`** (or similarly named) in `liabilityCalcs.ts`: sum `emiInr` where defined, using `roundCurrency` for consistency with CALC-01 style; unit test beside `liabilityCalcs.test.ts`.

## 5. Loan type UX

- Display map: `home→Home`, `car→Car`, `personal→Personal`, `other→Other`.
- Badge: `variant="secondary"` for all types (CONTEXT D-03) — same visual weight; text differentiates.

## 6. Pitfalls

- **Wrong save path:** Mutating `data.liabilities` in place then saving — must shallow-copy array on update.
- **Double comma formatting:** Always `parseFinancialInput` on user-entered currency strings.
- **SectionKey exhaustiveness:** TypeScript will flag missing `SECTION_COMPONENTS` entry when `SectionKey` grows — fix all references.

---

## Validation Architecture

Phase 17 validates through:

1. **Static:** `npx tsc -b --noEmit` after TS edits.
2. **Unit tests (Vitest):** `npm test` — extend `src/lib/__tests__/liabilityCalcs.test.ts` if new EMI aggregate helper is added; existing suite must stay green.
3. **Manual UAT (post-execute):** Add/edit/delete flows, empty state, banner presence, sidebar order, badge labels — aligns with ROADMAP success criteria and LIAB/INFRA requirements.

No E2E harness in repo; page behavior is covered by UAT per GSD verify-work.

---

## Dependencies

- Phase 15 calc utilities (reuse `sumLiabilitiesInr`).
- Phase 14 schema (read-only for this phase).

---

*Research for planning — 2026-05-02*
