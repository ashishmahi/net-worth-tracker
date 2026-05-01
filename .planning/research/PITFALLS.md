# Pitfalls Research

**Domain:** Adding debt/liability tracking to an existing personal finance app (partial liability already present — property only)
**Researched:** 2026-05-01
**Confidence:** HIGH — based on direct code inspection of `dashboardCalcs.ts`, `data.ts`, `AppDataContext.tsx`, `DashboardPage.tsx`

---

## Critical Pitfalls

### Pitfall 1: Double-Counting Property Debt in Net Worth

**What goes wrong:**
`sumPropertyInr()` in `dashboardCalcs.ts` already nets out the property liability. It subtracts `outstandingLoanInr` from `agreementInr` when `hasLiability` is true, returning equity rather than gross value. If v1.5 also introduces a standalone `liabilities` list and a user enters their home loan in both the Property section's liability toggle AND the new Liabilities page, the same debt is subtracted twice. Net worth drops by double the loan balance with no error shown.

**Why it happens:**
The two entry points look independent to the user. The Property form has a "Liability" toggle that sets `outstandingLoanInr` on that property item. The new Liabilities page is a separate form with its own list. Without an explicit guardrail, a thorough user filling in "all debts" enters the home loan in both places. This is the single most likely mistake for first-time users of v1.5.

**How to avoid:**
1. Keep `sumPropertyInr()` returning equity as-is (property already nets its own loan). Do not change this function.
2. Add a new `calcTotalStandaloneDebt(data)` that sums only `data.liabilities.items[n].outstandingBalance`. This pool is completely separate from property.
3. Net worth formula: `grossNetWorth = sumForNetWorth(categoryTotals) - calcTotalStandaloneDebt(data)`. The property liability is already embedded in the `property` category total; only standalone debt is subtracted on top.
4. In the Liabilities page UI, add visible inline copy: "For a home loan on a tracked property, use the Liability toggle on that property — entering it here too will double-count."
5. In the Dashboard Total Debt row, show the breakdown: "Property loans: X | Other loans: Y" so the user can self-audit.

**Warning signs:**
- Net worth on Dashboard is significantly lower than expected immediately after adding standalone liabilities
- Total Debt row value is larger than any individual loan visible in either the Property or Liabilities page

**Phase to address:**
DEBT-03 (net worth formula). Define the formula precisely and write a unit test before building any UI: one property item with `outstandingLoanInr = 500000` + zero standalone liabilities must produce the same net worth as the current v1.4 output.

---

### Pitfall 2: Snapshot Backward Compatibility — Old `totalInr` Values Are Semantically Ambiguous After v1.5

**What goes wrong:**
All existing `netWorthHistory` entries store `totalInr` computed by `sumForNetWorth(totals)` which calls `sumPropertyInr()`. Those snapshots already deduct property loans (equity is stored, not gross). When v1.5 changes the net worth formula to also subtract standalone liabilities, old snapshots were recorded under the pre-v1.5 formula. The chart will show a discontinuity at the v1.5 adoption point that looks like a sudden drop in wealth — even if the user's actual financial position is unchanged.

**Why it happens:**
`NetWorthPointSchema` stores only `{ recordedAt, totalInr }` with no formula version metadata. At render time there is no way to know whether a historical snapshot included standalone liabilities or not.

**How to avoid:**
1. Do not retroactively alter existing snapshot values. Old entries are immutable history — the established pattern in this codebase (`ensureNetWorthHistory`, `ensureOtherCommodities`) is additive-only. Follow the same discipline.
2. Accept the discontinuity as legitimate data. The chart drop at v1.5 is real: past snapshots did not capture all debt.
3. Optionally, add a `formulaVersion: z.number().int().optional()` field to `NetWorthPointSchema` (e.g., `1` = pre-v1.5 assets-only, `2` = full liabilities included). This costs one schema field and enables future chart annotations or tooltips explaining the change.
4. A UI note on the chart ("Liabilities tracking added — older snapshots may not reflect all debts") is the minimum user-facing mitigation.

**Warning signs:**
- A migration function that re-computes or modifies existing `netWorthHistory[n].totalInr` values
- A sharp unexplained drop in the chart at the v1.5 upgrade date

