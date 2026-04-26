# Phase 04 — Property — Technical Research

**Question:** What do we need to know to plan the Property section well?

## RESEARCH COMPLETE

---

## 1. Data model (Zod + `data.json`)

- **Replace** `PropertySchema`’s `z.array(z.unknown())` with a typed array of `PropertyItem` objects.
- **PropertyItem** (per `04-CONTEXT` D-01, D-03, D-04, D-07–D-09, D-11):
  - Extend `BaseItemSchema` (`id`, `createdAt`, `updatedAt`) — same as `BankAccount`, `MfPlatform`.
  - `label: z.string().min(1)` (property name).
  - `agreementInr: z.number().nonnegative()` — stored agreement value in INR.
  - `milestones: z.array(MilestoneRowSchema)` where each row has:
    - `id: z.string().uuid()`
    - `label: z.string()` (empty allowed for “untitled” row or require min(1) in form only — Zod can allow empty for flexibility; form validation is stricter)
    - `amountInr: z.number().nonnegative()`
    - `isPaid: z.boolean()`
  - `hasLiability: z.boolean()`
  - `outstandingLoanInr: z.number().nonnegative().optional()` — present when user sets loan; when `hasLiability` is false, omit or ignore in UI.
- **No persisted totals** — `totalPaidInr`, `balanceDue` are **derived** in the UI with `roundCurrency` after summing paid milestone `amountInr` (D-05).
- **INITIAL_DATA** already has `property: { updatedAt, items: [] }` — empty array must remain valid after schema tightening.

## 2. Migration

- **Existing users:** `items: []` parses as before. If any test data used `z.unknown()`-shaped objects, `safeParse` may fail; production expectation is empty `items` until Phase 4 implementation.
- **No `balanceInr`-style legacy** for property in prior phases — optional `migratePropertyIfNeeded` only if we discover shape drift; default **no migration** unless issues found.

## 3. UI pattern analog

- **Primary reference:** `src/pages/BankSavingsPage.tsx` — Sheet, list rows, `useForm` + `zodResolver`, `parseFinancialInput` / `roundCurrency`, `createId` / `nowIso`, `saveData` spread pattern, delete + inline `saveError`, `saving` state.
- **Nested array editing:** Milestones are edited inside the property Sheet (add row, remove row, toggle paid). Use **React Hook Form** with `useFieldArray` **or** controlled state derived from a single zod form object — both are valid; `useFieldArray` matches “dynamic rows” well.

## 4. shadcn components (from `04-UI-SPEC.md`)

- Add **Checkbox** (milestone paid), **Switch** (hasLiability), **Table** (milestone sub-table) via official registry: `npx shadcn@latest add checkbox`, `switch`, `table`.
- **Rule:** Pick one of Switch **or** Checkbox for liability (prefer Switch per UI-SPEC).

## 5. Derived display helpers (inline or `lib`)

- `totalPaidStaged = roundCurrency(sum of amountInr where isPaid)` 
- `balanceDueToBuilder = roundCurrency(agreementInr - totalPaidStaged)` (D-05)
- `milestoneProgress = { paidCount, totalCount }` for row hint “8/13”
- Optional soft warning: `roundCurrency(sum of amountInr) > agreementInr` → `04-UI-SPEC` copy.

## 6. Accessibility (UI-SPEC)

- `aria-live="polite"` on region showing derived balance / paid.
- Labels + `htmlFor` for Switch/Checkbox; `aria-describedby` for loan helper.

## 7. Security (local app)

- No new network calls on Property page. **XSS:** use normal React text binding for user labels (no `dangerouslySetInnerHTML`).

## 8. Out of scope

- Phase 05 dashboard aggregation — only ensure fields exist for future use.

---

## Validation Architecture (Nyquist / Dimension 8)

The repo **does not** ship Vitest/Jest in `package.json` (only `tsc -b`, `vite build`, `eslint`). **Automated verification** for this phase:

| Layer | Command | When |
|-------|---------|------|
| Types + bundle | `npm run build` (runs `tsc -b && vite build`) | After every plan wave |
| Lint | `npm run lint` | After tasks touching TS/TSX |
| **Manual** | UAT: add property, milestones, mark paid, liability, save, reload, delete | Before `/gsd-verify-work` |

**Wave 0** (test framework): **Not required** for Phase 4 — “Existing infrastructure” = build + lint + manual UAT. Future phases may add Vitest; document in `04-VALIDATION.md`.

---

*Phase 04 — property — research 2026-04-26*
