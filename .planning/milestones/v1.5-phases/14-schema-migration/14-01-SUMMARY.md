---
phase: 14-schema-migration
plan: "01"
subsystem: data-model
tags: [schema, migration, liabilities, zod, typescript]
dependency_graph:
  requires: []
  provides:
    - LiabilityItemSchema (src/types/data.ts)
    - LiabilityItem type (src/types/data.ts)
    - liabilities field on DataSchema (src/types/data.ts)
    - ensureLiabilities() migration function (src/context/AppDataContext.tsx)
  affects:
    - src/types/data.ts
    - src/context/AppDataContext.tsx
tech_stack:
  added: []
  patterns:
    - BaseItemSchema.extend() for new item schema
    - ensure*() migration guard pattern at root level
    - z.enum() for loanType discriminator
key_files:
  created: []
  modified:
    - src/types/data.ts
    - src/context/AppDataContext.tsx
decisions:
  - "liabilities is a root-level key on DataSchema, not nested inside assets (D-06)"
  - "outstandingInr uses .nonnegative() — zero is valid but negative is not (D-04)"
  - "loanType uses z.enum(['home','car','personal','other']) — exactly four values (D-05)"
  - "ensureLiabilities injects plain [] not {updatedAt, items:[]} because DataSchema uses z.array() directly"
  - "NetWorthPointSchema.totalInr relaxed to z.number() to allow debt-exceeds-assets snapshots (D-07)"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-01"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 14 Plan 01: Schema Foundation — Liabilities Data Layer

**One-liner:** Added `LiabilityItemSchema` to data.ts, wired `ensureLiabilities()` migration into the chain, and updated `createInitialData()` — pure data-layer foundation for v1.5 debt tracking.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add LiabilityItemSchema, update DataSchema + NetWorthPointSchema | 5663334 | src/types/data.ts |
| 2 | Add ensureLiabilities(), wire migration chain, update createInitialData() | b98ef2b | src/context/AppDataContext.tsx |

## What Was Built

**src/types/data.ts:**
- `LiabilityItemSchema`: BaseItemSchema.extend with `label` (required), `outstandingInr` (required, nonneg), `loanType` (enum: home/car/personal/other), `lender` (optional), `emiInr` (optional, nonneg)
- `DataSchema` updated: `liabilities: z.array(LiabilityItemSchema)` added at root, between `assets` and `netWorthHistory`
- `NetWorthPointSchema.totalInr` relaxed from `.nonnegative()` to `z.number()` — supports debt-exceeds-assets snapshots
- `LiabilityItem` TypeScript type exported

**src/context/AppDataContext.tsx:**
- `ensureLiabilities()`: exported migration guard — injects `liabilities: []` at root when absent from old data files
- `parseAppDataFromImport()` migration chain extended: `ensureOtherCommodities → ensureLiabilities → DataSchema.safeParse`
- JSDoc chain comment updated
- `createInitialData()` now returns `liabilities: []` at root (peer of `assets`)

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced. Changes are pure schema/migration in-memory transforms. Zod `safeParse` (not `parse`) ensures malformed input returns error object, never throws — consistent with T-14-03 mitigation.

## Known Stubs

None — this plan is pure data layer with no UI rendering.

## Self-Check: PASSED

- src/types/data.ts: FOUND
- src/context/AppDataContext.tsx: FOUND
- commit 5663334 (Task 1): FOUND
- commit b98ef2b (Task 2): FOUND
