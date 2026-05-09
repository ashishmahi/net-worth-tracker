---
status: testing
phase: 36-dashboard-dual-currency-display
source: [36-01-SUMMARY.md]
started: "2026-05-09T14:30:00.000Z"
updated: "2026-05-09T15:45:00.000Z"
---

## Current Test

number: 2
name: No muted line when all amounts match reporting currency
expected: |
  When every contributing record in a breakdown category uses the same currency as the selected reporting currency (e.g. reporting USD and only USD platforms in Mutual Funds), that category row shows a single amount line only — no smaller muted subline under it.
awaiting: user response

## Tests

### 1. Breakdown dual line (one foreign currency)
expected: |
  On Dashboard → Breakdown, a category that mixes reporting-currency amounts with exactly one other currency (e.g. Mutual Funds with one INR platform and one USD platform while reporting in INR) shows the reporting-currency figure as the main bold line, and a second smaller muted line below with the aggregated original amount in that foreign currency (e.g. USD). Hero net worth, Gross assets, Total debt mini-stats, and the Total Debt row in Breakdown stay single-line (no second currency line there).
result: issue
reported: |
  Clean state, INR reporting, added India MF 2000000; switched reporting to USD — still saw INR in MF UI; added 10000 second platform; Dashboard MF row did not show two prices / dual stack.
severity: minor

### 2. No muted line when all amounts match reporting currency
expected: |
  When every contributing record in a breakdown category uses the same currency as the selected reporting currency (e.g. reporting USD and only USD platforms in Mutual Funds), that category row shows a single amount line only — no smaller muted subline under it.
result: [pending]

### 3. Rate unavailable on breakdown row
expected: |
  When the app cannot convert to your reporting currency for a breakdown row (missing FX / rate unavailable), the amount column shows a small muted “Rate unavailable” hint and a sensible primary figure (existing INR-style fallback, or a single interpretable foreign total when that applies) — not a silent wrong number.
result: [pending]

## Summary

total: 3
passed: 0
issues: 1
pending: 2
skipped: 0

## Gaps

- truth: "Dashboard Breakdown shows dual currency stack when category mixes reporting currency with exactly one other stored currency."
  status: failed
  reason: "User reported: after INR MF entries and switch to USD, no dual-line MF row; INR still shown on MF page."
  severity: minor
  test: 1
  root_cause: "MF add/edit does not persist platform.currency (MutualFundsPage.tsx). Per DM-01 / D-02, absent currency defaults to settings.reportingCurrency, so after switching to USD both platforms are effectively USD — foreignDistinct is empty — computeBreakdownOriginalLine returns null (DSP-03: hide secondary). Dual-line demo requires explicit differing CurrencyCode on platforms (e.g. JSON or Phase 37 currency field). MutualFundsPage meta/list hardcodes INR display — separate from Phase 36 dashboard breakdown."
  artifacts:
    - path: "src/pages/MutualFundsPage.tsx"
      issue: "No currency on save; labels and toLocaleString use INR only"
    - path: "src/lib/dashboardCalcs.ts"
      issue: "computeBreakdownOriginalLine uses p.currency ?? reportingLens — correct per spec"
  missing:
    - "Optional: document in UAT/README that Phase 36 dual-line needs stored currency diversity; Phase 37 adds MF currency dropdown."
  debug_session: ""
