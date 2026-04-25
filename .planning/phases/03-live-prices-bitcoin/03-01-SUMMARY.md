---
phase: 03-live-prices-bitcoin
plan: 01
subsystem: ui
tags: react, context, fetch, coingecko, forex

requires: []
provides:
  - Central priceApi.ts for BTC and USD-base forex with documented endpoints
  - LivePricesProvider and useLivePrices with TTLs, session override clearing on live success, refetch strategy
affects:
  - Phase 03 plans 02–03 (Settings, Bitcoin, Bank pages)

tech-stack:
  added: []
  patterns:
    - "Session-only rate overrides cleared per-channel when live fetch succeeds (D-04)"
    - "Mount + 60s interval + visibility refetch for stale quotes only (D-10)"

key-files:
  created:
    - src/lib/priceApi.ts
    - src/context/LivePricesContext.tsx
  modified:
    - src/main.tsx
    - CLAUDE.md

key-decisions:
  - "CoinGecko for BTC/USD; open.er-api.com USD latest for INR and AED with AED/INR = INR/AED per USD"
  - "Stable fetch callbacks use refs for TTL to avoid StrictMode re-fetch loops"

requirements-completed:
  - D-01
  - D-02
  - D-03
  - D-04
  - D-10

duration: 15min
completed: 2026-04-25
---

# Phase 03 Plan 01: Central live prices Summary

**CoinGecko + open.er-api `priceApi`, `LivePricesProvider` / `useLivePrices` with hourly forex and 5‑minute BTC TTLs, session overrides cleared on successful live quotes, and app shell wiring inside `AppDataProvider`.**

## Performance

- **Duration:** 15 min (estimate)
- **Started:** 2026-04-25 (inline execution)
- **Completed:** 2026-04-25
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Single `fetch` surface for market data with documented primary URLs and AED/INR derivation.
- Context exposes effective rates, loading/error per channel, `refetch`, and session setters aligned with D-04/D-06.
- `CLAUDE.md` live-price bullet now matches Phase 3 hourly forex and `priceApi` / `useLivePrices`.

## Task Commits

1. **Task 1: Implement priceApi.ts** — `66fd5de` (feat)
2. **Task 2: LivePricesContext + useLivePrices + main.tsx** — `2825c58` (feat)
3. **Task 3: Align CLAUDE.md TTL wording** — `64bfc7d` (docs)

## Files Created/Modified

- `src/lib/priceApi.ts` — `fetchBtcUsd`, `fetchForex`, exported TTL constants.
- `src/context/LivePricesContext.tsx` — provider, hook, TTL + visibility + interval refresh.
- `src/main.tsx` — `LivePricesProvider` nested inside `AppDataProvider`.
- `CLAUDE.md` — live price caching convention updated.

## Verification

- `npx tsc --noEmit` → exit 0
- `grep -R "fetch(" src/pages` → no matches

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED
