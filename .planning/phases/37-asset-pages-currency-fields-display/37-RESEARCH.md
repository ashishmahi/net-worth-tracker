# Phase 37 — Technical Research

**Question:** What do we need to know to plan **asset/liability pages** currency fields and dual-currency display well?

**Status:** Ready for planning  
**Sources:** `37-CONTEXT.md`, `docs/multi-currency.md`, codebase survey (2026-05-09)

---

## Summary

1. **Bank** already implements the target patterns: `CurrencySchema` in form Zod, `toReportingCurrency` on list rows, six-code `<select>`. **Gap:** `openAdd` hardcodes `currency: 'INR'` — must align with **D-01** (`reportingCurrency`).
2. **MF / Stocks** pages have **no** `currency` on `MfPlatform` / stock platform types in the sheet yet; table shows raw `currentValue` without CCY column — requires schema + `data.ts` parity + UI (**D-11**).
3. **Gold / Bitcoin / Commodities** — need per-product review for where amounts live (grams vs fiat); **AP-01** on sheet; **D-12** forbids Gold **table** Currency column this phase.
4. **Property / standalone liabilities** — `data.ts` uses `*Inr` field names; **D-09** demands neutral persisted keys + migration in `AppDataContext` load path + Zod + validation helpers (**high coordination cost** — dedicate a wave).
5. **Retirement** — **explicitly out** of multi-currency UI per **D-03**; no dropdown; presentation stays INR-oriented.
6. **Shared UI** — Introduce **`DualCurrencyAmount`** (**D-04–D-06**) consumed by asset pages first; **Dashboard** refactor deferred (**D-05**).

---

## Code anchors

| Area | Files | Notes |
|------|-------|------|
| Conversion | `src/lib/currencyConversion.ts` | `toReportingCurrency`, `ForexRateSnapshot` |
| Currency union | `src/types/currency.ts` | `CURRENCY_CODES`, `CurrencySchema` |
| Settings / reporting lens | `src/context/*`, settings slice | `reportingCurrency` already Phase 35 |
| Bank reference | `src/pages/BankSavingsPage.tsx` | Form fieldset, row conversion, `openAdd` fix |
| MF | `src/pages/MutualFundsPage.tsx` | Add Zod fields; persist `currency` on platforms |
| Stocks | `src/pages/StocksPage.tsx` | Same pattern as MF |
| Gold | `src/pages/GoldPage.tsx` | Form + holdings table — no CCY column (**D-12**) |
| Property | `src/pages/PropertyPage.tsx`, `PropertyItemSchema`, validation helpers | `agreementInr`, loan fields → neutral names |
| Liabilities | `src/pages/LiabilitiesPage.tsx`, schemas | Standalone liability `*Inr` → neutral |
| Live rates | `useLivePrices` | Pass snapshot into `DualCurrencyAmount` |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Silent INR coercion on save | **AP-02:** Save numeric fields **as entered**; store `currency` explicitly; never replace stored numbers with converted values |
| Migration breaks property validation | Gate with Vitest on `getPropertyValidationIssues` / schema after renames; migration tests with fixture JSON |
| Section totals wrong | **D-10:** Section headlines = **reporting currency one line** only; dual line **per row** only |
| Gold confusion | **D-12:** Document that **form** has currency; **table** has no Currency column until product supports non-INR bullion paths |

---

## Recommended execution order

1. **`DualCurrencyAmount` + tests** (blocks all display work).
2. **Bank** (smallest change — default fix + optional row swap to shared component).
3. **MF + Stocks** (parallelizable patterns).
4. **Gold, Bitcoin, Commodities**.
5. **Property + Liabilities** (schema + migration + labels — **serialize** if one person; **parallel** only with clear key naming contract).

---

## Validation Architecture

**Dimension coverage (Nyquist):**

| Dimension | How Phase 37 validates |
|-----------|------------------------|
| Unit logic | Vitest for `DualCurrencyAmount` branches (same CCY → no secondary; foreign CCY → primary reporting + secondary original; `ok: false` → **Rate unavailable** substring); property/liability migration unit tests |
| Integration | `tsc -b`; full `npm test -- --run` after each wave |
| Manual | Spot-check each page: add USD MF → JSON shows `currency: "USD"` and amount unchanged in USD units; toggle reporting currency → primary updates |

**Quick commands:** `npx tsc -b --pretty false`, `npm test -- --run`

---

## RESEARCH COMPLETE

Planning can proceed with **`37-CONTEXT.md`**, **`37-UI-SPEC.md`**, and this file.
