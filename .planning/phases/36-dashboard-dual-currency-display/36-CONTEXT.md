# Phase 36: Dashboard Dual-Currency Display - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement **DSP-01** and **DSP-03** on the **Dashboard**: category **breakdown rows** show **reporting currency as the primary figure (bold)**; when holdings use **another** currency, show **original amount(s)** in **smaller muted text**; when **all** underlying amounts are already in **reporting currency**, **hide** the secondary line entirely. Cover **“rate unavailable”** presentation per roadmap success criteria (aligned with **FX-03**). Per-record **forms** and **asset detail** dual display are **Phase 37**; Settings rates / snapshots / export are **Phase 38**.

Interactive gray-area prompts were **skipped** in-session; decisions below follow **`docs/multi-currency.md`**, **`.planning/ROADMAP.md`**, prior phase context, and the current **`DashboardPage`** layout unless you edit this file.

</domain>

<decisions>
## Implementation Decisions

### Where dual-currency applies (scope)

- **D-01:** Apply the **dual-currency layout** to rows in the **“Breakdown”** card only: **Gold → Retirement** category buttons **and** the **Total Debt** row when present. **Do not** add muted “original” lines to **Net worth** headline, **Gross assets**, or **Total debt** mini-stats in the **gradient hero** card — those stay **single-line reporting** totals for this phase (matches roadmap wording *breakdown rows* and keeps heroScan simple). Chart / allocation ring remain out of scope for dual-line typography.

### Mixed non-reporting currencies within one category

- **D-02:** For each **category row**, derive the set of **distinct stored `currency` codes** among contributing records (treating **absent** `currency` as **`settings.reportingCurrency`** per DM-01).
  - **All records in reporting currency:** **no** secondary line (**DSP-03**).
  - **Exactly one** distinct **non-reporting** currency appears in that category: secondary line shows the **aggregated original** — **sum of stored amounts in that currency**, formatted for display (**one** muted line).
  - **Two or more** distinct non-reporting currencies: show **reporting primary only**; **omit** the secondary line (avoid a misleading single “original” — spec shows one illustrative secondary). Do **not** add a “Multiple currencies” label unless you later extend REQUIREMENTS.

### Original-line format

- **D-03:** **Primary:** keep current **semibold tabular** reporting figure. **Secondary:** **smaller muted** text, **below** the primary (**vertical stack**, per `docs/multi-currency.md` §7). Use **ISO currency code + formatted amount** for the original line (e.g. **`AED 225,000`** style per spec §3); reuse or extend **`src/lib/wealthFormat.ts`** helpers for consistent grouping/compact rules. **Rounding:** follow **Phase 34** rule — full precision from conversion helpers; **roundCurrency** at aggregation/display boundaries **`dashboardCalcs`** already uses.

### “Rate unavailable” vs degraded reporting conversion

- **D-04:** When **`toReportingCurrency`** (or equivalent) **cannot** produce the **reporting** primary for a row:
  - Show a **“Rate unavailable”** hint (same **copy family** as existing dashboard degraded rows — **small muted** label).
  - **Primary figure:** prefer showing **original currency value** when the row’s contributing holdings resolve to a **single interpretable original** (e.g. one foreign code + rate path broken); **otherwise** fall back to the **existing INR-internal total display** pattern already used for degraded rows (`fmtInr0`-style) so legacy data **never** hard-crashes.
  - **Do not** invent cross-rates (Phase 34 **D-05**).

### Claude's Discretion

- **Extracting** a small **`DualCurrencyCell`** (or similar) **vs** inline JSX — **planner/implementer** may choose; keep **one** breakdown of semantics per D-01–D-04.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & roadmap

- `.planning/REQUIREMENTS.md` — **DSP-01**, **DSP-03**
- `.planning/ROADMAP.md` — Phase **36** goal, success criteria (3 items), v2.4 table
- `.planning/seeds/SEED-005-multi-currency-reporting.md` — seed scope

### Product spec

- `docs/multi-currency.md` — §3 Display pattern (dual vertical stack), §4 conversion, §8 edge cases

### Prior phase context

- `.planning/phases/34-fx-infrastructure-data-model/34-CONTEXT.md` — `toReportingCurrency`, INR hub, unavailable-rate union, strict currency codes
- `.planning/phases/35-reporting-currency-selector/35-CONTEXT.md` — reporting selector scope, dashboard-first recalculation, native `<select>`

### Implementation anchors

- `src/pages/DashboardPage.tsx` — Breakdown row grid, `formatRowReporting`, degraded row paths, Total Debt row
- `src/lib/dashboardCalcs.ts` — `calcCategoryTotals`, category keys, INR rollup (extend or parallel helpers for per-currency aggregation as needed)
- `src/lib/currencyConversion.ts` — `toReportingCurrency`, `ForexRateSnapshot`
- `src/lib/wealthFormat.ts` — compact / hero formatting
- `src/types/currency.ts` — six-code union

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`DashboardPage`** — Category `button` rows already use **`formatRowReporting`** and a **degraded** branch (**Rate unavailable** + **`fmtInr0`**); extend the **non-degraded** branch with stacked primary/secondary.
- **`calcCategoryTotals`** / **`sumForNetWorth`** — INR-internal aggregates today; Phase 36 may need **parallel rollup** by **`currency`** for secondary lines (or derived from item loops consistent with existing sum functions).
- **`toReportingCurrency`** + **`LivePricesContext`** — Already wired into **`DashboardPage`** via **`forexSnapshot`**.

### Established Patterns

- **Muted / destructive** text hierarchy matches **Total Debt** and **AED** warning lines.
- **Skeleton** / **excluded** category behavior (**—**, **`AlertCircle`**) should remain; dual-currency applies when a **numeric** total is shown.

### Integration Points

- **`AppDataContext`** data + **`settings.reportingCurrency`** — already drive reporting display.
- **`useLivePrices`** — rates for conversion; session overrides (Phase 34) respected via snapshot.

</code_context>

<specifics>
## Specific Ideas

- User selected all four gray-area topics (**scope**, **mixed**, **format**, **unavailable**) but **skipped** detailed **AskQuestion** flows — confirm or adjust **D-01–D-04** in this file before **`/gsd-plan-phase 36`** if anything should change.

</specifics>

<deferred>
## Deferred Ideas

- **Dual-currency on Net worth / Gross / Debt hero block** — optional polish if you want visual parity with breakdown later; not required for DSP-01/03 as scoped here.
- **`Multiple currencies`** explicit muted label for mixed foreign rows — omitted per D-02; can promote from deferred if UX requests it.

</deferred>

---

*Phase: 36-Dashboard Dual-Currency Display*
*Context gathered: 2026-05-09*
