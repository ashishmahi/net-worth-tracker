# Phase 33: Property sheet responsive & accessibility — Context

**Gathered:** 2026-05-06  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **PRA-01**: the updated Property add/edit flow stays **usable on narrow widths** (milestone region preserved or improved; sheet layout coherent); **reasonable labels and focus order** for **path selection**, milestones, loan fields, and Save — without expanding scope beyond Property sheet UX (no new features, no dashboard math changes).

Guided paths and save-blocking validation remain **Phases 31–32**; this phase **does not** reopen validation rules or Zod parity except where responsiveness/a11y wiring touches the same components.

</domain>

<decisions>
## Implementation Decisions

### Milestone block (narrow viewports)

- **D-01:** Keep the **horizontal-scroll wide table** pattern (`overflow-x-auto`, wide `min-w` table) as the structural default — optimize for roadmap **“preserve or improve”** and Phase **31**’s deferral of table redesign (**31-CONTEXT** **D-08**).
- **D-02:** Add a **muted hint** that the milestone grid **scrolls horizontally** (user-visible copy near the scroll region).
- **D-03:** **Touch targets** for milestone actions (e.g. remove-row ghost icon): follow **existing shadcn / component defaults** — **no** standalone Phase **33** mandate for 44×44px unless an obvious miss surfaces during implementation.
- **D-04 (a11y consistency):** Do **not** introduce **milestone-only** ARIA patterns that are **not** reflected elsewhere in the app; keep parity with existing complexity-widget conventions (user intent: no one-off scaffolding).

### Path picker (responsive + keyboard)

- **D-05:** On **extra-small / narrow** widths, **stack** the three path controls **vertically** (reflow) so labels stay readable — avoid cramped single-row layout on xs.
- **D-06:** Implement **arrow-key navigation** within the path **`radiogroup`** (direction matches orientation: Left/Right when row, Up/Down when stacked).
- **D-07:** **Tab order** moves **top-to-bottom** through **each** path control in **visual order**, then proceeds to **Property name** (explicit multi-stop tab sequence inside the group).
- **D-08:** On sheet **open**, **move focus explicitly** to the **first path control** (not relying solely on Radix default focus).

### Validation / disabled Save (presentation only)

- **D-09:** **Screen reader behavior** for disabled Save: **match established patterns** elsewhere in the codebase if present; **default lean** — **no** Phase **33** requirement for a new footer **`aria-live`** region unless the codebase already uses that pattern for similar forms (**user “you decide”** constrained by **D-10**–**D-12**).
- **D-10:** **Do not** add **`aria-describedby`** (or similar) wiring **specifically** for the disabled **Save** button in Phase **33**.
- **D-11:** **Do not** escalate Phase **32** inline validation **roles** or verbosity — keep **`role="status"`** / destructive copy as shipped for validation (**no** assertive live-region upgrade for milestone/loan messages in Phase **33**).
- **D-12:** **No** extra **visible** footer helper line** next to Save when disabled** (inline errors remain the primary signal for sighted users).

### Sheet focus (Radix Sheet)

- **D-13:** **Initial focus:** imperative focus to **path picker** on open (**D-08**).
- **D-14:** **Focus after close:** rely on **Radix Sheet / Dialog focus restoration** — **do not** override return focus unless a defect is found.
- **D-15:** **No** “skip to footer” / skip link inside the sheet for Phase **33**.
- **D-16:** **`:focus-visible`** styling on path buttons: **match global `Button`** styling — **no** special stronger ring only inside the path group.

### Claude's discretion

- **Milestone table vs alternatives:** User chose **“you decide”** for layout modality — captured as **D-01** (retain scroll table + scroll hint).
- **SR announcements for invalid Save:** User chose **“you decide”** — captured as **D-09** with **lean default** and **no** Save-specific **`aria-describedby`** per **D-10**.

### Planner note

- **D-06** + **D-07** together imply both **arrow-key group behavior** and **multiple Tab stops** through path buttons; implement so focus management stays predictable and does not fight Radix **Sheet** focus trap.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **PRA-01** (narrow widths; labels + focus order).
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — **v2.3**, Phase **33** goal, success criteria **PRA-01**.
- [`.planning/PROJECT.md`](../../PROJECT.md) — Stack, Property context, **UX-01** heritage (mobile usability).

### Seed & prior phase locks

- [`.planning/seeds/SEED-006-property-entry-flow-validation.md`](../../seeds/SEED-006-property-entry-flow-validation.md) — Original motivation; responsive/a11y notes.
- [`.planning/phases/31-guided-property-entry-ux/31-CONTEXT.md`](../31-guided-property-entry-ux/31-CONTEXT.md) — Path UX, milestone table scope (**D-08** milestones deferred responsive depth to Phase **33**).
- [`.planning/phases/32-property-save-validation-schema/32-CONTEXT.md`](../32-property-save-validation-schema/32-CONTEXT.md) — Save disable rules, inline errors vs **`saveError`** (**D-07** row **`aria-invalid`** explicitly deferred from Phase **32** unless trivial).

### Implementation touchpoints (repo)

- [`src/pages/PropertyPage.tsx`](../../../src/pages/PropertyPage.tsx) — **Sheet** shell, scroll body, path **`radiogroup`**, milestone **`Table`** wrap, footer Save.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`PropertyPage`** — **`SheetContent`** uses **`flex` + `overflow-y-auto`** body and **`max-h-[100dvh]`**; path control is **`grid grid-cols-3`** **`Button`**s with **`role="radio"`**; milestone block uses **`overflow-x-auto`** + **`Table`** with **`min-w-[36rem]`**; selective **`aria-label`** / **`aria-live="polite"`** on summary card.

### Established patterns

- **shadcn** **`Sheet`** / **`SheetFooter`** sticky actions; **Radix** focus trap and dismiss behavior — **D-14** prefers defaults for restore.
- Validation UX **locked in Phase 32** — Phase **33** adjusts presentation/focus only (**D-09**–**D-12**).

### Integration points

- No **`AppDataContext`** / schema changes required for **PRA-01** unless planner bundles purely-presentational props.

</code_context>

<specifics>
## Specific Ideas

- Scroll hint copy should be **short and muted**, adjacent to the milestone horizontal-scroll region (**D-02**).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 33 — Property sheet responsive & accessibility*  
*Context gathered: 2026-05-06*
