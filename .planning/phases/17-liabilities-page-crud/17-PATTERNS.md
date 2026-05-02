# Phase 17 — Pattern Map

**Purpose:** Closest analogs in-repo for new/modified files.

## Files to create

| New file | Role | Closest analog | Notes |
|----------|------|----------------|-------|
| `src/pages/LiabilitiesPage.tsx` | CRUD page + Sheet | `src/pages/GoldPage.tsx` | Same PageHeader + Card list + Sheet + RHF/Zod; data path is `data.liabilities` at root |
| (optional) tests in `src/lib/__tests__/liabilityCalcs.test.ts` | EMI sum | `liabilityCalcs.test.ts` for `sumLiabilitiesInr` | Add cases for optional `emiInr` only |

## Files to modify

| File | Change | Analog snippet |
|------|--------|----------------|
| `src/components/AppSidebar.tsx` | Add `'liabilities'` to `SectionKey` and `NAV_ITEMS` after `property` | Existing `NAV_ITEMS` order defines pattern |
| `src/App.tsx` | Import `LiabilitiesPage`, add to `SECTION_COMPONENTS` | Same as `commodities: CommoditiesPage` |
| `src/lib/liabilityCalcs.ts` | (Optional) export `sumStandaloneLiabilitiesEmiInr` | Mirror `sumLiabilitiesInr` reduce + `roundCurrency` |

## Data flow

```
useAppData() → data.liabilities
  → map to cards; saveData({ ...data, liabilities: newArray })
```

## Code excerpts (reference)

- **Immutability + save:** See `GoldPage` `onSubmit` mapping `items` and spreading `data.assets.gold` — for liabilities, spread only `...data, liabilities: updated`.
- **Currency string fields:** `BankSavingsPage` `balance: z.string()` + `parseFinancialInput` on submit.

---

## PATTERN MAPPING COMPLETE
