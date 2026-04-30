# Phase 12: Commodities: data & net worth - Context

**Gathered:** 2026-04-28  
**Revised:** 2026-04-30 — discriminated union model (standard + manual), silver live fetch, combined 'Commodities' row, settings.commodityPrices dropped  
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the **persisted data model**, **load-time migration**, **live silver price wiring**, **net worth math** (including **Record snapshot** eligibility), and **`createInitialData` / import / reset** alignment for **commodities other than gold**.

### Two commodity item types (discriminated union)

All non-gold commodity items live in a **single** `assets.otherCommodities.items[]` array using a discriminated union on `type`:

- **`type: 'standard'`** — weight-based, live-priced precious metals. v1.4 supports **`kind: 'silver'`** only. Fields: `kind`, `grams` (≥ 0). Price comes from live API fetch — no user-entered INR/gram.
- **`type: 'manual'`** — freeform named assets (oil, copper, art, etc.). Fields: `label` (string), `valueInr` (≥ 0). User enters the total INR value directly; no weight or unit tracking.

### Pricing model

- **Silver**: live spot price fetched via a free metals API (e.g. metals.live, metalpriceapi.com). Converts silver USD/troy oz → INR/gram using existing USD/INR forex rate (1 troy oz = 31.1035 g). Cache TTL: **~1 hour** (same as forex). Wired through `src/lib/priceApi.ts` + `useLivePrices()`.
- **Manual items**: `valueInr` stored directly — no fetch, always available.
- **`settings.commodityPrices`** is **dropped** — live fetch covers standard items; manual items are self-contained.

### Dashboard

Single **"Commodities"** row on the Dashboard, combining silver + all manual items.  
Net worth partial-total behavior: manual items are always summed; silver portion is excluded (not null-out the whole row) when live silver price is unavailable — mirrors how AED bank accounts work when `aedInr` is missing.

### Gold is untouched

`assets.gold` and `settings.goldPrices` remain unchanged (COM-06). Gold is NOT folded into `otherCommodities`.

### Phase 12 vs Phase 13

**Phase 12 delivers:** DataSchema (discriminated union), migration, `sumCommoditiesInr` helper, `CategoryTotals` + `DASHBOARD_CATEGORY_ORDER`, snapshot eligibility, `parseAppDataFromImport` / `createInitialData` / reset alignment, **and** `priceApi.ts` + `useLivePrices()` silver fetch wiring.

**Phase 13 delivers:** CRUD UI for silver items and manual items, Settings forms, Dashboard row copy/polish, nav labels, gold UX polish (COM-06).

</domain>

<decisions>
## Implementation Decisions

### Persisted shape

- **D-01:** Leave `assets.gold` and `settings.goldPrices` unchanged — COM-06 compatibility. Do not fold gold into a generic commodities tree.
- **D-02:** Add sibling `assets.otherCommodities: { updatedAt: ISO datetime, items: OtherCommodityItem[] }`.
- **D-03:** `OtherCommodityItem` is a **Zod discriminated union** on `type`:
  - `type: 'standard'` → extends `BaseItemSchema` with `kind: z.literal('silver')` (extend enum later for platinum etc.) and `grams: z.number().nonnegative()`
  - `type: 'manual'` → extends `BaseItemSchema` with `label: z.string().min(1)` and `valueInr: z.number().nonnegative()`

### Settings pricing

- **D-04 (dropped):** `settings.commodityPrices` map from prior context is **not added**. Standard items use live fetch; manual items store `valueInr` directly. No user-managed price table for commodities.

### Live price fetch — silver

