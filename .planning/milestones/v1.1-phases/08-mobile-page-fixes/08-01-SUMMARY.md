---
phase: 08-mobile-page-fixes
plan: 01
subsystem: ui
tags: [react, tailwind, shadcn, page-header, mobile, MB-02]

requires:
  - phase: 07-mobile-foundation
    provides: Mobile shell, offcanvas nav
provides:
  - Shared PageHeader with stacked title + full-width CTA under 768px, row at min-[768px]
  - Dashboard and all seven asset pages use PageHeader; aria/output preserved
affects: []

tech-stack:
  added: []
  patterns: [PageHeader for all section h1 + optional meta + primary action]

key-files:
  created:
    - src/components/PageHeader.tsx
  modified:
    - src/pages/DashboardPage.tsx
    - src/pages/GoldPage.tsx
    - src/pages/MutualFundsPage.tsx
    - src/pages/StocksPage.tsx
    - src/pages/BankSavingsPage.tsx
    - src/pages/PropertyPage.tsx
    - src/pages/BitcoinPage.tsx
    - src/pages/RetirementPage.tsx

key-decisions:
  - "Action column uses w-full on Button and wrapper min-[768px]:w-auto for MB-02"
  - "Meta slot holds section totals, alerts, and Gold Settings hint unchanged"

patterns-established:
  - "PageHeader: flex-col gap-3; min-[768px]:flex-row min-[768px]:items-start min-[768px]:justify-between"

requirements-completed:
  - MB-02

duration: 25min
completed: 2026-04-26
---

# Phase 8 Plan 1: Page headers (MB-02)

**A shared `PageHeader` unifies section titles, optional `meta` (totals, alerts), and primary actions so narrow viewports stack a full-width CTA without horizontal header overflow, matching `08-UI-SPEC` D-01–D-03.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 6
- **Files modified:** 8 (1 created)

## Accomplishments

- `PageHeader` centralizes `min-[768px]` layout and `min-w-0` on the title column
- Gold, MF, Stocks, and Bank pass `output` and conditional copy through `meta`; add buttons use `w-full min-[768px]:w-auto`
- Dashboard, Bitcoin, and Retirement use title-only (or title + existing body content below)

## Task Commits

Single feature commit in inline execution; tasks verified against plan acceptance criteria and `npm run build`.

1. **Task 1: PageHeader component** — in main commit
2. **Task 2–5: page wiring** — in main commit
3. **Task 6: build** — `npm run build` exit 0

**Plan metadata:** with docs commit including this SUMMARY

## Files Created/Modified

- `src/components/PageHeader.tsx` — title h1, optional meta, optional action with responsive CTA width
- Asset and dashboard pages — import and use `PageHeader` per plan

## Deviations from Plan

None

## Issues Encountered

`gsd-sdk query state.begin-phase` misparsed arguments and corrupted `STATE.md` (literal `--phase` in body). Corrected manually in the same phase session.

## Self-Check: PASSED

- `npm run build` exits 0
- Grep checks from plan: `min-[768px]`, `text-xl font-semibold` on h1, `PageHeader` usage, no legacy `flex items-start justify-between` in updated pages
