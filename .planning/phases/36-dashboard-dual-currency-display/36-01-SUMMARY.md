---
phase: 36-dashboard-dual-currency-display
plan: "01"
subsystem: ui
tags: [react, vitest, multi-currency, dashboard]

requires:
  - phase: "34-fx-infrastructure-data-model"
    provides: toReportingCurrency, ForexRateSnapshot
provides:
  - Honest INR hub totals for MF, stocks, bank, property, retirement via stored currency + forex snapshot.
  - computeBreakdownOriginalLine for D-02 secondary eligibility.
  - Breakdown rows dual-stack primary + muted original line; degraded D-04 path.
  - Regression tests for D-02 / DSP-03.
affects: ["37", "dashboard"]

tech-stack:
  added: []
  patterns-established:
    - "CategoryTotalsCalcContext threads rates + reportingLens defaults for omitted record currency."

key-files:
  created:
    - "src/lib/__tests__/dashboardBreakdown.test.ts"
  modified:
    - "src/lib/dashboardCalcs.ts"
    - "src/lib/__tests__/dashboardCalcs.test.ts"
    - "src/pages/DashboardPage.tsx"

key-decisions:
  - "Gold, commodities, and bitcoin omit secondary metadata in this phase; MF/stocks/bank/property/retirement implement D-02 fully."

requirements-completed: [DSP-01, DSP-03]

duration: 25min
completed: 2026-05-09
---

# Phase 36: Dashboard dual-currency display — Plan 01

**Breakdown category rows now aggregate through `toReportingCurrency` into INR and show one optional muted foreign subline when exactly one distinct non-reporting currency contributed successfully.**

## Performance

- **Tasks:** 3
- **Files modified:** 4 (including new test file)

## Accomplishments

- Extended `calcCategoryTotals` with `CategoryTotalsCalcContext` and INR hub sums for MF, stocks, banks (all ISO legs), property equity, retirement.
- Shipped `computeBreakdownOriginalLine` implementing **36-CONTEXT D-02** aligned with numeric contributor set.
- Dashboard breakdown renders vertical stack (**D-03**) and degraded **D-04** enhancement when FX to reporting lens fails.

## Task Commits

1. **36-01-01 INR hub totals + breakdown metadata** — `5decc50` (feat)
2. **36-01-02 Vitest fixtures** — `2cbbe9f` (test)
3. **36-01-03 dual stack JSX** — `e5b7e16` (feat)

## Verification

- `npx tsc -b --pretty false` ✓
- `npm test -- --run` ✓ (146 tests)
- `npm run build` ✓

## Deviations

- None.

## Self-Check: PASSED
