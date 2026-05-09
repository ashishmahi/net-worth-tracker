# Phase 37 — Pattern Map

**Phase directory:** `.planning/phases/37-asset-pages-currency-fields-display`

Analogs for new or heavily modified files:

| Planned / modified surface | Role | Closest existing analog | Notes |
|----------------------------|------|-------------------------|-------|
| `src/components/DualCurrencyAmount.tsx` | Smart display | `src/pages/BankSavingsPage.tsx` row (`toReportingCurrency`, stacked amounts); **Phase 36** `DashboardPage` breakdown stack (**reference**, do not refactor dashboard) | Owns formatting + **Rate unavailable** per **37-UI-SPEC** |
| `BankSavingsPage.tsx` | Form + list | Self — extend `openAdd` default | Replace `currency: 'INR'` with `settings.reportingCurrency` |
| `MutualFundsPage.tsx` | Sheet + table | `BankSavingsPage.tsx` currency fieldset + Zod | Add **Currency** column + **DualCurrencyAmount** in Value column |
| `StocksPage.tsx` | Sheet + table | `MutualFundsPage.tsx` (after update) | Keep parity with MF |
| `GoldPage.tsx` | Sheet + table | `BankSavingsPage` + **D-12** | **No** Currency column in holdings table |
| `BitcoinPage.tsx`, `CommoditiesPage.tsx` | Sheet + detail | `BankSavingsPage` | Per-record `currency` |
| `PropertyPage.tsx` + property schema | Migration-heavy | `src/types/data.ts` `PropertyItemSchema`, existing migration patterns in `AppDataContext` | **D-09** neutral keys |
| `LiabilitiesPage.tsx` | Sheet + list | Bank + property validation style | **D-08**, **D-09** |

**Excerpt — Bank currency fieldset (pattern):**

- Legend **Currency**, native `<select>`, `aria-invalid` + `role="alert"` on error — copy structure into MF/Stocks/Gold/BTC/Commodities/Property/Liabilities per **37-UI-SPEC**.

---

## PATTERN MAPPING COMPLETE
