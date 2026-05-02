# Phase 15: Calculation Utilities - Pattern Map

**Mapped:** 2026-05-01
**Files analyzed:** 2
**Analogs found:** 2 / 2

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/liabilityCalcs.ts` | utility (pure calc) | transform | `src/lib/dashboardCalcs.ts` | exact |
| `src/lib/__tests__/liabilityCalcs.test.ts` | test | — | `src/lib/__tests__/dashboardCalcs.test.ts` | exact |

---

## Pattern Assignments

### `src/lib/liabilityCalcs.ts` (utility, transform)

**Analog:** `src/lib/dashboardCalcs.ts`

**Imports pattern** (dashboardCalcs.ts lines 1-3):
```typescript
import type { AppData } from '@/types/data'
import { roundCurrency } from '@/lib/financials'
```
Only these two imports are needed — no React, no priceApi, no UI imports.

**Core pattern — AppData-taking pure function** (dashboardCalcs.ts lines 97-104):
```typescript
// sumPropertyInr shows the hasLiability + outstandingLoanInr guard pattern
function sumPropertyInr(data: AppData): number {
  return data.assets.property.items.reduce((sum, item) => {
    const equity = item.hasLiability
      ? roundCurrency(item.agreementInr - (item.outstandingLoanInr ?? 0))
      : item.agreementInr
    return roundCurrency(sum + roundCurrency(equity))
  }, 0)
}
```

**roundCurrency convention** (dashboardCalcs.ts lines 73-78):
```typescript
// Apply roundCurrency to every line value AND to the running sum accumulation
function sumMutualFunds(data: AppData): number {
  return data.assets.mutualFunds.platforms.reduce(
    (sum, p) => roundCurrency(sum + roundCurrency(p.currentValue)),
    0
  )
}
```

**Guard for divide-by-zero / zero denominator** (dashboardCalcs.ts lines 168-171):
```typescript
export function percentOfTotal(categoryValue: number, grandTotal: number): number {
  if (grandTotal <= 0) return 0
  return roundCurrency((categoryValue / grandTotal) * 100)
}
```
Apply the same guard in `debtToAssetRatio` when `grossAssets === 0`.

**Empty list guard** — return 0 immediately when the source array is empty (dashboardCalcs.ts line 33: `if (items.length === 0) return 0`).

**Function signatures to implement** (from CONTEXT.md D-04–D-07):
```typescript
export function sumLiabilitiesInr(data: AppData): number
// sums data.liabilities[*].outstandingInr; returns 0 for empty list

export function sumAllDebtInr(data: AppData): number
// property items where hasLiability===true → outstandingLoanInr ?? 0
// + sumLiabilitiesInr(data)

export function calcNetWorth(grossAssets: number, liabilitiesTotal: number): number
// grossAssets - liabilitiesTotal; may return negative

export function debtToAssetRatio(totalDebt: number, grossAssets: number): number
// roundCurrency((totalDebt / grossAssets) * 100); returns 0 when grossAssets === 0
```

**LiabilityItem schema fields** (src/types/data.ts lines 94-100):
```typescript
// data.liabilities is LiabilityItem[]
// relevant fields:
//   outstandingInr: number (nonnegative)
//   loanType: 'home' | 'car' | 'personal' | 'other'
//   lender?: string
//   emiInr?: number
```

**PropertyItem liability fields** (src/types/data.ts lines 85-86):
```typescript
hasLiability: z.boolean(),
outstandingLoanInr: z.number().nonnegative().optional(),
// sumAllDebtInr filters data.assets.property.items by hasLiability === true
// then sums outstandingLoanInr ?? 0
```

---

### `src/lib/__tests__/liabilityCalcs.test.ts` (test)

**Analog:** `src/lib/__tests__/dashboardCalcs.test.ts`

**Imports pattern** (dashboardCalcs.test.ts lines 1-9):
```typescript
import { describe, expect, it } from 'vitest'
import {
  sumLiabilitiesInr,
  sumAllDebtInr,
  calcNetWorth,
  debtToAssetRatio,
} from '@/lib/liabilityCalcs'
import { roundCurrency } from '@/lib/financials'
import { createInitialData } from '@/context/AppDataContext'
import type { AppData } from '@/types/data'
```

**Test data helper pattern** (dashboardCalcs.test.ts lines 11-19):
```typescript
// Declare iso once at module scope for all item timestamps
const iso = new Date().toISOString()

// One helper per logical data shape — patches createInitialData() for the specific test concern
function withLiabilities(
  items: AppData['liabilities']
): AppData {
  const d = createInitialData()
  d.liabilities = items
  return d
}
```

**Test structure pattern** (dashboardCalcs.test.ts lines 21-25, 84-85):
```typescript
// Group by function under describe(); use plain English it() labels
describe('sumLiabilitiesInr', () => {
  it('returns 0 for empty liabilities', () => { ... })
  it('sums outstandingInr across all items', () => { ... })
  it('rounds accumulated sum with roundCurrency', () => { ... })
})
```

**Edge cases to mirror from dashboardCalcs.test.ts style:**
- Empty array → returns 0 (matches line 23: `expect(fn(createInitialData(), null)).toBe(0)`)
- Single item — exact value
- Multi-item accumulation — verify roundCurrency applied to sum
- Property items: `hasLiability === false` items must be excluded from `sumAllDebtInr`
- `debtToAssetRatio` when `grossAssets === 0` → returns 0 (mirrors `percentOfTotal` guard)
- `calcNetWorth` with `liabilitiesTotal > grossAssets` → negative result is valid

**UUID helper for test items** (dashboardCalcs.test.ts line 34):
```typescript
id: crypto.randomUUID(),
createdAt: iso,
updatedAt: iso,
```
All list items must include these three BaseItem fields.

---

## Shared Patterns

### roundCurrency — Apply Everywhere
**Source:** `src/lib/financials.ts` lines 27-29
```typescript
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}
```
**Rule:** Call `roundCurrency` on each line value AND on the running sum after each addition. Never accumulate raw floats.

### AppData Parameter Convention
**Source:** `src/lib/dashboardCalcs.ts` (every exported function)
- Functions that read stored data take `data: AppData` as the first (and usually only) parameter.
- Functions that operate on already-computed numbers (like `calcNetWorth`, `debtToAssetRatio`) take plain `number` parameters — no AppData needed.

### createInitialData() in Tests
**Source:** `src/context/AppDataContext.tsx` lines 100-118
```typescript
export function createInitialData(): AppData {
  // returns version:1, all asset arrays empty, liabilities: []
}
```
**Rule:** Always call `createInitialData()` for the base object in tests, then patch only the fields relevant to the test. Never construct AppData manually from scratch.

---

## No Analog Found

None — both files have exact analogs in the codebase.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/lib/__tests__/`, `src/types/`, `src/context/`
**Files scanned:** 4 (`dashboardCalcs.ts`, `dashboardCalcs.test.ts`, `financials.ts`, `data.ts`, `AppDataContext.tsx`)
**Pattern extraction date:** 2026-05-01
