---
phase: 29-bullion-import-uplift-data-calculations
plan: 01
subsystem: testing
tags: [react, vitest, zod, import-uplift, gold, silver]

requires:
  - phase: 26-27
    provides: live spot pricing and settings persistence patterns
provides:
  - Persisted gold/silver import uplift rates with safe defaults and migration on import
  - Uplifted live ₹/g for gold and silver, threaded through sync, Settings cards, Gold page, and dashboard net worth
affects: [phase-30-settings-ux]

tech-stack:
  added: []
  patterns:
    - "Resolve uplift from settings (or default) at hint/net-worth boundaries; parity tests pass explicit 0 uplift"

key-files:
  created: []
  modified:
    - src/types/data.ts
    - src/context/AppDataContext.tsx
    - src/lib/goldLiveHints.ts
    - src/lib/silverLiveHints.ts
    - src/lib/dashboardCalcs.ts
    - src/pages/DashboardPage.tsx
    - src/context/GoldSpotPricesSync.tsx
    - src/context/SilverSpotPricesSync.tsx
    - src/components/settings/SettingsGoldPricingCard.tsx
    - src/components/settings/SettingsSilverPricingCard.tsx
    - src/pages/GoldPage.tsx

key-decisions:
  - "Dashboard gold uses effectiveGoldInrPerGramForKarat: uplifted live when auto-sync and feeds present; else saved goldPrices"
  - "Silver commodity row uses existing effectiveSilverInrPerGramForNetWorth (now uplift-aware from task 3)"

patterns-established:
  - "calcCategoryTotals live payload includes goldUsdPerOz for uplifted gold totals"

requirements-completed: [BLN-01, BLN-02, BLN-03, BLN-05]

duration: 0min
completed: 2026-05-06
---

# Phase 29: Bullion import uplift — Summary

**Import uplift rates live in Settings (defaults 10% / 8%), gold and silver live ₹/g and dashboard net worth use parity × (1 + rate) with `roundCurrency`, and Vitest covers schema, hints, and dashboard wiring.**

## Performance

- **Tasks:** 5
- **Files modified:** 14 (per plan `files_modified`)

## Accomplishments

- Zod + `ensureImportUpliftRates` default and migrate stored documents without uplift keys
- `liveInrPerGramPure` / `liveInrPerGramForKarat` and silver live line use uplift; resolvers read settings
- Spot sync and pricing UIs recompute when uplift or spot/forex changes
- `calcCategoryTotals` takes `goldUsdPerOz`; gold row matches uplifted live when auto-sync applies

## Task Commits

1. **29-01-01 — Settings schema + migration** — `118b0c0`
2. **29-01-02 — goldLiveHints uplift** — `cd14503`
3. **29-01-03 — silverLiveHints uplift** — `38ef40b`
4. **29-01-04 — Sync + hint surfaces** — `35fedf4`
5. **29-01-05 — dashboardCalcs + DashboardPage** — `de79d5a`

## Files Created/Modified

- Core types and load path: `src/types/data.ts`, `src/context/AppDataContext.tsx`, tests
- Math and effective pricing: `src/lib/goldLiveHints.ts`, `src/lib/silverLiveHints.ts`, `src/lib/dashboardCalcs.ts`
- UI/sync: `GoldSpotPricesSync`, `SilverSpotPricesSync`, Settings gold/silver cards, `GoldPage`, `DashboardPage`

## Decisions Made

None beyond plan — followed CONTEXT/RESEARCH defaults and D-04/D-05 rounding.

## Deviations from Plan

None — plan executed as written.

## Issues Encountered

- Adjusted `dashboardCalcs` silver wiring test expectation when default silver uplift shipped (task 3); full suite green before phase close.

## User Setup Required

None.

## Next Phase Readiness

- Phase **30** can add Settings UX for editing uplift rates (**BLN-04**); data fields and math are in place.

---
*Phase: 29-bullion-import-uplift-data-calculations · Plan 01 · Completed: 2026-05-06*
