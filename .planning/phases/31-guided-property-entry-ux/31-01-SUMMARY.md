---
phase: 31-guided-property-entry-ux
plan: 01
subsystem: ui
tags: [react, vitest, property, sheet]

requires:
  - phase: 31-context
    provides: UX decisions D-01–D-15 and inference defaults
provides:
  - Segmented path control + conditional Property sheet sections
  - Pure path helpers with Vitest coverage
affects:
  - Phase 32 — save validation can assume path-shaped drafts

tech-stack:
  added: []
  patterns:
    - Pure `propertyEntryPath` helpers imported by `PropertyPage`
    - Immediate draft reset on path change (D-03), no confirm dialog

key-files:
  created:
    - src/lib/propertyEntryPath.ts
    - src/lib/propertyEntryPath.test.ts
  modified:
    - src/pages/PropertyPage.tsx

key-decisions:
  - "Path switch uses immediate reset (Add + Edit); no window.confirm"
  - "PRP-03: no persisted entryKind — inference only; documented in RESEARCH"

patterns-established:
  - "Radiogroup-style path picker with three equal segments below header"

requirements-completed: [PRP-01, PRP-02, PRP-03]

duration: 25min
completed: 2026-05-06
---

# Phase 31: Guided property entry UX — Plan 31-01 Summary

**Shipped a three-path Property sheet (fully paid / milestones / mortgaged)** with conditional milestones and loan blocks, dashboard-aligned helper copy, and tested **`propertyEntryPath`** inference plus draft-reset rules.

## Performance

- **Duration:** ~25 min (inline execution)
- **Tasks:** 2 (atomic commits)
- **Files touched:** 3

## Accomplishments

- Extracted **`inferEntryPathFromPropertyItem`**, **`getDraftFieldsToReset`**, and **`PATH_LABELS`** with Vitest coverage for inference and key transitions.
- Reordered the sheet to **path → name → agreement**, then **D-07** ordering for loan vs milestones when both apply; hid milestones + liability UI on **fully paid**.
- Neutral subtitle (**D-09**) and second-person hints at agreement, loan, and paid-to-builder summary without new formulas.

## Task Commits

1. **31-01-01 — propertyEntryPath helpers + Vitest** — `14f2c66` (feat)
2. **31-01-02 — PropertyPage path UI + conditional layout** — `4e21607` (feat)

## Files Created/Modified

- `src/lib/propertyEntryPath.ts` — Path union, labels, inference, draft-reset sets.
- `src/lib/propertyEntryPath.test.ts` — Vitest cases for inference + resets.
- `src/pages/PropertyPage.tsx` — Path radiogroup, conditional blocks, save shaping for fully paid.

## Deviations

- None.

## Self-Check: PASSED

- `npm test -- --run` — pass  
- `npm run build` — pass  
- Plan acceptance greps — pass  
