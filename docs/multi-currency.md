Multi-Currency Feature — Implementation Spec
Overview
Allow users to hold assets in different currencies (INR, USD, AED, EUR, GBP, SGD) while viewing all totals in a single reporting currency that can be switched at any time.

1. Reporting Currency Selector
Location: Topbar (right side, next to live price chips)
Control: <select> dropdown showing symbol + code (e.g. ₹ INR, $ USD, AED)
Behavior: Switching recalculates all aggregate values (net worth, category totals, breakdown rows) using live FX rates
Persistence: Save to settings in your data model (not session-only)
Default: INR

2. Per-Record Currency
Every asset/liability record gets an optional currency field (defaults to reporting currency)
Gold holdings, MF platforms, stock brokers, bank accounts, property, liabilities — all support it
When adding/editing a holding, the form includes a currency dropdown (same 6 options)
The app stores the original amount in the original currency — never overwrite with converted values

3. Display Pattern — Dual Currency (where it applies)
Dashboard breakdown: Single column in reporting currency only (category totals can mix many underlying currencies; a second line does not scale).
Asset detail pages (MF platforms, stocks, property, etc.): Primary value in reporting currency; when the record currency differs, show the original amount as a secondary line where implemented (DualCurrencyAmount pattern).
Gold holdings / commodities lists: Currency-aware rows with dual presentation where rates allow.

4. Conversion Logic
Use the live rates already in your app (USD/INR, AED/INR from forex feed, BTC/USD from BTC feed)
For currencies not directly covered by feeds (EUR, GBP, SGD), you'll need to add those pairs to your LivePricesContext
Conversion formula: displayValue = originalValue × rate_to_reporting_currency
When reporting currency = record currency, skip conversion, hide secondary line
5. Data Model Changes
settings — add:

reportingCurrency: "INR" | "USD" | "AED" | "EUR" | "GBP" | "SGD"
Every asset record — add optional field:

currency?: string  // defaults to reportingCurrency if absent
MF platforms / Stock platforms — add:
currency: string   // e.g. "USD" for Interactive Brokers

6. Settings Page — Live Rates
The existing "Live market rates" card already shows USD/INR, AED/INR, BTC/USD, XAU, XAG
Extend to show all supported currency pairs needed for conversion
Session-only manual override already exists — it covers the fallback case

7. Mobile Responsive
On mobile topbar: show reporting currency as a compact badge/chip (e.g. ₹ INR ▾) that opens the same selector
Breakdown rows stack the dual currency vertically (same as desktop, already compact enough)
Settings page on mobile: show "Reporting currency" as the first row with current value and a Change › action

8. Property equity (net worth)
Under-construction / builder instalments **without** a mortgage: dashboard property value is the **sum of milestone amounts marked paid**, not the full agreement — so cash left in the bank for unpaid instalments is not double-counted with the property line. **No milestones** on that record falls back to **full agreement** (simple completed purchase). **With a mortgage**, equity is **agreement − outstanding loan** (milestones optional for tracking).

9. Edge Cases
No rate available: Show the original currency value only, skip conversion, show a "Rate unavailable" hint
Same currency: Don't show the secondary line at all
Export/Import: The zip export should preserve currency fields on all records; import should respect them
Snapshots: Net worth snapshots should record which reporting currency was active and the rates used at snapshot time, so historical values remain accurate