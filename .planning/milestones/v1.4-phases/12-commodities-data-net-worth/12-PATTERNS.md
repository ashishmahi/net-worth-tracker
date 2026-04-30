# Phase 12: Commodities Data & Net Worth — Pattern Map

**Mapped:** 2026-04-30
**Files analyzed:** 7 new/modified files + 4 new test files
**Analogs found:** 10 / 11 (1 test file: no existing analog — Wave 0 gap)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/types/data.ts` | model/schema | CRUD | `src/types/data.ts` (GoldItemSchema, BankAccountSchema) | exact — extend same file |
| `src/context/AppDataContext.tsx` | provider/migration | CRUD | `src/context/AppDataContext.tsx` (ensureNetWorthHistory) | exact — extend same file |
| `src/lib/priceApi.ts` | service | request-response | `src/lib/priceApi.ts` (fetchForex) | exact — extend same file |
| `src/context/LivePricesContext.tsx` | provider | event-driven | `src/context/LivePricesContext.tsx` (runForexFetch) | exact — extend same file |
| `src/lib/dashboardCalcs.ts` | utility | transform | `src/lib/dashboardCalcs.ts` (sumGoldInr, sumBankSavingsInr) | exact — extend same file |
| `src/pages/DashboardPage.tsx` | component | request-response | `src/pages/DashboardPage.tsx` (AED bank row pattern) | exact — extend same file |
| `src/lib/__tests__/schema.test.ts` | test | CRUD | none | no analog — Wave 0 gap |
| `src/lib/__tests__/migration.test.ts` | test | CRUD | none | no analog — Wave 0 gap |
| `src/lib/__tests__/dashboardCalcs.test.ts` | test | transform | none | no analog — Wave 0 gap |
| `src/context/__tests__/AppDataContext.test.ts` | test | CRUD | none | no analog — Wave 0 gap |

---

## Pattern Assignments

### `src/types/data.ts` — Add OtherCommodityItem discriminated union

**Analog:** `src/types/data.ts` — GoldItemSchema (weight-based item extending BaseItemSchema) and BankAccountSchema (enum discriminant field)

**Imports pattern** (lines 1-1):
```typescript
import { z } from 'zod'
```

**BaseItemSchema** (lines 5-9) — both union branches extend this:
```typescript
export const BaseItemSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
```

**Gold analog: weight-based item extending BaseItemSchema** (lines 14-17):
```typescript
const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
})
```

**Bank analog: enum-discriminant item extending BaseItemSchema** (lines 73-77):
```typescript
const BankAccountSchema = BaseItemSchema.extend({
  label: z.string(),
  currency: z.enum(['INR', 'AED']),
  balance: z.number().nonnegative(),
})
```

**Section container analog** (lines 19-22 for GoldSchema):
```typescript
const GoldSchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(GoldItemSchema),
})
```

**DataSchema assets object** (lines 122-135) — insert `otherCommodities` after `gold`:
```typescript
export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({
    gold: GoldSchema,
    // ← INSERT: otherCommodities: OtherCommoditiesSchema,
    mutualFunds: MutualFundsSchema,
    stocks: StocksSchema,
    bitcoin: BitcoinSchema,
    property: PropertySchema,
    bankSavings: BankSavingsSchema,
    retirement: RetirementSchema,
  }),
  netWorthHistory: z.array(NetWorthPointSchema),
})
```

**Type export pattern** (lines 138-148) — copy style for new types:
```typescript
export type AppData = z.infer<typeof DataSchema>
export type BaseItem = z.infer<typeof BaseItemSchema>
export type GoldItem = z.infer<typeof GoldItemSchema>
// ← ADD: export type OtherCommodityItem = z.infer<typeof OtherCommodityItemSchema>
// ← ADD: export type StandardCommodityItem = z.infer<typeof StandardCommodityItemSchema>
// ← ADD: export type ManualCommodityItem = z.infer<typeof ManualCommodityItemSchema>
```

**What to add — complete new block** (insert after GoldSchema block, before MutualFundsSchema):
```typescript
const StandardCommodityItemSchema = BaseItemSchema.extend({
  type: z.literal('standard'),
  kind: z.literal('silver'),       // extend enum later for platinum etc.
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

export type OtherCommodityItem = z.infer<typeof OtherCommodityItemSchema>
export type StandardCommodityItem = z.infer<typeof StandardCommodityItemSchema>
export type ManualCommodityItem = z.infer<typeof ManualCommodityItemSchema>
```

**Key constraint:** TypeScript narrows on `type` (the union discriminant), not on `kind`. Always check `item.type === 'standard'` first, then `item.kind`.

---

### `src/context/AppDataContext.tsx` — Add ensureOtherCommodities + extend createInitialData

**Analog:** `src/context/AppDataContext.tsx` — `ensureNetWorthHistory` (lines 42-49) and `migrateLegacyBankAccounts` (lines 7-39)

**ensureNetWorthHistory — exact pattern to mirror** (lines 42-49):
```typescript
function ensureNetWorthHistory(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  if (!('netWorthHistory' in o) || o.netWorthHistory === undefined) {
    return { ...o, netWorthHistory: [] }
  }
  return raw
}
```

**migrateLegacyBankAccounts — nested assets spread pattern** (lines 7-39):
```typescript
function migrateLegacyBankAccounts(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const root = raw as Record<string, unknown>
  const assets = root.assets
  if (!assets || typeof assets !== 'object') return raw
  const a = assets as Record<string, unknown>
  // ... transform ...
  return {
    ...root,
    assets: {
      ...a,
      bankSavings: { ...bs, accounts: nextAccounts },
    },
  }
}
```

**parseAppDataFromImport — migration pipeline** (lines 52-62):
```typescript
export function parseAppDataFromImport(
  raw: unknown,
): { success: true; data: AppData } | { success: false; zodError: ZodError } {
  const migrated = migrateLegacyBankAccounts(raw)
  const withHistory = ensureNetWorthHistory(migrated)
  // ← ADD: const withCommodities = ensureOtherCommodities(withHistory)
  const result = DataSchema.safeParse(withHistory /* → withCommodities */)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, zodError: result.error }
}
```

**createInitialData — add otherCommodities to assets** (lines 67-83):
```typescript
export function createInitialData(): AppData {
  const now = nowIso()
  return {
    version: 1,
    settings: { updatedAt: now },
    assets: {
      gold: { updatedAt: now, items: [] },
      // ← ADD: otherCommodities: { updatedAt: now, items: [] },
      mutualFunds: { updatedAt: now, platforms: [] },
      stocks: { updatedAt: now, platforms: [] },
      bitcoin: { updatedAt: now, quantity: 0 },
      property: { updatedAt: now, items: [] },
      bankSavings: { updatedAt: now, accounts: [] },
      retirement: { updatedAt: now, nps: 0, epf: 0 },
    },
    netWorthHistory: [],
  }
}
```

**What to add — ensureOtherCommodities** (mirror ensureNetWorthHistory but nested inside assets):
```typescript
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

**Import needed:** `nowIso` is already imported (line 3): `import { nowIso } from '@/lib/financials'`

---

### `src/lib/priceApi.ts` — Add fetchSilverUsdPerOz

**Analog:** `src/lib/priceApi.ts` — `fetchForex` (lines 57-79) for HTTP+validation pattern; `BTC_TTL_MS`/`FOREX_TTL_MS` constants (lines 25-28) for TTL export pattern

**Existing TTL constants pattern** (lines 25-28):
```typescript
/** Client-side cache hint: BTC quotes refresh often (D-02). */
export const BTC_TTL_MS = 5 * 60 * 1000

/** Client-side cache hint: forex less volatile — ~1 hour (D-02). */
export const FOREX_TTL_MS = 60 * 60 * 1000
```

**fetchForex — HTTP + shape guard + positive check pattern** (lines 57-79):
```typescript
export async function fetchForex(): Promise<ForexRates> {
  const res = await fetch(OPEN_ER_USD_LATEST)
  if (!res.ok) {
    throw new Error(`open.er-api.com forex failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  if (!json || typeof json !== 'object' || !('rates' in json)) {
    throw new Error('Forex: unexpected response shape')
  }
  const rates = (json as { rates?: Record<string, number> }).rates
  if (!rates || typeof rates.INR !== 'number' || typeof rates.AED !== 'number') {
    throw new Error('Forex: missing INR or AED rates')
  }
  const { INR, AED } = rates
  if (INR <= 0 || AED <= 0) {
    throw new Error('Forex: non-positive rate')
  }
  // ... derive and return
}
```

**fetchBtcUsd — simpler single-field extraction** (lines 30-50):
```typescript
export async function fetchBtcUsd(): Promise<number> {
  const res = await fetch(COINGECKO_BTC_URL)
  if (!res.ok) {
    throw new Error(`CoinGecko BTC/USD failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  // ... extract and validate single numeric field
  if (!Number.isFinite(usd) || usd <= 0) {
    throw new Error('CoinGecko BTC/USD: unexpected response shape')
  }
  return usd
}
```

**What to add — constants and function**:
```typescript
const GOLD_API_SILVER_URL = 'https://api.gold-api.com/price/XAG'

/** Silver cache hint: same volatility bucket as forex (~1 hour). */
export const SILVER_TTL_MS = FOREX_TTL_MS

/** Troy ounce to grams conversion constant (1 troy oz = 31.1035 g). */
export const TROY_OZ_TO_GRAMS = 31.1035

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

**Verified API response shape** (from live curl 2026-04-30):
```json
{ "currency": "USD", "price": 73.887001, "symbol": "XAG", "updatedAt": "2026-04-30T18:59:02Z" }
```
The `price` field is USD per troy ounce.

---

### `src/context/LivePricesContext.tsx` — Add silver fetch channel

**Analog:** `src/context/LivePricesContext.tsx` — `runForexFetch` (lines 94-119) for TTL-gated fetch pattern; `LivePricesContextValue` type (lines 32-46) for context value shape

**LivePricesContextValue — type to extend** (lines 32-46):
```typescript
export type LivePricesContextValue = {
  btcUsd: number | null
  usdInr: number | null
  aedInr: number | null
  btcLoading: boolean
  forexLoading: boolean
  btcError: string | null
  forexError: string | null
  refetch: () => void
  setSessionRates: (partial: SessionRatePartial) => void
  clearSessionRates: () => void
  // ← ADD: silverUsdPerOz: number | null
  // ← ADD: silverLoading: boolean
  // ← ADD: silverError: string | null
}
```

**State declarations to mirror** (lines 53-68):
```typescript
const [liveBtc, setLiveBtc] = useState<number | null>(null)
const lastBtcAt = useRef<number>(0)
const liveBtcRef = useRef<number | null>(null)
const [btcLoading, setBtcLoading] = useState(false)
const [btcError, setBtcError] = useState<string | null>(null)
// Pattern: three state vars + one timestamp ref + one value ref per fetch channel
```

**runForexFetch — TTL-gated fetch with loading/error state** (lines 94-119):
```typescript
const runForexFetch = useCallback(async (force: boolean) => {
  const now = Date.now()
  const hasLive = liveUsdInrRef.current != null && liveAedInrRef.current != null
  const stale = force || now - lastForexAt.current >= FOREX_TTL_MS || !hasLive
  if (!stale) return
  setForexLoading(true)
  setForexError(null)
  try {
    const { usdInr, aedInr } = await fetchForex()
    liveUsdInrRef.current = usdInr
    liveAedInrRef.current = aedInr
    setLiveUsdInr(usdInr)
    setLiveAedInr(aedInr)
    lastForexAt.current = Date.now()
    setSession(s => {
      const next = { ...s }
      delete next.usdInr
      delete next.aedInr
      return next
    })
  } catch (e) {
    setForexError(e instanceof Error ? e.message : 'Forex fetch failed')
  } finally {
    setForexLoading(false)
  }
}, [])
```

**refetch and refetchStale — wire silver into both** (lines 121-129):
```typescript
const refetch = useCallback(() => {
  void runBtcFetch(true)
  void runForexFetch(true)
  // ← ADD: void runSilverFetch(true)
}, [runBtcFetch, runForexFetch /*, runSilverFetch */])

const refetchStale = useCallback(() => {
  void runBtcFetch(false)
  void runForexFetch(false)
  // ← ADD: void runSilverFetch(false)
}, [runBtcFetch, runForexFetch /*, runSilverFetch */])
```

**useEffect mount fetch — wire silver** (lines 131-134):
```typescript
useEffect(() => {
  void runBtcFetch(true)
  void runForexFetch(true)
  // ← ADD: void runSilverFetch(true)
}, [runBtcFetch, runForexFetch /*, runSilverFetch */])
```

**useMemo value object — add silver fields** (lines 161-187):
```typescript
const value = useMemo<LivePricesContextValue>(
  () => ({
    btcUsd: session.btcUsd ?? liveBtc,
    usdInr: session.usdInr ?? liveUsdInr,
    aedInr: session.aedInr ?? liveAedInr,
    btcLoading,
    forexLoading,
    btcError,
    forexError,
    // ← ADD: silverUsdPerOz: liveSilver,
    // ← ADD: silverLoading,
    // ← ADD: silverError,
    refetch,
    setSessionRates,
    clearSessionRates,
  }),
  [/* add liveSilver, silverLoading, silverError to dep array */]
)
```

**Import to add** — add to existing priceApi import (line 11-15):
```typescript
import {
  BTC_TTL_MS,
  FOREX_TTL_MS,
  SILVER_TTL_MS,        // ← ADD
  fetchBtcUsd,
  fetchForex,
  fetchSilverUsdPerOz,  // ← ADD
} from '../lib/priceApi'
```

**Note:** `SessionRatePartial` does NOT gain `silverUsdPerOz` — silver is API-only (no session override). Do not modify `SessionRatePartial` or `SessionOverrides`.

---

### `src/lib/dashboardCalcs.ts` — Add sumCommoditiesInr, extend CategoryTotals + ORDER

**Analog:** `src/lib/dashboardCalcs.ts` — `sumGoldInr` (lines 28-41) for null-when-price-missing pattern; `sumBankSavingsInr` (lines 76-89) for partial-total (skip item, don't zero row) pattern

**DASHBOARD_CATEGORY_ORDER — insert 'otherCommodities' after 'gold'** (lines 4-12):
```typescript
export const DASHBOARD_CATEGORY_ORDER = [
  'gold',
  'otherCommodities',  // ← ADD here (position 1, after gold)
  'mutualFunds',
  'stocks',
  'bitcoin',
  'property',
  'bankSavings',
  'retirement',
] as const
```

**CategoryTotals — add otherCommodities** (lines 16-24):
```typescript
export type CategoryTotals = {
  gold: number | null
  otherCommodities: number | null  // ← ADD (null only when all items are silver with no price)
  mutualFunds: number
  stocks: number
  bitcoin: number | null
  property: number
  bankSavings: number
  retirement: number
}
```

**sumGoldInr — null-when-required-price-absent pattern** (lines 28-41):
```typescript
function sumGoldInr(data: AppData): number | null {
  const items = data.assets.gold.items
  if (items.length === 0) return 0
  if (data.settings.goldPrices === undefined) return null

  let sum = 0
  for (const item of items) {
    const k = KARAT_TO_KEY[item.karat]
    const price = data.settings.goldPrices![k]
    const line = roundCurrency(item.grams * price)
    sum = roundCurrency(sum + line)
  }
  return sum
}
```

**sumBankSavingsInr — partial-total (skip item not row) pattern** (lines 76-89):
```typescript
function sumBankSavingsInr(data: AppData, aedInr: number | null): number {
  return data.assets.bankSavings.accounts.reduce((sum, a) => {
    if (a.currency === 'INR') {
      return roundCurrency(sum + roundCurrency(a.balance))
    }
    if (aedInr == null) {
      return sum  // skip AED account — do NOT zero out the whole total
    }
    return roundCurrency(sum + roundCurrency(a.balance * aedInr))
  }, 0)
}
```

**calcCategoryTotals — extend signature and body** (lines 101-114):
```typescript
export function calcCategoryTotals(
  data: AppData,
  live: {
    btcUsd: number | null
    usdInr: number | null
    aedInr: number | null
    silverUsdPerOz: number | null  // ← ADD
  }
): CategoryTotals {
  // ← ADD: derive silverInrPerGram before the return
  return {
    gold: sumGoldInr(data),
    otherCommodities: sumCommoditiesInr(data, silverInrPerGram),  // ← ADD
    mutualFunds: sumMutualFunds(data),
    // ...rest unchanged
  }
}
```

**Import to add** — `TROY_OZ_TO_GRAMS` from priceApi or define inline:
```typescript
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'  // option A
// OR define inline: const TROY_OZ_TO_GRAMS = 31.1035  // option B
```

**What to add — sumCommoditiesInr** (hybrid of sumGoldInr + sumBankSavingsInr):
```typescript
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

  // null only when ALL items are standard with no silver price available
  if (!hasPricedItems) return null
  return sum
}
```

**sumForNetWorth — no change needed** (lines 116-124). It already iterates `DASHBOARD_CATEGORY_ORDER` and reads `totals[k]`, so adding `'otherCommodities'` to the order + type is sufficient.

---

### `src/pages/DashboardPage.tsx` — Minimal commodity row wiring

**Analog:** `src/pages/DashboardPage.tsx` — AED bank row informational note (lines 267-270) for partial-unavailable pattern; gold null pattern (lines 272-276) for excludedNames; BTC skeleton (lines 252-254) for loading skeleton

**ROW_LABEL — add otherCommodities** (lines 29-37):
```typescript
const ROW_LABEL: Record<DashboardCategoryKey, string> = {
  gold: 'Gold',
  otherCommodities: 'Commodities',  // ← ADD
  mutualFunds: 'Mutual Funds',
  // ...rest unchanged
}
```

**NAV_KEY — add otherCommodities** (lines 39-47):
```typescript
const NAV_KEY: Record<DashboardCategoryKey, SectionKey> = {
  gold: 'gold',
  otherCommodities: 'settings',  // ← ADD (placeholder; Phase 13 adds real page)
  // ...rest unchanged
}
```

**noHoldingsYet — add otherCommodities check** (lines 57-68):
```typescript
function noHoldingsYet(data: AppData): boolean {
  return (
    data.assets.gold.items.length === 0 &&
    data.assets.otherCommodities.items.length === 0 &&  // ← ADD
    data.assets.mutualFunds.platforms.length === 0 &&
    // ...rest unchanged
  )
}
```

**useLivePrices destructure — add silver fields** (lines 79-85):
```typescript
const {
  btcUsd,
  usdInr,
  aedInr,
  btcLoading,
  forexLoading,
  silverUsdPerOz,  // ← ADD
  silverLoading,   // ← ADD
  silverError,     // ← ADD
} = useLivePrices()
```

**calcCategoryTotals call — add silverUsdPerOz** (lines 87-90):
```typescript
const totals = useMemo(
  () => calcCategoryTotals(data, { btcUsd, usdInr, aedInr, silverUsdPerOz }),
  [data, btcUsd, usdInr, aedInr, silverUsdPerOz]
)
```

**showNetWorthSkeleton — add silver condition** (line 96):
```typescript
const hasSilverItems = data.assets.otherCommodities.items.some(
  i => i.type === 'standard'
)
const showNetWorthSkeleton =
  (hasBtcHolding && btcLoading) ||
  (hasAed && forexLoading) ||
  (hasSilverItems && silverLoading)  // ← ADD
```

**excludedNames — add Commodities when totals.otherCommodities === null** (lines 99-105):
```typescript
const excludedNames: string[] = []
if (totals.gold === null && data.assets.gold.items.length > 0) {
  excludedNames.push('Gold')
}
if (totals.bitcoin === null && hasBtcHolding) {
  excludedNames.push('Bitcoin')
}
// ← ADD: null only when all items are silver with no price — mirrors gold pattern
if (totals.otherCommodities === null) {
  excludedNames.push('Commodities')
}
```

**Row rendering — silver-unavailable informational note** (AED pattern at lines 267-270):
```typescript
// Existing AED pattern to mirror:
{isBankRow && aedRateMissing && (
  <span className="text-xs text-muted-foreground block mt-0.5">
    AED balances excluded — rate unavailable
  </span>
)}

// New Commodities row pattern (informational, does NOT push to excludedNames):
{isCommoditiesRow && silverError != null && hasSilverItems && (
  <span className="text-xs text-muted-foreground block mt-0.5">
    Silver price unavailable — silver items excluded
  </span>
)}
```

---

## Shared Patterns

### roundCurrency — floating-point safety
**Source:** `src/lib/financials.ts` lines 27-29
**Apply to:** All numeric calculations in `sumCommoditiesInr`, `calcCategoryTotals`
```typescript
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}
```
Rule: call after every multiplication and addition in financial calculations.

### nowIso — timestamps
**Source:** `src/lib/financials.ts` lines 39-41
**Apply to:** `ensureOtherCommodities` injected default value; `createInitialData`
```typescript
export function nowIso(): string {
  return new Date().toISOString()
}
```

### Migration guard pattern — safe unknown traversal
**Source:** `src/context/AppDataContext.tsx` lines 7-10 (migrateLegacyBankAccounts)
**Apply to:** `ensureOtherCommodities`
```typescript
if (raw === null || typeof raw !== 'object') return raw
const o = raw as Record<string, unknown>
// type-safe property access without casting the whole object
```

### TTL-gated fetch channel pattern
**Source:** `src/context/LivePricesContext.tsx` lines 70-92 (runBtcFetch) and 94-119 (runForexFetch)
**Apply to:** `runSilverFetch` in `LivePricesContext.tsx`

The canonical channel shape uses: one `useRef` for the last-fetched timestamp, one `useRef` for the live value (for TTL check without triggering re-renders), one `useState` for the rendered value, one `useState` for loading, one `useState` for error. The `force` parameter bypasses TTL.

### HTTP response guard pattern
**Source:** `src/lib/priceApi.ts` lines 57-79 (fetchForex)
**Apply to:** `fetchSilverUsdPerOz`
```typescript
const json: unknown = await res.json()
if (!json || typeof json !== 'object' || !('price' in json)) {
  throw new Error('silver price: unexpected response shape')
}
const price = (json as { price: unknown }).price
if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
  throw new Error('silver price: non-positive or non-numeric value')
}
```

### `as const` derived type — TypeScript compile-time coverage
**Source:** `src/lib/dashboardCalcs.ts` lines 4-14
**Apply to:** Any additions to `DASHBOARD_CATEGORY_ORDER`

`DashboardCategoryKey` is derived as `(typeof DASHBOARD_CATEGORY_ORDER)[number]`. Adding `'otherCommodities'` to the array automatically expands the type — TypeScript will flag missing entries in `ROW_LABEL` and `NAV_KEY` immediately.

---

## Test File Patterns (Wave 0 — No Existing Analog)

No test files exist in the project (verified: no `*.test.ts` or `__tests__/` directories in `src/`). Wave 0 must install Vitest and create these files from scratch.

**Test framework to install:** `npm install --save-dev vitest`

### `src/lib/__tests__/schema.test.ts`
**Tests:** `OtherCommodityItemSchema` and `DataSchema` discriminated union parsing
**Pattern to follow (from RESEARCH.md):**
```typescript
import { describe, it, expect } from 'vitest'
import { OtherCommodityItemSchema } from '@/types/data'