**Phase to address:**
DEBT-05 (migration). The `ensureLiabilities()` migration function must only add the new `liabilities` key with empty items — it must not touch `netWorthHistory`. Document the formula-change discontinuity explicitly in code comments.

---

### Pitfall 3: Migration Gaps — `outstandingLoanInr` Is Already Optional and New Enrichment Fields Must Follow the Same Pattern

**What goes wrong:**
`PropertyItemSchema` already has `outstandingLoanInr: z.number().nonnegative().optional()`. If v1.5 enriches the property liability with additional fields (`lenderName`, `emiInr`) without careful schema design, two problems arise: (a) existing `data.json` files with `outstandingLoanInr` set but no `lenderName` will fail `DataSchema.safeParse()` if the new fields are required, breaking the entire load; (b) the `parseAppDataFromImport` chain must be extended but a missing step will silently fall through to the schema error path.

**Why it happens:**
Adding required fields to an existing optional sub-object is the most common migration error. The developer adds `lenderName: z.string().min(1)` without making it `.optional()`, or forgets to chain a migration step before `safeParse()` that backfills the field for existing records.

**How to avoid:**
1. Any new fields on `PropertyItemSchema` (lenderName, emiInr) must be `.optional()`, OR the migration must backfill them for all existing property items before `DataSchema.safeParse()` runs.
2. Add the migration step inside `parseAppDataFromImport()` in `AppDataContext.tsx`, chained in order before `safeParse()`: `migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → safeParse`.
3. Guard debt math against missing enrichment fields: `lenderName` and `emiInr` are display-only and must never enter net worth calculations. Only `outstandingLoanInr` (property) and `outstandingBalance` (standalone) affect numbers.

**Warning signs:**
- `DataSchema.safeParse()` failing on load for users upgrading from v1.4
- `loadError` state appearing immediately after upgrading with existing data

**Phase to address:**
DEBT-05 (migration + schema). Write a test using a real v1.4 `data.json` fixture that has `hasLiability: true` and `outstandingLoanInr` set, and confirm it passes the full migration chain without errors.

---

### Pitfall 4: Debt-to-Asset Ratio Division by Zero and Negative Net Worth

**What goes wrong:**
The Dashboard debt insight will compute `Debt-to-Asset Ratio = totalDebt / grossAssets`. Two edge cases cause failures: (a) `grossAssets` is zero — user with liabilities but no assets — resulting in `Infinity` or `NaN`; (b) net worth is negative because debt exceeds assets, and `NetWorthPointSchema.totalInr` has `.nonnegative()` which will reject snapshot recording when this happens.

The existing `percentOfTotal()` function guards `grandTotal <= 0` but a new ratio function written separately may not replicate the guard. Display code formatting `Infinity` as a percentage string will crash or render "Infinity%".

**Why it happens:**
Standard arithmetic oversight. The existing guard in `dashboardCalcs.ts` (`if (grandTotal <= 0) return 0`) is in one function; a new `calcDebtToAssetRatio` function written in a different pass may not copy it.

**How to avoid:**
1. Define `calcDebtToAssetRatio(totalDebt: number, grossAssets: number): number` in `dashboardCalcs.ts` alongside the other calc functions. Guard: `if (grossAssets <= 0 || totalDebt <= 0) return 0`.
2. Use `grossAssets` (sum of raw category values before subtracting standalone debt) as the denominator, not `grandTotal`. Gross assets remain positive even when net worth is negative.
3. In Dashboard component: display "—" when the ratio is 0 and there are no debts; display the ratio when 0 means debts exactly equal assets.
4. Remove `.nonnegative()` from `NetWorthPointSchema.totalInr` — a snapshot of negative net worth is a valid financial state. Replace with `z.number()`.

**Warning signs:**
- Console errors: `NaN` or `Infinity` appearing after adding a loan larger than total assets
- Snapshot recording fails with a Zod error when net worth goes negative

**Phase to address:**
DEBT-04 (dashboard insights). Include unit tests: `calcDebtToAssetRatio(500000, 0)` → 0; `calcDebtToAssetRatio(0, 1000000)` → 0; `calcDebtToAssetRatio(500000, 1000000)` → 0.5.

