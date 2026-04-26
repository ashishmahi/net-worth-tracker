# Phase 05: Dashboard — Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the `DashboardPage.tsx` stub with a live net worth summary that aggregates all 7 asset sections (Gold, Mutual Funds, Stocks, Bitcoin, Property, Bank Savings, Retirement) into a single INR total with a per-category breakdown. No new data entry, no charts, no historical tracking — read-only aggregation and display only.

</domain>

<decisions>
## Implementation Decisions

### Property Contribution to Net Worth
- **D-01:** Property net worth value = **equity**: `roundCurrency(agreementInr − (outstandingLoanInr ?? 0))` when `hasLiability` is true. When `hasLiability` is false (or `outstandingLoanInr` is zero/absent), use full `agreementInr`.
- **D-02:** Sum across all properties for the Property category total.

### Retirement Contribution to Net Worth
- **D-03:** Use **current balance only** — `nps + epf` from `data.assets.retirement`. Do NOT use projected corpus (`calcProjectedCorpus`). Projected corpus stays on the Retirement page only.

### Dashboard Layout
- **D-04:** Big total INR at top in a `Card` component, then 7 category rows below listing each section name + INR amount + % of total. Rows are vertically stacked (not a grid). Uses existing `card.tsx`.
- **D-05:** Category rows are **clickable** — tapping a row navigates to that section's page using the existing App.tsx section-switching mechanism (`useState`). The Dashboard needs to receive a navigation callback prop (or equivalent) from App.tsx.

### Live-Price Loading States
- **D-06:** While live prices are loading (`btcLoading` or `forexLoading`), show a **skeleton placeholder** (from `skeleton.tsx`, already installed) for the affected category row's value. The total card also shows a skeleton until all prices resolve.
- **D-07:** On fetch error: use cached/stale live price from `useLivePrices()` if available (the hook holds last known values). If completely unavailable (null), show `—` with a small error indicator on that row and **exclude** that category's value from the total, noting the exclusion with a disclaimer line.

### Calculation Rules (derived from CLAUDE.md and prior phases)
- **D-08:** Gold total = `sum(grams × goldPrices[karat])` for each item, using `roundCurrency` after each multiplication and after summing.
- **D-09:** Bitcoin total INR = `roundCurrency(quantity × btcUsd × usdInr)` — uses live `btcUsd` and `usdInr` from `useLivePrices()`.
- **D-10:** Bank Savings total INR = sum of INR accounts (balance) + sum of AED accounts (`roundCurrency(balance × aedInr)`) — uses live `aedInr`.
- **D-11:** MF, Stocks — already in INR; sum `currentValue` across platforms directly.
- **D-12:** Never store the computed total in `data.json` — compute at render time only (CLAUDE.md).

### Claude's Discretion
- Exact row styling (font size, dividers, hover/active state for clickable rows).
- Whether to show a small "Prices as of …" timestamp using the last fetch time.
- Whether to show a "Refresh prices" button on the dashboard or rely on the Settings page refetch.
- INR formatting (e.g., `₹1,23,45,678` Indian lakh notation vs plain thousands).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap and product
- `.planning/ROADMAP.md` — Phase 05 goal (net worth summary, 7 sections, INR)
- `.planning/PROJECT.md` — Active requirements and Out of Scope (no charts, no historical)

### Prior phase decisions (lock consistency)
- `.planning/phases/02-manual-asset-sections/02-CONTEXT.md` — data shapes for Gold, MF, Stocks, Bank, Retirement
- `.planning/phases/03-live-prices-bitcoin/03-CONTEXT.md` — `useLivePrices()` contract, session overrides, error handling
- `.planning/phases/04-property/04-CONTEXT.md` — Property schema (agreementInr, milestones, hasLiability, outstandingLoanInr); D-09 deferred net equity rule to Phase 05

### Code (integration points)
- `src/types/data.ts` — full AppData schema; all 7 asset section shapes
- `src/context/AppDataContext.tsx` — `useAppData()` hook
- `src/context/LivePricesContext.tsx` — `useLivePrices()` hook; btcUsd, usdInr, aedInr, loading/error states
- `src/lib/financials.ts` — `roundCurrency`, `parseFinancialInput`, `calcProjectedCorpus` (RetirementPage only, not Dashboard)
- `src/pages/DashboardPage.tsx` — stub to replace
- `src/components/ui/card.tsx` — total card
- `src/components/ui/skeleton.tsx` — loading placeholders (already installed)
- `src/App.tsx` — section switching mechanism (useState-based navigation for clickable rows)
- `CLAUDE.md` — no computed totals in data.json, roundCurrency after every multiplication, INR as primary currency

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`useLivePrices()`**: provides `btcUsd`, `usdInr`, `aedInr` (number | null), `btcLoading`, `forexLoading`, `btcError`, `forexError`
- **`useAppData()`**: provides `data` (full AppData) and `saveData` — Dashboard only reads, no writes
- **`card.tsx`**: shadcn Card already used in other pages — use for the total net worth display
- **`skeleton.tsx`**: installed, not yet used in pages — Dashboard is first consumer
- **`roundCurrency()`**: use after every multiplication and summation

### Established Patterns
- Section switching is handled by `App.tsx` via useState — DashboardPage needs a navigation callback to implement clickable rows (D-05)
- No React Router — navigate by calling the setter from App.tsx context or prop
- Inline error handling (no toast library) consistent with Phase 02 D-20

### Integration Points
- DashboardPage reads from all 7 `data.assets.*` sections and `data.settings.goldPrices`
- DashboardPage consumes `useLivePrices()` for BTC and AED conversions
- App.tsx needs to pass a `navigate` or `onSectionChange` prop to DashboardPage for clickable rows

</code_context>

<specifics>
## Specific Ideas

- User's layout preference confirmed via mockup: big total card at top, then category list rows with name + ₹ amount + % of total
- Property: equity-first display (agreementInr − loan) rather than gross or paid-only
- Retirement: current-day balance, not future projection
- Skeleton on loading (not "—") to keep the layout stable while prices load

</specifics>

<deferred>
## Deferred Ideas

- Charts / visualizations (pie or bar) — explicitly Out of Scope per PROJECT.md
- Historical net worth tracking / trends — not in v1
- "Refresh prices" button on the Dashboard — left to Claude's discretion (may use Settings page flow instead)
- INR lakh shorthand (e.g., "₹12.3L") — Claude decides formatting; full number is acceptable
- Tax calculations — out of scope for v1

</deferred>

---

*Phase: 05-dashboard*
*Context gathered: 2026-04-26*
