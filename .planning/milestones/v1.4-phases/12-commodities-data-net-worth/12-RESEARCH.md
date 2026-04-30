# Phase 12: Commodities — Data & Net Worth — Research

**Researched:** 2026-04-30
**Domain:** TypeScript schema (Zod 4), live price fetch, dashboard calculations, data migration
**Confidence:** HIGH — all integration files read directly from codebase, all APIs live-tested

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `assets.gold` and `settings.goldPrices` untouched. Gold is NOT folded into `otherCommodities`.
- **D-02:** Add sibling `assets.otherCommodities: { updatedAt: ISO datetime, items: OtherCommodityItem[] }`.
- **D-03:** `OtherCommodityItem` is a Zod discriminated union on `type`:
  - `type: 'standard'` extends `BaseItemSchema` with `kind: z.literal('silver')` and `grams: z.number().nonnegative()`
  - `type: 'manual'` extends `BaseItemSchema` with `label: z.string().min(1)` and `valueInr: z.number().nonnegative()`
- **D-04 (dropped):** `settings.commodityPrices` is NOT added. Standard items use live fetch; manual items store `valueInr` directly.
- **D-05:** `DASHBOARD_CATEGORY_ORDER` gains `'otherCommodities'` immediately after `'gold'`.
- **D-06:** `CategoryTotals` gains `otherCommodities: number | null`. Partial-total rule: manual items always sum; silver items skip (not null-out) when `silverInrPerGram` unavailable.
- **D-07:** Dashboard row label: `"Commodities"`.
- **D-08:** Stay on `version: 1`. Add `ensureOtherCommodities` pre-parse helper that injects `{ updatedAt: nowIso(), items: [] }` when the key is absent.
- **D-09:** `createInitialData()` includes `otherCommodities: { updatedAt: ..., items: [] }`. Settings does NOT gain `commodityPrices`.
- **D-10:** `parseAppDataFromImport` and reset path stay aligned with `DataSchema`.
- **D-11 (revised):** Silver live price IS in scope for Phase 12. Add `silverUsdPerOz: number | null` to `LivePricesContextValue`. Fetch via free metals API. Cache TTL ~1 hour (same bucket as forex). Route through `priceApi.ts`.
- **D-12:** Phase 12 surface area — schema, migration, `sumCommoditiesInr`, `CategoryTotals` + order, snapshot parity, import/init/reset alignment, `priceApi.ts` + `useLivePrices()` silver wiring, minimal Dashboard row.

### Claude's Discretion

- Exact metals API endpoint — pick most reliable free tier (research result: `https://api.gold-api.com/price/XAG` — no API key, no rate limit, CORS enabled).
- Wording of silver-unavailable informational message on Dashboard.
- Whether to add a dev-only Settings override for silver price (defer unless needed — context says post-v1.4).

### Deferred Ideas (OUT OF SCOPE)

- Platinum and other precious metals (post-v1.4)
- Price fetch for base metals / energy — freeform manual covers them
- Stale-price indicator
- Manual silver price override (post-v1.4 unless offline dev need arises)
- Agricultural commodities — freeform manual covers them
- COM-03, COM-04, COM-06 — Phase 13

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COM-01 | Persisted model supports ≥1 commodity type beyond gold (silver) with user holdings + pricing, backward-compatible migration | D-02/D-03 schema; D-08 `ensureOtherCommodities` migration; live fetch for standard items |
| COM-02 | Net worth and "Record snapshot" aggregate all commodity holdings; missing-price behavior matches existing null/incomplete patterns | D-06 `sumCommoditiesInr` partial-total; D-05/D-07 Dashboard row; snapshot parity per D-12 |
| COM-05 | JSON export/import, `createInitialData`, full data reset aligned with Zod `DataSchema` | D-09 `createInitialData`; D-10 `parseAppDataFromImport`; D-08 migration helper |

</phase_requirements>

---

## Summary

Phase 12 is a **pure data + calculation + price-wiring** phase with no new CRUD UI. All work happens in five files: `src/types/data.ts`, `src/context/AppDataContext.tsx`, `src/lib/priceApi.ts`, `src/context/LivePricesContext.tsx`, and `src/lib/dashboardCalcs.ts` — plus minimal display wiring in `src/pages/DashboardPage.tsx`.

