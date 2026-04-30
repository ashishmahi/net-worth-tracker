---
phase: 13
plan: "02"
status: complete
completed: "2026-05-01"
---

## Outcome

- Dashboard **Commodities** row navigates to `commodities` (`NAV_KEY.otherCommodities`).
- Net-worth exclusion card and record-snapshot blocked copy mention **Commodities** for holdings/manual values when commodity totals are incomplete.
- Subtle **Includes silver & manual** hint when both item types exist.
- **Gold** row label paired visually with `Coins` icon only — no calc/nav/key changes.

## Key files

- `src/pages/DashboardPage.tsx`

## Self-Check: PASSED

- `npm test`
- `npx tsc -b --noEmit`

## Deviations

- `gsd-sdk verify.key-links` for this plan still reports “Source file not found” for the NAV_KEY → AppSidebar check (tooling/path resolution); wiring verified manually in code.
