# Phase 26 — Technical research: Live gold spot

**Date:** 2026-05-03

## API

- **Endpoint:** `GET https://api.gold-api.com/price/XAU` — same vendor as existing silver (`/price/XAG`).
- **Sample JSON:** `{ "price": number, "symbol": "XAU", "currency": "USD", ... }` — reuse **`price`** parsing pattern from `fetchSilverUsdPerOz` in [`src/lib/priceApi.ts`](../../src/lib/priceApi.ts).
- **CORS:** Public API; same client-side constraints as silver (no backend proxy in scope).

## Wiring

- **`GOLD_TTL_MS`:** Equal **`SILVER_TTL_MS`** / **`FOREX_TTL_MS`** (~1h) per CONTEXT D-02.
- **`LivePricesContext`:** Duplicate **`runSilverFetch`** structure: refs, stale TTL, loading/error, hook into **`refetch`**, **`refetchStale`**, mount effect — no session overrides for spot metals.

## INR / gram derivation

- Pure: **`((usdPerOz / TROY_OZ_TO_GRAMS) * usdInr)`** then **`roundCurrency`** from [`src/lib/financials.ts`](../../src/lib/financials.ts).
- **22K:** × **22/24**; **18K:** × **18/24**. Matches commodity purity conventions from Phase 12.

## UI parity

- **Settings → Live market rates** `<dl>`: match **`Loader2`**, **`tabular-nums`**, **`aria-live="polite"`** patterns (~568+ in SettingsPage).
- **Gold Prices card:** Muted **`text-sm text-muted-foreground`** hint lines under each **`Label`** + **`Input`**.

## Risks

- Third-party outage → **`goldError`** surfaced; net worth still uses saved **`goldPrices`** only (unchanged **`sumGoldInr`**).

---

## RESEARCH COMPLETE

Findings align with **`26-CONTEXT.md`** — implementation can proceed without additional discovery.
