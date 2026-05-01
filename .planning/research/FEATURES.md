# Feature Research

**Domain:** Debt & Liability tracking in a personal net worth tracker (v1.5 milestone)
**Researched:** 2026-05-01
**Confidence:** HIGH (milestone scope fixed in PROJECT.md; patterns verified against Monarch/Kubera/YNAB + existing codebase direct inspection)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a debt tracker must have to feel complete. Missing any means the feature is broken or actively misleading.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Loan entry: label + lender + outstanding balance | Every net worth tracker (Monarch, Kubera, YNAB) treats these three fields as the minimum useful loan record | LOW | `label` = "Home Loan - Lodha"; `lender` = "SBI"; `outstandingBalanceInr` in INR |
| Loan entry: EMI amount | Users need to know monthly cash outflow; it is the most-referenced loan figure in day-to-day finance | LOW | Store as `emiInr`; display in list card; no payoff projection in v1.5 |
| Standalone liabilities list CRUD | Add / edit / delete loans independent of property assets; every tracker has a dedicated liabilities section | MEDIUM | Sheet slide-in for add/edit; card list with edit/delete icons; matches existing Commodities and Property page conventions already in this codebase |
| Net worth = gross assets − total debt | The core accounting identity; showing gross assets only once a liabilities section exists is actively misleading | LOW (calc) / MEDIUM (wiring) | `sumForNetWorth` must subtract `sumTotalDebt()`; property equity already nets `outstandingLoanInr`; standalone liabilities subtract from the gross sum |
| Property liability enrichment | Existing `hasLiability` toggle already captures `outstandingLoanInr`; users with home loans also need lender name and EMI alongside the balance | LOW | Additive schema change: `lender?: string` and `emiInr?: number` added to `PropertyItemSchema` (both optional, Zod already uses `.optional()` for this field style) |
| Dashboard: Total Debt row | All major net worth apps show a single aggregated liabilities figure on the summary; absence creates a blind spot | LOW | Sum of property outstanding loans (hasLiability items) + all standalone liability outstanding balances |
| Dashboard: Debt-to-Asset ratio | Standard leverage metric; shows financial risk at a glance without requiring the user to divide manually | LOW (calc) | `totalDebt / grossAssets × 100`; display as percentage to one decimal place; show "—" when grossAssets is 0 |
| Data migration: existing data loads cleanly | Without migration, any user opening the app post-update sees schema errors or broken state | MEDIUM | `liabilities` array defaults to `[]`; `PropertyItem` lender/EMI fields default to `undefined` (additive Zod change; existing records pass validation unchanged) |
| Import/reset parity | JSON import and Settings "Reset all data" must handle the new `liabilities` key the same way other sections do | LOW | Import: `DataSchema` validation covers it once schema is updated; reset: `createInitialData()` needs `liabilities: []` |

### Differentiators (Valuable Beyond the Minimum)

Features that make the debt section meaningfully more useful without scope creep.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Loan type tag (home / car / personal / other) | Lets users distinguish loan categories at a glance in the list; enables future per-type subtotals with near-zero current cost | LOW | `loanType: 'home' \| 'car' \| 'personal' \| 'other'`; displayed as a shadcn Badge in the card row |
| Net worth breakdown: Gross Assets / Total Debt / Net Worth | Three-line breakdown above category rows makes the debt deduction visible and understandable; Monarch and PocketSmith both use this layout | LOW | Three stacked summary rows before category detail rows; no new data needed; reuses existing calc values |
| Empty state with call-to-action on Liabilities page | First-time experience: blank list with "No liabilities yet. Add your first loan." + Add button | LOW | Already a convention in this codebase (CommoditiesPage); copy-forward pattern |
| Property loan annotation on dashboard row | Property row already shows equity; a small "(loan: ₹X)" annotation makes the deduction transparent without requiring the user to visit the Property page | LOW | Optional line below property total row; uses `outstandingLoanInr` already computed in `sumPropertyInr()` |

