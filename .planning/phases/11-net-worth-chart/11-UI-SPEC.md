---
phase: "11"
slug: net-worth-chart
status: approved
shadcn_initialized: true
preset: default
baseColor: zinc
created: 2026-04-28
reviewed_at: 2026-04-28
source: "11-CONTEXT (D-01–D-05) + NWH-04 + CLAUDE.md; extends 10-UI-SPEC placement"
---

# Phase 11 — UI design contract: Net worth chart (Dashboard)

> **Scope:** Time series of `netWorthHistory` on the **Dashboard** with **light/dark** legibility, **insufficient-data** state when `length < 2`, and **Recharts** + **shadcn Chart** primitives. **Out:** export, APIs, per-asset series (per ROADMAP).

---

## Placement & layout

| Element | Position |
|--------|----------|
| **Chart block** | **Below** the top **Net worth** `Card` and the **Record snapshot** / status row; **above** the **category breakdown** `Card`. Full width of the Dashboard **content column** — same horizontal padding as sibling `Card`s (`space-y-4` rhythm with the rest of the page). |
| **Chart container** | Use **`Card`** (or `Card` + inner padding) so the chart matches other Dashboard sections. Optional `CardHeader` with a short **section title** (see copy table). |
| **Responsive** | Chart width **100%** of the content column; **height** fixed with a sensible min-height (e.g. 240–320px class range) — *implementation discretion* for exact `h-*` token. |

**Visual hierarchy (focal order):** (1) **Net worth** total in the first `Card` — primary anchor. (2) **Record snapshot** row — action to add data. (3) **Net worth over time** chart or empty state — supporting context. (4) Category breakdown — detail. The chart must not visually overpower the total; use **muted** grid/axis and **one** series color from theme.

---

## Data & behavior

| Rule | Spec |
|------|------|
| **Show chart** | When `data.netWorthHistory.length >= 2` — render **line** (or **line + subtle area fill** per D-05) with **X** = time from `recordedAt`, **Y** = `totalInr`. |
| **Empty / insufficient (NWH-04)** | When `length === 0` or `length === 1` — **do not** draw a trend line or area that implies progression. Show the **insufficient data** `Card` only. |
| **Sort order** | Points ordered by time ascending for the series (derive from ISO timestamps). |
| **Animation** | **Off** or minimal (e.g. Recharts `isAnimationActive={false}` or shortest duration) — financial readout, not marketing motion. |

---

## Chart implementation (stack)