The codebase has tight, well-established patterns: every new capability has a direct analogue in existing code. The `ensureOtherCommodities` migration helper mirrors `ensureNetWorthHistory` exactly. The `sumCommoditiesInr` function is a hybrid of `sumGoldInr` (nullable when price unavailable) and `sumBankSavingsInr` (partial-total with AED accounts skipped, not zeroed). The silver price fetch in `priceApi.ts` mirrors `fetchForex` with a different URL and simpler response shape. `LivePricesContext.tsx` gains a third fetch channel alongside BTC and forex.

The free `api.gold-api.com/price/XAG` endpoint was live-tested on 2026-04-30 — it returns `{ price: number, currency: "USD", symbol: "XAG", updatedAt: string }` with no API key, no registration, and no rate limit. The `price` field is USD per troy ounce. Silver price in INR/gram is derived as `(silverUsdPerOz / 31.1035) × usdInr`.

**Primary recommendation:** Work in file order — schema → migration → price fetch → calc → dashboard. Each step depends on the previous and can be verified in isolation.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Persisted commodity schema | `src/types/data.ts` | — | Single source of truth for Zod + TypeScript types |
| Load-time migration | `src/context/AppDataContext.tsx` | — | Pre-parse JSON transform before `DataSchema.safeParse` |
| Silver spot price fetch | `src/lib/priceApi.ts` | — | CLAUDE.md: all market fetch through `priceApi.ts` |
| Live price state + TTL cache | `src/context/LivePricesContext.tsx` | — | Hook that pages consume; no ad-hoc fetch in pages |
| Net worth calculation | `src/lib/dashboardCalcs.ts` | — | `calcCategoryTotals` → `sumForNetWorth` pipeline |
| Dashboard Commodities row | `src/pages/DashboardPage.tsx` | — | Minimal: extend `ROW_LABEL`, `NAV_KEY`, `noHoldingsYet`, exclusion note |
| `createInitialData` / import / reset | `src/context/AppDataContext.tsx` | — | Already handles all three paths |

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | 4.3.6 [VERIFIED: package.json] | Schema declaration + type inference | Project's existing validation layer |
| React 18.3.x | 18.3.x [VERIFIED: CLAUDE.md] | Component model | Project stack |
| TypeScript | — | Type safety | Project stack |

### External API (no installation needed — HTTP fetch)

| Endpoint | Auth | TTL | Unit |
|----------|------|-----|------|
| `https://api.gold-api.com/price/XAG` | None [VERIFIED: live curl test] | Use FOREX_TTL_MS (~1h) | USD per troy oz |

**No new npm packages are required for Phase 12.**

---

## Architecture Patterns

### System Architecture Diagram

```
User browser tab load / visibility / 60s interval
         │
         ▼
  LivePricesContext.tsx
  ├── runBtcFetch()      ──► priceApi.fetchBtcUsd()   ──► CoinGecko     TTL: 5 min
  ├── runForexFetch()    ──► priceApi.fetchForex()     ──► open.er-api   TTL: 1 hr
  └── runSilverFetch()   ──► priceApi.fetchSilverUsdPerOz() ──► gold-api.com TTL: 1 hr
         │
         │  silverUsdPerOz (number | null)
         ▼
  dashboardCalcs.calcCategoryTotals(data, { btcUsd, usdInr, aedInr, silverUsdPerOz })
         │
         ├── sumGoldInr(data)                        → number | null
         ├── sumCommoditiesInr(data, silverInrPerGram) → number | null
         │     ├── manual items: always add item.valueInr
         │     └── standard items: add grams × silverInrPerGram (skip if null)
         ├── sumBitcoinInr(data, live)               → number | null
         └── ... existing categories
         │
         ▼
  sumForNetWorth(totals)  ──►  DashboardPage grandTotal
         │
         ▼
  canRecordSnapshot, excludedNames, snapshot button
```

### Recommended Project Structure (no change)

