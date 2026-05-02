# Phase 16: Property Liability Enrichment — Technical Research

**Question answered:** What do we need to know to implement lender + EMI + disambiguation hint on the property form?

## RESEARCH COMPLETE

### Stack facts

- **No React Router** in `package.json`; navigation is `App.tsx` `activeSection: SectionKey` + `AppSidebar` `onSelect`. **`/liabilities` is not a valid URL pattern** in this app.
- **Pattern reference:** `PropertyPage.tsx` already implements `hasLiability`, `loanStr`, conditional `{hasLiability && (…)}` for outstanding loan, and `parseFinancialInput` + `roundCurrency` on save.
- **Schema:** `PropertyItemSchema` in `src/types/data.ts` — extend with `lender` and `emiInr` mirroring optional fields on `LiabilityItemSchema` (`lender`, `emiInr`).

### Implementation approach

1. **Zod:** `lender: z.string().optional()`, `emiInr: z.number().nonnegative().optional()` on `PropertyItemSchema`. No migration — optional fields validate absent keys.
2. **Local state:** Add `lenderStr`, `emiStr`; reset in `openAdd()`; hydrate in `openEdit()` from `item.lender` / `item.emiInr`.
3. **Submit:** Extend `...(hasLiability ? { outstandingLoanInr: … } : {})` to include optional `lender` (trimmed non-empty string) and `emiInr` (when EMI parses to a number); omit when liability off.
4. **Hint:** Static paragraph per `16-CONTEXT.md` D-02–D-03; emphasize “Liabilities page” per UI-SPEC. Defer clickable navigation to Phase 17 when `SectionKey` gains `liabilities`.

### Risks / none

- Pure client-side; same trust model as other optional string fields (React escaping).

---

## Validation Architecture

Phase verification is **automated build + test suite** plus grep-ready checks on edited files.

| Dimension | Approach |
|-----------|----------|
| Schema | `npm test` (any schema tests if present) + `npx tsc -b --noEmit` implied by project build |
| UI | Manual UAT optional; automated: `npm test` passes, no TS errors |
| Regression | Full Vitest run (`npm test`) after changes |

**Nyquist note:** No new Nyquist-specific test file is mandatory if existing suite covers types; executor runs full `npm test` after edits.
