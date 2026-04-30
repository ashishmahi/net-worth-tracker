---
phase: 13
plan: "01"
status: complete
completed: "2026-05-01"
---

## Outcome

- `SectionKey` gains `commodities` with sidebar nav after Gold; `App` wires `CommoditiesPage`.
- New `CommoditiesPage`: list + sheets for standard silver (grams) and manual (label + ₹), rich empty state with two primary actions, delete-in-sheet pattern aligned with Gold.
- Read-only approximate INR for silver when live rates exist (`useLivePrices` + same INR/gram formula as `calcCategoryTotals`); nothing persisted on standard items beyond grams.
- `GoldPage.tsx` unchanged.

## Key files

- `src/components/AppSidebar.tsx`
- `src/App.tsx`
- `src/pages/CommoditiesPage.tsx`

## Self-Check: PASSED

- `npm test` (vitest)
- `npx tsc -b --noEmit`
- `git diff src/pages/GoldPage.tsx` empty

## Deviations

- None.
