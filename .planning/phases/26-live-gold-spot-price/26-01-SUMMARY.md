---
phase: 26-live-gold-spot-price
plan: "01"
subsystem: live-prices
tags: [gold, gold-api, LivePricesContext, Settings, Vitest]

requires:
  - phase: "12"
    provides: "silver via priceApi; forex for INR conversion"
provides:
  - `fetchGoldUsdPerOz` + `GOLD_TTL_MS` (parity with silver)
  - `goldUsdPerOz` / loading / error on `LivePricesContext`
  - Settings Gold Prices live ₹/g hints; Live rates XAU/XAG rows
  - Gold page live spot hint line when prices not configured
affects: [Settings UX, Gold page, net-worth messaging unchanged]

tech-stack:
  added: []
  patterns: ["goldLiveHints.ts for purity math; mirror runSilverFetch for gold"]

key-files:
  created:
    - src/lib/goldLiveHints.ts
    - src/lib/__tests__/goldLiveHints.test.ts
    - src/lib/__tests__/priceApi.gold.test.ts
  modified:
    - src/lib/priceApi.ts
    - src/context/LivePricesContext.tsx
    - src/pages/SettingsPage.tsx
    - src/pages/GoldPage.tsx

requirements-completed:
  - SPOT-01
  - SPOT-02
  - SPOT-03
  - UX-01
  - UX-02
  - UX-03
  - CALC-01
  - TEST-01

duration: —
completed: 2026-05-03
---

# Phase 26 Plan 01 Summary

**Gold spot (XAU) is fetched like silver, surfaced on `LivePricesContext`, and drives read-only ₹/gram hints on Settings and Gold. Saved `goldPrices` and `sumGoldInr` behavior are unchanged.**

## Verification

- `npm test -- --run` — all passing
- `npm run build` — success

## Notes

- Session overrides do not apply to metal spot (same as silver).
