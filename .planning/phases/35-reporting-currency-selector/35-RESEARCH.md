# Phase 35 — Technical Research

**Phase:** 35 — Reporting Currency Selector  
**Question:** What do we need to know to plan RC-01–RC-03 well?

---

## Summary

Phase 34 delivered **`reportingCurrency`** on settings, **`toReportingCurrency`** in `src/lib/currencyConversion.ts`, and **five INR legs** on **`LivePricesContext`** (`usdInr`, `aedInr`, `eurInr`, `gbpInr`, `sgdInr`). **`dashboardCalcs.ts`** still computes **INR-equivalent** category totals (`calcCategoryTotals`). **`DashboardPage`** formats everything with **`fmtCompactInr`**, **`fmtInr0`**, and **`splitInrAmount`**.

Phase 35 adds **native `<select>`** in **`AppTopbar`** (after “Live prices”, before USD/INR chip) and **`MobileTopBar`**, persists via **`saveData`**, and **re-renders Dashboard** so headline net worth, gross assets, debt lines, breakdown rows, and allocation ring reflect **`settings.reportingCurrency`** using **`toReportingCurrency(amountInr, 'INR', reportingCurrency, snapshot)`** at **display boundaries** (keep **`calcCategoryTotals`** unchanged — internal INR sums remain the engine).

---

## Code Anchors

| Area | File | Notes |
|------|------|--------|
| Desktop chrome | `src/components/AppTopbar.tsx` | Right cluster: Live pill → *(insert)* → USD/INR → BTC |
| Mobile chrome | `src/components/MobileTopBar.tsx` | 44px controls; add select without shrinking tap targets |
| Settings field | `src/context/AppDataContext.tsx` | `data.settings.reportingCurrency`; **`saveData`** persists whole doc |
| Conversion | `src/lib/currencyConversion.ts` | **`ForexRateSnapshot`** matches five legs + INR hub |
| Rates | `src/context/LivePricesContext.tsx` | Build snapshot `{ usdInr, aedInr, eurInr, gbpInr, sgdInr }` |
| Dashboard totals | `src/lib/dashboardCalcs.ts` | Still INR; **do not** duplicate category logic in Phase 35 |
| Dashboard UI | `src/pages/DashboardPage.tsx` | Many **`fmt*Inr`** call sites; hero uses **`splitInrAmount(netWorth)`** |
| Prior UI pattern | `src/pages/BankSavingsPage.tsx` | **`toReportingCurrency`** + **`reportingCurrency`** + rate snapshot |

---

## RC Mapping

| REQ | Implementation sketch |
|-----|------------------------|
| **RC-01** | Render `<select>` with six **`CurrencyCode`** options; labels **`symbol + code`** per **35-CONTEXT D-04** and **`35-UI-SPEC.md`**; **`value={data.settings.reportingCurrency ?? 'INR'}`**; **`onChange`** → **`saveData`** with updated **`settings.reportingCurrency`** and **`settings.updatedAt`** |
| **RC-02** | **`useMemo`** / helpers: **`forexSnapshot`** from **`useLivePrices()`**; **`displayInReporting(nInr)`** = **`toReportingCurrency(nInr, 'INR', reportingCurrency, snap)`**; on **`ok: false`**, show **“Rate unavailable”** (and keep INR figure or em dash per **UI-SPEC** / **FX-03**); **Scope:** net worth card, gross/total debt summary, breakdown row amounts, **AllocationRing** inputs (scale all category values identically — **%** unchanged). **Out of scope for 35:** **`NetWorthOverTimeCard`** can stay **INR-labeled** until snapshot currency (Phase 38) — optional one-line disclaimer to avoid user confusion |
| **RC-03** | Already persisted by **`saveData`** → **`localStorage`**; verify reload reads same **`reportingCurrency`** |

---

## Formatting

- **INR:** keep **`fmtCompactInr`** / **`splitInrAmount`** / **`fmtInr0`** where reporting is INR.
- **Non-INR:** add **`fmtAmountForCurrency(n: number, code: CurrencyCode)`** (or split compact vs full) using **`Intl.NumberFormat`** with **`style: 'currency'`, `currency: code`**, and document locale choice (e.g. **`en-IN`** for consistency with existing copy). **Cr/L** style is **INR-only**; other currencies use standard **k / M** or full locale formatting — call out in plan so acceptance criteria are grep-verifiable (e.g. `new Intl.NumberFormat` in **`wealthFormat.ts`**).

---

## Edge Cases

- **`reportingCurrency === 'INR'`:** no FX legs required for display; fast path (skip **`toReportingCurrency`** or `from === to`).
- **Missing rate for target reporting currency:** **`ok: false`** — primary figure may show em dash + **“Rate unavailable”** per product spec; do not throw.
- **Snapshot delta:** `netWorth` and `lastSnapshot.totalInr` are both INR-based today — convert **both** to reporting for **displayed** delta, or convert **delta in INR** once (linear w.r.t. same **to** currency). **Linear:** `toReportingCurrency(deltaInr, 'INR', to, snap)` only if all components use same rates — safer: **`displayNw - displayLast`** after converting each.

---

## Validation Architecture

| Dimension | Approach |
|-----------|----------|
| **Automated** | **`npm test -- --run`** — extend **`src/lib/__tests__`** with tests for any **new pure formatter** (`fmtAmountForCurrency` / INR branch); **`currencyConversion`** already tested |
| **Manual / UAT** | Toggle select → Dashboard numbers change without reload; reload → selection persists |
| **Regression** | **`npx tsc -b`** after **`AppTopbar`** / **`MobileTopBar`** / **`DashboardPage`** edits |

---

## RESEARCH COMPLETE

Planner may proceed to **`35-01-PLAN.md`** with **`ForexRateSnapshot`** wiring and explicit file touch list.
