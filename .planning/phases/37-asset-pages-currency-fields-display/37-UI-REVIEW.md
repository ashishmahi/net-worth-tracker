# Phase 37 — UI Review

**Audited:** 2026-05-09  
**Baseline:** `37-UI-SPEC.md` (approved)  
**Screenshots:** not captured (no dev server on ports 3000 / 5173 / 8080 — code-only audit)  
**Execution summaries:** no `*-SUMMARY.md` in this phase directory — context taken from `37-01-PLAN.md` and implemented sources under `src/`.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Contract strings (**Currency**, **Rate unavailable**, loading copy on Bank) and optional liability helper match the UI contract; empty states are section-specific. |
| 2. Visuals | 3/4 | MF/Stocks use grid-based column layouts with header rows and **CCY** / **Value** hierarchy; section headline totals are visually clear but MF/Stocks lack the Bank-style FX caveat when totals omit rows. |
| 3. Color | 4/4 | Semantic tokens (`text-foreground`, `text-muted-foreground`, `text-destructive`, `border-input`) — no off-palette bulk fills; **`CurrencyFieldHint`** uses muted trigger + ring focus. |
| 4. Typography | 3/4 | **`DualCurrencyAmount`** matches spec layers (`text-sm` / `text-[11px]`); headline section totals use **`text-2xl`** without **`tabular-nums`**, drifting from D-10’s **`text-base` / `text-lg` … tabular-nums** guidance. |
| 5. Spacing | 3/4 | **`gap-px`**, sheet **`space-y-4`**, and **`overflow-x-auto`** wrappers align with D-13; arbitrary **`min-w-[520px]`** / **`min-w-[420px]`** are scoped exceptions per spec. |
| 6. Experience Design | 3/4 | **`aria-live`** on totals, loading/error paths on Bank, **`overflow-x-auto`** on wide tables; **MF/Stocks** headline totals **silently exclude** platforms when **`toReportingCurrency`** fails — unlike **BankSavingsPage**, which surfaces partial-FX messaging (**WARNING**). |

**Overall: 20/24**

---

## Registry Safety

**Registry audit:** `components.json` present (shadcn **default** / zinc / cssVariables). **`37-UI-SPEC.md`** specifies **no new third-party registry blocks** — **`DualCurrencyAmount`** is a **local** composition. No third-party shadcn registry blocks required scanning.

---

## Top 3 Priority Fixes

1. **Headline section totals omit `tabular-nums` and use `text-2xl`** — Large currency figures can jitter when totals update; **D-10** calls for **`tabular-nums`** on reporting-only totals. Add **`tabular-nums`** to **`<output>`** meta totals (Bank, MF, Stocks, Gold, Liabilities as applicable) and decide whether **`text-lg`** / **`text-base`** matches the contract vs retaining **`text-2xl`** as an explicit PageHeader convention (update **UI-SPEC** if the latter).

2. **MF/Stocks headline total can under-report without disclosure** — **`sectionTotal`** reducers skip holdings when **`!c.ok`** (same pattern as Bank’s sum), but **Bank** shows **`needsFxRate`** / **`Loading conversion rates…`** while **MF/Stocks** meta has **only** the number. **User impact:** Net-worth-style headline looks complete while row **`DualCurrencyAmount`** shows **Rate unavailable**. **Fix:** Mirror **`conversionBlocked`** / descriptive copy from **`BankSavingsPage`** when any platform fails FX conversion.

3. **`DualCurrencyAmount` degraded stack vs hero net worth** — **Dashboard** uses **large** “Rate unavailable” for the net-worth hero (`DashboardPage.tsx` ~541–548) but **small** muted hint above the figure for breakdown tiles (~599–604). **`DualCurrencyAmount`** follows the **breakdown** pattern (muted hint, then amount). **Fix:** No change required unless product wants row-level amounts to match the **hero** pattern — if so, document one canonical degraded layout in **`37-UI-SPEC`** and align **`DualCurrencyAmount`** / dashboard tiles.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

- **`DualCurrencyAmount.tsx`** includes exact substring **`Rate unavailable`** (FX-03).
- **Bank:** **`Loading conversion rates…`** when **`forexLoading`** (`BankSavingsPage.tsx` ~181–182).
- **Liabilities:** optional helper **`All amounts on this record are in the selected currency.`** (`LiabilitiesPage.tsx` ~421–422) matches the contract table.
- **Property:** **`Agreement, loan, milestones, and EMI use this currency.`** (`PropertyPage.tsx` ~781) satisfies the one-line helper intent.
- Currency fieldset legends use **`Currency`** with optional **`CurrencyFieldHint`** (tooltip copy is product-long but consistent with multi-currency education).

### Pillar 2: Visuals (3/4)

