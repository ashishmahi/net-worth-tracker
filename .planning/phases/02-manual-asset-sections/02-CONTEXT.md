# Phase 02: Manual Asset Sections — Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace 6 stub pages with fully functional data entry: Gold, Mutual Funds, Stocks, INR Bank Savings, Retirement (NPS/EPF), and Settings. All sections persist via AppDataContext. No live prices (Phase 3). No AED accounts (Phase 3). No Property (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Form Interaction Pattern
- **D-01:** All multi-item sections (Gold items, MF platforms, Stocks platforms, Bank accounts) use the **Sheet/drawer overlay** for add and edit. Click "Add" or click a row → Sheet opens from the right with a form inside. Save and Delete buttons inside the Sheet.
- **D-02:** Single-entity sections (Retirement, Settings) use inline forms — no Sheet needed.

### Gold Section
- **D-03:** Gold items store **karat + grams only** — no price field on individual items.
- **D-04:** Price per gram lives in **Settings** (one rate per karat: 24K, 22K, 18K). Updated manually from goodreturns.in.
- **D-05:** Section total = sum of (grams × price_per_gram_for_that_karat) across all items. Computed at render, never stored.

### Mutual Funds Section
- **D-06:** Per-platform entries. Fields: platform name (free text) + current total value (INR) + monthly SIP amount (INR, optional — can be 0).
- **D-07:** Section total = sum of current values across platforms (SIP is informational, not added to total).

### Stocks Section
- **D-08:** Per-platform entries. Fields: platform name (free text) + current total value (INR).
- **D-09:** Section total = sum of current values.

### INR Bank Savings Section
- **D-10:** Per-account entries. Fields: account label (free text, e.g. "HDFC Savings", "SBI FD") + current balance (INR).
- **D-11:** Section total = sum of balances.
- **D-12:** INR accounts only in Phase 2. AED accounts are Phase 3.

### Retirement Section
- **D-13:** Two fixed fields: NPS current balance (INR) + EPF current balance (INR). No list — direct inline edit.
- **D-14:** Show projected corpus at retirement — computed from current balances, return rates, and years to retirement (all from Settings). Formula: each balance grows at its respective rate for `target_age − current_age` years. Display total projected NPS + EPF corpus.
- **D-15:** Current age is a Settings field (needed to compute years to retirement).

### Settings Section
- **D-16:** Gold prices block: price per gram for 24K, 22K, 18K (INR, manual entry).
- **D-17:** Retirement assumptions block: current age, target retirement age, NPS annual return %, EPF annual rate %.
- **D-18:** Export Data button already implemented — keep as-is.
- **D-19:** Settings is a single inline form (no Sheet). Save button at the bottom of each block or one global Save.

### Error Handling
- **D-20:** Save errors appear **inline below the Save button** in the Sheet (or inline form for Settings/Retirement). Error text disappears on next save attempt. No toast library required.

### Data Schema Updates (replace z.unknown() stubs)
- **D-21:** `MutualFundsSchema.platforms` → array of `{ id, createdAt, updatedAt, name: string, currentValue: number, monthlySip: number }`
- **D-22:** `StocksSchema.platforms` → array of `{ id, createdAt, updatedAt, name: string, currentValue: number }`
- **D-23:** `BankSavingsSchema.accounts` → array of `{ id, createdAt, updatedAt, label: string, balanceInr: number }`
- **D-24:** `SettingsSchema` gains: `goldPrices: { k24: number, k22: number, k18: number }`, `retirement: { currentAge: number, targetAge: number, npsReturnPct: number, epfRatePct: number }`
- **D-25:** `RetirementSchema` keeps `nps` and `epf` as current balances (numbers). No structural change needed.

### Claude's Discretion
- Section total display position (top header vs. bottom of list) — Claude decides based on layout feel.
- Whether to add a shadcn `card` component for section wrappers or use plain dividers — Claude decides (install if it improves clarity).
- Exact form field order and labels within the Sheet.
- Whether MF monthly SIP is labeled "Monthly SIP" or "SIP/month".

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data Schema
- `src/types/data.ts` — Current schema with z.unknown() stubs for MF/Stocks/Bank to be replaced per D-21 through D-25

### Financial Utilities
- `src/lib/financials.ts` — parseFinancialInput, roundCurrency, createId, nowIso — use for all inputs and calculations

### Persistence
- `src/context/AppDataContext.tsx` — useAppData() hook, data and saveData — the only way to read/write data

### Critical Conventions
- `CLAUDE.md` — MUST read. Currency inputs use type="text" inputmode="decimal". Never store computed totals. Round after every multiplication. All list items need id (UUID), createdAt, updatedAt.

### UI Components Available
- `src/components/ui/sheet.tsx` — Sheet/drawer for add/edit forms (D-01)
- `src/components/ui/input.tsx` — text inputs
- `src/components/ui/button.tsx` — buttons
- `src/components/ui/separator.tsx` — section dividers

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Sheet` component (sheet.tsx): Already installed and available — use for all add/edit overlays
- `useAppData()`: Provides `data` (current AppData), `saveData(newData)` (async, throws on failure), `loadError`
- `parseFinancialInput()`: Handles "1,50,000" Indian formatting → number — use for all currency fields
- `roundCurrency()`: Use after every multiplication
- `createId()` + `nowIso()`: Use when creating new list items

### Established Patterns
- `saveData` throws on failure — catch in the Sheet/form and show inline error below Save button (D-20)
- Optimistic update already baked in: `saveData` updates state immediately and reverts on error
- No React Router — section switching is handled by App.tsx via useState; pages just render their content

### Integration Points
- Each page component reads from `useAppData().data.assets.{section}` and writes via `saveData({ ...data, assets: { ...data.assets, {section}: updated } })`
- Settings reads/writes `data.settings`
- Retirement reads `data.assets.retirement` for balances, `data.settings.retirement` for assumptions

</code_context>

<specifics>
## Specific Ideas

- User checks goodreturns.in for gold rates manually — Settings gold price fields should be easy to update quickly
- MF platforms the user has: PaytmMoney, possibly Groww (free-text label so not hardcoded)
- Stocks platform: Zerodha Kite (free-text label)
- INR bank accounts: HDFC Savings, SBI FD (free-text label)
- Retirement: NPS + EPF. Current age ~35, target 60, NPS 10%, EPF 8.15% — these should be the default placeholder values in Settings
- Projected corpus formula: `balance × (1 + rate/100) ^ (targetAge − currentAge)` for NPS and EPF separately, then sum

</specifics>

<deferred>
## Deferred Ideas

- AED bank accounts — Phase 3 (alongside AED/INR live rate)
- Bitcoin section — Phase 3
- Live gold price fetch — kept manual; no API for Indian gold prices
- Individual fund / stock tracking within a platform — not in v1; per-platform totals sufficient
- Toast notifications for errors — would require adding Sonner; inline errors are sufficient for v1

</deferred>

---

*Phase: 02-manual-asset-sections*
*Context gathered: 2026-04-25*
