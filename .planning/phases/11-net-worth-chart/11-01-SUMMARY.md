---
phase: 11-net-worth-chart
plan: 01
subsystem: ui
tags: [recharts, shadcn, tailwind, dashboard, chart]

requires:
  - phase: 10-history-schema
    provides: netWorthHistory in AppData, Record snapshot on Dashboard
provides:
  - Responsive net-worth time-series chart on Dashboard when ≥2 snapshots
  - NWH-04 insufficient-data Card when 0–1 snapshots (no misleading trend line)
affects:
  - dashboard UX and bundle size (Recharts)

tech-stack:
  added: [recharts]
  patterns: [shadcn ChartContainer + Recharts LineChart; CSS --chart-* tokens for light/dark]

key-files:
  created:
    - src/components/NetWorthOverTimeCard.tsx
  modified:
    - package.json
    - package-lock.json
    - src/index.css
    - src/pages/DashboardPage.tsx

key-decisions:
  - "Custom compact tooltip (amount + short date on one line) for D-04 instead of default ChartTooltipContent block layout"
  - "Subtle Area fill at 12% opacity under Line using same --chart-1 token"

patterns-established:
  - "Guard chart mount on sortedHistory.length >= 2 only; empty state uses exact UI-SPEC copy strings"

requirements-completed: [NWH-04]

duration: 25min
completed: 2026-04-28
---

# Phase 11: Net worth chart — Plan 01 summary

**Dashboard net worth over time: Recharts line + optional light area fill via shadcn `ChartContainer`, theme `--chart-1` tokens, and a muted empty state until two snapshots exist.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-28 (session)
- **Completed:** 2026-04-28
- **Tasks:** 1
- **Files modified:** 5 (+ existing `chart.tsx`)

## Accomplishments

- Installed **recharts**; rely on existing **shadcn** `src/components/ui/chart.tsx` primitives.
- **`NetWorthOverTimeCard`**: sorts history ascending; branches empty vs chart; INR axis/tooltip formatting aligned with Dashboard (`en-IN`, 0 decimals).
- **`DashboardPage`**: renders card below snapshot controls and above category breakdown when holdings exist.

## Task commits

1. **Task 11-01-01** — Dependencies, chart primitives, component, Dashboard wiring — `e27b755` (feat(11))

## Files created/modified

- `src/components/NetWorthOverTimeCard.tsx` — Chart + insufficient-data Card.
- `src/pages/DashboardPage.tsx` — Import and placement.
- `src/index.css` — `--chart-1` … `--chart-5` in `:root` and `.dark`.
- `package.json` / `package-lock.json` — `recharts` dependency.

## Decisions made

- Tooltip implemented as a small custom `ChartTooltip` content renderer for a single compact line (amount + date), matching D-04 minimalism.

## Deviations from plan

### Auto-fixed issues

**1. ChartTooltipContent vs custom tooltip**

- **Issue:** Default `ChartTooltipContent` layout risked a tall multi-row tooltip and awkward label pairing with `hideLabel`.
- **Fix:** Custom `content` render on `ChartTooltip` still uses the shadcn **`ChartTooltip`** wrapper from `chart.tsx` with theme-aligned container styles.

None other — plan executed as written.

## Issues encountered

None.

## User setup required

None.

## Next phase readiness

v1.3 chart scope for Phase 11 is satisfied for NWH-04; optional follow-ups (export, APIs) remain out of roadmap scope.

## Self-check

Verification commands from plan (local):

- `npm run build` — PASS
- `npm run lint` — PASS (existing project warnings only)
- Greps for `recharts`, `--chart-1`, component strings — PASS

---
*Phase: 11-net-worth-chart*
