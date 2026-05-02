# Phase 18: Dashboard & Net Worth Integration - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the existing `liabilityCalcs.ts` functions into `DashboardPage.tsx`:
- Replace `sumForNetWorth(totals)` with `calcNetWorth(grossAssets, sumLiabilitiesInr(data))` for both the headline net worth figure and new net worth snapshots (DASH-01, DASH-04)
- Add a conditional Total Debt row to the category breakdown card (DASH-02)
- Add a conditional Debt-to-Asset ratio inside the headline net worth card (DASH-03)

No new calc functions needed — all utilities are in place from Phases 15–17. This phase is UI wiring only.

</domain>

<decisions>
## Implementation Decisions

### Headline Net Worth (DASH-01, DASH-04)
- **D-01:** `grandTotal` (currently `sumForNetWorth(totals)`) is replaced by `calcNetWorth(grossAssets, sumLiabilitiesInr(data))`. The `grossAssets` variable is `sumForNetWorth(totals)` — keep it as a named intermediate for use in the % column and ratio calculation.
- **D-02:** Snapshot recording (`handleRecordSnapshot`) uses the new `calcNetWorth()` result, not the old `sumForNetWorth`. Historical snapshots are unchanged (no migration).

### Total Debt Row (DASH-02)
- **D-03:** Placed after the last asset row in the existing category breakdown card — separated by a `<Separator>`, same clickable button row style as asset rows.
- **D-04:** **Conditional** — only rendered when `sumAllDebtInr(data) > 0`. Hidden for users with no loans.
- **D-05:** Displayed as a **positive number in destructive/muted-destructive color** (e.g. `text-destructive` or `text-destructive/80`). Not shown as a negative. The color signals it reduces net worth.
- **D-06:** Row **navigates to the Liabilities page** via `onNavigate('liabilities')` — same SPA `onNavigate` callback pattern used by all other rows.
- **D-07:** No % column value for the Total Debt row — leave that cell empty or `—`.

### Debt-to-Asset Ratio (DASH-03)
- **D-08:** Displayed **inside the headline net worth card**, as a small secondary line below the net worth figure — e.g. `Debt-to-asset ratio: 12%`.
- **D-09:** **Conditional** — only shown when `sumAllDebtInr(data) > 0`. Hidden when no debt exists.
- **D-10:** Calculated as `debtToAssetRatio(sumAllDebtInr(data), grossAssets)`. Returns 0 when `grossAssets === 0` (function already handles this).

### % Column Denominator
- **D-11:** The % column continues to use **gross assets** (`sumForNetWorth(totals)`) as the denominator, not net worth. Percentages still add to ~100% and stay interpretable as asset composition. The debt deduction is only reflected in the headline number.

### Empty State
- **D-12:** The `noHoldingsYet()` check is updated to also return `false` when `data.liabilities.length > 0`. If a user has liabilities but no assets, the full dashboard renders with ₹0 gross, negative net worth, and the Total Debt row visible.

### Claude's Discretion
- Exact Tailwind class for destructive debt color (e.g. `text-destructive`, `text-destructive/80`, or `text-red-600`) — match existing destructive usage in the project
- Label text for the Total Debt row (e.g. "Total Debt", "Loans & Debt") — "Total Debt" is preferred
- Exact label/format for the ratio line (e.g. "Debt-to-asset: 12%" vs "Debt ratio: 12%") — keep it short

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary File (edit target)
- `src/pages/DashboardPage.tsx` — Full current implementation; all changes in this phase happen here

### Calc Utilities to Import
- `src/lib/liabilityCalcs.ts` — `sumLiabilitiesInr`, `sumAllDebtInr`, `calcNetWorth`, `debtToAssetRatio` — all already implemented
- `src/lib/dashboardCalcs.ts` — `sumForNetWorth` (keep as `grossAssets` intermediate), `calcCategoryTotals`, `percentOfTotal`, `DASHBOARD_CATEGORY_ORDER`

### Navigation Pattern
- `src/components/AppSidebar.tsx` — `SectionKey` type; `'liabilities'` was added in Phase 17 — use `onNavigate('liabilities')` in the Total Debt row click handler
- `src/App.tsx` — SPA section-switch; no React Router; `onNavigate` is the correct mechanism

### Requirements
- `.planning/REQUIREMENTS.md` §DASH-01–DASH-04 — Exact success criteria for all four dashboard requirements

### Phase Context for Calc Decisions
- `.planning/phases/15-calculation-utilities/15-CONTEXT.md` — D-03: `sumForNetWorth` stays as gross; D-06: `calcNetWorth` signature

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DashboardPage.tsx` `inrNoDecimals()` — existing formatter for all INR display; reuse for Total Debt value
- `DashboardPage.tsx` `onNavigate` prop — use for Total Debt row click (same as asset row pattern)
- `<Separator>` component — already imported; reuse to separate Total Debt row

### Established Patterns
- Asset rows use `<button type="button" onClick={() => onNavigate(NAV_KEY[key])}>` — Total Debt row follows the same pattern
- `grandTotal` is the net worth variable name — rename to `netWorth` or keep and update; `grossAssets = sumForNetWorth(totals)` becomes a new intermediate
- `percentOfTotal(v, grandTotal)` → update second arg to `grossAssets` (D-11)

### Integration Points
- `sumForNetWorth(totals)` call site in `useMemo` → becomes `grossAssets`; add `netWorth = calcNetWorth(grossAssets, sumLiabilitiesInr(data))` memo
- `handleRecordSnapshot` → replace `sumForNetWorth(totals)` with `netWorth`
- `noHoldingsYet(data)` → add `&& data.liabilities.length === 0` check

</code_context>

<specifics>
## Specific Ideas

- Total Debt row uses the same clickable `<button>` style as asset rows but value displayed in destructive color
- Ratio line sits below the `<CardTitle>` net worth figure inside the same `<CardHeader>` — small, `text-sm text-muted-foreground` style consistent with other secondary lines in the card

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 18-dashboard-net-worth-integration*
*Context gathered: 2026-05-02*
