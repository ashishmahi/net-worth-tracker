---
phase: 12
plan: "03"
status: complete
completed: "2026-04-30"
---

## Outcome

- `sumCommoditiesInr` implements partial-total semantics (manual always; standard silver only when INR/gram derivable).
- `calcCategoryTotals` accepts `silverUsdPerOz`, derives INR/gram via `TROY_OZ_TO_GRAMS`, `CategoryTotals` / `DASHBOARD_CATEGORY_ORDER` include `otherCommodities`.
- Dashboard shows **Commodities** row, silver loading skeleton at net-worth level, silver error note, `noHoldingsYet` / `excludedNames` aligned with null commodity totals.

## Key files

- `src/lib/dashboardCalcs.ts`, `src/lib/__tests__/dashboardCalcs.test.ts`
- `src/pages/DashboardPage.tsx`

## Self-Check: PASSED

- `npx vitest run`
- `npx tsc -b --noEmit`

## Deviations

- None.
