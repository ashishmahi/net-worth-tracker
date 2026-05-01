# Phase 15: Calculation Utilities - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Four pure TypeScript functions for debt arithmetic — `sumLiabilitiesInr`, `sumAllDebtInr`, `calcNetWorth`, `debtToAssetRatio` — each with unit tests. No UI, no wiring to components (that's Phase 18). Schema is already in place from Phase 14.

</domain>

<decisions>
## Implementation Decisions

### File Placement
- **D-01:** New `src/lib/liabilityCalcs.ts` — debt logic isolated from dashboard display logic; `dashboardCalcs.ts` stays focused on category totals and display functions
- **D-02:** Tests in new `src/lib/__tests__/liabilityCalcs.test.ts` — mirrors the source file; consistent with the one-test-file-per-source-module pattern

### calcNetWorth / sumForNetWorth Relationship
- **D-03:** Both functions co-exist; `sumForNetWorth(CategoryTotals)` stays unchanged for gross asset totals; `calcNetWorth(grossAssets, liabilitiesTotal)` is the new headline net worth function; Phase 18 decides the call site wiring — no changes to `dashboardCalcs.ts` or `DashboardPage.tsx` in this phase

### Function Signatures (from REQUIREMENTS)
- **D-04:** `sumLiabilitiesInr(data: AppData): number` — sums `outstandingInr` across all standalone liabilities; returns 0 for empty list
- **D-05:** `sumAllDebtInr(data: AppData): number` — combines property `outstandingLoanInr` (only items where `hasLiability === true`) + `sumLiabilitiesInr(data)`; display total only
- **D-06:** `calcNetWorth(grossAssets: number, liabilitiesTotal: number): number` — gross assets minus standalone liabilities; can return negative
- **D-07:** `debtToAssetRatio(totalDebt: number, grossAssets: number): number` — percentage; returns 0 when `grossAssets === 0`

### Calculation Conventions
- **D-08:** `roundCurrency()` after every multiplication and sum accumulation (established project convention)

### Claude's Discretion
- Test case selection depth and edge case coverage — follow the style and depth of `dashboardCalcs.test.ts`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Calc Patterns
- `src/lib/dashboardCalcs.ts` — Pattern for AppData-taking pure calc functions; `roundCurrency` usage; `sumForNetWorth` to co-exist with
- `src/lib/financials.ts` — `roundCurrency` utility to import
- `src/lib/__tests__/dashboardCalcs.test.ts` — Test style and depth to match

### Schema (Phase 14 output)
- `src/types/data.ts` — `LiabilityItemSchema`, `DataSchema.liabilities`, `PropertyItemSchema.outstandingLoanInr`, `PropertyItemSchema.hasLiability`
- `src/context/AppDataContext.tsx` — `createInitialData()` for test data helpers

### Requirements
- `.planning/REQUIREMENTS.md` §CALC-01–04 — Exact function names, signatures, and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `roundCurrency` (`src/lib/financials.ts`) — import for all arithmetic
- `createInitialData()` (`src/context/AppDataContext.tsx`) — use in tests to get a valid `AppData` base, then patch `.liabilities`
- `AppData` type (`src/types/data.ts`) — parameter type for `data`-taking functions

### Established Patterns
- Pure functions, no side effects, no React — just TypeScript + imports
- Functions that take `AppData` access `data.assets.*` or `data.liabilities` directly
- `sumPropertyInr` in `dashboardCalcs.ts` shows how to handle `hasLiability` + `outstandingLoanInr` on property items (reference for `sumAllDebtInr`)

### Integration Points
- Phase 18 (`DashboardPage.tsx`) will import from `liabilityCalcs.ts` — no wiring needed in Phase 15
- `sumForNetWorth` in `dashboardCalcs.ts` remains the gross assets calculator; `calcNetWorth` is a new peer for net-of-debt calculation

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

*Phase: 15-calculation-utilities*
*Context gathered: 2026-05-01*
