# Phase 32: Property save validation & schema — Context

**Gathered:** 2026-05-06  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **save-blocking validation** and **schema parity** for Property: milestone totals vs agreement (**PRV-01**), loan field rules (**PRV-02**, **PRV-03**), **`PropertyItemSchema` / Zod** aligned with the sheet (**PRV-04**), and **Vitest** coverage for validation helpers (**PRV-05**). Guided UX paths remain Phase **31**; responsive/a11y depth remains Phase **33**.

</domain>

<decisions>
## Implementation Decisions

### Outstanding vs agreement (PRV-02)

- **D-01:** **Block save** when `hasLiability` is true and **outstanding loan > agreement** — **no** “save anyway” / warning override path for Phase 32.
- **D-02:** **Block save** when `hasLiability` is true but outstanding parses to **0** (empty/zero treated as invalid for a claimed loan).
- **D-03:** **Allow** outstanding **equal to** agreement (`outstanding ≤ agreement` includes equality).
- **D-04:** When blocking for loan-vs-agreement issues, emphasize messaging on the **outstanding loan** field / helper (`loan_field` anchor).

### Blocked-save error UX (PRV-01 / consistency)

- **D-05:** **Disable the Save button** while the sheet is invalid — use the **same validation evaluation** as submit blocking (**D-12**).
- **D-06:** When multiple rules fail, show errors **inline under each relevant section only** — **no** consolidated bullet list in the footer for validation.
- **D-07:** For milestone total **>** agreement: keep the **existing destructive inline message** under the milestone block as the primary signal (plus disabled Save) — **do not** add row-level `aria-invalid` / extra row highlighting in Phase 32 unless the planner finds it trivially bundled.
- **D-08:** Keep **validation messages separate** from React state **`saveError`** — reserve **`saveError`** for **property name required** and **persistence / async save** failures.

### EMI and weak sanity (PRV-03)

- **D-09:** **EMI is optional** when a property-attached loan exists; treat **blank EMI** and **explicit 0** as the same permissive path (“unknown / not tracked”).
- **D-10:** **Block save** when EMI is **entered** (non-blank, parsed > 0 path — see planner nuance) **and** **EMI ≥ outstanding** (weak sanity failure). *(Planner: define strict numeric interpretation alongside **D-09** so “entered” vs “blank/zero” stays consistent.)*
- **D-11:** **Skip** optional tenure / payoff **hints** in Phase 32 — only the blocking rules above plus inline messaging.

### Validation layering & tests (PRV-04 / PRV-05)

- **D-12:** Introduce **pure helper functions** (single module); **`PropertyItemSchema`** uses **superRefine** (or equivalent) that **delegates** to those helpers; **`PropertyPage`** uses the **same helpers** for validity / disabled Save — **one implementation**, multiple call sites.
- **D-13:** **Same rules** for disabled Save and submit — **no** lighter-weight disable heuristic that diverges from submit validation.
- **D-14:** **Vitest:** **unit-test helpers exhaustively**; **minimal** schema smoke tests only if needed — **no** PropertyPage-level integration tests required by default.
- **D-15 (`entryKind`):** Add persisted **`entryKind`** on **`PropertyItem` only if** the planner concludes **`inferEntryPathFromPropertyItem`** is **ambiguous** for validation or parity; otherwise **continue inference-only** (Phase **31** precedent).

### Claude's discretion

- Exact **module/file names**, **validation issue codes**, and **minimal Zod smoke** coverage vs helpers-only emphasis.
- How **`disable Save`** recomputes on draft changes (frequency/deps) while honoring **D-12** / **D-13**.
- Precise **copy strings** for inline errors while following **D-04**, **D-06**, **D-07**, **D-08**.

### Requirements note (PRV-03 vs product choice)

- **PRV-03** text implies EMI discipline “where applicable”; **D-09** explicitly chooses **optional EMI** with permissive blank/zero. Treat **D-09**–**D-11** as the **product override** for Phase 32 traceability.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **PRV-01**–**PRV-05** (save validation, Zod parity, Vitest).
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — **v2.3**, Phase **32** goal, success criteria, requirement IDs.
- [`.planning/PROJECT.md`](../../PROJECT.md) — Local-only app, Property + INR/`roundCurrency` conventions.

### Seed & upstream UX context

- [`.planning/seeds/SEED-006-property-entry-flow-validation.md`](../../seeds/SEED-006-property-entry-flow-validation.md) — Problem framing; validation notes.
- [`.planning/phases/31-guided-property-entry-ux/31-CONTEXT.md`](../31-guided-property-entry-ux/31-CONTEXT.md) — Phase **31** locked UX decisions (`entryKind` conditional, path resets, inference).

### Implementation touchpoints (repo)

- [`src/pages/PropertyPage.tsx`](../../../src/pages/PropertyPage.tsx) — Sheet state, `exceedAgreement` warning line, Save path, **`saveError`** usage.
- [`src/types/data.ts`](../../../src/types/data.ts) — **`PropertyItemSchema`** / **`PropertyMilestoneRowSchema`** extension points for refinements.
- [`src/lib/propertyEntryPath.ts`](../../../src/lib/propertyEntryPath.ts) — **`inferEntryPathFromPropertyItem`**, draft reset helpers — informs **D-15**.
- [`src/context/AppDataContext.tsx`](../../../src/context/AppDataContext.tsx) — **`saveData`** / persistence boundary.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`PropertyPage`** — Local draft state; **`exceedAgreement`** computed from sheet strings; destructive milestone message already present; **`saveError`** for name + catch path.
- **`PropertyItemSchema`** — Structural checks only today; cross-field rules belong in shared helpers + refinements (**D-12**).

### Established patterns

- **`inferEntryPathFromPropertyItem`** — Path inference for Edit; save builds **`PropertyItem`** consistent with path (**fully paid** clears milestones/loan).
- Other asset pages often use **react-hook-form + Zod**; Property remains controlled — parity via shared validators instead of migrating the whole form in this phase.

### Integration points

- **`saveData`** updates `assets.property.items`; validation must run **before** persist so **`localStorage`** never receives failing rows per roadmap intent.
- **`dashboardCalcs`** — Equity uses agreement/outstanding; validation avoids inconsistent tuples reaching storage.

</code_context>

<specifics>
## Specific Ideas

- Existing milestone-over-agreement copy: **“Milestone total exceeds agreement. Check amounts.”** — retain as primary milestone PRV-01 signal (**D-07**).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 32 — Property save validation & schema*  
*Context gathered: 2026-05-06*
