---
phase: "36-dashboard-dual-currency-display"
status: passed
completed: "2026-05-09"
---

# Phase 36 verification

## Requirement traceability

| ID | Verification |
|----|----------------|
| DSP-01 | Breakdown category rows (Gold–Retirement) show reporting-currency primary; optional muted original subline per D-02; hero and Total Debt remain single-line (`DashboardPage.tsx`, `36-CONTEXT` D-01). |
| DSP-03 | When all contributing effective currencies equal `reportingLens`, secondary is omitted (`computeBreakdownOriginalLine` returns `null`; tests in `dashboardBreakdown.test.ts`). |

## Automated

- `npx tsc -b --pretty false` — pass  
- `npm test -- --run` — pass (146 tests)  
- `npm run build` — pass  

## Human verification

- Manual spot-check suggested: mixed-currency MF row in running app shows primary + muted subline; reporting-only holdings hide subline; missing FX continues to show “Rate unavailable” copy.
