---
phase: 08-mobile-page-fixes
plan: 02
subsystem: ui
tags: [react, shadcn, sheet, mobile, MB-03, MB-04]

requires:
  - plan: 08-01
    provides: PageHeader on all asset add/edit entry pages
provides:
  - Add/Edit sheets use max-h[100dvh] flex column with scrollable field region and fixed footer
  - Property milestone Table in horizontal scroll region with min width for narrow viewports
affects: []

tech-stack:
  added: []
  patterns: [SheetContent p-0 flex; form flex-1 min-h-0; inner overflow-y-auto px-6]

key-files:
  created: []
  modified:
    - src/pages/GoldPage.tsx
    - src/pages/MutualFundsPage.tsx
    - src/pages/StocksPage.tsx
    - src/pages/BankSavingsPage.tsx
    - src/pages/PropertyPage.tsx

key-decisions:
  - "SheetFooter stays inside <form> after scroll body; submit and delete remain type as before"
  - "Property: Table wrapped in min-w-0 overflow-x-auto; table min-w-[36rem] w-max for 375px use"

requirements-completed:
  - MB-03
  - MB-04

duration: 35min
completed: 2026-04-26
---

# Phase 8 Plan 2: Sheet layout + property table (MB-03, MB-04)

**Add/Edit `Sheet` panels use a capped viewport height, a scrollable field stack, and a non-scrolling header/footer; the property milestone grid scrolls horizontally on very narrow widths instead of clipping columns.**

## Performance

- **Duration:** ~35 min
- **Tasks:** 6
- **Build:** `npm run build` exit 0

## Accomplishments

- Gold, MF, Stocks, Bank, Property: `SheetContent` is `flex flex-col` with `max-h-[100dvh] min-h-0`, `p-0`, and `sm:max-w-lg`; `SheetHeader` in a shrink-0 padded block; form is `flex-1 min-h-0` with a middle `overflow-y-auto` region; `SheetFooter` pinned with `border-t` inside the form
- Property: milestone `Table` wrapped in `w-full min-w-0 overflow-x-auto`; `Table` has `min-w-[36rem] w-max` so a horizontal scrollbar can appear on small screens

## Task Commits

Single implementation commit in inline execution (all tasks + build verified).

## Deviations from Plan

None. Shadcn `Table` still includes an internal wrapper with `overflow-auto` — the outer `overflow-x-auto` adds `min-w-0` in the flex chain for predictable narrow layouts.

## Issues Encountered

None.

## Self-Check: PASSED

- Grep/acceptance: `min-h-0`, `overflow-y-auto`, `max-h-[100dvh]` on gold + peers; `overflow-x-auto` + `min-w-` on Property; `npm run build` clean

## Next Phase Readiness

MB-02–MB-04 delivered for Phase 8; human UAT for keyboard + real device per ROADMAP still recommended.
