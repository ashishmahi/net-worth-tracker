# Phase 31: Guided property entry UX — Context

**Gathered:** 2026-05-06  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **guided property entry UX** for **Property** add/edit: **path selection** aligned with three mental models (**fully paid**, **paying builder in stages / milestones**, **mortgaged**); **conditional sections** so each path surfaces only relevant controls; **helper copy** (including light-touch connection to equity / net worth per roadmap intent). **Save-blocking validation**, **Zod parity deep-dives**, and **responsive/a11y hardening** belong to **Phases 32–33**, not here.

**Requirements mapped:** **PRP-01**, **PRP-02**, **PRP-03** (schema timing clarified below).

</domain>

<decisions>
## Implementation Decisions

### Path picker (Add flow)

- **D-01:** Use a **segmented control or tabs** at the **top of the sheet** for the three paths — compact, fits single-sheet mobile layout.
- **D-02:** **Order:** **path selection first**, then property name and remaining fields — establish mental model before details.
- **D-03:** If the user **changes path** before save (Add or Edit), **clear fields that belong to the path they are leaving** (same destructive-reset rule for both flows).
- **D-04:** Segment labels: **medium length** — e.g. **Fully paid** / **Milestones** / **Mortgaged** (executor finalizes exact strings to avoid truncation).

### Conditional layout (per path)

- **D-05 (Fully paid):** **Hide the payment milestones block entirely** — simplest sheet for resale-style entry.
- **D-06 (Fully paid):** **Hide the “Has home loan / liability” switch** — this path means **no property-attached loan** in this sheet (standalone loans remain on **Liabilities**).
- **D-07 (Mortgaged):** When **both** loan and milestones matter, show the **home loan / liability block before** the milestones section — debt-first ordering.
- **D-08 (Milestones / builder path):** Keep the **existing milestone table** structure and behavior (wide scroll table, add row, paid checkboxes); Phase **31** adjusts **visibility** and **copy**, not table redesign (**Phase 33** owns responsive/a11y depth).

### Helper copy & net-worth framing

- **D-09:** Sheet **subtitle** under the title: **one neutral line** shared across paths — avoid rewriting the header when switching paths; path-specific nuance lives in **section helpers**.
- **D-10:** Connection to **dashboard net worth** / equity: **light touch** — short hints near relevant fields, **not** a long net-worth explanation (**second person** voice per **D-12**).
- **D-11:** **Roadmap alignment:** Success criterion “helper copy connects each path to how equity and milestones affect net worth” is met through **concise, contextual hints** (not an essay). Executor places lines **without repeating** the same sentence in multiple places (**placement discretion** — see Claude's discretion).
- **D-12:** Voice for new helper lines: **second person** (e.g. “Your …”) — personal finance tone consistent with intent.

### Edit flow & PRP-03 (`entryKind`)

- **D-13:** **Edit** uses the **same segmented path control as Add** — always visible; path changes use the same **field-reset** rules as **D-03**.
- **D-14 (PRP-03):** Introduce persisted **`entryKind`** (or equivalent) on **`PropertyItem` in Phase 31 only if** the planner concludes that **inference cannot reliably drive** conditional UI (including reopen behavior). Otherwise **defer schema** work to **Phase 32** with documented inference — **no requirement** to add the field in 31 by default.
- **D-15:** **Legacy / ambiguous saves:** Product **has not gone live** — **do not** invest in special inference rules for old ambiguous rows; treat as **greenfield** for path defaults unless planner finds a reason otherwise.

### Claude's discretion

- **Placement of net-worth hints** (**D-11):** Executor chooses **one or two** best anchor points (e.g. agreement, outstanding loan, paid-to-builder summary) so hints stay **light** and **non-repetitive**.
- **Confirmation before clearing fields** when switching path on **Edit** (**destructive change):** Executor decides whether to match **immediate reset** (Add) or add a **confirm dialog** when data would be lost — pick **one** pattern and apply consistently.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **PRP-01**, **PRP-02**, **PRP-03** (property entry paths, conditional UI, optional `entryKind`).
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — **v2.3**, **Phase 31** goal, success criteria, requirement IDs.
- [`.planning/PROJECT.md`](../../PROJECT.md) — Local-only app, Property + liabilities context, INR conventions.

### Seed & rationale

- [`.planning/seeds/SEED-006-property-entry-flow-validation.md`](../../seeds/SEED-006-property-entry-flow-validation.md) — Problem framing, code touchpoints, validation notes (validation execution → Phase **32**).

### Implementation touchpoints (repo)

- [`src/pages/PropertyPage.tsx`](../../../src/pages/PropertyPage.tsx) — Property add/edit **Sheet**, milestones table, `hasLiability`, `exceedAgreement` warning (blocking save → Phase **32**).
- [`src/types/data.ts`](../../../src/types/data.ts) — **`PropertyItemSchema`** / **`PropertyItem`** — optional **`entryKind`** extension point if **D-14** applies.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`PropertyPage`** — Single **Sheet** pattern (`Sheet`, `SheetContent`, scrollable body); **shadcn** `Table` for milestones; **`Switch`** for `hasLiability`; builder-centric copy in **`SheetHeader`** today — replace/refine with **D-09** and path-based visibility (**D-05–D-08**).

### Established patterns

- Other asset pages (e.g. **MutualFundsPage**, **StocksPage**) use **react-hook-form** + **Zod** — Property remains **local state** in Phase **31** unless planner unifies; **schema alignment** is explicitly **Phase 32** (**PRV-04**).

### Integration points

- **`AppDataContext`** **`saveData`** — persists **`assets.property.items`**; any new **`entryKind`** field must migrate/load like other optional keys (**Phase 31 or 32** per **D-14**).
- **Dashboard / net worth:** [`src/lib/dashboardCalcs.ts`](../../../src/lib/dashboardCalcs.ts) — equity-style rollups from **`agreementInr`**, **`outstandingLoanInr`**, **`hasLiability`**; copy should stay consistent with **actual** calculations (no new math in Phase **31**).

</code_context>

<specifics>
## Specific Ideas

- Segment labels anchored at **Fully paid** / **Milestones** / **Mortgaged** (**D-04**).
- **Fully paid** path is intentionally **strict**: no milestones UI, no property-attached loan toggle (**D-05**, **D-06**).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 31 — Guided property entry UX*  
*Context gathered: 2026-05-06*