### Anti-Features (Avoid These)

Features that appear valuable but add disproportionate complexity for this milestone.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Payoff projection / amortization schedule | Users naturally want to know when they'll be debt-free | Requires interest rate, disbursement date, and tenure — 4+ new required fields per loan; turns a tracker into a calculator; high edge-case surface (partial prepayment, rate changes, variable rates) | Store EMI for cash-flow awareness; defer payoff projection to a dedicated future milestone |
| Interest rate field | Useful for comparing loan costs | Many users do not know their exact rate off the top of their head; a required field that blocks quick entry defeats the purpose of a fast manual tracker | Omit in v1.5; EMI captures payment impact without requiring a rate figure |
| Credit card tracking | Covers revolving debt | Fundamentally different payment model — statement cycle, minimum payment, credit utilisation; needs separate UX from installment loans | Explicitly out of scope per PROJECT.md; a separate milestone if desired |
| Multi-currency loans (AED-denominated) | AED bank accounts are already supported in this app | Outstanding loan balances are almost universally in INR for the target user (India-based); AED loan is a rare edge case that would complicate every debt calculation | Keep `outstandingBalanceInr` in INR only; user can convert manually if needed |
| Automatic balance sync for loan balances | Would eliminate manual updates | Requires OAuth + banking API (Plaid, Salt Edge, or AA framework); fundamentally incompatible with the local-only, no-backend architecture of v1.x | Manual entry with `updatedAt` timestamp so the user can see data staleness |
| Per-loan debt-to-asset ratio | Granular insight per loan | The aggregate dashboard ratio is the actionable metric; per-loan ratios add noise with no decision-making benefit | Single aggregate debt-to-asset ratio on dashboard |

---

## Feature Dependencies

```
[Standalone Liabilities CRUD]
    └──requires──> [DataSchema: liabilities array + LiabilityItemSchema]
                       └──requires──> [Data migration: liabilities:[] default on load]
                                          └──requires──> [createInitialData() + import/reset parity]

[Dashboard: Total Debt row]
    └──requires──> [sumTotalDebt() in dashboardCalcs.ts]
                       └──requires──> [DataSchema with liabilities]

[Dashboard: Debt-to-Asset ratio]
    └──requires──> [Dashboard: Total Debt row]
    └──requires──> [Gross assets sum before deduction (sumForNetWorth() pre-v1.5 value)]

[Net worth = assets − total debt]
    └──requires──> [sumTotalDebt()]
    └──enhances──> [existing sumForNetWorth()]

[Property liability enrichment (lender, EMI)]
    └──enhances──> [existing PropertyItem hasLiability / outstandingLoanInr]
    └──requires──> [PropertyItemSchema additive update (optional fields only)]
    (independent of standalone liabilities CRUD — can land in same schema phase)

[Loan type tag Badge]
    └──enhances──> [Standalone Liabilities CRUD]
    └──no hard dependency — addable or omittable without blocking anything]

[Net worth history snapshots (existing v1.3 feature)]
    └──auto-updated──> [once sumForNetWorth() subtracts debt, new snapshots reflect net worth correctly]
    (no new snapshot work needed — the subtraction flows through the existing snapshot path)
```

### Dependency Notes

- **Schema before everything:** The `liabilities` key must exist on `DataSchema` and `createInitialData()` before the Liabilities page or dashboard debt row can be wired. Phase ordering: data model + migration first, then CRUD UI, then dashboard wiring.
- **sumTotalDebt() is the central dependency:** `dashboardCalcs.ts` currently deducts property `outstandingLoanInr` inline inside `sumPropertyInr()` (net equity). For v1.5, property outstanding loans must also feed into a new `sumTotalDebt()` that adds standalone liabilities. `sumPropertyInr()` continues to return equity (unchanged); the debt sum is computed separately for the dashboard Total Debt row and the net worth subtraction.
- **Property liability enrichment is fully independent:** Adding `lender` and `emiInr` to `PropertyItem` is an additive Zod change (both optional) that can be done in the same schema migration phase without touching the liabilities list at all.
- **Debt-to-asset ratio requires gross assets:** Gross assets = `sumForNetWorth(totals)` computed with the pre-deduction asset sum. The ratio must use the pre-deduction value to avoid circular dependency. Store gross assets as a separate variable before subtracting debt.
- **Net worth history snapshots are automatically correct:** Once `sumForNetWorth()` subtracts debt, any new snapshot recorded via the existing "Record Snapshot" flow captures post-deduction net worth. Historical snapshots are unaffected (they were recorded before liabilities existed). No snapshot migration needed.

