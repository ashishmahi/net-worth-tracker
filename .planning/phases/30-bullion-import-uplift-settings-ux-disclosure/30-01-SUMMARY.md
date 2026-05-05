---
phase: 30-bullion-import-uplift-settings-ux-disclosure
plan: 01
subsystem: ui
tags: [react, settings, disclosure, bullion, BLN-04]

requires:
  - phase: 29-bullion-import-uplift-data-calculations
    provides: uplifted live ₹/g hints and persisted uplift keys (no UI tuning in v2.2)
provides:
  - Centralized read-only disclosure strings for gold/silver import-style uplift (~10% / ~8% ballpark)
  - Per-card parity explanation and approximate / non-advice footnotes on Settings pricing cards
  - REQUIREMENTS.md BLN-04 aligned with disclosure-only v2.2 decision
affects: []

tech-stack:
  added: []
  patterns:
    - "Copy lives in src/lib/bullionUpliftDisclosure.ts; cards import constants only"

key-files:
  created:
    - src/lib/bullionUpliftDisclosure.ts
  modified:
    - src/components/settings/SettingsGoldPricingCard.tsx
    - src/components/settings/SettingsSilverPricingCard.tsx
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Parity line describes uplift on top of spot × USD→INR parity ₹/g per 30-CONTEXT D-05"

patterns-established:
  - "BLN-04 legal/educational strings centralized to avoid gold/silver drift"

requirements-completed: [BLN-04]

duration: 0min
completed: 2026-05-06
---

# Phase 30: Bullion import uplift — Settings UX & disclosure — Summary

**Read-only ballpark uplift copy (~10% gold / ~8% silver), shared parity one-liner, and per-card approximate / not legal or tax advice footnotes on Settings gold and silver cards, plus REQUIREMENTS clarification for disclosure-only v2.2.**

## Performance

- **Tasks:** 1
- **Files modified:** 4 (per plan)

## Accomplishments

- Added `bullionUpliftDisclosure.ts` with exported constants for ballpark, parity, and disclaimer copy
- Appended muted disclosure block (last in `CardContent`) on both Settings commodity pricing cards
- Updated **BLN-04** in `REQUIREMENTS.md` for disclosure-only shipped intent (no uplift tuning UI)

## Task Commits

1. **30-01-01 — Disclosure copy module + Settings cards (Wave 1)** — `bde3b1b` (feat)

## Files Created/Modified

- `src/lib/bullionUpliftDisclosure.ts` — string constants for BLN-04 disclosure
- `src/components/settings/SettingsGoldPricingCard.tsx` — imports + disclosure block
- `src/components/settings/SettingsSilverPricingCard.tsx` — imports + disclosure block
- `.planning/REQUIREMENTS.md` — BLN-04 bullet + last updated

## Decisions Made

Followed **30-UI-SPEC** order: ballpark → parity line → footnote; no tuning controls added.

## Deviations from Plan

None — plan executed as written.

## Issues Encountered

None

## Next Phase Readiness

BLN-04 UX complete for v2.2; milestone verification can close Phase 30 after `/gsd-verify-work` if needed.

## Self-Check: PASSED

---
*Phase: 30-bullion-import-uplift-settings-ux-disclosure*
*Completed: 2026-05-06*
