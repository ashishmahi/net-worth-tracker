# Stack Research: v1.5 Debt & Liabilities

**Project:** Personal Wealth Tracker
**Researched:** 2026-05-01
**Confidence:** HIGH — all conclusions drawn from direct codebase inspection; no speculative library additions required

---

## Verdict: No new npm dependencies needed

Every capability required for debt/liability tracking already exists in the installed stack. This section documents each concern and which existing mechanism handles it.

---

## Existing Stack Coverage by Concern

### 1. Data Schema — Zod 4.3.x (already installed)

The existing pattern in `src/types/data.ts` is the exact model to follow:

- `BaseItemSchema` (uuid `id`, `createdAt`, `updatedAt`) — reuse as-is for each `LiabilityItem`
- `z.object({...})` with `z.string().min(1)` for label/lender, `z.number().nonnegative()` for balances and EMI — same field shapes as `PropertyItemSchema`
- `DataSchema` root needs a new top-level `liabilities` key (parallel to `assets`, not nested inside it — debts are not assets)

**New schema addition** (`src/types/data.ts`):

```typescript
export const LiabilityItemSchema = BaseItemSchema.extend({
  label: z.string().min(1),          // e.g. "Home Loan – HDFC"
  lender: z.string().optional(),     // e.g. "HDFC Bank"
  outstandingInr: z.number().nonnegative(),
  emiInr: z.number().nonnegative().optional(),
})

export const LiabilitiesSchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(LiabilityItemSchema),
})
```

Then in `DataSchema`:
```typescript
export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({ ... }),          // unchanged
  liabilities: LiabilitiesSchema,     // NEW — top-level, not inside assets
  netWorthHistory: z.array(NetWorthPointSchema),
})
```

The `PropertyItemSchema` also gains `lender` and `emiInr` fields for DEBT-01:
```typescript
export const PropertyItemSchema = BaseItemSchema.extend({
  ...existing fields...,
  hasLiability: z.boolean(),
  outstandingLoanInr: z.number().nonnegative().optional(),
  loanLender: z.string().optional(),   // NEW for DEBT-01
  loanEmiInr: z.number().nonnegative().optional(),  // NEW for DEBT-01
})
```

### 2. Migration — Pattern from `AppDataContext.tsx` (no new tools)

The established migration pattern is pure functions that transform `unknown → unknown` before `DataSchema.safeParse`. Add one more function in the chain:

```typescript
/** v1.5: inject empty liabilities block for pre-v1.5 data.json files */
export function ensureLiabilities(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  if (!('liabilities' in o) || o.liabilities === undefined) {
    return { ...o, liabilities: { updatedAt: nowIso(), items: [] } }
  }
  return raw
}
```

Chain: `migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → safeParse`

This function is exported so `migration.test.ts` can test it directly — same pattern as `ensureOtherCommodities`.

### 3. Calculation Utilities — `src/lib/financials.ts` and `dashboardCalcs.ts` (extend in-place)

No new libraries. Two additions to existing files:

**`src/lib/financials.ts`** — no changes needed; `roundCurrency` and `parseFinancialInput` cover all liability arithmetic.

**`src/lib/dashboardCalcs.ts`** — add:

```typescript
export function sumLiabilitiesInr(data: AppData): number {
  // standalone liabilities list
  const standaloneLiabilities = data.liabilities.items.reduce(
    (sum, item) => roundCurrency(sum + roundCurrency(item.outstandingInr)),
    0
  )
  // property liabilities (already deducted per-item in sumPropertyInr, so no double-count)
  return standaloneLiabilities
}

export function calcDebtToAssetRatio(totalDebt: number, grossAssets: number): number {
  if (grossAssets <= 0) return 0
  return roundCurrency((totalDebt / grossAssets) * 100)
}
```

Net worth formula change in `sumForNetWorth`:
- Current: sum of `CategoryTotals` (property already nets out its own loan via `sumPropertyInr`)
- After: `sumForNetWorth(totals) - sumLiabilitiesInr(data)` — standalone loans subtract from gross net worth

The dashboard needs two new derived values: `totalDebt` (property outstanding loans + standalone liabilities) and `debtToAssetRatio`. Both are pure arithmetic on existing data — no state, no hooks, no new libraries.

### 4. Forms — React Hook Form 7.x + Zod (already installed)

`CommoditiesPage.tsx` is the reference implementation: `useForm<FormValues>({ resolver: zodResolver(formSchema) })`. The liabilities page uses the identical pattern.

Form schema for a liability entry (local to the page file, same as commodities approach):

```typescript
const liabilityFormSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  lender: z.string().optional(),
  outstandingInr: z.string().min(1, 'Outstanding balance is required.'),
  emiInr: z.string().optional(),
})
```

String inputs parsed via `parseFinancialInput()` on submit — same as every other page.

### 5. UI Components — shadcn/ui (already installed, no new installs)

All needed components are installed:

| Component | Already in codebase | Used for |
|-----------|--------------------|----|
| `Sheet` / `SheetContent` / `SheetHeader` / `SheetFooter` | Yes — all asset pages | Add/edit liability slide-over |
| `Card` / `CardContent` | Yes | Liabilities list card |
| `Input` | Yes | label, lender, outstanding balance, EMI fields |
| `Label` | Yes | Field labels |
| `Button` | Yes | Add / Save / Delete |
| `Separator` | Yes | Between list items |
| `Switch` | Yes | Property "has home loan" toggle (already used) |
| `Table` / `TableBody` / etc. | Yes | Dashboard debt rows |
| `AlertDialog` | Yes | Not needed for basic CRUD (no irreversible action pattern here — delete is enough with a destructive button) |
| `Badge` | Yes | Optional: "Debt" label badge on liability items |

