# Phase 05: Dashboard — Research

**Researched:** 2026-04-26
**Domain:** React read-only aggregation page, multi-section net worth calculation
**Confidence:** HIGH (all findings are from direct codebase inspection — no external libraries needed)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Property net worth value = equity: `roundCurrency(agreementInr − (outstandingLoanInr ?? 0))` when `hasLiability` is true. When `hasLiability` is false (or `outstandingLoanInr` is zero/absent), use full `agreementInr`.
**D-02:** Sum across all properties for the Property category total.
**D-03:** Retirement = current balance only — `nps + epf`. Do NOT use `calcProjectedCorpus`.
**D-04:** Big total INR card at top (Card component), then 7 category rows below (name + INR amount + % of total). Rows vertically stacked.
**D-05:** Category rows are clickable — tap navigates to that section's page via App.tsx section-switching mechanism. DashboardPage receives a navigation callback prop (or equivalent).
**D-06:** While `btcLoading` or `forexLoading`, show Skeleton for affected category row value. Total card also shows Skeleton until all prices resolve.
**D-07:** On fetch error: use stale/cached price from `useLivePrices()` if available. If completely unavailable (null), show `—` with small error indicator, exclude that category from total, add disclaimer line.
**D-08:** Gold total = `sum(grams × goldPrices[karat])` per item, `roundCurrency` after each multiplication and after summing.
**D-09:** Bitcoin total INR = `roundCurrency(quantity × btcUsd × usdInr)`.
**D-10:** Bank Savings total INR = sum INR accounts + sum AED accounts via `roundCurrency(balance × aedInr)`.
**D-11:** MF and Stocks already in INR — sum `currentValue` directly.
**D-12:** Never store computed total in `data.json` — compute at render time only.

### Claude's Discretion

- Exact row styling (font size, dividers, hover/active state for clickable rows)
- Whether to show a "Prices as of …" timestamp
- Whether to show a "Refresh prices" button or rely on Settings page
- INR formatting (Indian lakh notation vs plain thousands)

### Deferred Ideas (OUT OF SCOPE)

