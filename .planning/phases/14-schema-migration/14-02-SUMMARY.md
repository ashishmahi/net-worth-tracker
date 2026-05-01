---
phase: 14-schema-migration
plan: "02"
subsystem: tests
tags: [tests, schema, migration, liabilities, zod, vitest]
dependency_graph:
  requires:
    - 14-01 (LiabilityItemSchema, ensureLiabilities exports)
  provides:
    - LiabilityItemSchema test coverage (src/lib/__tests__/schema.test.ts)
    - DataSchema liabilities integration tests (src/lib/__tests__/schema.test.ts)
    - ensureLiabilities() unit tests (src/lib/__tests__/migration.test.ts)
  affects:
    - src/lib/__tests__/schema.test.ts
    - src/lib/__tests__/migration.test.ts
tech_stack:
  added: []
  patterns:
    - Zod safeParse boundary testing (valid/invalid inputs)
    - Migration guard reference-identity testing (toBe(raw))
    - baseFields() / minimalOldRoot() helper reuse pattern
key_files:
  created: []
  modified:
    - src/lib/__tests__/schema.test.ts
    - src/lib/__tests__/migration.test.ts
decisions:
  - "Reused existing baseFields() and minimalOldRoot() helpers — no new helpers needed"
  - "ensureLiabilities reference-identity test uses toBe(raw) not toEqual — confirms no copy is made"
  - "DataSchema liabilities test mutates createInitialData() return value directly — mirrors existing otherCommodities test pattern"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-01"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 14 Plan 02: Schema & Migration Tests — Liabilities Coverage

**One-liner:** Extended schema.test.ts with 8 LiabilityItemSchema/DataSchema liabilities tests and migration.test.ts with 3 ensureLiabilities() boundary tests — all 59 tests pass, no regressions.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add LiabilityItemSchema and DataSchema liabilities tests to schema.test.ts | e9563b1 | src/lib/__tests__/schema.test.ts |
| 2 | Add ensureLiabilities() tests to migration.test.ts | b0e7f40 | src/lib/__tests__/migration.test.ts |

## What Was Built

**src/lib/__tests__/schema.test.ts:**
- Import updated to include `LiabilityItemSchema` from `@/types/data`
- `describe('LiabilityItemSchema')` — 6 tests: valid required-only, valid with all optionals, zero outstandingInr (fully paid), negative outstandingInr rejection, empty label rejection, unknown loanType (`'mortgage'`) rejection
- `describe('DataSchema liabilities')` — 2 tests: full data with populated liabilities array, empty liabilities array (createInitialData result)
- Total: 14 `it()` calls across 4 describe blocks; all pass

**src/lib/__tests__/migration.test.ts:**
- Import updated to include `ensureLiabilities` from `@/context/AppDataContext`
- `describe('ensureLiabilities')` — 3 tests: injects `[]` at root when key absent, reference pass-through when key already present (`toBe(raw)`), non-object inputs (`null`, `'x'`) returned unchanged
- Total: 6 `it()` calls across 2 describe blocks; all pass

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Test-only files with no production impact.

## Known Stubs

None — test files with no UI rendering or data-source wiring.

## Self-Check: PASSED

- src/lib/__tests__/schema.test.ts: FOUND
- src/lib/__tests__/migration.test.ts: FOUND
- commit e9563b1 (Task 1): FOUND
- commit b0e7f40 (Task 2): FOUND
- npm test exits 0: CONFIRMED (59/59 tests pass)
- schema.test.ts it() count: 14 (≥13 required)
- migration.test.ts it() count: 6 (≥6 required)
- 4 describe blocks in schema.test.ts: CONFIRMED
- 2 describe blocks in migration.test.ts: CONFIRMED
