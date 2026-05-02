# Phase 14: Schema & Migration - Pattern Map

**Mapped:** 2026-05-01
**Files analyzed:** 4 (2 modified, 2 test additions)
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/types/data.ts` | model/schema | transform | `src/types/data.ts` (existing schemas) | exact — add to same file |
| `src/context/AppDataContext.tsx` | service/migration | transform | `src/context/AppDataContext.tsx` (`ensureOtherCommodities`) | exact — add to same file |
| `src/lib/__tests__/schema.test.ts` | test | transform | `src/lib/__tests__/schema.test.ts` (OtherCommodityItemSchema suite) | exact — add to same file |
| `src/lib/__tests__/migration.test.ts` | test | transform | `src/lib/__tests__/migration.test.ts` (ensureOtherCommodities suite) | exact — add to same file |

---

## Pattern Assignments

### `src/types/data.ts` — Add `LiabilityItemSchema` and update `DataSchema`

**Analog within same file:** `PropertyItemSchema` (BaseItemSchema.extend with optional fields) and `OtherCommodityItemSchema` (exported item schema).

**BaseItemSchema extend pattern** (`src/types/data.ts` lines 81–87 — PropertyItemSchema):
```typescript
export const PropertyItemSchema = BaseItemSchema.extend({
  label: z.string().min(1),
  agreementInr: z.number().nonnegative(),
  milestones: z.array(PropertyMilestoneRowSchema),
  hasLiability: z.boolean(),
  outstandingLoanInr: z.number().nonnegative().optional(),
})
```

**New schema to add** — follows exact same extend pattern, placed after `PropertySchema` block and before `BankAccountSchema`:
```typescript
export const LiabilityItemSchema = BaseItemSchema.extend({
  label: z.string().min(1),
  outstandingInr: z.number().nonnegative(),
  loanType: z.enum(['home', 'car', 'personal', 'other']),
  lender: z.string().optional(),
  emiInr: z.number().nonnegative().optional(),
})
```

Key decisions:
- `label` and `outstandingInr` are required (D-03, D-04)
- `lender` and `emiInr` are `.optional()` (D-01, D-02)
- `outstandingInr` uses `.nonnegative()` — zero is valid (D-04)
- `loanType` uses `z.enum([...])` (D-05)
- Schema is `export`ed (matches `OtherCommodityItemSchema` and `PropertyItemSchema`)

**`NetWorthPointSchema` change** (`src/types/data.ts` lines 137–140):
```typescript
// BEFORE (line 139):
  totalInr: z.number().nonnegative(),
// AFTER (D-07):
  totalInr: z.number(),
