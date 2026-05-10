---
status: complete
phase: 38-settings-snapshots-export-import
source: 38-01-PLAN.md (must_haves), 38-CONTEXT.md, 38-UI-SPEC.md
started: 2026-05-10T12:00:00Z
updated: 2026-05-10T14:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Live rates tab — merged card layout and scope
expected: One merged card on Live rates; row order USD→INR … SGD→INR then BTC/USD; correct labels; no XAU/XAG rows on this tab.
result: pass

### 2. Live rates tab — read-only, Edit, Apply, Cancel, Clear
expected: Default is read-only formatted values. Edit toggles six decimal inputs plus Apply session rates, Clear session rates, and Cancel. Cancel exits edit without applying drafts. Apply applies non-empty session overrides and returns to read-only. Clear clears session overrides per existing behavior. Copy still explains session-only semantics.
result: pass

### 3. Dashboard — Record snapshot
expected: Record snapshot control behaves as before (success feedback / history updates). Chart still plots INR (totalInr); no new chart chrome for reporting currency this phase.
result: pass

### 4. Zip export / import round-trip
expected: Export data as zip; import that zip (or round-trip in a second profile/session). Per-record currency fields persist. At least one net worth history point with new optional fields (reportingCurrency, totalReporting, rates if present) survives the round-trip intact.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
