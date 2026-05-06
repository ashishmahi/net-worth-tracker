---
phase: 32-property-save-validation-schema
plan: "01"
subsystem: ui
tags: [react, zod, vitest, property]

requires:
  - phase: 31-guided-property-entry-ux
    provides: Property sheet drafts, entry paths, milestone/loan UI
provides:
  - Pure property validation helpers aligned with PRV-01–03
  - PropertyItemSchema superRefine parity with helpers
  - Save gating and loan/EMI inline errors on PropertyPage
affects: [property-entry-flow-validation]

tech-stack:
  added: []
  patterns:
    - "Single validation source (getPropertyValidationIssues) consumed by Zod and UI"

key-files:
  created:
    - src/lib/propertyValidation.ts
    - src/lib/__tests__/propertyValidation.test.ts
  modified:
    - src/types/data.ts
    - src/lib/__tests__/schema.test.ts
    - src/pages/PropertyPage.tsx

key-decisions:
  - "Sheet validity uses PropertyItemSchema.safeParse as the gate; helpers stay in sync for messaging"
  - "PRV inline violations do not populate saveError (name/persistence only)"

patterns-established:
  - "Cross-field property rules live in propertyValidation.ts; schema superRefine delegates"

requirements-completed: [PRV-01, PRV-02, PRV-03, PRV-04, PRV-05]

duration: 25min
completed: 2026-05-06
---

# Phase 32: Property save validation & schema — Plan 01 Summary

**Property saves are blocked until Zod agrees with the same rules as the sheet, with loan/EMI errors inline instead of in the global save banner.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-06T01:47:00Z
- **Completed:** 2026-05-06T01:50:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Centralized PRV-01–03 logic in `getPropertyValidationIssues` with exhaustive Vitest coverage.
- `PropertyItemSchema` uses `superRefine` so persisted rows cannot bypass the same tuples as the UI.
- Property sheet disables Save when invalid and skips `saveData` on invalid submit without polluting `saveError`.

## Task Commits

1. **32-01-01 — propertyValidation helpers + tests** — `aea7014` (feat)
2. **32-01-02 — PropertyItemSchema superRefine** — `931aa8b` (feat)
3. **32-01-03 — PropertyPage gating + inline errors** — `4e62e1c` (feat)

## Files Created/Modified

- `src/lib/propertyValidation.ts` — Issue codes and `getPropertyValidationIssues`.
- `src/lib/__tests__/propertyValidation.test.ts` — Table-driven PRV cases.
- `src/types/data.ts` — `PropertyItemBaseSchema` + `superRefine` wiring.
- `src/lib/__tests__/schema.test.ts` — `PropertyItemSchema cross-field validation` describe block.
- `src/pages/PropertyPage.tsx` — `buildPropertyItemFromDraft`, `sheetIsValid`, submit gate, loan/EMI messages.

## Self-Check: PASSED

- `npm test -- --run` — PASS
- `npx tsc -b --pretty false` — PASS

## Deviations

- None.
