# Phase 36: Dashboard Dual-Currency Display - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement **DSP-01** and **DSP-03** on the **Dashboard**: **Breakdown** category rows show **reporting currency as the primary figure (bold / dominant)**; when contributing holdings use **another** currency, show **original amount(s)** in **smaller muted text below**; when **all** underlying amounts are already in **reporting currency**, **hide** the secondary line entirely. Cover **“rate unavailable”** per roadmap success criteria (aligned with **FX-03**). **Hero** net worth and **Gross assets / Total debt / Debt·asset** mini-stats stay **single-line reporting** totals for this phase. **Total Debt** row inside the Breakdown card stays **single-line** (reporting), matching the **phase design prototype**. Per-record **forms** and **asset detail** dual display are **Phase 37**; Settings rates / snapshots / export are **Phase 38**. Chart and allocation ring are **not** in scope for dual-line typography.

</domain>

<decisions>
## Implementation Decisions

### Where dual-currency applies (scope)

- **D-01:** Apply the **dual-currency stack** only to **Breakdown** card **category** rows (Gold → Retirement). **Do not** add muted “original” lines to the **gradient hero**: **Net worth** headline, **Gross assets**, **Total debt**, or **Debt / asset** — **single-line reporting** only. **Do not** add a secondary line on the **Total Debt** row in Breakdown (prototype shows **one** reporting-currency figure there). Matches **`.planning/ROADMAP.md`** emphasis on breakdown rows and the **layout prototype** (`design/net-worth-tracker-redesign-v2/`).

### Mixed non-reporting currencies within one category

- **D-02:** Per category row, derive **distinct stored `currency` codes** among contributing records (**absent** `currency` → **`settings.reportingCurrency`** per **DM-01**).
  - **All reporting:** **no** secondary line (**DSP-03**).
  - **Exactly one** distinct **non-reporting** code: secondary shows **aggregated original** — **sum of stored amounts in that currency**, **one** muted line.
  - **Two or more** distinct non-reporting codes: **reporting primary only**; **omit** secondary (prototype does not model multi-foreign breakdown; avoids one misleading “original”).
  - **Do not** add a **“Multiple currencies”** label unless promoted from deferred later.

### Original-line format (prototype + spec)

- **D-03:** **Layout:** **Vertical stack** in the amount column — **primary** larger semibold/tabular (**~14px** visual weight per prototype `.row .val`), **secondary** below (**~11px**, muted, **~1px** gap, tabular nums — `.row .val-local` in prototype). Use existing **Tailwind/shadcn** tokens to match this hierarchy; do not depend on shipping the static HTML bundle.
- **Copy:** Primary follows current **`formatRowReporting` / `fmtCompactForReporting`** style for **reporting** currency. Secondary: **currency label + formatted amount** — prefer **`wealthFormat`** (or extension) for grouping/compact rules; **symbols vs ISO** may match **spec §3** and **Phase 35** topbar (`₹ INR`, `$ USD`, literal **AED** / **SGD** style) rather than forcing one global rule if the formatter already encodes per-code display.
- **Rounding:** **Phase 34** — full precision from **`toReportingCurrency`**; **`roundCurrency`** at aggregation/display boundaries (**`dashboardCalcs`** conventions).

### “Rate unavailable” vs degraded conversion

- **D-04:** When **`toReportingCurrency`** cannot produce the **reporting** primary for a row:
  - Show a **“Rate unavailable”** hint (**small muted**, same family as existing dashboard degraded rows).
  - **Primary:** prefer **original currency value** when the row resolves to **one interpretable foreign total**; **else** fall back to the **existing INR-internal / `fmtInr0`-style** degraded display path so legacy data **never** hard-crashes.
  - **Do not** invent cross-rates (**Phase 34 D-05**).

### Claude's Discretion

- **`DualCurrencyCell`** (small component) **vs** inline JSX in **`DashboardPage`** — implementer chooses; keep **one** place that encodes **D-01–D-04** semantics.

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

### Layout prototype (Phase 36)

- `.planning/phases/36-dashboard-dual-currency-display/design/net-worth-tracker-redesign-v2/Wealth Tracker.html` — open in browser with local bundle (see `app.jsx` / `styles.css` sibling files)
- `.planning/phases/36-dashboard-dual-currency-display/design/net-worth-tracker-redesign-v2/app.jsx` — Breakdown rows: `.val` + conditional `.val-local` (~361–366); hero single-line (~284–310); Total Debt row single-line (~373–379)
- `.planning/phases/36-dashboard-dual-currency-display/design/net-worth-tracker-redesign-v2/styles.css` — `.row .val`, `.row .val-local` typography

### Prior phase context

- `.planning/phases/34-fx-infrastructure-data-model/34-CONTEXT.md` — `toReportingCurrency`, INR hub, unavailable-rate union, strict currency codes
- `.planning/phases/35-reporting-currency-selector/35-CONTEXT.md` — reporting selector, dashboard-first recalculation, native `<select>`

### Implementation anchors (shipped app)

- `src/pages/DashboardPage.tsx` — Breakdown row grid, `formatRowReporting`, degraded paths, Total Debt row
- `src/lib/dashboardCalcs.ts` — category totals; extend or parallel helpers for **per-currency** aggregation where needed
- `src/lib/currencyConversion.ts` — `toReportingCurrency`, `ForexRateSnapshot`
- `src/lib/wealthFormat.ts` — compact / tabular formatting
- `src/types/currency.ts` — six-code union

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`DashboardPage`** — Category rows use **`formatRowReporting`** and **degraded** branches (**Rate unavailable** + **`fmtInr0`**); extend **non-degraded** path with stacked primary/secondary aligned to **D-03**.
- **`calcCategoryTotals`** / **`sumForNetWorth`** — INR-oriented aggregates today; Phase 36 may need **rollup by `currency`** for secondary lines (or equivalent item-level loops consistent with existing sums).
- **`toReportingCurrency`** + **`LivePricesContext`** — Wired via **`forexSnapshot`** on the dashboard.

### Established Patterns

- **Muted / destructive** hierarchy aligns with existing **Total Debt** and AED warning patterns.
- **Skeleton** / excluded category behavior (**—**, **`AlertCircle`**) unchanged; dual-currency applies where a **numeric** total shows.

### Integration Points

- **`AppDataContext`** + **`settings.reportingCurrency`** drive reporting display.
- **`useLivePrices`** — rates for conversion; session overrides (**Phase 34**) respected via snapshot.

</code_context>

<specifics>
## Specific Ideas

- Context **re-created** after accidental edit; user confirmed **`design/net-worth-tracker-redesign-v2`** as the visual reference **for breakdown dual-line layout and surface scope** (not full app parity).
- **`PhoneDashboard`** in the prototype omits `.val-local` — shipped app should **preserve secondary line on narrow breakpoints** unless a follow-up UX phase tightens layout.

</specifics>

<deferred>
## Deferred Ideas

- **Dual-currency on hero** (Net worth / Gross / Debt mini-stats) — optional polish; not required for **DSP-01/03** as scoped here.
- **Explicit “Multiple currencies”** muted label — omitted per **D-02**; promote if UX requests it.
- **Match prototype mobile** breakdown (hide secondary on phone) — deferred unless user requests parity with **`PhoneDashboard`**.

</deferred>

---

*Phase: 36-Dashboard Dual-Currency Display*
*Context gathered: 2026-05-09*