```
src/
├── types/data.ts              # ADD: OtherCommodityItemSchema, OtherCommoditiesSchema, exports
├── context/
│   ├── AppDataContext.tsx     # ADD: ensureOtherCommodities, extend createInitialData
│   └── LivePricesContext.tsx  # ADD: silverUsdPerOz state + runSilverFetch channel
├── lib/
│   ├── priceApi.ts            # ADD: SILVER_TTL_MS const, fetchSilverUsdPerOz()
│   ├── dashboardCalcs.ts      # ADD: sumCommoditiesInr, extend CategoryTotals + ORDER
│   └── financials.ts          # ADD: TROY_OZ_TO_GRAMS = 31.1035 constant (or inline)
└── pages/DashboardPage.tsx    # ADD: 'otherCommodities' to ROW_LABEL, NAV_KEY,
                               #      noHoldingsYet check, silver-unavailable flag
```

---

## Pattern 1: Zod 4 Discriminated Union for OtherCommodityItem

**What:** Two-branch discriminated union keyed on `type` field. Both branches extend `BaseItemSchema`. Zod 4.3.6 supports `z.discriminatedUnion` with identical syntax to Zod 3.

**When to use:** When a single array can hold structurally different items that share base fields, and TypeScript must be able to narrow the type from the `type` field.

**Verified:** Live-tested with Zod 4.3.6 from project `node_modules`. [VERIFIED: bash test 2026-04-30]

```typescript
// src/types/data.ts — add after BaseItemSchema

const StandardCommodityItemSchema = BaseItemSchema.extend({
  type: z.literal('standard'),
  kind: z.literal('silver'),       // extend enum here for platinum etc.
  grams: z.number().nonnegative(),
})

const ManualCommodityItemSchema = BaseItemSchema.extend({
  type: z.literal('manual'),
  label: z.string().min(1),
  valueInr: z.number().nonnegative(),
})

export const OtherCommodityItemSchema = z.discriminatedUnion('type', [
  StandardCommodityItemSchema,
  ManualCommodityItemSchema,
])

const OtherCommoditiesSchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(OtherCommodityItemSchema),
})

// Export types (single source of truth)
export type OtherCommodityItem = z.infer<typeof OtherCommodityItemSchema>
export type StandardCommodityItem = z.infer<typeof StandardCommodityItemSchema>
export type ManualCommodityItem = z.infer<typeof ManualCommodityItemSchema>
```

**DataSchema change:**

```typescript
export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({
    gold: GoldSchema,
    otherCommodities: OtherCommoditiesSchema,   // ← ADD (after gold)
    mutualFunds: MutualFundsSchema,
    // ... rest unchanged
  }),
  netWorthHistory: z.array(NetWorthPointSchema),
})
```

---

## Pattern 2: ensureOtherCommodities Migration Helper

**What:** Pre-parse JSON transform. Mirrors `ensureNetWorthHistory` exactly — injects a default key when absent to make old `data.json` files (with no `otherCommodities` key) pass `DataSchema.safeParse`. Version stays at 1. [VERIFIED: codebase read]

```typescript
// src/context/AppDataContext.tsx — add alongside ensureNetWorthHistory

function ensureOtherCommodities(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  const assets = o.assets
  if (!assets || typeof assets !== 'object') return raw
  const a = assets as Record<string, unknown>
  if (!('otherCommodities' in a) || a.otherCommodities === undefined) {
    return {
      ...o,
      assets: {
        ...a,
        otherCommodities: { updatedAt: nowIso(), items: [] },
      },
    }
  }
  return raw
}
```

**Wire into `parseAppDataFromImport`:**

```typescript
export function parseAppDataFromImport(raw: unknown) {
  const migrated = migrateLegacyBankAccounts(raw)
  const withHistory = ensureNetWorthHistory(migrated)
  const withCommodities = ensureOtherCommodities(withHistory)   // ← ADD
  const result = DataSchema.safeParse(withCommodities)
  // ...
}
```

---

## Pattern 3: Silver Spot Price Fetch via gold-api.com

**What:** Free, no-auth REST endpoint that returns silver price in USD/troy oz. CORS-enabled. [VERIFIED: live curl test 2026-04-30 — returned `{"currency":"USD","price":73.887001,"symbol":"XAG",...}`]

**Response shape (verified):**
```json
{
  "currency": "USD",
  "currencySymbol": "$",
  "exchangeRate": 1.0,
  "name": "Silver",
  "price": 73.887001,
  "symbol": "XAG",
  "updatedAt": "2026-04-30T18:59:02Z",
  "updatedAtReadable": "a few seconds ago"
}
```

