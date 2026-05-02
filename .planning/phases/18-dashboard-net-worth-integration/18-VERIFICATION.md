---
status: passed
phase: 18-dashboard-net-worth-integration
verified: 2026-05-02
---

# Phase 18 Verification

## Goal

The dashboard headline net worth reflects debt-adjusted totals, a Total Debt summary row appears when relevant, new snapshots capture true net worth, and asset composition percentages use gross assets as denominator.

## Must-haves checked

| Truth | Evidence |
|-------|----------|
| Headline uses `calcNetWorth(grossAssets, sumLiabilitiesInr(data))` | `src/pages/DashboardPage.tsx`: `netWorth` memo |
| Snapshots store rounded net worth from same formula | `handleRecordSnapshot`: `calcNetWorth(gross, sumLiabilitiesInr(data))` → `roundCurrency` |
| Total Debt row when `sumAllDebtInr(data) > 0`; navigates to liabilities | `totalDebtAll` memo; button `onNavigate('liabilities')`, destructive styling |
| Debt-to-asset ratio when debt > 0; 0% when no assets | `debtToAssetRatio(totalDebtAll, grossAssets)` per `liabilityCalcs.ts` contract |
| Category `%` uses `grossAssets` not net worth | `percentOfTotal(..., grossAssets)`; guard `grossAssets <= 0` |
| Liabilities-only users not stuck on empty state | `noHoldingsYet` includes `data.liabilities.length === 0` |

## Automated checks

- `npm test` — pass (55 tests)
- `npx tsc -b --noEmit` — pass

## Requirement traceability

| ID | Status |
|----|--------|
| DASH-01 | Satisfied — headline net worth |
| DASH-02 | Satisfied — Total Debt row + link |
| DASH-03 | Satisfied — ratio line |
| DASH-04 | Satisfied — snapshot value |

## human_verification

None required — logic matches pure helpers and existing patterns.

## Notes

Historical `netWorthHistory` entries are not migrated; only new snapshots use the updated computation path.
