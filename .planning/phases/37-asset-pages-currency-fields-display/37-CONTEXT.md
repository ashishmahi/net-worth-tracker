# Phase 37: Asset Pages — Currency Fields & Display - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **AP-01**, **AP-02**, and **DSP-02** across **Gold, MF, Stocks, Bank Savings, Retirement, Bitcoin, Commodities, Property, and Liabilities**: **currency dropdown** on add/edit (six ISO codes), **persist original amounts** with **`currency`** (no silent conversion into stored numbers), and **dual-currency detail display** matching the dashboard / `docs/multi-currency.md` §3. **Exception (user):** **Retirement** page stays **INR-only** for Phase 37 — no multi-currency UI; treat balances as **INR**; international retirement schemes **deferred**. **Exception (user):** **Gold** table — **no dedicated Currency column** in UI for now; still satisfy AP-01 on the form/persistence as needed, but **defer visible column** until non-INR-native bullion pricing exists. **Neutral field names (user):** Property/Liability JSON fields that end in `Inr` should move to **neutral amount names** in persisted data and **UI/validation** — **surface + schema** scope; **optional** cleanup of internal helper names if noisy. **Out of scope for 37:** **Phase 38** (Settings rates, snapshots, export), **Dashboard** refactor to use the new shared component (deferred).

</domain>

<decisions>
## Implementation Decisions

### Add-form defaults

- **D-01:** On **Add** (new item), initialize the currency control to **`settings.reportingCurrency`** on every page that gets a dropdown in this phase (aligns **Bank** and others with roadmap SC1; replaces hardcoded INR default in `openAdd` where present).
- **D-02:** When **`currency` is missing** on a legacy record, the editor should show **`reportingCurrency` as the selected value** (DM-01 effective default); first save may persist an explicit code.
- **D-03 (exception):** **Retirement** — **no** currency dropdown in Phase 37; page remains **INR**-oriented; **deferred** broader product work to support common retirement schemes across **India, US, Europe, Singapore**.

### Dual-currency UI

- **D-04:** Introduce a **single shared smart component** (e.g. `DualCurrencyAmount`) in **`src/components/`** that **owns** `toReportingCurrency`, **Rate unavailable** (FX-03), and the **primary/secondary stack**; **formatting** aligned with **Dashboard breakdown + `BankSavingsPage`** patterns (`formatRowReporting` / `wealthFormat` style).
- **D-05:** **Do not** refactor **`DashboardPage`** in Phase 37 to use the component; **asset pages only** — shared component is introduced and consumed from **non-dashboard** surfaces first.
- **D-06:** Component is **smart** — parents pass **numeric amount**, **from currency**, **reporting currency**, and **rate snapshot** (not pre-rendered strings).

### Property & standalone liabilities

- **D-07:** **One `currency` per property record** applies to **agreement, outstanding loan, EMI, and all milestone amounts** — all stored amounts are **native** values in that currency.
- **D-08:** **Standalone liabilities** — **one `currency`** applies to **outstanding principal and EMI** consistently.
- **D-09:** **Rename persisted JSON keys** from `*Inr` to **neutral amount keys** where applicable (**property + liabilities**), with migration — **surface + schema + validation + tests that gate correctness**; **defer** purely cosmetic renames of internal helpers unless trivial.

### Tables, aggregates, Gold

- **D-10:** **Section totals** (e.g. MF portfolio total, gold section total): **reporting-currency single line only**; rely on **per-row** dual currency for drill-down (does **not** mirror dashboard D-02 aggregation rules on pages).
- **D-11:** **MF and Stocks** tabular rows: include an explicit **Currency column** plus **dual-line Value** (Gold **column** excluded per **D-12**).
- **D-12:** **Gold** — holdings remain **grams + karat**; **defer explicit Currency column** in the table until bullion supports non-INR-native valuation paths; still meet **AP-01** for the **form** and persistence as the implementer wires it.
- **D-13:** **Narrow layouts:** responsive behavior (**scroll** vs **stack cards**) is **per-page implementer discretion** with the goal of avoiding broken layouts.

### Claude's Discretion

- **Open add/edit while user changes reporting currency in the top bar:** user chose **discretion** — **default recommendation:** do **not** auto-mutate in-flight draft currency; **optional** snap only for a **fresh empty Add** if that reduces confusion (document in implementation if so).
- **Narrow table layout** per page (overflow-x vs stacked cards).
- **Gold** form vs display wiring after reviewing **`GoldPage`** and valuation paths (must respect **D-12** on the **column**).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & roadmap

- `.planning/REQUIREMENTS.md` — **AP-01**, **AP-02**, **DSP-02** (v2.4)
- `.planning/ROADMAP.md` — Phase **37** goal, success criteria, requirement IDs
- `.planning/seeds/SEED-005-multi-currency-reporting.md` — seed scope

### Product spec

- `docs/multi-currency.md` — §2 per-record currency, §3 display (note **Gold** column exception in this phase’s **D-12**), §4 conversion, §8 edge cases

### Prior phase context

- `.planning/phases/34-fx-infrastructure-data-model/34-CONTEXT.md` — conversion, migration, strict currency union
- `.planning/phases/36-dashboard-dual-currency-display/36-CONTEXT.md` — dual-line typography, DSP parity reference

### Implementation anchors (existing code)

- `src/pages/DashboardPage.tsx` — dual-line breakdown patterns (reference only; **no refactor required in 37** per **D-05**)
- `src/pages/BankSavingsPage.tsx` — form currency + row conversion patterns to align with **D-04**
- `src/lib/currencyConversion.ts` — `toReportingCurrency`
- `src/types/data.ts` — property, liability, retirement, gold, MF, stocks schemas
- `src/types/currency.ts` — six-code union

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`BankSavingsPage`** — Currency in sheet + **`toReportingCurrency`** on list rows; replace INR-only **`openAdd`** default with **`reportingCurrency`** per **D-01**.
- **`DashboardPage`** — Typography hierarchy for stacked amounts (**reference**, not extracted this phase per **D-05**).
- **`currencyConversion` / `LivePricesContext`** — Same snapshot shape as dashboard/bank.

### Established Patterns

- **React Hook Form + Zod** on sheets; **never raw `z.number()` on form fields** (existing pitfall docs).
- **Property validation** — `getPropertyValidationIssues` / **PropertyItemSchema** must stay consistent after **neutral renames** (**D-09**).

### Integration Points

- **`AppDataContext`** — `saveData`, migrations on load/import for renamed keys.
- **`useLivePrices`** — forex snapshot for smart **`DualCurrencyAmount`**.

</code_context>

<specifics>
## Specific Ideas

- User wants **neutral JSON field names** for property/liability amounts but accepts **surface-first** rename scope (**D-09**).
- Retirement explicitly **parked** as India-centric until a dedicated phase addresses multi-country schemes.

</specifics>

<deferred>
## Deferred Ideas

- **Retirement internationalization** — multi-country retirement schemes (India, US, Europe, Singapore); richer models than INR-only NPS/EPF labels.
- **Dashboard refactor** — adopt shared **`DualCurrencyAmount`** on **`DashboardPage`** (extract duplication).
- **Gold Currency column** — show when non-INR bullion valuation path is product-real.
- **Full internal rename sweep** — cosmetic **`*Inr`** identifiers in helpers after **D-09** surface pass.

</deferred>

---

*Phase: 37-Asset Pages — Currency Fields & Display*
*Context gathered: 2026-05-09*