describe('OtherCommodityItemSchema', () => {
  it('accepts a valid standard silver item', () => {
    const result = OtherCommodityItemSchema.safeParse({
      type: 'standard', kind: 'silver', grams: 100,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })
  it('rejects unknown type', () => {
    const result = OtherCommodityItemSchema.safeParse({ type: 'unknown' })
    expect(result.success).toBe(false)
  })
})
```

### `src/lib/__tests__/migration.test.ts`
**Tests:** `ensureOtherCommodities` (via `parseAppDataFromImport` with old data missing the key)
**Key cases:** old data.json (no `otherCommodities`) parses successfully; data with the key passes through unchanged.

### `src/lib/__tests__/dashboardCalcs.test.ts`
**Tests:** `sumCommoditiesInr` — all branches from D-06
**Key cases:**
- Empty items → `0`
- Manual items only → always sum (no price needed)
- Silver items with `silverInrPerGram = null` → skip silver, return manual portion
- All silver items + `silverInrPerGram = null` → `null`
- Silver items + valid `silverInrPerGram` → correct rounded total
- `sumForNetWorth` includes `otherCommodities` when non-null

### `src/context/__tests__/AppDataContext.test.ts`
**Tests:** `createInitialData` shape and `parseAppDataFromImport`
**Key cases:**
- `createInitialData()` has `assets.otherCommodities.items` as empty array
- `parseAppDataFromImport` with valid standard + manual items returns success
- `parseAppDataFromImport` with old data (no `otherCommodities` key) returns success (migration)

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/lib/__tests__/schema.test.ts` | test | CRUD | No test files exist in project — Wave 0 installs Vitest |
| `src/lib/__tests__/migration.test.ts` | test | CRUD | No test files exist in project — Wave 0 installs Vitest |
| `src/lib/__tests__/dashboardCalcs.test.ts` | test | transform | No test files exist in project — Wave 0 installs Vitest |
| `src/context/__tests__/AppDataContext.test.ts` | test | CRUD | No test files exist in project — Wave 0 installs Vitest |

---

## Metadata

**Analog search scope:** `src/types/`, `src/context/`, `src/lib/`, `src/pages/`
**Files read:** 7 source files (data.ts, AppDataContext.tsx, LivePricesContext.tsx, priceApi.ts, dashboardCalcs.ts, DashboardPage.tsx, financials.ts)
**Pattern extraction date:** 2026-04-30