---

## MVP Definition

This is an existing app adding a capability. "MVP" here means the minimum that makes debt tracking correct and non-misleading.

### v1.5 Launch With

- [ ] `LiabilityItemSchema` — `id` (UUID), `label`, `lender`, `outstandingBalanceInr`, `emiInr`, `loanType`, `createdAt`, `updatedAt`
- [ ] `DataSchema` updated: `liabilities: z.array(LiabilityItemSchema)` at root level alongside `assets`
- [ ] Migration: `liabilities: []` default on load; `PropertyItem` lender + EMI fields default to `undefined` (Zod additive)
- [ ] `createInitialData()` updated to include `liabilities: []`
- [ ] Liabilities page — Sheet-based CRUD; card list with edit/delete; empty state with Add CTA
- [ ] Property page — lender + EMI fields rendered when `hasLiability` switch is on
- [ ] `sumTotalDebt(data)` in `dashboardCalcs.ts` — sum of all `outstandingBalanceInr` across property `hasLiability` items + standalone liabilities
- [ ] `sumForNetWorth()` updated to subtract `sumTotalDebt(data)`
- [ ] Dashboard: Total Debt row + Debt-to-Asset ratio (one decimal %)
- [ ] Import + reset parity verified in tests

### Add After Validation

- [ ] Gross / Debt / Net three-line summary breakdown on dashboard — low cost, adds clarity once users have loans to see
- [ ] Property loan annotation on the dashboard property row

### Future Consideration (v2+)

- [ ] Payoff projection — only when users request it; requires interest rate + tenure + disbursement date; separate milestone
- [ ] Credit card liability tracking — different UX model; separate milestone
- [ ] Automatic balance sync via Account Aggregator — requires backend, auth, infrastructure

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| LiabilityItemSchema + migration | HIGH | LOW | P1 |
| Standalone liabilities CRUD | HIGH | MEDIUM | P1 |
| Property: lender + EMI fields | MEDIUM | LOW | P1 |
| sumTotalDebt() + net worth deduction | HIGH | LOW | P1 |
| Dashboard Total Debt row | HIGH | LOW | P1 |
| Dashboard Debt-to-Asset ratio | MEDIUM | LOW | P1 |
| Import/reset parity | HIGH | LOW | P1 |
| Loan type tag (Badge) | MEDIUM | LOW | P2 |
| Gross/Debt/Net three-line dashboard breakdown | MEDIUM | LOW | P2 |
| Property loan annotation on dashboard row | LOW | LOW | P3 |
| Payoff projection | MEDIUM | HIGH | Deferred |
| Interest rate field | LOW | LOW | Deferred |

**Priority key:**
- P1: Required for a correct, shippable v1.5
- P2: Adds clarity at low cost; include if time allows
- P3: Nice to have; no risk to include
- Deferred: Out of scope for v1.5

---

## Competitor Feature Analysis

