---
status: passed
phase: 16-property-liability-enrichment
verified: 2026-05-01
---

# Phase 16 Verification

## Goal

Users can record lender name and EMI against a property liability, and are guided to the right place for standalone loan tracking.

## Must-haves checked

| Truth | Evidence |
|-------|----------|
| PropertyItemSchema includes optional lender and emiInr; DataSchema parses | `grep lender` / `emiInr` in `src/types/data.ts` PropertyItemSchema; `npm test` load paths exercised |
| Optional Lender + EMI when hasLiability on; persist when non-empty | `PropertyPage.tsx` conditional spread on save; fields inside `hasLiability` block |
| Disambiguation hint above liability fields without requiring toggle | Paragraph before `{hasLiability && (` with exact intro copy + Liabilities page emphasis |

## Automated checks

- `npm test` — pass (53 tests)
- `npx tsc -b --noEmit` — pass

## Requirement traceability

| ID | Status |
|----|--------|
| PROP-01 | Satisfied — Lender field |
| PROP-02 | Satisfied — EMI field |
| PROP-03 | Satisfied — Hint copy |

## human_verification

None required — behavior covered by automated tests and code inspection.

## Notes

No `react-router-dom` added; navigation remains section-based.
