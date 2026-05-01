# Phase 14: Schema & Migration - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Pure data-layer changes: define `LiabilityItemSchema`, add `liabilities: LiabilityItem[]` at the root of `DataSchema` (peer of `assets`), write `ensureLiabilities()` migration, update `createInitialData()`, relax `NetWorthPointSchema.totalInr` to allow negative values, and wire import/reset parity. No UI, no calculations — schema foundation only.

</domain>

<decisions>
## Implementation Decisions

### LiabilityItemSchema Fields
- **D-01:** `lender` is `.optional()` — not every loan has a known lender at entry time
- **D-02:** `emiInr` is `.optional()` — EMI may not be known or applicable for all loan types
- **D-03:** `label` and `outstandingInr` are required (non-optional) — minimum viable loan record
- **D-04:** `outstandingInr` uses `z.number().nonnegative()` — outstanding balance cannot be negative; zero is valid (fully paid)
- **D-05:** `loanType` enum: `home | car | personal | other` — exactly as specified in DEBT-01

### Schema Structure
- **D-06:** `liabilities: LiabilityItem[]` lives at the root of `DataSchema`, peer of `assets` and `netWorthHistory` — NOT inside `assets`
- **D-07:** `NetWorthPointSchema.totalInr` relaxed from `z.number().nonnegative()` to `z.number()` to support debt > assets snapshots (DEBT-05)

### Migration
- **D-08:** `ensureLiabilities()` follows the `ensure*` pattern used by `ensureOtherCommodities` — pure transform, injects `liabilities: []` when the key is absent
- **D-09:** `ensureLiabilities()` is `export`ed from `AppDataContext.tsx` so it can be tested directly (same pattern as `ensureOtherCommodities`)
- **D-10:** Migration is added to the chain in `parseAppDataFromImport` after existing migrations

### Tests
- **D-11:** Phase 14 includes unit tests following existing patterns:
  - `LiabilityItemSchema` validation cases added to `src/lib/__tests__/schema.test.ts`
  - `ensureLiabilities()` cases added to `src/lib/__tests__/migration.test.ts`

### Claude's Discretion
- Test case selection (which valid/invalid inputs to cover) — follow the same style and depth as `OtherCommodityItemSchema` and `ensureOtherCommodities` tests

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Types
- `src/types/data.ts` — All existing Zod schemas; `LiabilityItemSchema` and `DataSchema` updates go here
- `src/context/AppDataContext.tsx` — Migration chain (`parseAppDataFromImport`), `createInitialData()`, `ensureOtherCommodities` pattern to follow

### Tests
- `src/lib/__tests__/schema.test.ts` — Schema validation test pattern; add `LiabilityItemSchema` cases here
- `src/lib/__tests__/migration.test.ts` — Migration unit test pattern; add `ensureLiabilities()` cases here

### Requirements
- `.planning/REQUIREMENTS.md` §DEBT-01–05, §INFRA-01–02 — Exact field names, types, and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseItemSchema` (`src/types/data.ts:5`) — extend with `.extend()` for `LiabilityItemSchema`, same as all other item schemas
- `ensureOtherCommodities` — exact template for `ensureLiabilities()`; injects a missing root-level key before Zod parse

### Established Patterns
- All schemas: defined in `src/types/data.ts`, types exported at bottom via `z.infer<typeof Schema>`
- Migrations: pure functions, live in `AppDataContext.tsx`, chained in `parseAppDataFromImport`, exported for testing
- Optional fields: `outstandingLoanInr` on `PropertyItemSchema` uses `.optional()` — same approach for `lender` and `emiInr`

### Integration Points
- `parseAppDataFromImport` migration chain (line 73–84 in `AppDataContext.tsx`) — add `ensureLiabilities` call
- `createInitialData()` (line 89–106) — add `liabilities: []` at root
- `DataSchema` root object (line 144–158 in `data.ts`) — add `liabilities` field

</code_context>

<specifics>
## Specific Ideas

No specific references or "I want it like X" moments — standard implementation following established patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-schema-migration*
*Context gathered: 2026-05-01*
