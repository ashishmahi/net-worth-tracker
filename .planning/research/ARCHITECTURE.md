# Architecture Research

**Domain:** Personal finance tracker — debt/liability layer on top of existing React+Vite app
**Researched:** 2026-05-01
**Confidence:** HIGH (based on direct code inspection of all relevant source files)

---

## Existing Architecture (v1.4 baseline)

```
┌──────────────────────────────────────────────────────────────┐
│                       App.tsx (shell)                         │
│   SidebarProvider → AppSidebar + SidebarInset + MobileTopBar │
│   activeSection: SectionKey (useState, no router)            │
└───────────────────────────┬──────────────────────────────────┘
                            │ renders
              ┌─────────────┴─────────────┐
              │ DashboardPage             │ Section Pages
              │ (onNavigate prop)         │ GoldPage, CommoditiesPage,
              │                           │ PropertyPage, BankPage…
              └─────────────┬─────────────┘
                            │ consume
        ┌───────────────────┴──────────────────────┐
        │ AppDataContext                            │
        │   data: AppData  (from data.json via     │
        │   GET /api/data → Zod parse)             │
        │   saveData(newData)  → POST /api/data    │
        └───────────────────┬──────────────────────┘
                            │ types from
        ┌───────────────────┴──────────────────────┐
        │ src/types/data.ts                        │
        │   DataSchema (Zod) — single source of    │
        │   truth for AppData type                 │
        │   DataSchema.assets.{gold, otherCommod,  │
        │   mutualFunds, stocks, bitcoin, property,│
        │   bankSavings, retirement}               │
        └───────────────────┬──────────────────────┘
                            │ computed by
        ┌───────────────────┴──────────────────────┐
        │ src/lib/dashboardCalcs.ts                │
        │   calcCategoryTotals() — per-section INR │
        │   sumForNetWorth()     — gross total     │
        │   sumPropertyInr()     — deducts         │
        │     outstandingLoanInr from agreementInr │
        └──────────────────────────────────────────┘
```

### Migration chain (AppDataContext.tsx)

Every boot and every JSON import runs the same pipeline:

```
raw JSON
  → migrateLegacyBankAccounts()    (Phase 3: balanceInr → {currency,balance})
  → ensureNetWorthHistory()         (v1.3: inject [] if absent)
  → ensureOtherCommodities()        (v1.4: inject empty block if absent)
  → DataSchema.safeParse()
```

`parseAppDataFromImport()` is the single entry point for both boot and Settings import.

### Key invariants to preserve

1. All asset section data lives inside `data.assets.*` — never at root level.
2. Computed totals are never stored; only raw inputs persist.
3. `createInitialData()` must always produce a valid `AppData` (used for reset + first load).
4. Migration functions are pure, run pre-parse on `unknown`, and are referentially tested.

---

## Question 1: Where does `liabilities` live on DataSchema?

**Answer: Top-level peer of `assets`, NOT nested inside `assets`.**

Rationale from code inspection:

- `assets` in `DataSchema` is typed as `z.object({ gold, otherCommodities, … })` — every key
  produces a positive INR value. Adding liabilities inside `assets` is semantically wrong and
  forces the dashboard to distinguish "which `assets.*` keys are actually liabilities."
- `netWorthHistory` is already a top-level peer of `assets`, proving the schema supports
  non-asset sections at root.
- Keeping liabilities top-level means `dashboardCalcs.ts` can read `data.liabilities` cleanly
  alongside `data.assets`, with zero risk of conflation with asset sums.
- `DASHBOARD_CATEGORY_ORDER` and `CategoryTotals` enumerate only asset categories. There is no
  reason to shoehorn liabilities into that array.

**Concrete schema placement:**

```typescript
// src/types/data.ts
export const LiabilityItemSchema = BaseItemSchema.extend({
  label: z.string().min(1),
  lender: z.string().default(''),
  outstandingBalanceInr: z.number().nonnegative(),
  emiAmountInr: z.number().nonnegative().default(0),
})

export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({ /* unchanged */ }),
  liabilities: z.array(LiabilityItemSchema),   // NEW — top-level peer
  netWorthHistory: z.array(NetWorthPointSchema),
})
```

---

## Question 2: How should dashboardCalcs.ts handle total debt?

**Answer: Export a separate `sumLiabilitiesInr()` function; do NOT inline debt deduction into
`sumForNetWorth()`.**

Rationale:

