# Phase 11: Net worth chart - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `11-CONTEXT.md`.

**Date:** 2026-04-28
**Phase:** 11 — Net worth chart
**Areas discussed:** Chart stack, Dashboard layout, Empty state, Axes & tooltips

---

## Gray area selection

User chose to discuss: **stack**, **layout**, **empty**, **axis**. User did **not** select **series look** (line vs area) — captured as **D-05** default in CONTEXT.md.

---

## Chart stack

| Option | Description | Selected |
|--------|-------------|----------|
| Recharts + shadcn Chart pattern | Add Recharts + shadcn/ui Chart primitives (ChartContainer, etc.) | ✓ |
| Recharts only, manual styling | ResponsiveContainer + Tailwind/CSS variables, no shadcn chart wrapper | |
| You decide | Minimal deps, match Dashboard cards | |

**User's choice:** Recharts + shadcn Chart pattern.

---

## Dashboard layout

| Option | Description | Selected |
|--------|-------------|----------|
| Below net worth Card | Chart below main net worth Card + snapshot row; full width of content column | ✓ |
| Above net worth Card | Trend before big number | |
| You decide | Summary first, then chart | |

**User's choice:** Below net worth Card (interpreted in CONTEXT as: after net worth Card **and** Record snapshot/status row, before category breakdown).

---

## Empty state (0–1 snapshots)

| Option | Description | Selected |
|--------|-------------|----------|
| Muted Card + guidance | Title + explain 2+ points + point to Record snapshot when eligible | ✓ |
| Minimal inline | Paragraph only, no extra Card | |
| You decide | Match other Dashboard empty hints | |

**User's choice:** Muted Card with guidance.

---

## Axes & tooltips

| Option | Description | Selected |
|--------|-------------|----------|
| Adaptive en-IN | Sensible ticks; tooltip INR + date | |
| Compact | Compact X labels + minimal tooltip (amount-focused or minimal chrome) | ✓ |
| You decide | Recharts defaults tuned for mobile | |

**User's choice:** Compact — locked in CONTEXT as minimal tooltip (INR-primary, avoid verbose date+amount blocks).

---

## Claude's Discretion

- Series stroke vs fill emphasis (**D-05** in CONTEXT).
- Tick algorithms, exact tooltip string shape within “compact” constraint.
- File placement for shadcn chart helpers.

## Deferred Ideas

None recorded during this session.
