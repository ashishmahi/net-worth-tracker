# Phase 16 — Pattern Map

## Files to touch

| File | Role | Closest analog |
|------|------|----------------|
| `src/types/data.ts` | Extend `PropertyItemSchema` | `LiabilityItemSchema` (`lender`, `emiInr` optional pattern) |
| `src/pages/PropertyPage.tsx` | State + conditional UI + save | Existing `hasLiability` / `loanStr` / `outstandingLoanInr` block (~396–427) |

## Code excerpts (reference)

**Conditional liability payload** (`PropertyPage.tsx`):

```typescript
...(hasLiability
  ? { outstandingLoanInr: roundCurrency(parseFinancialInput(loanStr)) }
  : {}),
```

**Optional fields on liabilities** (`src/types/data.ts`):

```typescript
export const LiabilityItemSchema = BaseItemSchema.extend({
  // ...
  lender: z.string().optional(),
  emiInr: z.number().nonnegative().optional(),
})
```

## Conventions

- Currency parsing: `parseFinancialInput` from `@/lib/financials`
- Rounding: `roundCurrency` for persisted INR amounts
- Inputs: `type="text"` + `inputMode="decimal"` for money fields

## PATTERN MAPPING COMPLETE