| Layer | Decision |
|-------|----------|
| **Library** | **Recharts** (npm dependency). |
| **Styling shell** | **shadcn/ui Chart** pattern: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` (and related primitives per [shadcn charts](https://ui.shadcn.com/charts)) so colors use **CSS variables**, not one-off hex. |
| **Series paint** | **`hsl(var(--chart-1))`** (or the first chart token the official chart block maps) for stroke/fill — **after** adding chart CSS variables to `src/index.css` via the official **chart** block / documented zinc chart vars. **No** raw hex for series in light/dark. |
| **Grid / axes** | **Muted** strokes (`--border` or chart-muted tokens); **compact** X ticks (D-04) — tick count/format *implementation discretion* from date span; avoid label clutter on narrow widths. |
| **Tooltip (D-04)** | **Compact**: primary value = **formatted INR** (same family as dashboard totals, e.g. `en-IN` currency); **short** date or relative label — **one** primary line; avoid tall multi-block tooltips. |

---

## Insufficient-data state (muted Card)

| Role | Spec |
|------|------|
| **Surface** | Same **`Card`** treatment as other Dashboard blocks; **`text-muted-foreground`** for secondary lines. |
| **Heading** | **Need two snapshots to see a trend** (exact user-facing string). |
| **Body** | Explains that the chart needs **at least two snapshots over time**; directs the user to **Record snapshot** when they can add another point — align tone with existing record-disabled helper copy (short, actionable). |
| **When user cannot record** | If the same gates as Phase 10 disable recording, optional **one line** mirroring `recordBlockedMessage` semantics (*Claude’s discretion* — do not duplicate long Settings copy). |

---

## Theme & accessibility

| Topic | Spec |
|-------|------|
| **Light / dark** | All chart chrome and series colors must read correctly in **both** themes — driven by **CSS variables**, not hard-coded light-only colors. |
| **Contrast** | Series line vs background ≥ sensible readable contrast; tooltip text uses `foreground` / `muted-foreground` via chart primitives. |
| **Semantics** | Chart region has a **visible title** (heading or `aria-labelledby`); if the graphic is decorative-only with adjacent title, `aria-hidden` on SVG *only if* values are exposed elsewhere (*prefer* exposing tooltip for SR via Recharts/shadcn patterns where feasible). |

---

## Copywriting contract

| Element | Copy |
|---------|------|
| **Primary action (unchanged)** | **Record snapshot** — exact label on the Dashboard button (Phase 10). |
| **Chart section title** | **Net worth over time** (section heading for the chart `Card`). |
| **Insufficient-data heading** | **Need two snapshots to see a trend** |
| **Insufficient-data body** | Short explanation + **Record another snapshot** when eligible; if only one snapshot exists, acknowledge one point recorded and ask for a **second** snapshot later. |
| **Snapshot save error** | Inherit Phase 10 / existing: e.g. *Could not save snapshot. Check that the app is running and try again.* — no generic “Something went wrong” without a path. |
| **Destructive actions** | None introduced in this phase — *n/a*. |

---

## Design System (project)

| Property | Value |
|----------|-------|
| Tool | **shadcn/ui** |
| Preset | **default** (`components.json` — `style: default`, `baseColor: zinc`, `cssVariables: true`) |
| Component library | **Radix** (via shadcn primitives) |
| Icon library | **lucide-react** |
| Font | **System / Tailwind default** — inherits app (`body` in `index.css`) |

---

## Spacing scale

Declared values (multiples of 4 only):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, chart legend gaps |
| sm | 8px | Tooltip padding, tight stacks |
| md | 16px | Default padding inside chart card |
| lg | 24px | Section gaps (`space-y-*` alignment with Dashboard) |
| xl | 32px | Rare large gaps only |
| 2xl | 48px | Major breaks |
| 3xl | 64px | Page-level (usually N/A for this block) |

**Exceptions:** Recharts internal margins — *implementation discretion*; outer wrapper stays on Tailwind **4px grid**.

---

## Typography (this phase + Dashboard alignment)

| Role | Size | Weight | Line height |
|------|------|--------|-------------|
| Body | 16px (`text-base`) | 400 | 1.5 |
| Label / helper | 14px (`text-sm`) | 400 | 1.5 |
| Section heading (chart card title) | 18px (`text-lg`) | 600 | 1.25 |
| Axis / tick / tooltip compact | 12px (`text-xs`) | 400 | 1.4 |

**Weights used:** **400** (regular), **600** (semibold) — max two weights.

---

## Color (semantic — 60 / 30 / 10)

| Role | Token / mapping | Usage |
|------|-----------------|--------|
| Dominant (~60%) | `--background` | Page surface |
| Secondary (~30%) | `--card`, `--muted` | Cards, chart plot background feel |
| Accent (~10%) | `--primary`, **`--chart-1`** | Primary app emphasis elsewhere; **chart series stroke/fill** uses **`chart-1`** (not `--primary` fill for large areas unless token collision resolved by shadcn chart defaults) |
| Destructive | `--destructive` | Errors only (inline snapshot error) |
| Borders / grid | `--border` | Axes, gridlines |

**Accent reserved for this phase:** (1) Net worth series stroke and optional light area fill under the line. (2) Primary **focus-visible** rings on interactive chart controls if any. **Not** used for: generic body text, full-width fills unrelated to the series, or “all buttons.”

---

## Registry safety

| Registry | Blocks / deps | Safety gate |
|----------|----------------|-------------|
| **shadcn official** | Add **`chart`** block (`ChartContainer`, tooltip helpers, etc.) via `npx shadcn@latest add chart` | **not required** — official registry |
| **npm** | **`recharts`** | Standard dependency; no shadcn third-party registry |
| **Third-party shadcn registries** | **None** | — |

---

## Checker sign-off (orchestrator)

| Dimension | Result |
|-----------|--------|
| 1 Copywriting | PASS |
| 2 Visuals | PASS |
| 3 Color | PASS |
| 4 Typography | PASS |
| 5 Spacing | PASS |
| 6 Registry Safety | PASS |

**Approval:** 2026-04-28

---

## References

- `.planning/REQUIREMENTS.md` — **NWH-04**
- `.planning/phases/11-net-worth-chart/11-CONTEXT.md` — D-01–D-05
- `.planning/phases/10-history-schema/10-UI-SPEC.md` — Record snapshot copy & placement
- `src/pages/DashboardPage.tsx` — integration point
- `components.json` — shadcn preset
