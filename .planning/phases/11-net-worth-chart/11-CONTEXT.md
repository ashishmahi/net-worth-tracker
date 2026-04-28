# Phase 11: Net worth chart - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Render a **time series** of persisted net worth snapshots on the **Dashboard**: **Y** = `totalInr`, **X** = `recordedAt` from `data.netWorthHistory`, responsive width, **legible in light and dark** theme. When there are **fewer than two** points, show a clear **insufficient data** state — **no** line that implies a trend (**NWH-04**). **Out of scope:** export, new APIs, per-asset series (per ROADMAP / REQUIREMENTS).

</domain>

<decisions>
## Implementation Decisions

### Chart stack
- **D-01:** Use **Recharts** together with the **shadcn/ui Chart** pattern (`ChartContainer` and related primitives as in the shadcn charts documentation) so styling aligns with **theme tokens** and existing UI. Add the **recharts** dependency and any **shadcn chart** pieces the project does not yet have (generator or hand-port per project convention).

### Dashboard layout
- **D-02:** Place the chart **below** the main **Net worth** `Card` and the **Record snapshot** / status row, and **above** the **category breakdown** `Card` — full width of the Dashboard **content column** (same horizontal rhythm as other Cards).

### Empty / insufficient data (0–1 snapshots)
- **D-03:** Use a **muted Card** with a **short title**, copy that explains you need **at least two snapshots over time** to show a trend, and **point users to “Record snapshot”** when they are eligible to record (mirror gating ideas from the existing record-disabled messaging where helpful).

### Axes & tooltips
- **D-04:** Prefer **compact** presentation: **minimal X-axis labels** (avoid clutter on mobile), **tooltip kept small** — show **formatted INR** as the primary value; **avoid long date + amount blocks** in the tooltip (e.g. one compact line or amount-forward). Exact tick count is **Claude’s discretion** from data span.

### Series visualization (not discussed live)
- **D-05:** Roadmap allows **line or area**; default implementation should use a **single primary series** with **readable contrast** in both themes — **line with optional light fill** is acceptable if it stays subtle and does not argue with **D-04** minimalism.

### Claude's Discretion
- Exact **shadcn** file layout under `src/components/ui/` vs a local `components/chart.tsx` mirror; **Recharts** `CartesianGrid` / `XAxis` tick formatter details; **responsive height**; animation off or minimal for a financial readout.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — **NWH-04** (chart + empty state when &lt;2 snapshots)
- `.planning/ROADMAP.md` — Phase 11 goal, success criteria, depends on 10.1
- `.planning/STATE.md` — v1.3 decisions and current focus

### Prior phase context (data shape & Dashboard)
- `.planning/phases/10-history-schema/10-CONTEXT.md` — `netWorthHistory`, Record snapshot, migration expectations
- `.planning/phases/10-history-schema/10-UI-SPEC.md` — Dashboard / Record snapshot UI contract if still authoritative for placement tone

### Code
- `src/types/data.ts` — `NetWorthPointSchema`, `netWorthHistory`
- `src/pages/DashboardPage.tsx` — integration point for chart + empty state
- `src/lib/dashboardCalcs.ts` — `sumForNetWorth` semantics (display total must stay consistent with snapshot rows)
- `CLAUDE.md` — project conventions (INR rounding, no bogus persistence)

### Product / architecture
- `.planning/PROJECT.md` — v1.3 milestone scope
- `.planning/research/ARCHITECTURE.md` — stack reference if needed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`Card`**, **`PageHeader`**, **`Button`**, **`Skeleton`** — Dashboard already composes the net worth block and category table with these primitives.
- **`useAppData()`** — `data.netWorthHistory` is available for series + length checks.
- **`roundCurrency` / `sumForNetWorth` / `calcCategoryTotals`** — same semantic total as snapshot rows (already used in `handleRecordSnapshot`).

### Established Patterns
- **shadcn/ui** under `src/components/ui/`; **Tailwind** + **CSS variables** for light/dark (**ThemeProvider** / class strategy per v1.1).
- Dashboard layout: `space-y-4`, **Card** sections stacked vertically.

### Integration Points
- **`DashboardPage.tsx`** — insert chart section after snapshot controls, before category `DASHBOARD_CATEGORY_ORDER` Card.
- **`package.json`** — **recharts** not yet installed; chart UI components may need to be added following shadcn charts pattern.

</code_context>

<specifics>
## Specific Ideas

- Align new chart colors with **chart-1** / foreground / muted theme tokens once shadcn chart pieces exist — **no** hard-coded colors that break dark mode.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 11 scope.

</deferred>

---

*Phase: 11-net-worth-chart*
*Context gathered: 2026-04-28*
