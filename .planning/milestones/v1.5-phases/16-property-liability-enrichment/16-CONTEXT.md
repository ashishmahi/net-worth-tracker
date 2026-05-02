# Phase 16: Property Liability Enrichment - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the existing property form's liability toggle section with two new optional fields (Lender, EMI), update `PropertyItemSchema` with those fields, and add a persistent disambiguation hint directing users to the Liabilities page for standalone loans. No new routes, no new pages — property form only.

</domain>

<decisions>
## Implementation Decisions

### Field Layout (under `hasLiability` toggle)
- **D-01:** Field order: Outstanding loan (INR) → Lender (optional) → EMI (₹/month, optional). Existing `outstandingLoanInr` field stays first for continuity; the two new fields follow.

### Disambiguation Hint
- **D-02:** Hint is **always visible** — rendered immediately below the toggle row, above the conditional liability fields. Not toggled; always shown so users who don't turn on the switch still see the guidance.
- **D-03:** Copy: _"For loans not tied to a specific property (personal, car, etc.), use the Liabilities page."_ Short + directive style, matching existing helper text tone.
- **D-04:** "Liabilities page" is a **React Router `<Link>`** pointing to `/liabilities`. The route doesn't exist until Phase 17 — the link is correct but effectively inert until then.

### Schema Changes
- **D-05:** Add `lender: z.string().optional()` and `emiInr: z.number().nonnegative().optional()` to `PropertyItemSchema` in `src/types/data.ts`. Follows the same optional pattern as `LiabilityItemSchema`.
- **D-06:** No migration needed — both fields are optional, so existing `data.json` without them passes `PropertyItemSchema` validation without changes.

### EMI Field UI
- **D-07:** Label: "EMI (₹/month)". Placeholder: "e.g. 25,000". Helper text: Claude's discretion — follow the same pattern as the existing Outstanding loan helper ("How much you still owe the lender in INR, not the builder.").
- **D-08:** Input: `type="text" inputMode="decimal"` and `parseFinancialInput()` for parsing — same as `loanStr`.

### Lender Field UI
- **D-09:** Simple text `<Input>`. Label: "Lender". Placeholder: Claude's discretion (e.g. "e.g. HDFC Bank"). No validation beyond optional string.

### Save / Clear Behavior
- **D-10:** When `hasLiability` is toggled off, `lender` and `emiInr` are excluded from the saved item (same pattern as `outstandingLoanInr` — spread them in only when `hasLiability` is true). State vars `lenderStr` and `emiStr` reset in `openAdd()` and re-populated in `openEdit()` from `item.lender` and `item.emiInr`.

### Claude's Discretion
- Helper text for EMI field — match the style of the existing outstanding loan helper text
- Lender placeholder copy
- Exact Tailwind spacing between the three fields under the toggle (match existing field spacing in the form)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Property Form
- `src/pages/PropertyPage.tsx` — Full property form; existing `hasLiability` toggle + `outstandingLoanInr` field pattern to follow for new fields; `openAdd`, `openEdit`, `onSubmit` all need updating
- `src/types/data.ts` — `PropertyItemSchema` (add `lender`, `emiInr`); `PropertyItem` type will auto-update from schema

### Requirements
- `.planning/REQUIREMENTS.md` §PROP-01, PROP-02, PROP-03 — Exact success criteria for this phase

### Prior Phase Context
- `.planning/phases/14-schema-migration/14-CONTEXT.md` — D-01–D-11 schema decisions; `lender` and `emiInr` field design rationale on `LiabilityItemSchema` (same optional pattern applies here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hasLiability` / `loanStr` state + `setHasLiability` / `setLoanStr` pattern in `PropertyPage.tsx` — exactly replicate for `lenderStr` / `emiStr`
- `parseFinancialInput()` from `src/lib/financialMath.ts` — already used for `loanStr`; use for `emiStr`
- `roundCurrency()` — apply when saving `emiInr` (same as `outstandingLoanInr`)
- shadcn `<Input>`, `<Label>`, `<Switch>` — all already imported in `PropertyPage.tsx`
- React Router `<Link>` — import from `react-router-dom`; already used elsewhere in the app

### Established Patterns
- Conditional field rendering: `{hasLiability && (<div>...</div>)}` — the same wrapper gates the three liability fields
- Optional field spreading on save: `...(hasLiability ? { outstandingLoanInr: ... } : {})` — extend this spread to include `lender` and `emiInr` (omit if blank string / falsy)
- Helper text: `<p className="text-sm text-muted-foreground mt-1" id="...">` pattern already on the outstanding loan field

### Integration Points
- `PropertyItem` type is inferred from `PropertyItemSchema` — adding fields to the schema automatically updates the type; no separate interface edit needed
- `openEdit` reads from `item.outstandingLoanInr` — add reads for `item.lender` and `item.emiInr`
- No dashboard or calculation changes in this phase — `outstandingLoanInr` drives equity calc; new fields are display-only enrichment

</code_context>

<specifics>
## Specific Ideas

- Hint sits between the toggle row and the conditional fields — always rendered, not inside `{hasLiability && ...}`
- "Liabilities page" in the hint uses React Router `<Link to="/liabilities">` with no special styling (inherits the `text-muted-foreground` context or a subtle underline — Claude's discretion to match app link style)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-property-liability-enrichment*
*Context gathered: 2026-05-01*
