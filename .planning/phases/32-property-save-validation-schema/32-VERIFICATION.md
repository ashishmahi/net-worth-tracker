---
phase: 32-property-save-validation-schema
status: passed
verified: 2026-05-06
---

# Phase 32 verification — Property save validation & schema

## Goal (from roadmap)

Enforce financial consistency at save time; align **Zod** with UI; **Vitest** for helpers/schema.

## Requirement traceability

| ID | Evidence |
|----|----------|
| PRV-01 | `getPropertyValidationIssues` milestone sum vs agreement; duplicate message under milestones UI; schema `superRefine` + tests |
| PRV-02 | Outstanding required / exceeds agreement codes; inline destructive copy under outstanding field; schema parity |
| PRV-03 | EMI vs outstanding rule; inline message at EMI; optional EMI respected |
| PRV-04 | `PropertyItemSchema.superRefine` calls `getPropertyValidationIssues`; PropertyPage gates on `safeParse` |
| PRV-05 | `propertyValidation.test.ts` + `schema.test.ts` cross-field describe |

## Automated checks

- `npm test -- --run` — **125 passed** (includes `propertyValidation.test.ts`, `schema.test.ts`, full suite)
- `npx tsc -b --pretty false` — **pass**

## Must-haves (from plan)

| Must-have | Result |
|-----------|--------|
| Save never calls `saveData` when candidate fails `PropertyItemSchema.safeParse` | `onSubmit` returns early after name check |
| `PropertyItemSchema.superRefine` rejects same tuples as sheet validation | Shared `getPropertyValidationIssues` |
| Save disabled iff invalid | `disabled={saving \|\| !sheetIsValid}` |
| `saveError` only name/persistence | Validation failures do not set `saveError` |

## Human verification

None required — behavior covered by automated tests and code inspection.

## Notes

Schema drift gate (`verify.schema-drift`) reported valid for this phase.
