---
status: passed
phase: 31-guided-property-entry-ux
verified: 2026-05-06
---

# Phase 31 verification

## Goal (from roadmap)

Guided **path selection** (paid off / milestones / mortgaged); **conditional sections** and **helper copy** on Property add/edit — **PRP-01–PRP-03**.

## Must-haves (from plan)

| Requirement | Evidence |
|-------------|----------|
| Three-option path control before name/agreement | `PropertyPage.tsx` — radiogroup segments first in scroll body; `PATH_LABELS` |
| Fully paid hides milestones + liability switch | Conditional `milestonesBlock` / `liabilityBlock` null when `entryPath === 'fullyPaid'` |
| D-07 loan before milestones when both matter | `loanBeforeMilestones` + block order |
| Path change clears drafts per D-03 | `getDraftFieldsToReset` + `handleEntryPathChange` |
| Path-neutral subtitle + second-person helpers | `property-form-desc` + agreement / loan / summary hints |
| PRP-03: no entryKind by default | No `PropertyItem` schema change; inference in `inferEntryPathFromPropertyItem` |

## Automated checks

- `npm test -- --run` — pass (110 tests)
- `npx tsc -b --pretty false` — pass
- `npm run build` — pass

## Human verification

Optional: walk **Add property** on device — switch paths with draft data and confirm immediate reset behavior feels acceptable.

## Gaps

None.