The `Trash2` and `Plus` icons from `lucide-react` are already imported on other pages. No additional Radix primitives or shadcn/ui components need installing.

### 6. Navigation — `AppSidebar.tsx` (extend in-place)

`AppSidebar.tsx` defines `SectionKey` as a union type and the nav items array. Add `'liabilities'` to the union and add a nav entry. The Landmark or `HandCoins` icon from `lucide-react` works — `lucide-react` is already at `^1.12.0` which includes both.

### 7. Persistence — Vite plugin `GET/POST /api/data` (unchanged)

`saveData(nextData)` in `AppDataContext` does a full-document `POST /api/data`. Adding a `liabilities` key to the document requires no plugin changes — the plugin passes the JSON body through verbatim. The `createInitialData()` function needs updating to include an empty `liabilities` block.

### 8. Tests — Vitest (already installed)

Follow the test file pattern in `src/lib/__tests__/migration.test.ts` and `schema.test.ts`:

- `migration.test.ts` — add tests for `ensureLiabilities` (same pattern as `ensureOtherCommodities` tests)
- `schema.test.ts` — add `LiabilityItemSchema` validation tests (required fields, optional fields, negative balance rejection)
- `dashboardCalcs.test.ts` — add tests for `sumLiabilitiesInr` and `calcDebtToAssetRatio`

No new test tooling needed.

---

## What NOT to Add

| Temptation | Why to skip |
|---|---|
| A debt-specific calculation library | All loan math needed is: `sum(outstandingInr)`, `totalDebt / grossAssets * 100`, and `grossAssets - totalDebt`. The existing `roundCurrency` + plain arithmetic is sufficient. No amortisation schedule, no compound interest projection in v1.5 scope. |
| `@radix-ui/react-progress` for a debt ratio bar | A plain Tailwind `div` with `style={{ width: \`${ratio}%\` }}` on a colored container is the shadcn/ui pattern for progress indicators; the full Radix primitive isn't needed for a display-only ratio bar. |
| A separate "loans" data service / API route | The existing single-document `POST /api/data` pattern handles all persistence. Introducing a separate endpoint would break the "one JSON file" invariant. |
| `immer` for immutable state updates | The existing spread-to-update pattern (`{ ...data, liabilities: { ...data.liabilities, items: nextItems } }`) is used throughout and is fine at this data volume. |
| `date-fns` for EMI date tracking | No date-based EMI features are in v1.5 scope. Outstanding balance is a point-in-time number the user updates manually, same as every other value in the app. |
| A `LiabilityContext` | The existing `AppDataContext` already provides `data` and `saveData`. A separate context would be unnecessary layering for a list that's structurally identical to `otherCommodities`. |

---

## Integration Points Summary

| Concern | File to change | Type of change |
|---------|---------------|---------------|
| Zod schema + TypeScript types | `src/types/data.ts` | Add `LiabilityItemSchema`, `LiabilitiesSchema`; extend `PropertyItemSchema`; add `liabilities` to `DataSchema` root |
| Migration function | `src/context/AppDataContext.tsx` | Add `ensureLiabilities()`, add to chain in `parseAppDataFromImport` and boot load |
| `createInitialData()` | `src/context/AppDataContext.tsx` | Add `liabilities: { updatedAt: nowIso(), items: [] }` to initial document |
| Calculation utilities | `src/lib/dashboardCalcs.ts` | Add `sumLiabilitiesInr()`, `calcDebtToAssetRatio()`; update `sumForNetWorth` signature if needed |
| New page | `src/pages/LiabilitiesPage.tsx` | New file — follows `CommoditiesPage.tsx` structure |
| Dashboard debt rows | `src/pages/DashboardPage.tsx` | Add Total Debt row and Debt-to-Asset ratio after net worth total |
| Property form enrichment | `src/pages/PropertyPage.tsx` | Add lender + EMI fields inside the `hasLiability` conditional section |
| Navigation | `src/components/AppSidebar.tsx` | Add `'liabilities'` to `SectionKey`, add nav item |
| App routing | `src/App.tsx` | Add `case 'liabilities': return <LiabilitiesPage />` |
| Tests | `src/lib/__tests__/migration.test.ts`, `schema.test.ts`, `dashboardCalcs.test.ts` | New test cases for new functions/schemas |

---

## Version Compatibility

All existing packages are compatible. No version changes needed.

| Package | Installed version | Relevance | Notes |
|---------|------------------|-----------|-------|
| `zod` | `^4.3.6` | Schema definition | Discriminated unions not needed for liabilities (simpler flat schema) |
| `react-hook-form` | `^7.73.1` | Liability form | `zodResolver` from `@hookform/resolvers` already installed |
| `@hookform/resolvers` | `^5.2.2` | RHF+Zod bridge | Already in use on `CommoditiesPage` |
| `lucide-react` | `^1.12.0` | Nav icon | `HandCoins` or `Landmark` available in this version |
| `recharts` | `^2.15.4` | No change needed | Dashboard chart not affected |

---

## Installation

```bash
# No new packages required.
# All debt/liability work is new files + modifications to existing files.
```

---

## Sources

- Direct codebase inspection: `src/types/data.ts`, `src/lib/dashboardCalcs.ts`, `src/lib/financials.ts`, `src/context/AppDataContext.tsx`, `src/pages/CommoditiesPage.tsx`, `src/pages/PropertyPage.tsx`, `src/pages/DashboardPage.tsx`, `package.json`
- Established migration pattern confirmed from `src/lib/__tests__/migration.test.ts`
- Schema pattern confirmed from `src/lib/__tests__/schema.test.ts`

---
*Stack research for: v1.5 Debt & Liabilities — Personal Wealth Tracker*
*Researched: 2026-05-01*