- Charts / visualizations (pie or bar)
- Historical net worth tracking / trends
- "Refresh prices" button (Claude's discretion)
- INR lakh shorthand
- Tax calculations
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Dashboard showing total net worth in INR with per-category breakdown | Calculation formulas verified from data.ts + all page implementations; `useLivePrices()` contract confirmed from LivePricesContext.tsx |
</phase_requirements>

---

## Summary

Phase 05 replaces the `DashboardPage.tsx` stub (7 lines) with a read-only aggregation view. The page reads from all 7 `data.assets.*` sections and `data.settings.goldPrices` via `useAppData()`, computes each category's INR value at render time, and displays a total card plus clickable category rows. Three categories depend on live prices: Bitcoin (`btcUsd × usdInr`), Bank Savings with AED accounts (`aedInr`), and Gold (manual price from Settings, not a live fetch). The remaining four — Mutual Funds, Stocks, Property, Retirement — are pure INR arithmetic with no live-price dependency.

The only structural change outside `DashboardPage.tsx` is in `App.tsx`: the current `SECTION_COMPONENTS` map passes no props to pages. DashboardPage needs a `navigate` callback. App.tsx must break the dashboard out of the generic component map and render it directly with a prop so `setActiveSection` can be forwarded.

All patterns, utilities, and UI components required are already installed and used by prior phases. No new dependencies are needed.

**Primary recommendation:** Implement all calculation logic in a pure helper function (`calcDashboardTotals`) inside `DashboardPage.tsx` (or an adjacent `dashboardCalculations.ts`), test it in isolation, then wire the read-only UI on top. Keep the App.tsx change minimal — render DashboardPage outside the SECTION_COMPONENTS dispatch, or add a `navigate` prop variant.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Net worth calculation (all 7 categories) | Frontend (render-time) | — | CLAUDE.md: never store computed totals; pure JS arithmetic from in-memory AppData |
| Live price consumption (BTC, forex) | Frontend (LivePricesContext) | — | Context already fetches; Dashboard is a passive consumer |
| Navigation on row click | Frontend (App.tsx state) | — | No router; `useState`-based section switching already in App.tsx |
| Skeleton loading states | Frontend (DashboardPage) | — | `btcLoading`/`forexLoading` from useLivePrices; Skeleton component already installed |
| Error fallback display | Frontend (DashboardPage) | — | Inline error pattern established by prior phases; no toast library |

---

## Standard Stack

### Core (all already installed — zero new dependencies)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| React 18 | ^18.3.1 | Component rendering | [VERIFIED: package.json] |
| TypeScript | ~5.6.2 | Type safety | [VERIFIED: package.json] |
| Tailwind CSS | ^3.4.19 | Utility styling | [VERIFIED: package.json] |
| shadcn/ui card | installed | Total card display | [VERIFIED: src/components/ui/card.tsx] |
| shadcn/ui skeleton | installed | Loading placeholders | [VERIFIED: src/components/ui/skeleton.tsx] |
| shadcn/ui separator | installed | Row dividers | [VERIFIED: used in BankSavingsPage, GoldPage] |

### No New Installations Required

No `npm install` step needed for this phase. Every component and utility is already present.

---

## Architecture Patterns

### System Architecture Diagram

```
AppDataContext (data.assets.*, data.settings.goldPrices)
          │
          ▼
LivePricesContext (btcUsd | null, usdInr | null, aedInr | null,
                   btcLoading, forexLoading, btcError, forexError)
          │
          ▼
DashboardPage (reads both contexts, computes at render)
    │
    ├── calcCategoryTotals(data, btcUsd, usdInr, aedInr)
    │       ├── gold: items.reduce(grams × goldPrices[karat])
    │       ├── mutualFunds: platforms.reduce(currentValue)
    │       ├── stocks: platforms.reduce(currentValue)
    │       ├── bitcoin: quantity × btcUsd × usdInr  ← null if prices missing
    │       ├── property: items.reduce(equity per item)
    │       ├── bankSavings: INR + AED×aedInr         ← partial if aedInr missing
    │       └── retirement: nps + epf
    │
    ├── TotalCard
    │       ├── Loading: <Skeleton> if btcLoading || forexLoading
    │       └── Loaded: ₹{grandTotal} (excluding unavailable categories + disclaimer)
    │
    └── CategoryRow × 7 (clickable button → onNavigate(sectionKey))
            ├── Loading state: <Skeleton h-5 w-24> in value slot
            ├── Unavailable: "—" + error badge + excluded from total
            └── Loaded: name | ₹amount | X% of total

App.tsx: renders DashboardPage with onNavigate={setActiveSection} prop
         (breaks out of generic SECTION_COMPONENTS dispatch for dashboard key)
```

### Recommended File Structure (no new directories needed)

```
src/pages/
└── DashboardPage.tsx    ← replace stub; all calculation logic here or in adjacent file

src/App.tsx              ← minimal edit: pass onNavigate prop to DashboardPage
```

Optionally extract calculations into a sibling:
```
src/lib/dashboardCalcs.ts   ← pure functions, easy to unit-test if desired
```

### Pattern 1: Per-Category Value Calculation (pure function)

**What:** A single function accepts `AppData` + live prices and returns a typed result object. Each category either has a number or `null` (when required prices are unavailable). Null entries are excluded from the total and shown as `—`.

**When to use:** Any time you need the dashboard total or category subtotals.

```typescript
// [VERIFIED: derived from data.ts schema + CONTEXT.md decisions D-08 to D-11]
type CategoryResult = {
  gold: number | null       // null when data.settings.goldPrices is undefined
  mutualFunds: number
  stocks: number
  bitcoin: number | null    // null when btcUsd or usdInr is null
  property: number
  bankSavings: number       // AED accounts excluded (not null) when aedInr is null
  retirement: number
}

function calcCategoryTotals(
  data: AppData,
  btcUsd: number | null,
  usdInr: number | null,
  aedInr: number | null
): CategoryResult {
  // Gold (D-08) — null when goldPrices not yet configured in Settings
  const goldPrices = data.settings.goldPrices
  const gold = goldPrices
    ? data.assets.gold.items.reduce((sum, item) => {
        const key = ({ 24: 'k24', 22: 'k22', 18: 'k18' } as const)[item.karat]
        return roundCurrency(sum + roundCurrency(item.grams * goldPrices[key]))
      }, 0)
    : null

  // Mutual Funds (D-11) — already INR
  const mutualFunds = data.assets.mutualFunds.platforms.reduce(
    (sum, p) => roundCurrency(sum + p.currentValue), 0
  )

  // Stocks (D-11) — already INR
  const stocks = data.assets.stocks.platforms.reduce(
    (sum, p) => roundCurrency(sum + p.currentValue), 0
  )

  // Bitcoin (D-09) — null when prices unavailable
  const bitcoin =
    btcUsd != null && usdInr != null
      ? roundCurrency(data.assets.bitcoin.quantity * btcUsd * usdInr)
      : null

  // Property (D-01, D-02) — equity per item, sum across all
  const property = data.assets.property.items.reduce((sum, item) => {
    const equity = item.hasLiability
      ? roundCurrency(item.agreementInr - (item.outstandingLoanInr ?? 0))
      : item.agreementInr
    return roundCurrency(sum + equity)
  }, 0)

  // Bank Savings (D-10) — INR accounts always included; AED excluded only when aedInr null
  const bankSavings = data.assets.bankSavings.accounts.reduce((sum, a) => {
    if (a.currency === 'INR') return roundCurrency(sum + a.balance)
    if (aedInr != null) return roundCurrency(sum + roundCurrency(a.balance * aedInr))
    return sum  // AED account skipped, not null-ing the whole category
  }, 0)

  // Retirement (D-03) — current balance only
  const retirement = roundCurrency(
    data.assets.retirement.nps + data.assets.retirement.epf
  )

  return { gold, mutualFunds, stocks, bitcoin, property, bankSavings, retirement }
}
```

**Note on BankSavings vs Bitcoin null treatment:** Bitcoin returns `null` when rates are missing (the entire category is undetermined). BankSavings returns the partial INR-only subtotal even when `aedInr` is null (INR accounts are always known). If the account has only AED accounts and aedInr is null, bankSavings total will be 0, not null — this is correct per D-10 and consistent with BankSavingsPage behavior. [VERIFIED: BankSavingsPage.tsx lines 139-147]

### Pattern 2: Grand Total with Null Exclusion

```typescript
// [VERIFIED: derived from D-07]
const CATEGORY_KEYS = ['gold','mutualFunds','stocks','bitcoin','property','bankSavings','retirement'] as const
type CategoryKey = typeof CATEGORY_KEYS[number]

const totals = calcCategoryTotals(data, btcUsd, usdInr, aedInr)

const grandTotal = CATEGORY_KEYS.reduce((sum, key) => {
  const v = totals[key]
  return v != null ? roundCurrency(sum + v) : sum
}, 0)

const hasExcluded = CATEGORY_KEYS.some(k => totals[k] === null)
```

### Pattern 3: Navigation Callback Prop (App.tsx change)

**What:** DashboardPage receives `onNavigate: (key: SectionKey) => void`. App.tsx renders it outside the generic `SECTION_COMPONENTS` dispatch.

**Current App.tsx problem:** `SECTION_COMPONENTS` is typed as `Record<SectionKey, React.ComponentType>` — no props. The generic `<ActivePage />` call passes nothing. [VERIFIED: src/App.tsx lines 16-26, 31]

**Minimal fix — render DashboardPage inline when section is 'dashboard':**

```typescript
// src/App.tsx (minimal change)
// [VERIFIED: pattern consistent with existing App.tsx structure]
const ActivePage = activeSection !== 'dashboard'
  ? SECTION_COMPONENTS[activeSection]
  : null

// In JSX:
{activeSection === 'dashboard'
  ? <DashboardPage onNavigate={setActiveSection} />
  : ActivePage && <ActivePage />}
```

**DashboardPage signature:**
```typescript
// src/pages/DashboardPage.tsx
import type { SectionKey } from '@/components/AppSidebar'

interface DashboardPageProps {
  onNavigate: (key: SectionKey) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) { ... }
```

`SectionKey` is already exported from `AppSidebar.tsx`. [VERIFIED: src/components/AppSidebar.tsx line 10]

### Pattern 4: Skeleton Loading — Category Row

**What:** While `btcLoading` or `forexLoading` is true, show a `Skeleton` in the value slot. The layout stays stable (no height shift).

```typescript
// [VERIFIED: Skeleton component shape from src/components/ui/skeleton.tsx]
const isLivePriceRow = (key: CategoryKey) =>
  key === 'bitcoin' || key === 'bankSavings'

// In row render:
{isLoading && isLivePriceRow(key)
  ? <Skeleton className="h-5 w-24 inline-block" />
  : <span>{formatInr(totals[key])}</span>}
```

`isLoading` = `btcLoading` for bitcoin; `forexLoading` for bankSavings (AED) and bitcoin (usdInr). In practice, use `btcLoading || forexLoading` for the total card skeleton; for individual rows, `btcLoading` for bitcoin row and `forexLoading` for bankSavings row.

### Pattern 5: INR Formatting (established by prior pages)

All prior pages use `toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`. [VERIFIED: BankSavingsPage.tsx line 157, GoldPage.tsx — implicit via toLocaleString]. Dashboard should match this pattern for consistency.

The `en-IN` locale produces Indian lakh notation automatically (e.g., `₹1,23,45,678`). No additional library needed.

### Anti-Patterns to Avoid

- **Storing grandTotal in state or data.json:** Violates CLAUDE.md. Recompute from raw inputs on every render inside `useMemo`.
- **Fetching prices from DashboardPage directly:** All price fetches go through `src/lib/priceApi.ts` and surface via `useLivePrices()`. Dashboard is a passive consumer — no direct `fetch` calls. [VERIFIED: CLAUDE.md rule 4]
- **Type-casting `React.ComponentType` to accept props:** Do not add the `onNavigate` prop to the `SECTION_COMPONENTS` map type. Render DashboardPage separately (Pattern 3 above) — adding a union type to the generic map would pollute all other page types.
- **Using `calcProjectedCorpus` for Retirement:** Dashboard uses current balance (`nps + epf`) only. `calcProjectedCorpus` is for RetirementPage only. [VERIFIED: D-03 + financials.ts]
- **Calling `roundCurrency` only at the end:** Round after EVERY multiplication to prevent floating-point drift (CLAUDE.md rule 2). See `calcCategoryTotals` pattern above.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading placeholder | Custom spinner/shimmer CSS | `Skeleton` from `skeleton.tsx` | Already installed; consistent with shadcn design system |
| INR currency formatting | Custom number formatter | `toLocaleString('en-IN', { style: 'currency', currency: 'INR' })` | Browser-native; matches all other pages |
| Section navigation | Custom router / URL hash routing | `setActiveSection` via `onNavigate` prop | Already established — no React Router in this project |
| Card layout | Custom bordered div | `Card` + `CardContent` from `card.tsx` | Already used in every page |
| Row dividers | Custom `<hr>` / CSS | `Separator` from `separator.tsx` | Already imported in BankSavingsPage, GoldPage |

**Key insight:** This is a pure read/display page. Every pattern it needs already exists in the codebase — the implementation is wiring, not invention.

---

## Runtime State Inventory

> Not applicable. Phase 05 is greenfield implementation — no rename, refactor, or migration.

---

## Common Pitfalls

### Pitfall 1: goldPrices may be undefined

**What goes wrong:** `data.settings.goldPrices` is optional in the schema (SettingsSchema marks it `.optional()`). If the user has not visited Settings, it will be `undefined`. Multiplying `item.grams * undefined[karat]` throws a runtime error.

**Why it happens:** Settings is optional by design; goldPrices block is populated only after user sets prices.

**How to avoid:** Guard with `if (goldPrices)` before summing. Return `null` (not 0) so the total card shows `—` for Gold rather than ₹0. [VERIFIED: GoldPage.tsx lines 121-129 shows the same guard — `goldTotal` is `null` when prices absent]

**Warning signs:** NaN in the total card; ₹0 Gold row when items exist.

### Pitfall 2: outstandingLoanInr may be undefined

**What goes wrong:** `PropertyItemSchema` defines `outstandingLoanInr` as `.optional()`. If `hasLiability` is true but the field was never set, `agreementInr - undefined` = NaN.

**Why it happens:** Schema allows hasLiability without outstandingLoanInr.

**How to avoid:** Use `item.outstandingLoanInr ?? 0` per D-01. [VERIFIED: data.ts line 64 — `outstandingLoanInr: z.number().nonnegative().optional()`]

### Pitfall 3: App.tsx SECTION_COMPONENTS dispatch skips props

**What goes wrong:** Passing `onNavigate` as prop to `DashboardPage` through the generic `SECTION_COMPONENTS[activeSection]` render fails silently — the prop is typed away and never received.

**Why it happens:** `SECTION_COMPONENTS` is `Record<SectionKey, React.ComponentType>` — `ComponentType` without a generic parameter defaults to `{}` (no props). TypeScript will error if you try to pass `onNavigate` to `<ActivePage />`.

**How to avoid:** Render DashboardPage outside the generic dispatch (Pattern 3 above). The `activeSection === 'dashboard'` branch renders `<DashboardPage onNavigate={setActiveSection} />` directly. [VERIFIED: App.tsx lines 16-31]

### Pitfall 4: Double-counting AED bank accounts

**What goes wrong:** If `aedInr` comes back from a session override AND the live rate, the hook already merges them. No double-counting risk in the hook. The risk is in the Dashboard calculation: looping accounts without checking currency and naively summing `balance` would add AED balance as if it were INR.

**How to avoid:** Always branch on `a.currency` in the bankSavings reduce (see Pattern 1). [VERIFIED: BankSavingsPage.tsx lines 139-147 — same pattern]

### Pitfall 5: Percentage calculation when total is zero

**What goes wrong:** `(categoryValue / grandTotal) * 100` throws Infinity when `grandTotal === 0` (empty data.json).

**How to avoid:** Guard: `grandTotal > 0 ? roundCurrency((v / grandTotal) * 100) : 0`.

### Pitfall 6: Skeleton height mismatch causing layout shift

**What goes wrong:** If the Skeleton placeholder is a different height than the rendered text, the layout jumps when prices load.

**How to avoid:** Use `<Skeleton className="h-5 w-24 inline-block" />` sized to match the text element it replaces. Check against the actual rendered row height after wiring.

---

## Code Examples

### Verified INR formatting (from BankSavingsPage)
```typescript
// Source: src/pages/BankSavingsPage.tsx line 157 [VERIFIED]
total.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
```

### Verified Skeleton usage (first Dashboard consumer — from skeleton.tsx)
```typescript
// Source: src/components/ui/skeleton.tsx [VERIFIED]
import { Skeleton } from '@/components/ui/skeleton'

// Loading placeholder sized to match a currency value text:
<Skeleton className="h-5 w-24" />
```

### Verified Card + CardContent pattern (from BankSavingsPage)
```typescript
// Source: src/pages/BankSavingsPage.tsx lines 178-237 [VERIFIED]
<Card>
  <CardContent className="p-0">
    {rows.map((row, index) => (
      <div key={row.key}>
        <button
          className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
          onClick={() => onNavigate(row.sectionKey)}
        >
          {/* ... row content ... */}
        </button>
        {index < rows.length - 1 && <Separator />}
      </div>
    ))}
  </CardContent>
</Card>
```

### Verified useLivePrices destructure (from BitcoinPage)
```typescript
// Source: src/pages/BitcoinPage.tsx line 21 [VERIFIED]
const { btcUsd, usdInr, btcLoading, forexLoading, btcError, forexError } = useLivePrices()
```

### Verified roundCurrency usage (from BankSavingsPage)
```typescript
// Source: src/pages/BankSavingsPage.tsx lines 139-147 [VERIFIED]
const sectionTotal = accounts.reduce((sum, a) => {
  if (a.currency === 'INR') {
    return roundCurrency(sum + roundCurrency(a.balance))
  }
  if (aedInr == null) {
    return sum
  }
  return roundCurrency(sum + roundCurrency(a.balance * aedInr))
}, 0)
```

---

## State of the Art

| Pattern | Current Usage in Codebase | Dashboard Usage |
|---------|--------------------------|-----------------|
| Section switching | `useState<SectionKey>` in App.tsx; no React Router | Same — pass `setActiveSection` as callback |
| Inline error display | `role="alert"` `<p>` with `text-destructive` | Same — no toast |
| Loading feedback | `Loader2` spinner in BitcoinPage | `Skeleton` instead (D-06) |
| Currency format | `toLocaleString('en-IN')` consistently | Same |
| Card pattern | `Card` + `CardContent className="p-0"` + rows | Same |

**No deprecated approaches in use.** All prior-phase patterns are current.

---

## Open Questions

1. **Gold null vs 0 disambiguation for user**
   - What we know: `goldPrices` is undefined when Settings not configured; the Gold category shows null/`—` in that state.
   - What's unclear: Should the dashboard row say `—` or `₹0` with a hint "Set gold prices in Settings"? CONTEXT.md D-07 covers the price-feed error case; goldPrices-absent is a different condition.
   - Recommendation: Show `—` with a subdued label "Set gold prices in Settings" — mirrors GoldPage behavior (line 152-154). Left to Claude's discretion per the style note in CONTEXT.md.

2. **Bank Savings AED partial total clarity**
   - What we know: When `aedInr` is null, AED accounts are silently excluded and INR-only accounts are still summed.
   - What's unclear: Should the Bank Savings row show a sub-note "AED accounts excluded — rate unavailable"?
   - Recommendation: Yes, add a small subdued note when `aedInr === null && hasAedAccounts`. Mirrors BankSavingsPage `aedNeedsRate` pattern (line 137). Left to Claude's discretion.

---

## Environment Availability

> Skipped — Phase 05 is a code-only change with no external tool dependencies. All required packages are already installed (`package.json` verified). No install step needed.

---

## Validation Architecture

> `workflow.nyquist_validation` is absent from `.planning/config.json` — treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no test runner in `package.json` [VERIFIED] |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

No test infrastructure exists in this project (confirmed: `package.json` has no `vitest`, `jest`, or `@testing-library/*`; no `src/**/*.test.*` files exist outside `node_modules`). [VERIFIED: package.json + Glob search]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | `calcCategoryTotals` returns correct INR per category | unit | N/A — no test runner | Wave 0 gap |
| DASH-01 | Null returned for bitcoin when btcUsd is null | unit | N/A | Wave 0 gap |
| DASH-01 | Property equity = agreementInr - loan when hasLiability true | unit | N/A | Wave 0 gap |
| DASH-01 | goldPrices absent → gold returns null | unit | N/A | Wave 0 gap |
| DASH-01 | grandTotal excludes null categories | unit | N/A | Wave 0 gap |

### Wave 0 Gaps

**Option A (no test runner — manual verification only):** Given no test infrastructure exists in the project and the project is explicitly local-only with no CI, setting up a test runner is out of scope unless the user requests it. All calculation logic should be manually exercised via the running app.

**Option B (if test runner desired):** Install `vitest` and `@testing-library/react`. However, this is a significant scope addition not requested by the user.

**Recommendation:** No Wave 0 test infrastructure tasks. Validate calculations visually via the running dev server. Extract calculation logic into a pure function (`calcCategoryTotals`) to keep it testable if a test runner is added later.

---

## Security Domain

> No security concerns apply to this phase. DashboardPage is a read-only local display component — no authentication, no user input, no network requests beyond what `useLivePrices()` already handles (established in Phase 03). No new ASVS categories are introduced.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | — | — | — |

**All claims in this research were verified by direct codebase inspection. No assumed claims.**

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `src/types/data.ts` — full AppData schema; all 7 asset section shapes verified
- `src/context/AppDataContext.tsx` — `useAppData()` hook signature and INITIAL_DATA structure
- `src/context/LivePricesContext.tsx` — `useLivePrices()` full contract; btcUsd/usdInr/aedInr nullable types; loading/error states
- `src/lib/financials.ts` — `roundCurrency`, `parseFinancialInput`, `calcProjectedCorpus` signatures
- `src/pages/DashboardPage.tsx` — stub confirmed (7 lines, no imports)
- `src/App.tsx` — SECTION_COMPONENTS map; `useState<SectionKey>` navigation; `<ActivePage />` render
- `src/components/ui/card.tsx` — Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription
- `src/components/ui/skeleton.tsx` — Skeleton signature
- `src/components/AppSidebar.tsx` — SectionKey type (all 9 keys); NAV_ITEMS with labels
- `src/pages/GoldPage.tsx` — goldPrices guard pattern; roundCurrency usage; row/sheet pattern
- `src/pages/BankSavingsPage.tsx` — AED/INR reduce pattern; sectionTotal; row click pattern
- `src/pages/BitcoinPage.tsx` — useLivePrices destructure; null price guard; Loader2 usage
- `src/pages/PropertyPage.tsx` — PropertyItem shape in use; sumPaidToBuilder helper
- `package.json` — confirmed all installed dependencies; no test runner present
- `.planning/phases/05-dashboard/05-CONTEXT.md` — locked decisions D-01 through D-12
- `CLAUDE.md` — critical conventions (no stored totals, roundCurrency, text inputs)

---

## Metadata

**Confidence breakdown:**
- Calculation formulas: HIGH — verified against actual schema types and prior page implementations
- App.tsx navigation fix: HIGH — verified SECTION_COMPONENTS type and render call
- Skeleton/loading pattern: HIGH — Skeleton component inspected; loading flags from LivePricesContext verified
- No new dependencies: HIGH — package.json verified
- Test infrastructure: HIGH (absent) — package.json and file glob both confirmed no test runner

**Research date:** 2026-04-26
**Valid until:** Stable — no external dependencies; valid until codebase changes
