---
status: pending
phase: 28-section-routing-home-header
source: [28-UI-SPEC.md, 28-01-PLAN.md]
started: 2026-05-03T23:55:00.000Z
updated: 2026-05-03T23:55:00.000Z
---

## Current Test

[awaiting manual verification]

## Tests

### 1. Gold deep link survives refresh
expected: |
  Run the dev server (`npm run dev`). Open Gold via sidebar or navigate to `/gold` (include repo `base` if deployed under a subpath). Refresh the browser — the Gold section stays visible (URL unchanged, no snap back to Dashboard).
result: [pending]

### 2. Settings deep link survives refresh
expected: |
  Navigate to `/settings` (with correct `basename`). Refresh — Settings remains open.
result: [pending]

### 3. Mobile Home returns to dashboard URL
expected: |
  Narrow viewport (or device toolbar). From Settings, tap the **Home** control (house icon) in the mobile top bar — URL becomes `/` (dashboard) and Dashboard content shows.
result: [pending]

### 4. Sidebar active state matches URL
expected: |
  Use sidebar links and/or paste URLs. The highlighted sidebar row matches the current section (`aria-current="page"` on the active item).
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

*None.*
