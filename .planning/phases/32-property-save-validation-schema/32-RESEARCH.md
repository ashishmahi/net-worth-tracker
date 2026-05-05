# Phase 32 — Technical research

**Question:** What do we need to know to implement save-blocking validation, Zod parity, and Vitest coverage well?

## RESEARCH COMPLETE

---

## 1. Current behavior (baseline)

- **`PropertyPage`** (`src/pages/PropertyPage.tsx`): Controlled draft state; **`exceedAgreement`** compares **`totalMilestonesSheet`** vs **`agreementInrSheet`** using **`parseFinancialInput`** + **`roundCurrency`** — **warning only** today; Save still runs.
- **Submit path:** Builds **`PropertyItem`**, calls **`saveData`** — **no** pre-flight validation beyond empty name check.
- **`PropertyItemSchema`** (`src/types/data.ts`): Structural only (`nonnegative`, optional loan fields). **No** cross-field refinements.

## 2. Target layering (CONTEXT **D-12**–**D-14**)

1. **Pure helpers module** — deterministic inputs/outputs, no React. Accept **parsed numeric / boolean fields** aligned with persisted **`PropertyItem`** shape **after** the same path-collapse rules as **`onSubmit`** (fully paid → empty milestones, no liability).
2. **`PropertyItemSchema`** — **`.superRefine`** calls the same helpers so **persist** path cannot bypass rules used at save time.
3. **`PropertyPage`** — Before **`saveData`**: build candidate **`nextItem`**, run **`PropertyItemSchema.safeParse`** **or** equivalent helper bundle — **must not** diverge (**D-13**). Use helpers for **disabled Save** without duplicating logic.

**Recommendation:** Export helpers such as **`getPropertyValidationIssues(item: PropertyItem): ValidationIssue[]`** (or structured codes) used by both **`superRefine`** and the page (derive “invalid” = issues length > 0). Optionally **`propertyItemSafeParse`** wrapper if it reduces duplication.

## 3. Rule interpretation (PRV + CONTEXT)

| Rule | Implementation notes |
|------|----------------------|
| **PRV-01 / D-07** | After path collapse, if **`milestones.length > 0`**: **`sum(amountInr) ≤ agreementInr`** (use **`roundCurrency`** on sum like **`parseFinancialInput`** pipeline). |
| **PRV-02 / D-01–D-03** | If **`hasLiability`**: **`outstandingLoanInr`** required, **`>` 0**, **`≤ agreementInr`**. Violation **D-01**: outstanding **>** agreement — block. **D-02**: outstanding **0** or missing when liability on — block. |
| **PRV-03 / D-09–D-11** | EMI optional; **`emiInr`** absent, **0**, or blank-equivalent = OK. If EMI **>** 0 **and** **`emiInr ≥ outstandingLoanInr`** — block (**weak sanity**). Parse: treat “entered” as **`parseFinancialInput(emiStr) > 0`** after trim — align with optional omission when blank. |

## 4. **`entryKind`** (**D-15**)

**`inferEntryPathFromPropertyItem`** remains sufficient for validation because rules apply to **persisted fields** after **`onSubmit`** collapse; no ambiguity requiring **`entryKind`** for Phase **32** unless execution discovers a collision — default **skip schema field**.

## 5. Testing strategy (**PRV-05**)

- **Primary:** **`src/lib/__tests__/propertyValidation.test.ts`** (or adjacent to chosen module) — exhaustive table-driven cases for helpers / issue codes.
- **Secondary:** Extend **`src/lib/__tests__/schema.test.ts`** with **`PropertyItem`** samples that **fail**/**pass** **`superRefine`** — smoke coverage only (**D-14**).
- Follow existing Vitest + **`@/`** imports like **`propertyEntryPath.test.ts`**.

## 6. Files to touch

| File | Role |
|------|------|
| **New** `src/lib/propertyValidation.ts` (name discretionary) | Pure validation helpers + shared issue codes/strings |
| `src/types/data.ts` | **`PropertyItemSchema.superRefine`** delegating to helpers |
| `src/pages/PropertyPage.tsx` | Disable Save; optional inline messages; **`safeParse` before save** |
| `src/lib/__tests__/propertyValidation.test.ts` | Unit tests |
| `src/lib/__tests__/schema.test.ts` | Minimal Property schema refinement tests |

## 7. Non-goals

- Migrating Property sheet to react-hook-form (**CONTEXT**).
- Phase **33** responsive/a11y depth.

---

## Validation Architecture

**Dimension 8 (Nyquist):** Phase deliverables are **deterministic pure functions + Zod refinements + Vitest**. Feedback loop:

1. After each task: **`npm test -- --run`** scoped to touched tests where possible; full suite before phase verify.
2. **Manual spot-check:** Open Property sheet — Save disabled when milestone total exceeds agreement; loan outstanding **>** agreement blocks; EMI ≥ outstanding blocks.

**Automated oracle:** Issue codes / messages asserted in unit tests; **`safeParse`** failure for representative bad **`PropertyItem`** shapes.