1. `sumForNetWorth()` currently sums `CategoryTotals` keys. Changing its contract to also
   subtract liabilities would silently shift per-row asset percentages — DashboardPage uses
   `grandTotal` as the denominator for percentage columns, which must remain a gross asset sum
   so that all rows add to 100%.

2. The dashboard needs total debt as an independent number to display "Total Debt" as its own
   row and to compute `debtToAssetRatio = totalDebt / grossAssets`. That decomposition is
   impossible if debt is already merged into the total.

3. `sumPropertyInr()` already deducts `outstandingLoanInr` per item to produce equity. That
   deduction is correct and must not change. Standalone liabilities (car loans, personal loans)
   are a second independent path.

**Recommended function signatures:**

```typescript
// src/lib/dashboardCalcs.ts

/** Sum standalone liabilities (INR). Property loans are NOT included — already in property equity. */
export function sumLiabilitiesInr(data: AppData): number {
  return (data.liabilities ?? []).reduce(
    (sum, item) => roundCurrency(sum + roundCurrency(item.outstandingBalanceInr)),
    0
  )
}

/** Total debt for display: property loans + standalone liabilities. */
export function sumAllDebtInr(data: AppData): number {
  const propertyDebt = data.assets.property.items.reduce(
    (sum, item) => roundCurrency(sum + (item.hasLiability ? (item.outstandingLoanInr ?? 0) : 0)),
    0
  )
  return roundCurrency(propertyDebt + sumLiabilitiesInr(data))
}

/**
 * True net worth: gross assets (property already at equity) minus standalone liabilities.
 * Do NOT subtract property loans here — sumPropertyInr() already did that.
 */
export function calcNetWorth(grossAssets: number, standaloneLiabilities: number): number {
  return roundCurrency(grossAssets - standaloneLiabilities)
}

/** Debt-to-asset ratio as a percentage (uses gross assets as denominator). */
export function debtToAssetRatio(totalDebt: number, grossAssets: number): number {
  if (grossAssets <= 0) return 0
  return roundCurrency((totalDebt / grossAssets) * 100)
}
```

**Dashboard call-site change:**

```typescript
// DashboardPage.tsx
const grossTotal = useMemo(() => sumForNetWorth(totals), [totals])        // unchanged
const standaloneLiabilities = useMemo(() => sumLiabilitiesInr(data), [data]) // NEW
const netWorth = useMemo(
  () => calcNetWorth(grossTotal, standaloneLiabilities),
  [grossTotal, standaloneLiabilities]
)
const totalDebt = useMemo(() => sumAllDebtInr(data), [data])              // NEW for display
```

The displayed "Net worth" headline changes from `grandTotal` to `netWorth`. Per-row asset
percentages keep `grossTotal` as denominator so they still add to 100%.

---

## Question 3: Should property.liability be unified with standalone liabilities?

**Answer: Partial unification — enrich `PropertyItemSchema` in-place; do NOT move property loans
into the top-level `liabilities` list.**

Arguments against full unification:

- `sumPropertyInr()` computes `agreementInr − outstandingLoanInr` per item. If the property
  loan moved to the top-level list, property would appear at gross value in assets and the loan
  would be deducted separately. The math still works but the property dashboard row would display
  the full agreement value, not equity — a regression from current behavior.
- There is no referential integrity in a flat JSON file. A property item and its paired
  liability entry in `data.liabilities` could drift out of sync across separate edits.
- `PropertyPage` manages liability state (`hasLiability`, `loanStr`) as local sheet state
  coordinated with the property item. Splitting it across sections adds cross-section coupling.

**The enrichment approach:** Extend `PropertyItemSchema` with two optional fields:

```typescript
export const PropertyItemSchema = BaseItemSchema.extend({
  label: z.string().min(1),
  agreementInr: z.number().nonnegative(),
  milestones: z.array(PropertyMilestoneRowSchema),
  hasLiability: z.boolean(),
  outstandingLoanInr: z.number().nonnegative().optional(),  // existing
  lender: z.string().optional(),                            // NEW
  emiAmountInr: z.number().nonnegative().optional(),        // NEW
})
```

Both new fields are optional so existing `data.json` continues to parse without a migration
function — Zod `.optional()` on fields that are absent is backward-compatible. PropertyPage
gains two new form inputs inside the existing `hasLiability` section.

`sumAllDebtInr()` aggregates property loans and standalone liabilities for the "Total Debt"
display row. The net worth calculation uses `calcNetWorth(grossAssets, sumLiabilitiesInr(data))`
— only standalone liabilities, because property loans are already subtracted via equity.

---

## Question 4: Build order