**`price` is USD per troy ounce.** 1 troy oz = 31.1035 grams.

```typescript
// src/lib/priceApi.ts — add alongside BTC_TTL_MS and FOREX_TTL_MS

const GOLD_API_SILVER_URL = 'https://api.gold-api.com/price/XAG'

/** Silver cache hint: same volatility bucket as forex (~1 hour). */
export const SILVER_TTL_MS = FOREX_TTL_MS  // 60 * 60 * 1000

export async function fetchSilverUsdPerOz(): Promise<number> {
  const res = await fetch(GOLD_API_SILVER_URL)
  if (!res.ok) {
    throw new Error(`gold-api.com silver failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  if (!json || typeof json !== 'object' || !('price' in json)) {
    throw new Error('silver price: unexpected response shape')
  }
  const price = (json as { price: unknown }).price
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error('silver price: non-positive or non-numeric value')
  }
  return price
}
```

**INR/gram derivation (in dashboardCalcs or passed as derived value):**

```typescript
// Compute at call site or in calcCategoryTotals — NOT stored anywhere
const TROY_OZ_TO_GRAMS = 31.1035

const silverInrPerGram =
  silverUsdPerOz != null && usdInr != null
    ? roundCurrency(silverUsdPerOz / TROY_OZ_TO_GRAMS * usdInr)
    : null
```

---

## Pattern 4: LivePricesContext Silver Channel

**What:** A third fetch channel alongside `runBtcFetch` and `runForexFetch`. Silver uses the forex TTL bucket (1 hour). Both the loading state and the error string follow the same existing pattern. [VERIFIED: codebase read]

**Additions to `LivePricesContextValue` type:**

```typescript
export type LivePricesContextValue = {
  // ...existing...
  silverUsdPerOz: number | null   // ← ADD
  silverLoading: boolean          // ← ADD
  silverError: string | null      // ← ADD
}
```

**`SessionRatePartial` does NOT gain `silverUsdPerOz`** — silver is API-only, no session override (deferred per context). This keeps the override surface minimal.

**`runSilverFetch` pattern:**

```typescript
// Mirrors runForexFetch: uses SILVER_TTL_MS, sets liveSilverRef, etc.
const runSilverFetch = useCallback(async (force: boolean) => {
  const now = Date.now()
  const hasLive = liveSilverRef.current != null
  const stale = force || now - lastSilverAt.current >= SILVER_TTL_MS || !hasLive
  if (!stale) return
  setSilverLoading(true)
  setSilverError(null)
  try {
    const v = await fetchSilverUsdPerOz()
    liveSilverRef.current = v
    setLiveSilver(v)
    lastSilverAt.current = Date.now()
  } catch (e) {
    setSilverError(e instanceof Error ? e.message : 'Silver price fetch failed')
  } finally {
    setSilverLoading(false)
  }
}, [])
```

Wire into `refetch`, `refetchStale`, and `useEffect` mount — same three places as BTC and forex.

---

## Pattern 5: sumCommoditiesInr — Partial-Total Calculation

**What:** Hybrid of `sumGoldInr` (null when required price missing) and `sumBankSavingsInr` (partial total — skip AED accounts, don't zero-out). Returns `0` when items is empty; returns partial sum (manual items only) when silver price is unavailable; returns null only if there are no manual items AND silver price is unavailable AND at least one silver item has grams > 0 (but see implementation note below). [VERIFIED: pattern analysis from codebase]

**Per D-06 decision:** The row is `null` only if the total is entirely indeterminate. In practice, the row is always a number (≥ 0): manual items always contribute; silver is skipped when `silverInrPerGram` is null.

```typescript
// src/lib/dashboardCalcs.ts

