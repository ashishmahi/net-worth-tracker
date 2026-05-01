# Phase 14: Schema & Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 14-schema-migration
**Areas discussed:** Field optionality, Tests in this phase

---

## Field Optionality

| Option | Description | Selected |
|--------|-------------|----------|
| Both optional | `lender?: string`, `emiInr?: number` — consistent with property's `outstandingLoanInr?.optional()` | ✓ |
| Both required | Forces every liability to have a lender and EMI | |
| lender optional, emiInr required | EMI always known; lender name not always known | |

**User's choice:** Both optional
**Notes:** Consistent with how property schema handles optional fields; Phase 17 UI enforces what it needs at the form level.

---

## Tests in This Phase

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — follow existing patterns | Add LiabilityItemSchema cases to schema.test.ts and ensureLiabilities() cases to migration.test.ts | ✓ |
| No — defer to Phase 15 | Skip tests in Phase 14; rely on Phase 15 to cover schema indirectly | |

**User's choice:** Yes — follow existing patterns
**Notes:** Same scope as Phase 12 did for otherCommodities.

---

## Claude's Discretion

- Test case selection — which valid/invalid inputs to cover for `LiabilityItemSchema` and `ensureLiabilities()`

## Deferred Ideas

None.
