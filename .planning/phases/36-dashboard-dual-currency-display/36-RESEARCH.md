# Phase 36 — Technical Research

**Question:** What do we need to know to PLAN **Dashboard dual-currency breakdown** (**DSP-01**, **DSP-03**) correctly?

---

## Current implementation snapshot

| Area | Finding |
|------|---------|
| **`DashboardPage.tsx`** | Category loop uses **`formatRowReporting(amountInr, reportingCurrency, snapshot)`** → single **`rowFmt.primary`** line; degraded shows **Rate unavailable** + **`fmtInr0(v)`**. |
| **`dashboardCalcs.ts`** | **`calcCategoryTotals`** returns **single INR.number per category**. **MF/Stocks** sum **`currentValue` as INR math** (`sumMutualFunds`, `sumStocks`) — no **`toReportingCurrency`** from stored codes yet. **Bank** handles **INR + AED→INR** only. |
| **`toReportingCurrency`** | INR hub (**`currencyConversion.ts`**); **`ForexRateSnapshot`** already includes **EUR/GBP/SGD** legs. |
| **`AppDataContext`** migration | Optional **`currency`** on records; defaults stamped **INR** where missing; **`reportingCurrency`** default **INR**. |
| **Prototype** | **`design/net-worth-tracker-redesign-v2/app.jsx`** — `.val` + conditional `.val-local`; hero + Total Debt single-line. |

---

## Gap driving Phase 36 work

**DSP-01** requires **original-currency subline** when stored currency ≠ reporting. Today:

1. **Primary** for non-INR reporting is **INR hub total → `toReportingCurrency(..., reporting)`** — correct only if **INR hub total** is built from **per-record** amounts in their **stored** currencies. Otherwise primary and secondary can **contradict**.
2. **Secondary** needs **per-category aggregation of raw amounts** grouped by **effective stored code** (`item.currency ?? settings.reportingCurrency`), then **D-02** rules (0 / 1 / 2+ distinct non-reporting codes).

**Conclusion:** Phase 36 must extend **`calcCategoryTotals`** (or tightly coupled helper) to accept **`ForexRateSnapshot`** + **`reportingCurrency` default** and convert **each monetary contribution** to **INR** via **`toReportingCurrency(amount, stored, 'INR', rates)`** before **`roundCurrency`** summation—**with the same null / excluded semantics** as today when any required leg is missing (gold/BTC/silver paths).

---

## Per-category notes (executor read_first)

| Key | Contributions | Currency source |
|-----|---------------|-----------------|
| `gold` | items × live ₹/g | optional **`currency`** on item (rare); value still ₹-derived internally |
| `otherCommodities` | manual `valueInr`; silver grams | manual may carry **`currency`**; silver path INR-based |
| `mutualFunds` / `stocks` | platform **`currentValue`** | **`currency` optional** — default **`reportingCurrency`** |
| `bitcoin` | qty × BTC × USD × INR | treat quantity path as INR hub output; **`currency`** on schema mostly informational unless product later defines alternate |
| `property` | agreement − loan INR fields | **`currency`** optional — use conversion if present and ≠ INR |
| `bankSavings` | account **`balance`** + **`currency`** | extend beyond AED to **six-code** **`toReportingCurrency`** into INR |
| `retirement` | NPS + EPF scalar | optional **`currency`** — if absent assume INR |

Detailed edge handling belongs in PLAN **tasks** (`read_first` lists exact functions).

---

## Testing strategy hypothesis

| Risk | Mitigation |
|------|------------|
| Hub sum drift vs secondary | Unit tests:** fixed snapshot**, mixed **USD + INR** MF platforms → primary matches sum of conversions; secondary shows USD-only aggregate when **D-02** applies |
| Multi-foreign omission | Fixtures with **USD + AED** MF rows (if model allows) → **no** secondary line |
| Degraded UX | **`toReportingCurrency` fails** → assert **Rate unavailable** string + **fmtInr0** or **single-original** path per **D-04** |

---

## Validation Architecture

Phase execution should:

1. **After each task touching TS:** `npx tsc -b --pretty false`
2. **After calcs tasks:** targeted **`npm test -- --run src/lib/__tests__/…`** for new **`dashboard*`** specs
3. **Wave / plan end:** `npm test -- --run` full Vitest suite
4. **Manual UAT smoke:** roadmap success criteria (**ROADMAP** Phase 36): mixed-currency breakdown, reporting-only breakdown, degraded rate hint

Nyquist **`36-VALIDATION.md`** expands the task↔command map.

---

## RESEARCH COMPLETE