**Dependency chain: schema → migration → calcs → property enrichment → liabilities CRUD → dashboard.**

```
Phase A — Schema + migration (no UI)
  1. src/types/data.ts
     - Add LiabilityItemSchema
     - Add liabilities: z.array(LiabilityItemSchema) to DataSchema
     - Add lender + emiAmountInr optionals to PropertyItemSchema
  2. src/context/AppDataContext.tsx
     - ensureLiabilities(): inject [] when key absent (v1.4 and older files)
     - Add ensureLiabilities() to parseAppDataFromImport() chain
     - Add liabilities: [] to createInitialData()
  3. Unit tests for ensureLiabilities() (follow migration.test.ts pattern)
  Checkpoint: DataSchema.safeParse() passes on old data.json; new fields round-trip

Phase B — Calculations (no UI)
  4. src/lib/dashboardCalcs.ts
     - sumLiabilitiesInr()
     - sumAllDebtInr()
     - calcNetWorth()
     - debtToAssetRatio()
  5. Unit tests for each new function (follow dashboardCalcs.test.ts pattern)
  Checkpoint: all calc tests green; all existing tests still green

Phase C — Property enrichment
  6. src/pages/PropertyPage.tsx
     - Add lender + emiAmountInr inputs to the hasLiability section
     - Read/write new fields in openEdit() / onSubmit()
  Checkpoint: property edit/save round-trips with new fields; old items load unchanged

Phase D — Liabilities page (new CRUD)
  7. src/pages/LiabilitiesPage.tsx
     - Single form variant (no discriminated union needed, unlike CommoditiesPage)
     - Sheet for add/edit/delete (follow CommoditiesPage structure)
     - Fields: label, lender, outstandingBalanceInr, emiAmountInr
     - Save: data.liabilities push/replace/filter → saveData({...data, liabilities: ...})
  8. src/components/AppSidebar.tsx
     - Add 'liabilities' to SectionKey union + NAV_ITEMS array
  9. src/App.tsx
     - Add LiabilitiesPage to SECTION_COMPONENTS
  Checkpoint: CRUD works; data.json persists liabilities correctly

Phase E — Dashboard integration
 10. src/pages/DashboardPage.tsx
     - Switch net worth headline to calcNetWorth(grossTotal, standaloneLiabilities)
     - Add "Total Debt" row (using sumAllDebtInr) after asset rows
     - Add "Debt-to-Asset" ratio display (percentage)
     - Update noHoldingsYet() to include data.liabilities.length > 0
     - Snapshot records calcNetWorth() not grossTotal
 11. DashboardPage navigation: add liabilities nav key to NAV_KEY map if needed
  Checkpoint: Dashboard shows correct net worth, Total Debt, D/A ratio

Phase F — Import / reset parity
 12. Verify parseAppDataFromImport() chain includes ensureLiabilities() — covered in Phase A
 13. Verify createInitialData() has liabilities: [] — covered in Phase A
 14. End-to-end: export data.json, clear, import — liabilities survive round-trip
```

---

## Component Inventory

### New components

| File | Type | Purpose |
|------|------|---------|
| `src/pages/LiabilitiesPage.tsx` | Page | CRUD for standalone loans — label, lender, balance, EMI |

### Modified components

| File | Change | Risk |
|------|--------|------|
| `src/types/data.ts` | Add `LiabilityItemSchema`; add `liabilities` to `DataSchema`; add `lender`/`emiAmountInr` to `PropertyItemSchema` | LOW — new fields are optional or additive |
| `src/context/AppDataContext.tsx` | Add `ensureLiabilities()`; extend migration chain; extend `createInitialData()` | LOW — follows identical pattern to `ensureOtherCommodities()` |
| `src/lib/dashboardCalcs.ts` | Add `sumLiabilitiesInr()`, `sumAllDebtInr()`, `calcNetWorth()`, `debtToAssetRatio()` | LOW — pure additions, no changes to existing functions |
| `src/pages/DashboardPage.tsx` | Switch net worth headline to `calcNetWorth()`; add Total Debt + ratio rows | MEDIUM — changes visible headline value and snapshot storage |
| `src/pages/PropertyPage.tsx` | Add lender + EMI inputs inside existing liability section | LOW — additive form fields only |
| `src/components/AppSidebar.tsx` | Add `'liabilities'` to `SectionKey` union + `NAV_ITEMS` | LOW |
| `src/App.tsx` | Add `LiabilitiesPage` to `SECTION_COMPONENTS` | LOW |

---

## Data Flow

### Liability save

