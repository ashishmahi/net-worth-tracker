---
phase: 05-dashboard
plan: 01
subsystem: lib
tags: [typescript, pure-functions]

key-files:
  created: [src/lib/dashboardCalcs.ts]
  modified: []

key-decisions:
  - "Gold null when items exist but goldPrices missing; bitcoin null when BTC or USD/INR null"
  - "Bank savings sums INR + AED (when aedInr); AED skipped when rate null"
  - "Property equity per D-01; retirement nps+epf per D-03; no calcProjectedCorpus"

requirements-completed: [DASH-01]

duration: 10min
completed: 2026-04-26
---

# Phase 05-01: dashboardCalcs

Pure `calcCategoryTotals`, `sumForNetWorth`, `percentOfTotal`, `hasAedAccountsWithMissingRate`, and `DASHBOARD_CATEGORY_ORDER` in `src/lib/dashboardCalcs.ts` per 05-CONTEXT D-01–D-12.

## Task commits

1. `feat(05-01): add dashboardCalcs for category totals and net worth`

## Self-Check: PASSED

- `npx tsc --noEmit` / `npm run build` (run in 05-02 batch with full UI)
- `rg "calcProjectedCorpus" src/lib/dashboardCalcs.ts` — no matches