```

**`DataSchema` root object** (`src/types/data.ts` lines 144–158) — add `liabilities` as peer of `assets` and `netWorthHistory` (D-06):
```typescript
export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({
    gold: GoldSchema,
    otherCommodities: OtherCommoditiesSchema,
    mutualFunds: MutualFundsSchema,
    stocks: StocksSchema,
    bitcoin: BitcoinSchema,
    property: PropertySchema,
    bankSavings: BankSavingsSchema,
    retirement: RetirementSchema,
  }),
  liabilities: z.array(LiabilityItemSchema),   // ← add this line (DEBT-02)
  netWorthHistory: z.array(NetWorthPointSchema),
})
```

**Type exports block** (`src/types/data.ts` lines 161–173) — add `LiabilityItem` after existing exports:
```typescript
export type LiabilityItem = z.infer<typeof LiabilityItemSchema>
```

---

### `src/context/AppDataContext.tsx` — Add `ensureLiabilities()` and update `createInitialData()`

**Analog: `ensureOtherCommodities`** (`src/context/AppDataContext.tsx` lines 51–68) — exact template to follow:
```typescript
/** v1.4 files without `assets.otherCommodities`: default empty block before Zod parse. */
export function ensureOtherCommodities(raw: unknown): unknown {
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

**New function to add** — `ensureLiabilities` checks the root (not `assets`) because `liabilities` is a root-level key (D-06, D-08, D-09). Place immediately after `ensureOtherCommodities`:
```typescript
/** v1.5 files without `liabilities`: default to `[]` before Zod parse. */
export function ensureLiabilities(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  if (!('liabilities' in o) || o.liabilities === undefined) {
    return { ...o, liabilities: [] }
  }
  return raw
}
```

Key difference from `ensureOtherCommodities`: `liabilities` is at the root (no `assets` drill-down needed). The shape injected is a plain `[]` (not an object with `updatedAt`), because `DataSchema` defines it as `z.array(LiabilityItemSchema)` directly.

The function must be `export`ed so the test file can import it directly (D-09).

**Migration chain** (`src/context/AppDataContext.tsx` lines 73–84) — add `ensureLiabilities` call after `ensureOtherCommodities` (D-10). Update the JSDoc comment too:
```typescript
/** Same migrate + `DataSchema` path as initial `GET /api/data` load — for import and boot.
 *  Chain: migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → safeParse
 */
export function parseAppDataFromImport(
  raw: unknown,
): { success: true; data: AppData } | { success: false; zodError: ZodError } {
  const migrated = migrateLegacyBankAccounts(raw)
  const withHistory = ensureNetWorthHistory(migrated)
  const withCommodities = ensureOtherCommodities(withHistory)
  const withLiabilities = ensureLiabilities(withCommodities)   // ← add this line
  const result = DataSchema.safeParse(withLiabilities)          // ← update variable name
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, zodError: result.error }
}
```

**`createInitialData()`** (`src/context/AppDataContext.tsx` lines 89–106) — add `liabilities: []` at root level, peer of `assets` and `netWorthHistory` (DEBT-04):
```typescript
export function createInitialData(): AppData {
  const now = nowIso()
  return {
    version: 1,
    settings: { updatedAt: now },
    assets: {
      gold: { updatedAt: now, items: [] },
      otherCommodities: { updatedAt: now, items: [] },
      mutualFunds: { updatedAt: now, platforms: [] },
      stocks: { updatedAt: now, platforms: [] },
      bitcoin: { updatedAt: now, quantity: 0 },
      property: { updatedAt: now, items: [] },
      bankSavings: { updatedAt: now, accounts: [] },
      retirement: { updatedAt: now, nps: 0, epf: 0 },
    },
    liabilities: [],        // ← add this line (DEBT-04)
    netWorthHistory: [],
  }
}
```

---

### `src/lib/__tests__/schema.test.ts` — Add `LiabilityItemSchema` test suite

**Analog: `OtherCommodityItemSchema` describe block** (`src/lib/__tests__/schema.test.ts` lines 1–83). Follow the same structure:
- `baseFields()` helper already defined (line 5–11) — reuse it, do not redefine
- Import `LiabilityItemSchema` from `@/types/data` — add to the import on line 2
- Add two `describe` blocks: one for `LiabilityItemSchema` item validation, one for `DataSchema` integration

**Import line update** (line 2):
```typescript
import { DataSchema, OtherCommodityItemSchema, LiabilityItemSchema } from '@/types/data'
```

**Schema validation suite pattern** (mirroring lines 13–61):
```typescript
describe('LiabilityItemSchema', () => {
  it('accepts valid item with required fields only', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Home Loan',
      outstandingInr: 2_500_000,
      loanType: 'home',
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('accepts valid item with all optional fields', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Car Loan',
      outstandingInr: 450_000,
      loanType: 'car',
      lender: 'HDFC Bank',
      emiInr: 8_500,
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('accepts zero outstandingInr (fully paid)', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Personal Loan',
      outstandingInr: 0,
      loanType: 'personal',
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('rejects negative outstandingInr', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Loan',
      outstandingInr: -1000,
      loanType: 'other',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })

  it('rejects empty label', () => {
    const r = LiabilityItemSchema.safeParse({
      label: '',
      outstandingInr: 100_000,
      loanType: 'home',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })

  it('rejects unknown loanType', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Loan',
      outstandingInr: 50_000,
      loanType: 'mortgage',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })
})
```

**DataSchema integration test** (mirroring lines 63–83):
```typescript
describe('DataSchema liabilities', () => {
  it('accepts full data with liabilities array', () => {
    const data = createInitialData()
    data.liabilities = [
      {
        label: 'Home Loan',
        outstandingInr: 2_500_000,
        loanType: 'home',
        lender: 'SBI',
        emiInr: 22_000,
        ...baseFields(),
      },
    ]
    const r = DataSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('accepts full data with empty liabilities array', () => {
    const r = DataSchema.safeParse(createInitialData())
    expect(r.success).toBe(true)
  })
})
```

---

### `src/lib/__tests__/migration.test.ts` — Add `ensureLiabilities()` test suite

**Analog: `ensureOtherCommodities` describe block** (`src/lib/__tests__/migration.test.ts` lines 1–52). Follow the same structure exactly.

**Import line update** (line 2):
```typescript
import { ensureOtherCommodities, ensureLiabilities } from '@/context/AppDataContext'
```

**`minimalOldRoot()` helper** (lines 6–21) already exists — reuse it. The helper does NOT include `liabilities`, which is correct: it simulates an old data.json that predates Phase 14.

**Migration test suite pattern** (mirroring lines 23–52):
```typescript
describe('ensureLiabilities', () => {
  it('injects liabilities when root has no key', () => {
    const raw = minimalOldRoot()
    const out = ensureLiabilities(raw) as Record<string, unknown>
    expect(Array.isArray(out.liabilities)).toBe(true)
    expect((out.liabilities as unknown[]).length).toBe(0)
  })

  it('passes through when liabilities already exists', () => {
    const raw = { ...minimalOldRoot(), liabilities: [] }
    expect(ensureLiabilities(raw)).toBe(raw)
  })

  it('returns non-object input unchanged', () => {
    expect(ensureLiabilities(null)).toBe(null)
    expect(ensureLiabilities('x')).toBe('x')
  })
})
```

Key difference from `ensureOtherCommodities` test: checking `out.liabilities` directly on the root object (not `out.assets.liabilities`), and checking `Array.isArray` + length rather than `objectContaining({ items: [] })`, because the injected value is `[]` not `{ updatedAt, items: [] }`.

---

## Shared Patterns

### BaseItemSchema Extension
**Source:** `src/types/data.ts` lines 5–9 (definition) and lines 14–17, 81–87 (usage)
**Apply to:** `LiabilityItemSchema`
```typescript
export const BaseItemSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
// Usage: const XSchema = BaseItemSchema.extend({ ... })
```

### Optional Fields Pattern
**Source:** `src/types/data.ts` line 86
**Apply to:** `lender` and `emiInr` in `LiabilityItemSchema`
```typescript
outstandingLoanInr: z.number().nonnegative().optional(),
```

### Export Pattern for Testable Migration Functions
**Source:** `src/context/AppDataContext.tsx` line 52
**Apply to:** `ensureLiabilities`
```typescript
export function ensureLiabilities(raw: unknown): unknown { ... }
```
Functions must be `export`ed (not module-private) so test files can import them directly.

### Test `baseFields()` Helper
**Source:** `src/lib/__tests__/schema.test.ts` lines 5–11
**Apply to:** All new schema test cases — reuse, never redefine
```typescript
function baseFields() {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
```

### Test Boundary Coverage Convention
**Source:** Both existing test files
**Apply to:** All new test suites — cover: valid minimum, valid with optionals, invalid required field, invalid enum value, boundary value (zero for nonnegative)

---

## No Analog Found

None — all four files have direct in-codebase analogs.

---

## Metadata

**Analog search scope:** `src/types/`, `src/context/`, `src/lib/__tests__/`
**Files scanned:** 4 primary files (all read in full)
**Pattern extraction date:** 2026-05-01
