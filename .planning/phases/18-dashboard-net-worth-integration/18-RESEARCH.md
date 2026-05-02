# Phase 18: Dashboard & Net Worth Integration — Research

**Phase:** 18 — Dashboard & Net Worth Integration  
**Question:** What do we need to know to implement debt-adjusted net worth, Total Debt row, and ratio on the dashboard?

---

## Summary

All arithmetic lives in `src/lib/liabilityCalcs.ts` and `src/lib/dashboardCalcs.ts` from prior phases. Phase 18 is **UI wiring only** in `src/pages/DashboardPage.tsx`:

1. **`grossAssets`** — keep `sumForNetWorth(totals)` as the gross aggregate (used for % column denominator and `debtToAssetRatio` denominator).
2. **`netWorth`** — `calcNetWorth(grossAssets, sumLiabilitiesInr(data))` for headline and snapshots (**standalone liabilities only** per CALC-03 / Phase 15).
3. **`totalDebt`** — `sumAllDebtInr(data)` for the dashboard row (property + standalone).
4. Replace internal uses of `grandTotal` as “display net worth” with `netWorth`; rename locals for clarity (`grandTotal` → avoid confusion — prefer `netWorth` + `grossAssets`).
5. **`percentOfTotal(v, grossAssets)`** — second argument must be gross assets (CONTEXT D-11).
6. **`noHoldingsYet`** — extend so liabilities-only users see the dashboard (CONTEXT D-12).
7. **Total Debt row** — append after `DASHBOARD_CATEGORY_ORDER.map`, following existing `<button>` row pattern with `Separator`, navigate to `'liabilities'`.

---

## Code Anchors (current)

| Location | Current behavior | Change |
|----------|------------------|--------|
| L103 | `grandTotal = sumForNetWorth(totals)` | Split: `grossAssets` + `netWorth` memos (liability calcs depend on `data`) |
| L165 | `roundCurrency(sumForNetWorth(totals))` in snapshot | Use `netWorth` (same rounding stack) |
| L282-285 | `percentOfTotal(..., grandTotal)` | Use `grossAssets` |
| L360-365 | `%` col uses `grandTotal <= 0` | Use `grossAssets <= 0` |
| L59-70 | `noHoldingsYet` | Add `data.liabilities.length === 0` to the AND chain (de Morgan: show dashboard if liabilities exist) |

---

## Dependencies

- **Phase 15** — `calcNetWorth`, `sumLiabilitiesInr`, `sumAllDebtInr`, `debtToAssetRatio` APIs stable.
- **Phase 17** — `SectionKey` includes `'liabilities'`; `onNavigate('liabilities')` is valid.

---

## Risks / Edge Cases

- **Negative net worth display:** `toLocaleString` with INR handles negative values; verify visually once.
- **Zero gross, positive debt:** Ratio line hidden when `sumAllDebtInr === 0`; when debt > 0 and gross === 0, CONDITIONAL for ratio: CONTEXT D-09 says show when debt > 0; D-10 says `debtToAssetRatio` returns 0% when gross === 0 — show **0%** or hide? CONTEXT: "only shown when sumAllDebtInr > 0" — show line with 0% if debt exists (debtToAssetRatio already 0).

---

## Validation Architecture

| Dimension | Approach |
|-----------|----------|
| Correctness of wiring | **Grep-verifiable** strings: imports from `@/lib/liabilityCalcs`, `calcNetWorth`, `sumAllDebtInr`, `onNavigate('liabilities')`, updated `noHoldingsYet` condition |
| Regression | **`npm test`** (Vitest) — existing `liabilityCalcs` tests unchanged; full suite green |
| Types | **`npx tsc -b --noEmit`** |
| UI | Manual UAT per ROADMAP success criteria (headline matches formula, row links, snapshot value) |

No database or schema changes — no migration push task.

---

## RESEARCH COMPLETE

Phase 18 implementation is ready for planning: single-file focus, no new libraries, verification via existing test suite + TypeScript + acceptance criteria in PLAN.md.