| Feature | Monarch Money | Kubera | YNAB | This App v1.5 |
|---------|--------------|--------|------|---------------|
| Liability entry fields | Label, account type, balance (auto-synced from bank) | Label, value, currency, institution (manual or connected) | Account name, balance (manual or synced) | Label, lender, outstanding balance INR, EMI, loan type — fully manual, INR only |
| Net worth formula | Assets − Liabilities (dashboard header) | Assets − Liabilities with per-category breakdown | Assets − Liabilities across all linked accounts | Gross assets − total debt; property equity already net; standalone liabilities deducted separately |
| Debt metric on dashboard | Net worth figure; ratio in custom reports | "Liabilities / Assets %" shown on balance sheet view | Net worth figure; no standalone ratio | Total Debt row + Debt-to-Asset % shown directly on main dashboard |
| Liability CRUD UX | Via account connection (mostly automatic); manual add also available | Manual entry per liability card | Manual account add | Sheet slide-in (matches existing Commodities/Property pattern in this codebase) |
| Loan type grouping | By account type (mortgage, student loan, etc.) | Free-form label | Free-form label | `loanType` enum: home / car / personal / other; displayed as Badge |
| Property loan linkage | Property asset + mortgage liability tracked as separate accounts; equity computed externally | Separate cards for asset and liability; net equity manual | Property asset + mortgage = two separate accounts | Property item has `hasLiability` + `outstandingLoanInr` already (v1.0); v1.5 enriches with `lender` + `emiInr` |

---

## Existing Codebase Integration Points

Integration requirements specific to this app's architecture.

| Integration Point | Current State | v1.5 Change Required |
|------------------|---------------|----------------------|
| `PropertyItemSchema` in `data.ts` | `hasLiability: boolean`, `outstandingLoanInr?: number` | Add `lender?: z.string().optional()` and `emiInr?: z.number().nonnegative().optional()` — additive, backward-compatible |
| `DataSchema` root in `data.ts` | `{ version, settings, assets, netWorthHistory }` | Add `liabilities: z.array(LiabilityItemSchema)` at root level |
| `sumPropertyInr()` in `dashboardCalcs.ts` | Deducts `outstandingLoanInr` inline when `hasLiability` is true (returns equity) | No change — equity calc stays; outstanding loan values are separately extracted by `sumTotalDebt()` |
| `sumForNetWorth()` in `dashboardCalcs.ts` | Sums all category totals from `DASHBOARD_CATEGORY_ORDER` | Subtract `sumTotalDebt(data)` from the asset sum before returning |
| `DashboardPage.tsx` | Per-category rows + net worth grand total | Add Total Debt row + Debt-to-Asset ratio; update grand total label to "Net Worth" if not already; optionally add three-line gross/debt/net summary header |
| `createInitialData()` in `AppDataContext` | Initialises all `assets` keys | Add `liabilities: []` |
| JSON import path | Validates against `DataSchema` via `safeParse` | No change needed; Zod handles the new key automatically once `DataSchema` is updated |
| Net worth history snapshots | `totalInr` recorded at snapshot time using `sumForNetWorth()` | Automatically correct once `sumForNetWorth()` subtracts debt; no snapshot migration required |
| Vitest tests in `schema.test.ts` / `dashboardCalcs.test.ts` | Cover existing schema + calc paths | New tests needed for `LiabilityItemSchema`, `sumTotalDebt()`, and net worth deduction path |

---

## Sources

- [Monarch Money — Tracking features](https://www.monarch.com/features/tracking)
- [Kubera — Balance sheet tracker](https://www.kubera.com/)
- [PocketSmith Net Worth Tour](https://www.pocketsmith.com/tour/net-worth/) — Gross Assets / Total Liabilities / Net Worth three-row layout
- [10 Best Net Worth Tracker Apps — CreditDonkey 2026](https://www.creditdonkey.com/best-net-worth-tracker.html)
- [Net Worth Tracker FAQ — FinancialAha](https://www.financialaha.com/spreadsheet-templates/personal-finance/net-worth-tracker/faq/) — debt-to-asset ratio as standard metric
- Codebase direct inspection: `src/types/data.ts`, `src/lib/dashboardCalcs.ts`, `src/pages/PropertyPage.tsx`, `.planning/PROJECT.md`

---

*Feature research for: debt & liability tracking — Personal Wealth Tracker v1.5*
*Researched: 2026-05-01*