```
LiabilitiesPage (user submits add/edit form)
  → build updated liabilities: LiabilityItem[]
  → saveData({ ...data, liabilities: updatedList })
  → AppDataContext.saveData()
  → optimistic setData() + POST /api/data
  → data.json written
```

### Dashboard net worth computation

```
DashboardPage (mount or data/live-prices change)
  → calcCategoryTotals(data, live)               [UNCHANGED]
  → sumForNetWorth(totals) → grossTotal           [UNCHANGED]
  → sumLiabilitiesInr(data) → standaloneLiab     [NEW]
  → calcNetWorth(grossTotal, standaloneLiab)      [NEW] → headline
  → sumAllDebtInr(data) → totalDebtDisplay        [NEW] → Total Debt row
  → debtToAssetRatio(totalDebt, grossTotal)       [NEW] → ratio display
  → asset rows render with grossTotal denominator [UNCHANGED]
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing liabilities inside `data.assets`

**What people do:** Add `liabilities: LiabilityItem[]` inside the `assets` object to keep all
financial data together.

**Why it's wrong:** `DASHBOARD_CATEGORY_ORDER` and `CategoryTotals` enumerate asset keys to
render dashboard rows. Adding liabilities there forces special-case exclusion logic in the
render loop and would make `sumForNetWorth()` return a negative subtotal for the liabilities
row, breaking percentage calculations.

**Do this instead:** Top-level peer key at `DataSchema` root, same placement as `netWorthHistory`.

---

### Anti-Pattern 2: Unifying property loans into the top-level liabilities list

**What people do:** Remove `outstandingLoanInr` from `PropertyItem` and mirror each property
loan as an entry in `data.liabilities`.

**Why it's wrong:** `sumPropertyInr()` computes equity = `agreementInr − outstandingLoanInr`.
Moving the loan breaks this equity calculation and would require `sumPropertyInr()` to look up
a matching liability entry by some external ID — there is no FK integrity in a flat JSON file.
The property row on the dashboard would revert to showing gross agreement value, not equity.

**Do this instead:** Keep the loan anchored on `PropertyItem` and enrich in place with `lender`
and `emiAmountInr`. `sumAllDebtInr()` in dashboardCalcs aggregates property loans and standalone
liabilities for the display-only "Total Debt" row without moving any data.

---

### Anti-Pattern 3: Changing `sumForNetWorth()` to subtract liabilities inline

**What people do:** Modify `sumForNetWorth(totals)` to accept liabilities and return true net
worth directly, saving a line at each call site.

**Why it's wrong:** `DashboardPage` uses the return value of `sumForNetWorth()` as the
denominator for per-row asset percentages. If the denominator becomes gross minus debt, the
percentages lose the invariant that they add to 100% (and can exceed 100% when debt is large).

**Do this instead:** Keep `sumForNetWorth()` unchanged as a gross-assets total. Introduce
`calcNetWorth(grossAssets, standaloneLiabilities)` as a separate, clearly-named function for
the headline display.

---

### Anti-Pattern 4: Skipping `ensureLiabilities()` migration function

**What people do:** Add `liabilities: z.array(LiabilityItemSchema)` to `DataSchema` as a
required field without injecting a default before `safeParse()`, assuming users will always
have fresh data.

**Why it's wrong:** `DataSchema` root uses `z.object()` without `.passthrough()`. An old
`data.json` missing the `liabilities` key fails `safeParse()`, triggering the "starting with
defaults" error path and clearing all of the user's displayed data (though it does not overwrite
their file until they save).

**Do this instead:** Add `ensureLiabilities()` to inject `liabilities: []` before `safeParse()`,
following the identical pattern as `ensureOtherCommodities()`. This keeps migration functions
consistent, separately testable, and guarantees old files always parse.

---

## Sources

- Direct inspection: `src/types/data.ts` — full schema
- Direct inspection: `src/lib/dashboardCalcs.ts` — all calc functions including `sumPropertyInr()`
- Direct inspection: `src/context/AppDataContext.tsx` — migration chain, `createInitialData()`
- Pattern reference: `src/pages/CommoditiesPage.tsx` — CRUD page template
- Pattern reference: `src/lib/__tests__/migration.test.ts` — migration test pattern
- Pattern reference: `src/lib/__tests__/dashboardCalcs.test.ts` — calc unit test pattern
- Context: `.planning/PROJECT.md` — v1.5 milestone goals and constraints

---
*Architecture research for: v1.5 Debt & Liabilities — Personal Wealth Tracker*
*Researched: 2026-05-01*
