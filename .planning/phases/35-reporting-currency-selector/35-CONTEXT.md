# Phase 35: Reporting Currency Selector - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the **reporting currency control** in the **top bar** (desktop `AppTopbar` + mobile `MobileTopBar`), wired to **`settings.reportingCurrency`**, with **immediate recalculation** of dashboard aggregates when the selection changes and **persistence** across reloads (RC-01–RC-03). FX feeds, conversion utilities, schema, and migration are **Phase 34** — reuse them; **dual-currency row layout** on dashboard (DSP-01/03) is **Phase 36**; per-record currency **forms** are **Phase 37**; Settings rates card / snapshots / export details are **Phase 38**.

</domain>

<decisions>
## Implementation Decisions

### Mobile vs desktop control

- **D-01:** Use a **native `<select>`** for reporting currency on **both** desktop and mobile — **one interaction pattern**, no compact chip in Phase 35. (User briefly preferred chip + popover per `docs/multi-currency.md` §7, then chose **consistency** over chip.) The milestone **Future** item (“compact badge/chip”) remains a later UX polish phase.

### RC-02 — instant recalculation scope (Phase 35)

- **D-02:** **Primary acceptance for Phase 35:** changing reporting currency **without page reload** updates **Dashboard** net worth, category totals, and breakdown rows that are part of the dashboard experience. **Do not** treat Phase 35 as the milestone to guarantee live refresh of every other route’s totals; later phases wire remaining surfaces (see roadmap Phases 36–37).

### Desktop top bar placement

- **D-03:** In `AppTopbar`, place the reporting-currency `<select>` **after** the “Live prices” pill and **before** the USD/INR chip — reads as **user reporting lens**, then **market** quotes (USD/INR, BTC).

### Dropdown labels & control type

- **D-04:** Option labels follow the product spec: **symbol + code** (e.g. ₹ INR, $ USD, AED …) for the six supported currencies.
- **D-05:** Use **native `<select>`** (not Radix Select) for **built-in accessibility**; theme styling within normal limits for native controls.

### Claude's Discretion

- **None** — user locked pattern (native select), labels, placement, and dashboard-first RC-02 scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- `.planning/REQUIREMENTS.md` — RC-01, RC-02, RC-03 traceability
- `.planning/ROADMAP.md` — Phase 35 goal, success criteria (3 items), boundary vs Phases 36–38
- `.planning/seeds/SEED-005-multi-currency-reporting.md` — seed scope

### Product spec

- `docs/multi-currency.md` — §1 reporting selector (note: §7 mobile **chip** deferred in favor of native `<select>` in Phase 35 per decisions above)

### Prior phase context

- `.planning/phases/34-fx-infrastructure-data-model/34-CONTEXT.md` — locked FX feed, `toReportingCurrency`, migration, six-code union

### Implementation anchors

- `src/components/AppTopbar.tsx` — desktop sticky header; live price chips; integration point for `<select>`
- `src/components/MobileTopBar.tsx` — mobile header; add reporting `<select>` alongside existing controls
- `src/context/AppDataContext.tsx` — `reportingCurrency` on settings, persistence
- `src/lib/dashboardCalcs.ts` / dashboard route components — aggregates to refresh for RC-02 (dashboard scope)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`AppTopbar`** — right cluster already holds “Live prices”, USD/INR, BTC; add reporting `<select>` after the Live pill per D-03.
- **`MobileTopBar`** — minimal row (menu, home, theme); **native `<select>`** must fit without breaking touch targets (planner may adjust layout/wrap).
- **`AppDataContext`** — `reportingCurrency` defaults and save path from Phase 34.
- **`toReportingCurrency`** / **`LivePricesContext`** — Phase 34 utilities for conversion at display/calc boundaries.

### Established Patterns

- Settings and data mutations go through **`AppDataContext`**; reporting currency updates should follow the same **immediate persist** pattern as other settings unless a future decision adds UX feedback (not discussed this session).

### Integration Points

- **Dashboard route** — primary place where RC-02 behavior is verified for Phase 35.
- Other routes (e.g. pages already referencing `reportingCurrency`) may pick up new settings on navigation; **explicit Phase 35 deliverable** is dashboard instant refresh.

</code_context>

<specifics>
## Specific Ideas

- User prioritized **consistent `<select>`** on desktop and mobile over the spec’s mobile chip pattern for this phase.

</specifics>

<deferred>
## Deferred Ideas

- **Compact badge/chip + popover** for mobile reporting currency — aligns with `docs/multi-currency.md` §7 and `.planning/REQUIREMENTS.md` Future section; deferred past Phase 35.

### Reviewed Todos (not folded)

*(None — no todo matches for phase 35.)*

</deferred>

---

*Phase: 35-Reporting Currency Selector*
*Context gathered: 2026-05-08*