---

### Pitfall 5: UX Confusion Between Property Liability Toggle and Standalone Liabilities Page

**What goes wrong:**
After v1.5 ships, a user with a home loan sees two places to record it: the Property section's "Liability" toggle (contextual, next to the property it belongs to) and the new Liabilities page (appears to be the authoritative "all debts" view). Without guidance, the user will either: (a) enter the loan in both places (double-counting, Pitfall 1 above); or (b) remove it from the Property toggle and re-enter it on the Liabilities page, causing the Property row to spike to its full `agreementInr` value while the net worth temporarily jumps before the standalone entry is saved.

**Why it happens:**
The existing property liability is embedded in an asset form — it is not mentally in the "liabilities" category. The new Liabilities page introduces a competing mental model: "I should track all my debts in one place."

**How to avoid:**
1. Liabilities page: add inline contextual copy — "For a home loan on a tracked property, use the Liability toggle on that property. Adding it here too will double-count it in your net worth."
2. Property form liability section: add a sub-label — "This loan is tracked against this property. You do not need to add it to the Liabilities page."
3. Dashboard Total Debt row: show a labelled breakdown of property loans vs. other loans so users can identify duplication.
4. Long-term (future milestone): unify property liability into the liabilities schema so there is only one entry point. Do not attempt this in v1.5 — it requires migrating and re-linking existing data.

**Warning signs:**
- User reports "net worth halved after entering liabilities"
- Property row on Dashboard shows full agreement value while the same loan appears in the standalone liabilities list

**Phase to address:**
DEBT-02 (Liabilities page UI). The UX copy is part of the definition of done for the page, not a polish task. Verify it is present before marking DEBT-02 complete.

---

### Pitfall 6: `createInitialData()` Does Not Initialize the New `liabilities` Key

**What goes wrong:**
`createInitialData()` in `AppDataContext.tsx` is the source for first load, failed parse, and user-initiated data reset. If `liabilities` is added to `DataSchema` but not to `createInitialData()`, the reset path produces an object that fails `DataSchema.safeParse()`. The app enters the error state immediately after the user confirms "clear all data" — an especially bad failure because the user just intentionally wiped their data.

**Why it happens:**
`DataSchema` is defined in `src/types/data.ts` and `createInitialData()` is in `src/context/AppDataContext.tsx`. They are updated independently. Every prior version (netWorthHistory in v1.3, otherCommodities in v1.4) required manual updates to both files. Missing one is the most common oversight in this codebase's pattern.

**How to avoid:**
1. After every schema change, search for `createInitialData` and update it to include the new field with its empty default value.
2. Add (or extend) the test: `expect(DataSchema.safeParse(createInitialData()).success).toBe(true)`. This test already covers v1.4 shapes; it must pass for v1.5 shapes too.

**Warning signs:**
- Zod errors immediately after data reset: "Required" or "Invalid type" on `liabilities`
- `loadError` state shows right after the user confirms the danger-zone reset

**Phase to address:**
DEBT-05 (schema + migration). Treat `createInitialData()` update as a hard checklist item alongside every `DataSchema` change — not optional.

---

### Pitfall 7: `noHoldingsYet()` Gating Logic Excludes Liabilities

**What goes wrong:**
`noHoldingsYet()` in `DashboardPage.tsx` checks all asset fields to decide whether to show the "No holdings yet" empty state. After v1.5, a user who has entered debts but no assets sees "No holdings yet" even though they have outstanding loans tracked. The net worth could display as 0 (or negative if negative net worth is implemented) while the page shows a "start adding assets" prompt — wrong and confusing.

A secondary issue: `NetWorthPointSchema.totalInr: z.number().nonnegative()` will reject recording a snapshot when net worth is negative (more debt than assets). The "Record snapshot" button will appear enabled but the save will fail Zod validation.

**Why it happens:**
The function was written when only assets existed. The `.nonnegative()` constraint was correct in a world with no liabilities but becomes wrong once debt can exceed assets.

