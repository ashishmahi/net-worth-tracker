# Phase 04: Property — Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the **Property** section end-to-end: a **list of properties** (replace the stub `PropertyPage`), each with **agreement value (INR)**, **payment milestone schedule** (user-defined rows — supports the real-world **~13-stage** build without hard-coding 13 in the schema), **cumulative / per-milestone paid state**, and a **liability (loan) toggle** with optional **outstanding loan (INR)** for equity-oriented display. **Dashboard** (phase 05) is out of scope; this phase only **stores** the right raw fields and shows clear section-level readouts so phase 05 can aggregate.

**Not in this phase:** net-worth dashboard, charts, multi-currency property, tax logic.

</domain>

<decisions>
## Implementation Decisions

### List and navigation pattern
- **D-01:** Follow **Phase 02 D-01**: **multiple** properties in `assets.property.items[]`; **Sheet** (drawer from the right) for add and edit; row tap → Sheet; **Add** button opens new property; inline save/delete errors in Sheet (Phase 02 D-20). Same UX family as Gold / MF / Stocks / Bank.
- **D-02:** Each list row shows a **summary**: property label, **agreement value** (INR), **balance due to builder/seller** (or equivalent label) as a **derived** readout, and a compact hint for **milestone** progress (e.g. count paid / total) — exact layout is **Claude’s discretion**.

### Money fields: stored vs derived
- **D-03:** Store **agreement value in INR** (`agreementValue` or `agreementInr` — one canonical name in Zod) per property.
- **D-04:** Store **milestones** as a **variable-length** array (no fixed 13 rows in schema). Each milestone: at minimum **`id` (uuid)**, **`label` (string)**, **`amountInr` (number, non-negative)**, **`isPaid` (boolean)**. Order = display order (array order or optional `order` field — planner picks one).
- **D-05:** **Total paid to builder/seller** = **sum of `amountInr` for rows where `isPaid`** (computed at render with `roundCurrency` after summing). **Balance due** = `roundCurrency(agreementValue - totalPaidStaged)`; **do not** persist a separate “balance” that could drift — single source of truth: agreement + milestones. If the user’s real workflow needs a top-level “amount paid” not tied to milestones, treat as a **planner/implementation gap** to be solved by either (a) a synthetic “lump” milestone or (b) an optional `additionalPaidInr` field — **deferred** unless a follow-up spec says otherwise; v1 is milestone-sum-only.
- **D-06:** All user-entered money fields in forms use **strings + `parseFinancialInput` → number**, **`roundCurrency`** for display and derived lines — same as Phase 2.

### Liability (loan) toggle
- **D-07:** Per property, **`hasLiability` (boolean)** — “this property is financed / has a home loan.”
- **D-08:** When `hasLiability` is true, show and persist optional **`outstandingLoanInr` (number, non-negative)** — how much is still owed to the **lender** (not the builder). Used for **equity / net** hints in this section and for **phase 05** aggregation. When false, omit or ignore loan fields in UI.
- **D-09:** **Gross** value for “property as asset” in this phase is the **agreement value**; **net equity** for later dashboard can be informed by `agreementValue` and `outstandingLoanInr` (exact net-worth rule for phase 05 is **not** decided here — only that raw fields exist).

### Milestone flexibility vs Excel
- **D-10:** **No** hard-coded 13 stage names in code — the **~13 payments** in the user’s Excel map to **up to N** user-defined milestone rows. Optional **“Quick add: 13 empty rows”** is **Claude’s discretion** (nice-to-have in implementation), not a requirement.

### Schema and migration
- **D-11:** Replace `PropertySchema`’s `z.array(z.unknown())` with a proper **Zod** shape for `items` (inferred TypeScript type exported from `data.ts` only). **No computed totals in JSON** (CLAUDE.md) — only raw inputs, milestone rows, and flags.
- **D-12:** `INITIAL_DATA` in `AppDataContext` should keep `property.items: []` compatible with the new schema.

### Claude's Discretion
- Milestone sub-table in Sheet: compact table vs stacked fields; column labels (“Due”, “Planned pay”, etc.).
- Whether to show a small **reconciliation** warning if `sum(milestone amounts) > agreement` (soft warning only).
- Optional milestone fields (e.g. `dueDate` string ISO) for sorting — only if it doesn’t block MVP.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap and product
- `.planning/ROADMAP.md` — Phase 04 goal (milestone table, agreement, paid, balance, liability toggle)
- `.planning/PROJECT.md` — property requirement + Excel context (7 sheets, 13 payment stages)

### Prior phase patterns (lock consistency)
- `.planning/phases/02-manual-asset-sections/02-CONTEXT.md` — Sheet list pattern (D-01, D-20)
- `.planning/phases/02-manual-asset-sections/02-UI-SPEC.md` — if present, shadcn/zinc list + Sheet rules

### Code (integration)
- `src/types/data.ts` — `PropertySchema` placeholder to replace
- `src/pages/PropertyPage.tsx` — stub to replace
- `src/lib/financials.ts` — `parseFinancialInput`, `roundCurrency`, `createId`, `nowIso`
- `src/context/AppDataContext.tsx` — load/migrate; follow Bank-style migration if needed
- `CLAUDE.md` — no computed totals in `data.json`, input conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **Sheet + list**: `src/pages/BankSavingsPage.tsx` (or Gold/MF pages) for row + Sheet + delete pattern.
- **RHF + Zod**: String money fields, `zodResolver`, same error pattern as other sections.
- **UI**: shadcn `Sheet`, `Button`, `Card`, `Separator` already in project.

### Established patterns
- `BaseItemSchema` in `data.ts` for `id`, `createdAt`, `updatedAt` on list entities — reuse for `PropertyItem` if each property is a top-level list row with nested `milestones[]`.

### Integration points
- `App.tsx` / `AppSidebar.tsx` — Property route already wired; only page + data shape change.
- **Phase 05** will read the same `AppData` — keep fields explicit and stable.

</code_context>

<specifics>
## Specific ideas

- Excel migration context: the user’s spreadsheet has a **detailed ~13 payment milestone** schedule for the current apartment; the app should support that as **N rows**, not a fixed template.

</specifics>

<deferred>
## Deferred ideas

- **Net worth / Dashboard** — phase 05; this phase only supplies **raw + derived-in-UI** for Property.
- **Lump-sum “amount paid”** not represented as milestones — revisit if milestone-only is too heavy for quick updates (could add a single optional field later).
- **Tax, registration fees, and non-milestone outflows** — not in v1 property scope.

</deferred>

---

*Phase: 04-property*
*Context gathered: 2026-04-25*