export function sumCommoditiesInr(
  data: AppData,
  silverInrPerGram: number | null
): number | null {
  const items = data.assets.otherCommodities.items
  if (items.length === 0) return 0

  let sum = 0
  let hasPricedItems = false

  for (const item of items) {
    if (item.type === 'manual') {
      sum = roundCurrency(sum + roundCurrency(item.valueInr))
      hasPricedItems = true
    } else if (item.type === 'standard') {
      // item.kind === 'silver' in v1.4
      if (silverInrPerGram != null && item.grams > 0) {
        sum = roundCurrency(sum + roundCurrency(item.grams * silverInrPerGram))
        hasPricedItems = true
      }
      // If silverInrPerGram is null: skip this item (not null-out the whole row)
    }
  }

  // Return null only if nothing was priceable at all AND items array was non-empty
  // (all items are standard with no silver price — no manual items)
  if (!hasPricedItems) return null
  return sum
}
```

**Wire into `calcCategoryTotals`:**

```typescript
export function calcCategoryTotals(
  data: AppData,
  live: {
    btcUsd: number | null
    usdInr: number | null
    aedInr: number | null
    silverUsdPerOz: number | null   // ← ADD
  }
): CategoryTotals {
  const silverInrPerGram =
    live.silverUsdPerOz != null && live.usdInr != null
      ? roundCurrency((live.silverUsdPerOz / TROY_OZ_TO_GRAMS) * live.usdInr)
      : null

  return {
    gold: sumGoldInr(data),
    otherCommodities: sumCommoditiesInr(data, silverInrPerGram),  // ← ADD
    mutualFunds: sumMutualFunds(data),
    // ... rest unchanged
  }
}
```

---

## Pattern 6: Dashboard Integration (Minimal — Phase 12 Only)

**What:** `DashboardPage.tsx` changes are intentionally minimal in Phase 12. Phase 13 adds full commodity section pages and navigation. [VERIFIED: codebase read]

**Changes required:**

1. **`ROW_LABEL`:** Add `otherCommodities: 'Commodities'`
2. **`NAV_KEY`:** Add `otherCommodities: 'settings'` (no dedicated page yet — navigate to settings as placeholder, or omit the nav target — Claude's discretion; Phase 13 adds the real page)
3. **`noHoldingsYet`:** Add check for `data.assets.otherCommodities.items.length === 0`
4. **`useLivePrices` destructure:** Add `silverUsdPerOz, silverLoading, silverError`
5. **`calcCategoryTotals` call:** Pass `silverUsdPerOz`
6. **Silver-unavailable informational flag:** Mirror the AED bank row note (`isCommoditiesRow && silverMissing && hasSilverItems`). Do NOT push `'Commodities'` into `excludedNames` — the row always shows a partial total (manual items + whatever silver is priceable).
7. **`showNetWorthSkeleton`:** Add `(hasSilverItems && silverLoading)` to the condition.

**Key constraint (from D-06):** Commodities row is NEVER null when there are manual items — so `excludedNames` should only include `'Commodities'` when `totals.otherCommodities === null` (all-silver items, no silver price). This matches the gold null pattern.

---

## Pattern 7: createInitialData and Reset Alignment

**What:** `createInitialData` and INITIAL_DATA already follow the pattern — add `otherCommodities` to `assets`. Reset path uses `createInitialData()` implicitly — no separate reset logic to change. [VERIFIED: codebase read]

```typescript
export function createInitialData(): AppData {
  const now = nowIso()
  return {
    version: 1,
    settings: { updatedAt: now },
    assets: {
      gold: { updatedAt: now, items: [] },
      otherCommodities: { updatedAt: now, items: [] },   // ← ADD
      mutualFunds: { updatedAt: now, platforms: [] },
      // ... rest unchanged
    },
    netWorthHistory: [],
  }
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Silver price conversion USD→INR/gram | Custom formula inline in components | `roundCurrency((silverUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr)` as constant pattern from `priceApi.ts` / `dashboardCalcs.ts` | Floating-point drift — must use `roundCurrency` per CLAUDE.md |
| Metals price API | New endpoint | `api.gold-api.com/price/XAG` — verified no-auth free | All alternative free tiers (metals.dev, metalpriceapi.com) require API key registration |
| Silver fetch caching | Ad-hoc in component | `LivePricesContext` TTL ref pattern | CLAUDE.md: no ad-hoc fetch in pages |
| Type narrowing on discriminated union items | `if (item.kind === 'silver')` | `if (item.type === 'standard')` (the discriminant) then `item.kind` | TypeScript narrows on `type` (the union key), not on `kind` |

---

## Common Pitfalls

### Pitfall 1: Forgetting to pipe `silverUsdPerOz` through `calcCategoryTotals` signature

**What goes wrong:** `calcCategoryTotals` currently takes `{ btcUsd, usdInr, aedInr }`. Adding `silverUsdPerOz` to `CategoryTotals` but not to the function signature causes a TypeScript error; adding it to the signature but not threading it from `DashboardPage.tsx` leaves silver always null.

**How to avoid:** Change signature → update `DashboardPage.tsx` call site → verify TypeScript compiles.

**Warning signs:** TypeScript error on `calcCategoryTotals` call in `DashboardPage.tsx`.

---

### Pitfall 2: `DASHBOARD_CATEGORY_ORDER` is `as const` — type extends automatically

**What goes wrong:** `DashboardCategoryKey` is derived as `(typeof DASHBOARD_CATEGORY_ORDER)[number]`. After adding `'otherCommodities'` to the array, the type expands automatically — but `ROW_LABEL: Record<DashboardCategoryKey, string>` will cause a TypeScript error until `otherCommodities` is added to `ROW_LABEL` and `NAV_KEY` too.

**How to avoid:** Update `DASHBOARD_CATEGORY_ORDER` → TypeScript will immediately flag missing entries in `ROW_LABEL` and `NAV_KEY`. Fix all three together.

**Warning signs:** TS error `Property 'otherCommodities' is missing in type...` on `ROW_LABEL`.

---

### Pitfall 3: `sumForNetWorth` iterates `DASHBOARD_CATEGORY_ORDER` — no change needed there

**What goes wrong:** Developer assumes `sumForNetWorth` needs direct modification.

**Why it's fine:** `sumForNetWorth` already iterates `DASHBOARD_CATEGORY_ORDER` and reads `totals[k]`, so adding `'otherCommodities'` to the order array + adding `otherCommodities` to `CategoryTotals` is sufficient. `sumForNetWorth` picks it up automatically. [VERIFIED: codebase read lines 116-124]

---

### Pitfall 4: `ensureOtherCommodities` must run BEFORE `DataSchema.safeParse`

**What goes wrong:** Adding the key after safeParse means old files silently fail validation (missing required key).

**How to avoid:** Chain `ensureOtherCommodities` in the same pipeline as `ensureNetWorthHistory` inside `parseAppDataFromImport`.

---

### Pitfall 5: Zod 4.x discriminated union — `BaseItemSchema.extend()` behavior

**What goes wrong:** Assuming Zod 4 broke the `.extend()` API — it did not. [VERIFIED: live test 2026-04-30] `z.discriminatedUnion('type', [S, M])` works identically to Zod 3 syntax.

**Note on Zod version:** The project has `zod@4.3.6` installed (not 3.x). The `z.discriminatedUnion` API and `.extend()` are fully compatible. The existing codebase already uses Zod 4 patterns (it uses `z.string().datetime()`, `z.literal()`, etc. — all verified in `data.ts`).

---

### Pitfall 6: `noHoldingsYet` gating on Dashboard

**What goes wrong:** Forgetting to add `otherCommodities` items check to `noHoldingsYet()` means the Dashboard shows "No holdings yet" even when a user has commodity items.

**How to avoid:** Add `data.assets.otherCommodities.items.length === 0` to the `&&` chain in `noHoldingsYet`. [VERIFIED: DashboardPage.tsx lines 57-68]

---

### Pitfall 7: Silver price API returns price per troy oz, not per gram

**What goes wrong:** Treating `price: 73.887001` from gold-api.com as INR/gram or USD/gram.

**Why it matters:** 1 troy oz ≠ 1 gram (= 31.1035 g). Using the raw value as per-gram would overstate silver value ~31x.

**How to avoid:** Always divide by `TROY_OZ_TO_GRAMS = 31.1035` before multiplying by grams. Define as a named constant in `priceApi.ts` or a shared constants file.

---

## Code Examples

### Complete `fetchSilverUsdPerOz` (verified response shape)

```typescript
// src/lib/priceApi.ts — Source: live curl test 2026-04-30
// Response: {"currency":"USD","currencySymbol":"$","exchangeRate":1.0,"name":"Silver",
//            "price":73.887001,"symbol":"XAG","updatedAt":"2026-04-30T18:59:02Z",...}

const GOLD_API_SILVER_URL = 'https://api.gold-api.com/price/XAG'
export const SILVER_TTL_MS = FOREX_TTL_MS  // reuse 1-hour bucket

export async function fetchSilverUsdPerOz(): Promise<number> {
  const res = await fetch(GOLD_API_SILVER_URL)
  if (!res.ok) {
    throw new Error(`gold-api.com silver failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  if (!json || typeof json !== 'object' || !('price' in json)) {
    throw new Error('silver price: unexpected response shape')
  }
  const price = (json as { price: unknown }).price
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error('silver price: non-positive or non-numeric value')
  }
  return price
}
```

### Discriminated union parse (verified with Zod 4.3.6)

```typescript
// Source: verified live in project node_modules/zod@4.3.6, 2026-04-30
const r = OtherCommodityItemSchema.safeParse({
  type: 'standard', kind: 'silver', grams: 100,
  id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
})
// r.success === true, r.data.type === 'standard', r.data.grams === 100
```

---

## Runtime State Inventory

Phase 12 is schema extension + new fetch channel, not a rename/refactor. No runtime state migration.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | `data.json` — no `otherCommodities` key in existing files | `ensureOtherCommodities` injects default before parse — no data migration |
| Live service config | None | None |
| OS-registered state | None | None |
| Secrets/env vars | No API key needed for gold-api.com | None |
| Build artifacts | None | None |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | dev server | ✓ [VERIFIED] | v20.19.5 | — |
| `api.gold-api.com/price/XAG` | Silver price fetch | ✓ [VERIFIED: live curl] | — | `silverUsdPerOz = null` (silently skip silver in partial total) |
| Zod `z.discriminatedUnion` | Schema | ✓ [VERIFIED: Zod 4.3.6] | 4.3.6 | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- `api.gold-api.com` network unavailable: fetch throws → `silverError` set, `silverUsdPerOz = null` → silver items excluded from partial total. Manual items still sum. Dashboard shows "Silver price unavailable" note. Snapshot not blocked if manual items exist.

---

## Validation Architecture

`nyquist_validation` is enabled (`config.json` → `workflow.nyquist_validation: true`).

### Test Framework

No test framework is installed. [VERIFIED: `package.json` has no test script, no vitest/jest devDependencies, no test files in `src/`]

| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | N/A — Wave 0 must install Vitest |
| Full suite command | N/A — Wave 0 must install Vitest |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COM-01 | `DataSchema.safeParse` accepts old data.json (no `otherCommodities` key) after migration | unit | `npx vitest run src/lib/__tests__/migration.test.ts` | ❌ Wave 0 |
| COM-01 | `DataSchema.safeParse` accepts standard + manual items | unit | `npx vitest run src/lib/__tests__/schema.test.ts` | ❌ Wave 0 |
| COM-02 | `sumCommoditiesInr` returns 0 when items empty | unit | `npx vitest run src/lib/__tests__/dashboardCalcs.test.ts` | ❌ Wave 0 |
| COM-02 | `sumCommoditiesInr` sums manual items when silver price null | unit | same | ❌ Wave 0 |
| COM-02 | `sumCommoditiesInr` returns null when only silver items and price null | unit | same | ❌ Wave 0 |
| COM-02 | `sumCommoditiesInr` adds silver grams × INR/gram when price available | unit | same | ❌ Wave 0 |
| COM-02 | `sumForNetWorth` includes `otherCommodities` when non-null | unit | same | ❌ Wave 0 |
| COM-05 | `createInitialData()` has `assets.otherCommodities` with empty items | unit | `npx vitest run src/context/__tests__/AppDataContext.test.ts` | ❌ Wave 0 |
| COM-05 | `parseAppDataFromImport` validates standard + manual items correctly | unit | same | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run` (once Vitest is installed in Wave 0)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** All tests green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Install Vitest: `npm install --save-dev vitest`
- [ ] `src/lib/__tests__/dashboardCalcs.test.ts` — covers COM-02 sumCommoditiesInr cases
- [ ] `src/lib/__tests__/schema.test.ts` — covers COM-01 DataSchema with discriminated union
- [ ] `src/lib/__tests__/migration.test.ts` — covers COM-01 ensureOtherCommodities
- [ ] `src/context/__tests__/AppDataContext.test.ts` — covers COM-05 createInitialData + parseAppDataFromImport