**How to avoid:**
1. Extend `noHoldingsYet()` (or rename it to `hasNothingToDisplay()`) to also check `data.liabilities?.items?.length === 0` or equivalent.
2. Change `NetWorthPointSchema.totalInr` from `z.number().nonnegative()` to `z.number()` — negative net worth is a valid financial state that should be recordable.

**Warning signs:**
- Dashboard shows "No holdings yet" when liabilities exist but no assets
- Snapshot recording silently fails for users with more debt than assets

**Phase to address:**
DEBT-04 (dashboard insights). Check both `noHoldingsYet()` and `NetWorthPointSchema.totalInr` — both require updates.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep property liability embedded in `PropertyItemSchema` rather than unifying it with the standalone liabilities list | No migration complexity in v1.5; Property UI unchanged | Two code paths aggregating total debt forever; debt display logic must aggregate from two sources | Acceptable in v1.5 — unification is a future milestone concern |
| Store `totalInr` in snapshots without formula version metadata | Simpler `NetWorthPointSchema` | Unexplained chart discontinuity at v1.5 adoption; no recovery for old snapshots | Acceptable only if a UI chart annotation is added |
| New property liability enrichment fields (`lenderName`, `emiInr`) as `.optional()` | No migration function needed for existing property items | Null-checks scattered through display code | Acceptable — follows the established pattern for this codebase |
| EMI field stored but not used in net worth calculation | Consistent data model for future cash-flow features | Risk of a future developer accidentally including EMI in debt totals | Acceptable — must be documented clearly in the calc functions |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `dashboardCalcs.calcCategoryTotals` | Adding standalone debt subtraction inside the existing function so the returned `property` total changes | Add a new `calcTotalStandaloneDebt(data)` function; subtract it in `sumForNetWorth` or at the Dashboard consumer level, separate from `calcCategoryTotals` |
| `parseAppDataFromImport` migration chain | Placing `ensureLiabilities` after `DataSchema.safeParse()` instead of before it | Chain order must be: `migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → safeParse` |
| `DataSchema` root structure | Adding `liabilities` inside `assets` (parallel to `property`) | `liabilities` is a peer of `assets` at the root level: `{ version, settings, assets: {...}, liabilities: {...}, netWorthHistory }` — it is not an asset class |
| Snapshot `handleRecordSnapshot` in `DashboardPage` | Computing `totalInr` from old `sumForNetWorth(totals)` only, forgetting to subtract standalone debt | After v1.5, snapshot `totalInr` must equal the displayed net worth figure — derive it from the same expression used in the Dashboard heading |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No guidance distinguishing property liability from standalone liabilities | User double-counts home loan; net worth is wrong by the full loan amount | Inline copy in both the Liabilities page and the Property liability section, each pointing to the other |
| Total Debt row on Dashboard shows a single opaque number | User cannot self-audit for accidental double-counting | Show labelled sub-breakdown: "Property loans: X | Other loans: Y" |
| Debt-to-Asset ratio displayed as "0%" when ratio is genuinely very small | Looks like "no debt" — misleading | Show one decimal place (e.g. "0.5%"); show "—" only when there is literally zero debt |
| EMI field treated as part of outstanding balance in net worth math | Incorrect double-deduction; EMI is a future payment, not current debt above the outstanding balance | EMI is display-only (cash-flow context); only `outstandingBalance` (standalone) and `outstandingLoanInr` (property) enter net worth math |

---

## "Looks Done But Isn't" Checklist

