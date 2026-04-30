# Phase 13 — UI design contract

**Phase:** Commodities: product UX  
**Status:** Ready for planning  
**Aligned with:** `13-CONTEXT.md`

---

## Screens

### Commodities (new primary section)

- **Route:** Sidebar item **Commodities** (same hierarchy as Gold / Mutual Funds — not under Settings).
- **Header:** `PageHeader` title **Commodities** (match sibling pages).
- **List:** Card-based list of `data.assets.otherCommodities.items` (mirror Gold list density and tap targets; `min-h` affordances consistent with `GoldPage`).
- **Primary actions:** At least one **Add** entry point that can reach both **Silver (grams)** and **Manual (label + ₹)** flows (either single Add → type step, or two visible buttons — implementer choice per D-03).

### Sheets (add / edit)

- **Silver (`standard`):** Fields: **grams** (text + `inputMode="decimal"`, parse via `parseFinancialInput`). Live value is derived from `useLivePrices()` — read-only display when rate available; show muted helper when rate missing (no ad-hoc fetch in page).
- **Manual (`manual`):** Fields: **label** (required string), **valueInr** (text → `parseFinancialInput` → nonnegative).
- **Patterns:** RHF + Zod string schemas → numeric parse on submit (same as `GoldPage`). Destructive delete with confirmation pattern aligned with Gold.

### Empty state

- Short copy explaining **silver (grams, live-derived ₹)** vs **manual (fixed ₹ label)**.
- **Two** primary actions (e.g. “Add silver” / “Add manual item”) — not a single generic CTA only.

### Dashboard

- **Commodities** row remains **one** combined row; optional secondary line or tooltip for partial/live caveats (already partially present — may refine copy only).
- Row click navigates to **Commodities** section (not Settings).

### Gold row (dashboard only)

- **Cosmetic only:** spacing, icon, or subtitle tweaks so the summary table sits visually next to the polished Commodities row — **no** change to gold total semantics or labels beyond presentation.

---

## Non-goals (UI)

- No CRUD for non-gold commodities inside `GoldPage`.
- No new commodity kinds beyond `silver` / `manual` in this phase.
- No storing computed totals in JSON.

---

## Accessibility

- Sheet titles describe add vs edit.
- Buttons and row links have explicit `aria-label` where pattern exists on sibling pages (`DashboardPage` row buttons).

---

*Generated for Phase 13 planning — mirrors locked decisions in `13-CONTEXT.md`.*