---

## Security Domain

This phase is a local-only app with no auth, no backend routes, and no user input reaching the API layer. The only external call is a read-only public API.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A — local-only, no auth |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | Yes | Zod `DataSchema.safeParse` — all imported data validated; `grams` and `valueInr` are `z.number().nonnegative()` |
| V6 Cryptography | No | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed import JSON with invalid `type` field | Tampering | `z.discriminatedUnion` rejects unknown `type` values at parse time — Zod safeParse returns error |
| Negative `grams` or `valueInr` in import | Tampering | `z.number().nonnegative()` in schema |
| API response with non-numeric `price` field | Tampering | Explicit `typeof price !== 'number'` guard in `fetchSilverUsdPerOz` |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `api.gold-api.com/price/XAG` will remain free and no-auth in production | Silver API | Would need to swap to another endpoint (metals.dev or metalpriceapi.com require API key registration) |
| A2 | Zod 4.3.6 `.extend()` and `z.discriminatedUnion` are API-stable | Schema | Low risk — verified live in project node_modules |

**Most claims in this research are VERIFIED or CITED from codebase reads and live API tests.**

---

## Open Questions

1. **NAV_KEY for `otherCommodities` row on Dashboard**
   - What we know: Phase 13 adds the commodity section page. Phase 12 must define `NAV_KEY['otherCommodities']`.
   - What's unclear: Should clicking the row navigate to `'settings'` (nearest useful page) or be a no-op?
   - Recommendation: Use `'settings'` as placeholder in Phase 12 (same pattern Phase 13 can fix). Or make the button non-navigable by omitting NAV_KEY for this key until Phase 13. Claude's discretion.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod 3.x `z.discriminatedUnion` | Zod 4.x `z.discriminatedUnion` (same API, new internals) | Project upgraded to Zod 4 before Phase 12 | API is identical — no code change needed |

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED: codebase read] `src/types/data.ts` — BaseItemSchema, GoldSchema, SettingsSchema, DataSchema — read 2026-04-30
- [VERIFIED: codebase read] `src/context/AppDataContext.tsx` — parseAppDataFromImport, createInitialData, ensureNetWorthHistory, migrateLegacyBankAccounts — read 2026-04-30
- [VERIFIED: codebase read] `src/lib/priceApi.ts` — fetchBtcUsd, fetchForex, BTC_TTL_MS, FOREX_TTL_MS — read 2026-04-30
- [VERIFIED: codebase read] `src/context/LivePricesContext.tsx` — LivePricesContextValue, runBtcFetch pattern, refetch/refetchStale, session overrides — read 2026-04-30
- [VERIFIED: codebase read] `src/lib/dashboardCalcs.ts` — DASHBOARD_CATEGORY_ORDER, CategoryTotals, calcCategoryTotals, sumForNetWorth, sumGoldInr, sumBankSavingsInr — read 2026-04-30
- [VERIFIED: codebase read] `src/pages/DashboardPage.tsx` — ROW_LABEL, NAV_KEY, noHoldingsYet, canRecordSnapshot, excludedNames, snapshot logic — read 2026-04-30
- [VERIFIED: live curl test] `https://api.gold-api.com/price/XAG` — returns `{"price":73.887001,"currency":"USD","symbol":"XAG",...}` with no API key — tested 2026-04-30
- [VERIFIED: bash test] Zod 4.3.6 `z.discriminatedUnion('type', [...])` — standard and manual branches both parse correctly — tested 2026-04-30 with project node_modules

### Secondary (MEDIUM confidence)

- [CITED: metals.dev/pricing] metals.dev free tier: 100 req/month, API key required — not suitable for this project
- [CITED: WebSearch] metalpriceapi.com free tier requires API key registration

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, no new packages needed
- Architecture: HIGH — all integration files read directly, patterns verified
- Silver price API: HIGH — live-tested with no-auth curl
- Pitfalls: HIGH — derived from direct codebase analysis
- Test framework: HIGH — verified absent; Wave 0 gap documented

**Research date:** 2026-04-30
**Valid until:** 2026-05-30 (gold-api.com free tier terms may change; re-verify if >30 days)
