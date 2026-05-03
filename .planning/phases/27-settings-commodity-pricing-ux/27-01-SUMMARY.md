---
phase: 27-settings-commodity-pricing-ux
plan: 01
subsystem: ui
tags: [react, settings, vitest, zod]

requires:
  - phase: 26
    provides: Live gold spot sync + gold hints patterns
provides:
  - Silver effective ₹/g for net worth with lock + auto-sync
  - Compact read-only + Edit commodity pricing on Settings (gold + silver)
  - Dashboard net-worth skeleton skips silver loading when only locked standard silver
affects: [dashboard, commodities, settings]

tech-stack:
  added: []
  patterns: [mirrored GoldSpotPricesSync for silver; extracted Settings*PricingCard components]

key-files:
  created:
    - src/lib/silverLiveHints.ts
    - src/lib/__tests__/silverLiveHints.test.ts
    - src/context/SilverSpotPricesSync.tsx
    - src/components/settings/SettingsGoldPricingCard.tsx
    - src/components/settings/SettingsSilverPricingCard.tsx
    - .planning/phases/27-settings-commodity-pricing-ux/27-UAT.md
  modified:
    - src/types/data.ts
    - src/lib/dashboardCalcs.ts
    - src/lib/__tests__/dashboardCalcs.test.ts
    - src/App.tsx
    - src/pages/DashboardPage.tsx
    - src/pages/SettingsPage.tsx

key-decisions:
  - "Silver `shouldAutoSyncSilverFromSpot` has no legacy carve-out (unlike gold)."
  - "Gold/silver pricing UI extracted to `SettingsGoldPricingCard` / `SettingsSilverPricingCard` to keep SettingsPage maintainable."

patterns-established:
  - "Effective silver: locked manual → live spot → unlocked cache → null."

requirements-completed: [UX-04, UX-05, UX-06, UX-07]

duration: 45min
completed: 2026-05-03
---

# Phase 27: Settings commodity pricing UX — Summary

**Delivered read-only + Edit flows for gold and silver on Settings, silver lock/sync parity with gold, and dashboard skeleton logic when silver is locked-only.**

## Performance

- **Duration:** ~45 min (single plan, inline execution)
- **Tasks:** 5 (4 automated + UAT doc)

## Accomplishments

- Added **`silverInrPerGram` / `silverPricesLocked`** and **`effectiveSilverInrPerGramForNetWorth`** wiring in **`calcCategoryTotals`**.
- **`SilverSpotPricesSync`** persists live silver ₹/g when unlocked, mirroring gold.
- Refactored Settings into **`SettingsGoldPricingCard`** and **`SettingsSilverPricingCard`** with healthy-feed read-only mode and failure-path immediate inputs.
- Dashboard headline avoids silver-loading skeleton when holdings are **only** standard silver with a **locked** saved rate.

## Self-Check: PASSED

- `npm test -- --run` — all tests passed
- `npm run build` — succeeded
- Plan acceptance greps and `27-UAT.md` presence verified

## Task commits

1. **Tasks 1–5** — `082b521` (`feat(27): silver effective rates, sync, and commodity pricing cards`)

## Deviations

- None.
