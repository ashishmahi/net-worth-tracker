---
phase: 14-schema-migration
reviewed: 2026-05-01T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/context/AppDataContext.tsx
  - src/lib/__tests__/migration.test.ts
  - src/lib/__tests__/schema.test.ts
  - src/types/data.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 14: Code Review Report

**Reviewed:** 2026-05-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 14 introduces the `LiabilityItemSchema` and `OtherCommodityItemSchema` Zod schemas along with their migration helpers (`ensureLiabilities`, `ensureOtherCommodities`), wires them into the boot-time migration chain in `AppDataContext.tsx`, and adds test coverage for both schema validation and migration behaviour.

The overall architecture is sound and consistent with the patterns established in earlier phases. The migration chain is clean, the schema types are well-exported, and the test suite exercises both the happy and rejection paths. Three warnings are raised: a silent data-loss risk when `data.json` fails to load, a missing `createdAt`/`updatedAt` requirement on `PropertyMilestoneRowSchema`, and an incorrect rollback placement in the `saveData` catch block. Four info-level observations cover minor gaps in schema strictness and test coverage.

## Warnings

### WR-01: `saveData` double-rollback — `setData(previous)` called twice on network error

**File:** `src/context/AppDataContext.tsx:166-168`
**Issue:** In the `catch` block, `setData(previous)` is called at line 167, but it was already called at line 163 inside the `if (!res.ok)` branch. For a non-OK HTTP response the path is: optimistic update → `if (!res.ok)` rollback at line 163 → `throw` → caught by outer `catch` → second rollback at line 167. The second call is a no-op only because `previous` is still in scope, but if the code evolves to mutate `previous` the double-call becomes a real bug. More critically, the outer `catch` also runs for the genuine network-error path (where `res` is never set), so the intent is correct for that path — but the current structure conflates two distinct error paths.

**Fix:** Remove the redundant `setData(previous)` from inside the `if (!res.ok)` block and rely solely on the catch-level rollback, or restructure with an explicit flag:
```typescript
async function saveData(newData: AppData): Promise<void> {
  const previous = data
  setData(newData)
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    })
    if (!res.ok) {
      throw new Error(`Save failed: ${res.status}`)
    }
  } catch (err) {
    setData(previous) // single rollback, covers both non-ok and network error
    throw err
  }
}
```

---

### WR-02: Schema mismatch on load silently discards all saved data

**File:** `src/context/AppDataContext.tsx:146-148`
**Issue:** When `parseAppDataFromImport` returns `{ success: false }`, the code sets a `loadError` string and leaves state at `INITIAL_DATA`, effectively discarding all user data without any recovery path. A corrupt field in a single record causes the entire `data.json` to be treated as unrecoverable. There is no logging of the raw JSON or the Zod error detail to aid debugging, and the user has no way to export the broken file before it is overwritten on the next save.

**Fix:** At minimum, log the full Zod error and the raw JSON to the console so the data is not silently lost. Ideally, expose the raw payload through context so a UI recovery flow can offer a "download broken file" option before the first save overwrites it:
```typescript
} else {
  console.error('data.json schema mismatch — raw:', raw)
  console.error('Zod issues:', result.zodError.issues)
  setLoadError('Saved data format is unrecognized. Starting with defaults to avoid data loss.')
}
```

---

### WR-03: `PropertyMilestoneRowSchema` lacks `BaseItemSchema` fields — inconsistent with project convention

**File:** `src/types/data.ts:74-79`
**Issue:** `PropertyMilestoneRowSchema` defines its own `id: z.string().uuid()` but omits `createdAt` and `updatedAt`, which every other list item in the schema requires per the project convention (CLAUDE.md: "all list items have `id`, `createdAt`, `updatedAt`"). This is a pre-existing gap but it directly affects the new liabilities work because `LiabilityItemSchema` correctly extends `BaseItemSchema` while milestone rows do not, creating an inconsistency at the same schema layer.

**Fix:** Extend `BaseItemSchema`:
```typescript
export const PropertyMilestoneRowSchema = BaseItemSchema.extend({
  label: z.string(),
  amountInr: z.number().nonnegative(),
  isPaid: z.boolean(),
})
```
This is a schema-only change; existing data.json rows without timestamps would fail validation, so a migration helper analogous to `ensureLiabilities` would be needed.

---

## Info

### IN-01: `MfPlatformSchema` and `StockPlatformSchema` accept empty `name` string

**File:** `src/types/data.ts:47-66`
**Issue:** `name: z.string()` allows an empty string on both `MfPlatformSchema` and `StockPlatformSchema`. `LiabilityItemSchema` and `ManualCommodityItemSchema` both use `z.string().min(1)` for their label fields. The inconsistency means a mutual fund or stock platform with an empty name passes schema validation and would render as a blank entry in the UI.

**Fix:** Apply `min(1)` to enforce non-empty names:
```typescript
name: z.string().min(1),
```

---

### IN-02: `ensureOtherCommodities` migration test does not exercise the full `parseAppDataFromImport` pipeline

**File:** `src/lib/__tests__/migration.test.ts:23-52`
**Issue:** The migration tests validate each `ensure*` helper in isolation but no test runs the complete `parseAppDataFromImport` chain (bank-account migration → netWorthHistory → otherCommodities → liabilities → Zod parse) against a realistic legacy payload. A bug in the ordering of migrations (e.g., running `ensureLiabilities` before `ensureNetWorthHistory`) would not be caught by the current suite.

**Fix:** Add an integration-level test:
```typescript
import { parseAppDataFromImport } from '@/context/AppDataContext'

it('parseAppDataFromImport succeeds on legacy v1.2 payload without otherCommodities or liabilities', () => {
  const legacy = minimalOldRoot() // no otherCommodities, no liabilities
  const result = parseAppDataFromImport(legacy)
  expect(result.success).toBe(true)
})
```

---

### IN-03: `NetWorthPointSchema` accepts negative `totalInr` — intentional but undocumented

**File:** `src/types/data.ts:145-148`
**Issue:** `totalInr: z.number()` (no `nonnegative()`) allows negative net worth snapshots. This is arguably correct for users with high liabilities, but the lack of a constraint or comment creates ambiguity about whether the omission is intentional.

**Fix:** Add an inline comment:
```typescript
export const NetWorthPointSchema = z.object({
  recordedAt: z.string().datetime(),
  totalInr: z.number(), // may be negative when liabilities exceed assets
})
```

---

### IN-04: `schema.test.ts` does not test rejection of a `standard` item missing `kind`

**File:** `src/lib/__tests__/schema.test.ts:13-61`
**Issue:** The `OtherCommodityItemSchema` tests cover rejection of negative `grams` and empty `label` but do not cover a `standard` item that omits the required `kind` field. This is the most natural misuse of the discriminated union and worth a guard.

**Fix:**
```typescript
it('rejects standard item missing kind', () => {
  const r = OtherCommodityItemSchema.safeParse({
    type: 'standard',
    grams: 100,
    ...baseFields(),
  })
  expect(r.success).toBe(false)
})
```

---

_Reviewed: 2026-05-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