- **MF/Stocks:** Column headers + **CCY** align with **D-11** (header may read **Currency** or **CCY** per spec). Row primary is platform name; value column right-aligns **`DualCurrencyAmount`** — clear scan line.
- **WARNING:** MF/Stocks **page meta** does not signal incomplete headline totals when FX is partial — visual **total** can imply completeness (see Pillar 6).

### Pillar 3: Color (4/4)

- No broad **`bg-primary`** fills; destructive styling reserved for errors and delete flows.
- **`text-muted-foreground`** on secondary amounts and table CCY cells matches **60/30/10** intent for figure vs annotation.

### Pillar 4: Typography (3/4)

- **`DualCurrencyAmount`:** **`text-sm font-semibold`** primary, **`text-[11px] font-normal`** secondary — matches **`37-UI-SPEC`** dual stack table.
- **WARNING:** **`PageHeader`** meta totals use **`text-2xl font-semibold`** (**e.g.** `MutualFundsPage.tsx` ~173, `BankSavingsPage.tsx` ~168, `GoldPage.tsx` ~186) without **`tabular-nums`** — spec asks **`text-base` or `text-lg font-semibold tabular-nums`** for section totals (**D-10**), modulo “consistent with each page” — **`text-2xl`** is a deliberate escalation worth either normalizing or documenting.

### Pillar 5: Spacing (3/4)

- **`DualCurrencyAmount`:** **`flex flex-col items-end gap-px leading-tight`** — matches spacing notes.
- **`overflow-x-auto`** + **`min-w-[…]`** on MF/Stocks — acceptable **D-13** discretion.
- Sheet **`space-y-4`** consistent with form sections.

### Pillar 6: Experience Design (3/4)

- **Bank:** **`conversionBlocked`**, **`needsFxRate`**, **`aria-live`** output — strong degraded-FX UX.
- **MF/Stocks:** **`sectionTotal`** skips **`!c.ok`** platforms (`MutualFundsPage.tsx` ~158–164, `StocksPage.tsx` ~152–158) **without** accompanying banner — **WARNING** (misleading completeness).
- **Gold:** No **Currency** column in holdings list — **D-12** satisfied.
- **Retirement:** No **`CurrencySchema`** / multi-currency chrome — **D-03** preserved (spot-check **`RetirementPage.tsx`**).

---

## Files Audited

| File | Focus |
|------|--------|
| `src/components/DualCurrencyAmount.tsx` | Dual stack, FX failure, typography tokens |
| `src/components/CurrencyFieldHint.tsx` | Tooltip trigger, focus ring |
| `src/pages/BankSavingsPage.tsx` | D-01 defaults, list **`DualCurrencyAmount`**, total + FX messaging |
| `src/pages/MutualFundsPage.tsx` | Form currency, CCY column, section total, overflow |
| `src/pages/StocksPage.tsx` | Parity with MF |
| `src/pages/GoldPage.tsx` | Form currency, no CCY column in list, **`DualCurrencyAmount`** on value |
| `src/pages/BitcoinPage.tsx` | Currency + display |
| `src/pages/CommoditiesPage.tsx` | Currency + display (sampled via plan) |
| `src/pages/PropertyPage.tsx` | Single-record currency, helper, **`DualCurrencyAmount`** usage |
| `src/pages/LiabilitiesPage.tsx` | Helper copy, list **`DualCurrencyAmount`**, totals |
| `src/pages/RetirementPage.tsx` | INR-only guard |
| `components.json` | Registry baseline (no third-party phase blocks) |

---

## UI REVIEW COMPLETE

**Phase:** 37 — Asset Pages — Currency Fields & Display  
**Overall Score:** 20/24  
**Screenshots:** not captured  

### Pillar Summary

| Pillar | Score |
|--------|-------|
| Copywriting | 4/4 |
| Visuals | 3/4 |
| Color | 4/4 |
| Typography | 3/4 |
| Spacing | 3/4 |
| Experience Design | 3/4 |

### Top 3 Fixes

1. Add **`tabular-nums`** (and reconcile **`text-2xl`** vs **`text-lg`/`text-base`**) on section headline totals per **D-10**.  
2. Surface partial-FX / incomplete total messaging on **MF** and **Stocks** when any row fails conversion — parity with **Bank**.  
3. Optionally unify degraded **`Rate unavailable`** presentation with dashboard hero vs row (**product decision** + spec note).

### File Created

`.planning/phases/37-asset-pages-currency-fields-display/37-UI-REVIEW.md`

### Recommendation Count

- **Priority fixes:** 3  
- **Minor recommendations:** 2 (semantic `<table>` vs grid for MF/Stocks; **`text-lg`** wrapper around liability card **`DualCurrencyAmount`** — verify inherited sizing intent)
