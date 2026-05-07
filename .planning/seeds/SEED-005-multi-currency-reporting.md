---
id: SEED-005
status: dormant
planted: 2026-05-07
planted_during: awaiting_next_milestone (post v2.3)
trigger_when: next milestone
scope: Large
---

# SEED-005: Add multi-currency reporting so assets held in any currency display in a user-selected reporting currency

## Why This Matters

The app currently hardcodes INR as the display currency. Users with assets in USD (US stocks, international MFs), AED (UAE bank accounts), or other currencies have no way to see true net worth in a single reporting currency — they must manually convert. This feature eliminates that friction by storing amounts in their original currency and converting at live FX rates, making the tracker genuinely useful for NRIs and globally-diversified portfolios.

## When to Surface

**Trigger:** Next milestone — surface immediately during `/gsd-new-milestone`

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- Milestone involves internationalization, multi-currency, or FX rates
- Milestone adds new asset types that may be denominated in foreign currencies
- Milestone touches the dashboard, settings, or data model
- Any new milestone starts (user flagged this as high priority)

## Scope Estimate

**Large** — Full milestone effort. The feature touches every asset page (Gold, MF, Stocks, Bank, Retirement, Property, Bitcoin, Liabilities), the data model, LivePricesContext, AppTopbar, DashboardPage, SettingsPage, and the export/import layer. Likely 8–12 phases:
- Data model migration (add `currency` field to all record types + `reportingCurrency` to settings)
- FX rate expansion (EUR, GBP, SGD pairs added to `priceApi.ts` and `LivePricesContext`)
- Reporting currency selector in topbar
- Per-record currency field on all asset forms
- Conversion logic utility + dual-currency display component
- Dashboard + breakdown row updates
- Per-asset-page updates (Gold, MF, Stocks, Bank, Property, Retirement, Bitcoin)
- Settings page live rates card extension
- Snapshot recording of rates + reporting currency at time of snapshot
- Export/import currency field preservation
- Mobile responsive topbar badge

## Breadcrumbs

Related code and decisions found in the current codebase:

**FX / Live prices infrastructure**
- `src/context/LivePricesContext.tsx` — currently provides USD/INR, AED/INR, BTC/USD; needs EUR, GBP, SGD pairs
- `src/lib/priceApi.ts` — all market fetch calls go here; extend with new currency pairs
- `src/components/AppTopbar.tsx` — live price chips live here; reporting currency selector goes here too

**Data model**
- `src/types/data.ts` — every asset record type needs an optional `currency?: string` field; settings needs `reportingCurrency`
- `src/context/AppDataContext.tsx` — schema version bump required; migration logic for adding currency defaults

**Dashboard / calculations**
- `src/lib/dashboardCalcs.ts` — aggregation logic; must accept FX rates and convert per-record before summing
- `src/pages/DashboardPage.tsx` — breakdown rows need dual-currency display pattern

**Asset pages that hold foreign-currency records**
- `src/pages/MutualFundsPage.tsx` — MF platforms (e.g. Interactive Brokers) need platform-level currency
- `src/pages/StocksPage.tsx` — broker-level currency
- `src/pages/BankSavingsPage.tsx` — AED accounts already exist; per-account currency field formalizes this
- `src/pages/PropertyPage.tsx` — property + liabilities need currency
- `src/pages/GoldPage.tsx`, `src/pages/CommoditiesPage.tsx` — gold/silver holdings need currency column
- `src/pages/BitcoinPage.tsx` — already USD-denominated; conversion to reporting currency
- `src/pages/RetirementPage.tsx` — retirement accounts may be USD (401k, IRA)
- `src/pages/LiabilitiesPage.tsx` — foreign liabilities (e.g. overseas mortgage)

**Settings**
- `src/pages/SettingsPage.tsx` — "Live market rates" card to be extended with all FX pairs
- `src/lib/financials.ts`, `src/lib/wealthFormat.ts` — formatting utilities; need reporting-currency-aware variants

**Full spec**
- `docs/multi-currency.md` — complete implementation spec (8 sections, covers display pattern, data model, edge cases, mobile, snapshots)

## Notes

Full spec is in `docs/multi-currency.md`. Key design decisions captured there:
- Store original currency amounts — never overwrite with converted values
- Dual-currency display: reporting currency primary (bold), original secondary (muted, smaller)
- 6 supported currencies: INR, USD, AED, EUR, GBP, SGD
- "No rate available" edge case: show original value only with hint
- Snapshots must record reporting currency + rates at time of capture for historical accuracy
