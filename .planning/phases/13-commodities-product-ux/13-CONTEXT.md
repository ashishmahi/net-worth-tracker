# Phase 13: Commodities: product UX - Context

**Gathered:** 2026-04-30  
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers **product UX** for **non-gold** commodity holdings: **add / edit / remove** lines for **`standard` (silver, grams)** and **`manual` (label + ₹ value)** items (COM-03), **clear Dashboard and navigation** surfacing of commodity wealth (COM-04), and **preservation of gold’s karat + grams + Settings gold prices** entry model (COM-06).

**In scope:** New **sidebar destination** and **Commodities page** with RHF + Zod patterns consistent with other asset sections; **Dashboard** row polish and wayfinding to the new section; **empty states**; update **`NAV_KEY` / row navigation** so the Commodities dashboard row no longer routes to Settings.

**Out of scope:** Changes to persisted schema beyond what Phase 12 defined; live feeds beyond existing silver API; tax-lot / cost basis; new commodity **kinds** beyond silver for `standard` (enum extension is a later phase).

</domain>

<decisions>
## Implementation Decisions

### Navigation & entry

- **D-01:** Add a **dedicated sidebar item** labeled **Commodities** (new `SectionKey` + route/page), following the same **page + sheet** pattern as **Mutual Funds / Stocks / Gold** — not Settings-only management.
- **D-02:** **Dashboard** “Commodities” row should **navigate to the Commodities section** (replace today’s `otherCommodities → settings` mapping in `DashboardPage.tsx`).

### CRUD & forms

- **D-03 (Claude’s discretion):** Exact **add/edit flow** (one vs two entry points, sheet vs inline, type picker ordering) is **planner’s choice** subject to: **RHF + Zod**, accessibility and validation parity with **GoldPage** / **StocksPage**, and **discriminated union** fields from `OtherCommodityItem` (`standard`: `kind` + `grams`; `manual`: `label` + `valueInr`). Prefer the **smallest implementation** that stays consistent with existing patterns.

### Dashboard & COM-04

- **D-04:** Keep a **single** combined **“Commodities”** dashboard row (no second row for silver vs manual in v1.4). **May** add **subtitle, secondary line, and/or tooltip** when it improves understanding (e.g. silver vs manual contribution, live price caveat) without duplicating Phase 12’s exclusion math.

### Gold boundary (COM-06)

- **D-05:** **GoldPage** — **no functional or layout changes** to karat/grams sheets, list behavior, or Settings gold price wiring.
- **D-06:** **Dashboard only:** **cosmetic alignment** for the **Gold** row is allowed (copy, spacing, icon treatment) so it visually fits next to the polished Commodities row — **no change** to how gold totals are computed or labeled semantically (still “Gold”).

### Empty states

- **D-07:** **Commodities** section **empty state** should include a **short explainer** (what silver vs manual means) and **two primary actions** (e.g. add silver / add manual item), not a single generic button only.

### Claude's Discretion

- **D-03** — CRUD UX mechanics (exact sheet titles, field order, whether “Add” is one button with type step vs two buttons).
- Secondary Dashboard copy for silver-unavailable / partial totals (Phase 12 already allows informational flags).
- Minor visual details on Commodities list (cards vs table) if consistent with sibling pages.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap

- `.planning/REQUIREMENTS.md` — **COM-03**, **COM-04**, **COM-06** (Phase 13)
- `.planning/ROADMAP.md` — v1.4 Phase 13 row

### Prior phase (data & behavior)

- `.planning/phases/12-commodities-data-net-worth/12-CONTEXT.md` — discriminated union, silver live pricing, combined Commodities row math, Phase 12 vs 13 split

### Product / code conventions

- `CLAUDE.md` — no computed totals in JSON, `roundCurrency`, `useLivePrices()` / `priceApi.ts`, RHF + Zod patterns

### Integration points (expected touchpoints)

- `src/components/AppSidebar.tsx` — `SectionKey`, `NAV_ITEMS`
- `src/App.tsx` — `SECTION_COMPONENTS` map
- `src/pages/DashboardPage.tsx` — `NAV_KEY`, row labels, Commodities row navigation & optional subtext/tooltip
- `src/pages/GoldPage.tsx` — **reference only** for patterns; **no functional changes** per D-05
- `src/types/data.ts` — `OtherCommodityItem` / `OtherCommoditiesSchema` (consume, do not redesign)
- `src/context/AppDataContext.tsx` — `saveData` / item updates

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`GoldPage.tsx`** — Sheet layout, `openAdd` / `openEdit`, Zod string fields → parse on submit, `PageHeader`, destructive actions pattern.
- **`StocksPage.tsx` / `MutualFundsPage.tsx`** — Platform/list + sheet CRUD template.
- **`DashboardPage.tsx`** — `ROW_LABEL`, `NAV_KEY`, `calcCategoryTotals`, silver loading / `hasSilverItems` — extend navigation target for `otherCommodities`.

### Established patterns

- **Section pages** are top-level sidebar routes with **Card** lists and **Sheet** forms.
- **Live silver** is read-only in UI (grams edited; value derived via `useLivePrices()`).

### Integration points

- New page registered beside `GoldPage`; **do not** fold non-gold CRUD into `GoldPage` (keeps COM-06 clear).

</code_context>

<specifics>
## Specific Ideas

- User chose **rich empty state** with **dual primary actions** for discoverability.
- User chose **Dashboard-only** cosmetic flexibility for the **Gold** row so the summary table stays visually cohesive after Commodities polish.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 13 scope.

</deferred>

---

*Phase: 13-commodities-product-ux*  
*Context gathered: 2026-04-30*