- [ ] **Net worth formula:** `property` category total already nets property equity; standalone liabilities are subtracted separately — verify no double-subtraction with a manual calculation against known values
- [ ] **`createInitialData()`:** Returns a `liabilities` key with `{ updatedAt, items: [] }` — verify `DataSchema.safeParse(createInitialData()).success === true`
- [ ] **Migration chain:** `ensureLiabilities` runs before `safeParse` in `parseAppDataFromImport` — verify a v1.4 fixture file (with and without property liability) loads without errors
- [ ] **Reset parity:** After data reset, `data.liabilities.items` is an empty array, not `undefined` — verify the Liabilities page does not crash on first render after reset
- [ ] **Snapshot recording:** `handleRecordSnapshot` computes `totalInr` equal to the displayed Dashboard net worth (including standalone debt subtraction) — verify the recorded value matches what the user sees
- [ ] **Negative net worth allowed:** `NetWorthPointSchema.totalInr` changed from `.nonnegative()` to `z.number()` — verify snapshot recording succeeds when total debt exceeds total assets
- [ ] **Division by zero guard:** `calcDebtToAssetRatio(x, 0)` returns 0, not `NaN` or `Infinity` — verify with unit test
- [ ] **EMI excluded from net worth:** `emiInr` / `emiAmount` fields are stored and displayed but not subtracted anywhere in `dashboardCalcs` — grep for `emi` across `dashboardCalcs.ts` to confirm

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double-counting discovered after snapshots recorded | MEDIUM | Fix formula in code; old snapshots remain as-is (show inflated past values); user records a new corrective snapshot; chart will show a step-change |
| `createInitialData()` missing `liabilities` after data reset | LOW | Update function, restart dev server; no data to recover since reset already wiped everything |
| Migration failed; `data.json` unreadable after upgrade | HIGH | User restores from JSON export backup; emphasise export-before-upgrade prompt in Settings; no automated recovery path |
| User duplicated home loan across Property toggle and Liabilities page | LOW | User deletes one entry; net worth self-corrects; UX copy prevents recurrence |
| `NetWorthPointSchema.totalInr` rejects negative value during snapshot | LOW | Change `.nonnegative()` to `z.number()`; re-deploy; no data migration needed since old snapshots are already non-negative |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Double-counting property debt (Pitfall 1) | DEBT-03 — net worth formula in `dashboardCalcs.ts` | Unit test: property item with loan + zero standalone liabilities → identical net worth to v1.4 |
| Snapshot backward compatibility (Pitfall 2) | DEBT-05 — migration function | Migration test: v1.4 fixture with `netWorthHistory` entries loads; those entries are untouched |
| Migration gaps in `PropertyItemSchema` enrichment (Pitfall 3) | DEBT-05 — schema + migration | Integration test: v1.4 `data.json` with `hasLiability: true` and `outstandingLoanInr` loads cleanly through full migration chain |
| Division by zero and negative net worth (Pitfall 4) | DEBT-04 — dashboard insights + schema | Unit tests for `calcDebtToAssetRatio`; Zod test that negative `totalInr` is accepted |
| UX confusion between two liability entry points (Pitfall 5) | DEBT-02 — Liabilities page UI | Manual review: inline disambiguation copy present in both Property form and Liabilities page |
| `createInitialData()` missing new key (Pitfall 6) | DEBT-05 — schema | Automated: `DataSchema.safeParse(createInitialData())` in test suite must pass |
| `noHoldingsYet()` incomplete gating (Pitfall 7) | DEBT-04 — dashboard insights | Manual test: add a loan with no assets → Dashboard shows debt rows, not the empty state |

---

## Sources

- Direct code inspection: `src/lib/dashboardCalcs.ts` — `sumPropertyInr()` nets equity; `sumForNetWorth()` iterates `DASHBOARD_CATEGORY_ORDER` (assets only, no liabilities subtraction yet); `percentOfTotal()` guards `grandTotal <= 0`
- Direct code inspection: `src/types/data.ts` — `PropertyItemSchema.outstandingLoanInr` is `.optional()`; `NetWorthPointSchema.totalInr` is `.nonnegative()`; `DataSchema` root structure (assets, settings, netWorthHistory — no liabilities key)
- Direct code inspection: `src/context/AppDataContext.tsx` — migration chain pattern (`migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → safeParse`); `createInitialData()` factory; `parseAppDataFromImport()` as the single path for both boot and import
- Direct code inspection: `src/pages/DashboardPage.tsx` — `noHoldingsYet()` (assets only); `handleRecordSnapshot()` uses `sumForNetWorth(totals)`; `canRecordSnapshot` gating logic
- Project history: `.planning/PROJECT.md` — v1.3 net worth history schema, v1.4 commodities migration pattern, v1.5 active requirements (DEBT-01 through DEBT-05)

---

*Pitfalls research for: debt & liability tracking added to existing personal finance app (v1.5)*
*Researched: 2026-05-01*