- **D-11 (revised):** Silver live price fetch **IS** in scope for v1.4. Approach:
  - Add `silverUsdPerOz: number | null` to live prices state in `useLivePrices()`.
  - Fetch from a free metals API (Claude's discretion on exact endpoint — pick whichever free tier is most reliable at implementation time). Fallback: null.
  - Convert: `silverInrPerGram = (silverUsdPerOz / 31.1035) × usdInr`. Both factors null-safe.
  - Cache TTL: **~1 hour** (same bucket as forex). Route through `src/lib/priceApi.ts` — no ad-hoc fetch in pages or components.

### Dashboard calculations & snapshot behavior

- **D-05:** `DASHBOARD_CATEGORY_ORDER` gains `'otherCommodities'` immediately after `'gold'`.
- **D-06:** `CategoryTotals` gains `otherCommodities: number | null`. Calculation:
  - Manual items: always add `item.valueInr` to the running sum (always priceable).
  - Standard (silver) items: add `roundCurrency(item.grams × silverInrPerGram)` when `silverInrPerGram` is available; **skip** (not null-out) when price is unavailable AND the item has `grams > 0`.
  - The row is `null` only if the total is indeterminate in a way that can't be partially summed — in practice this means `otherCommodities` will be a number (≥ 0) as long as manual items or priced silver exist; it reflects the best available partial total.
  - `0` when `items` is empty.
  - `canRecordSnapshot` / `excludedNames` / `noHoldingsYet`: treat missing silver price the same as missing AED rate — show an informational flag ("Silver price unavailable") but do NOT block the snapshot when other holdings are known.
- **D-07:** Dashboard row label: **"Commodities"** (single combined row, not separate silver / other).

### Migration & parse path

- **D-08:** Stay on `version: 1`. Add `ensureOtherCommodities` pre-parse helper (alongside `ensureNetWorthHistory`) that injects `{ updatedAt: nowIso(), items: [] }` when the key is absent — covers all existing `data.json` files.
- **D-09:** `createInitialData()` includes `otherCommodities: { updatedAt: ..., items: [] }`. `settings` does **not** gain `commodityPrices` (dropped).
- **D-10:** `parseAppDataFromImport` and the danger-zone reset path stay aligned with `DataSchema` — validated on import, cleared on reset.

### Phase 12 surface area

- **D-12:** **Required in Phase 12:**
  - `OtherCommodityItem` discriminated union schema in `src/types/data.ts`
  - `ensureOtherCommodities` migration helper in `AppDataContext`
  - `sumCommoditiesInr` helper (partial-total logic per D-06)
  - `CategoryTotals.otherCommodities` + `DASHBOARD_CATEGORY_ORDER` update
  - Snapshot / `excludedNames` / `noHoldingsYet` parity (informational flag, not blocking)
  - `parseAppDataFromImport` / `createInitialData` / reset alignment
  - `priceApi.ts` silver fetch + `useLivePrices()` `silverUsdPerOz` wiring
  - Minimal `DashboardPage.tsx` changes for `otherCommodities` row display and silver-unavailable flag (no CRUD UI)
  - **Defer to Phase 13:** Settings forms for silver grams / manual items, full commodity section pages, nav labels, Dashboard row polish.

### Claude's Discretion

- Exact Zod shape for the discriminated union (`z.discriminatedUnion('type', [...])` vs manual `z.union`).
- Exact metals API endpoint — pick the most reliable free tier available at implementation time.
- Wording of silver-unavailable informational message on Dashboard.
- Whether to add a minimal dev-only Settings field for silver price override (useful for offline testing without a live API).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap

- `.planning/REQUIREMENTS.md` — COM-01, COM-02, COM-05; Future: live spot feeds (now partially in scope for silver)
- `.planning/ROADMAP.md` — v1.4 Phase 12 row

### Product constraints

- `CLAUDE.md` — never store computed totals in `data.json`, `roundCurrency`, schema version 1, price caching rules, `useLivePrices()` contract

### Code hooks (integration points)

- `src/types/data.ts` — `DataSchema`, `GoldSchema`, `SettingsSchema`, `BaseItemSchema` — add `OtherCommodityItem` discriminated union here
- `src/context/AppDataContext.tsx` — `parseAppDataFromImport`, `createInitialData`, migration helpers — add `ensureOtherCommodities`
- `src/lib/priceApi.ts` — all price fetch logic; add silver fetch here (TTL ~1h)
- `src/lib/dashboardCalcs.ts` — `calcCategoryTotals`, `sumForNetWorth`, `DASHBOARD_CATEGORY_ORDER` — add `sumCommoditiesInr`, extend `CategoryTotals`
- `src/pages/DashboardPage.tsx` — `canRecordSnapshot`, `excludedNames`, `noHoldingsYet` — add Commodities row + silver-unavailable flag

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`sumGoldInr`** — exact pattern for nullable category when prices missing; mirror for silver portion of `sumCommoditiesInr`.
- **`sumBankSavingsInr`** — partial-total pattern (AED skipped, not null-out) — the model for commodities with mixed item types.
- **`BaseItemSchema`** — extend for both discriminated union branches.
- **`parseAppDataFromImport` / `ensureNetWorthHistory`** — exact template for `ensureOtherCommodities`.
- **`priceApi.ts` + `useLivePrices()`** — existing cache/TTL infrastructure; add silver alongside BTC/forex.

### Established patterns

- **Optional Settings keys** — `goldPrices.optional()` pattern; `otherCommodities` on assets is required (ensured by migration), but `commodityPrices` on settings is NOT added.
- **Migration helpers** — pure JSON transforms before `safeParse`; `version: 1` unchanged.
- **Price caching** — `priceApi.ts` handles TTL; pages consume `useLivePrices()` only.
- **`SettingsSchema` has `.passthrough()`** — future settings keys flow through without schema churn.

### Integration points

- `calcCategoryTotals` → `sumForNetWorth` → Dashboard snapshot `totalInr` must include `otherCommodities`.
- `useLivePrices()` returns `{ btcUsd, usdInr, aedInr }` today; extend with `silverUsdPerOz`.

</code_context>

<specifics>
## Specific Ideas

- **Silver** is the primary v1.4 "standard" commodity — physical, weighed in grams, live spot price (USD/oz → INR/gram via USD/INR).
- **Freeform items** (oil, copper, art, etc.) use `label + valueInr` — no unit tracking, no API. Covers the "oil worth ₹10L" use case exactly.
- Extending to platinum or other precious metals later: add `kind` enum value + metals API request for that symbol — no schema migration needed beyond the enum.
- 1 troy oz = 31.1035 g (hardcoded constant in `priceApi.ts` or `financials.ts`).

</specifics>

<deferred>
## Deferred Ideas

- **Platinum and other precious metals** — extend `kind` enum + API call when needed (post-v1.4).
- **Price fetch for base metals / energy** (crude oil, copper, nickel) — MCX/broker APIs; no clean free tier in v1.4. These are served by the freeform `manual` type.
- **Stale-price indicator** — show "silver price last updated X minutes ago"; separate UX milestone.
- **Manual silver price override** — allow user to enter a fallback price if API is down; post-v1.4 unless needed for offline dev testing (Claude's discretion).
- **Agricultural commodities** (soybeans, chana, cotton) — freeform manual covers them in v1.4.

</deferred>

---

*Phase: 12-commodities-data-net-worth*  
*Context gathered: 2026-04-28 · Revised: 2026-04-30*
