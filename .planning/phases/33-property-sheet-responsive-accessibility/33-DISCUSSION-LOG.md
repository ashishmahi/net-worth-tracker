# Phase 33: Property sheet responsive & accessibility — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06  
**Phase:** 33 — Property sheet responsive & accessibility  
**Areas discussed:** Milestone layout, Path picker, Validation announcements, Sheet focus  

---

## Milestone layout

| Option | Description | Selected |
|--------|-------------|----------|
| Keep horizontal-scroll table | Improve hints/spacing only; preserve roadmap pattern | ✓ (via “you decide” — executor rationale in CONTEXT **D-01**) |
| Stacked rows/cards on narrow | Replace horizontal scroll with stacked layout | |
| You decide | Claude picks best fit for PRA-01 | ✓ (initial) |

**User's choice:** “You decide” with follow-ups: **scroll hint — Yes**; **touch targets — shadcn defaults**; **no milestone-only ARIA** unless consistent app-wide.  
**Notes:** Horizontal-scroll table retained with explicit scroll hint; avoid one-off milestone scaffolding vs rest of app.

---

## Path picker

| Option | Description | Selected |
|--------|-------------|----------|
| One row | Keep `grid-cols-3` everywhere | |
| Stack on xs | Reflow vertically on narrow widths | ✓ |
| You decide | Breakpoint testing | |

| Option | Description | Selected |
|--------|-------------|----------|
| Arrow keys | Roving / arrow navigation in radiogroup | ✓ |
| Defer | Click/tap only | |
| ToggleGroup | Native Radix if low-risk swap | |

| Option | Description | Selected |
|--------|-------------|----------|
| Focus path first | Reinforces pick-path-before-details | ✓ |
| Focus property name | Faster repeat edits | |
| Radix default | Do not override | |

| Option | Description | Selected |
|--------|-------------|----------|
| Tab visual order | Tab through each path button top-to-bottom then next field | ✓ |
| Roving tabindex | Tab skips group; arrows inside | |
| You decide | Align with arrows | |

**User's choice:** Stack on narrow; **arrow keys yes**; **initial focus on path**; **tab visits each path button in visual order**.

---

## Validation & disabled Save

| Option | Description | Selected |
|--------|-------------|----------|
| Polite live region | Footer SR announcement when Save disabled | |
| Inline only | Rely on field-level messages | |
| You decide | Match rest of app | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| aria-describedby on Save | Helper id when disabled | |
| Dynamic id only | When validation-disabled | |
| No Save-specific wiring | Do not add | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Phase 32 roles | No assertive upgrade | ✓ |
| Assertive live regions | Stronger announcements | |
| Light polish only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Visible footer helper | Text when Save disabled | |
| Tooltip | Hover/focus Save | |
| No footer clutter | Inline errors enough | ✓ |

**User's choice:** Lean SR behavior (**you decide** defaults); **no Save `aria-describedby`**; **no role/verbosity escalation**; **no visible disabled-Save helper**.

---

## Sheet focus

| Option | Description | Selected |
|--------|-------------|----------|
| Imperative focus path | Focus first path control on open | ✓ |
| Radix only | Unless broken | |

| Option | Description | Selected |
|--------|-------------|----------|
| Return to trigger | Dialog pattern | |
| Radix restore | Do not override | ✓ |
| Fixed landing | First row / Add | |

| Option | Description | Selected |
|--------|-------------|----------|
| Skip link | Skip to footer | |
| No skip | Tab order suffices | ✓ |
| You decide | If sheet grows | |

| Option | Description | Selected |
|--------|-------------|----------|
| Match global Button focus ring | | ✓ |
| Stronger ring in group | | |
| You decide | | |

**User's choice:** **Explicit focus to path on open**; **Radix focus return on close**; **no skip link**; **focus-visible matches global Button**.

---

## Claude's Discretion

- **Milestone layout modality** — Resolved as retain scroll table + horizontal-scroll hint (**CONTEXT D-01**, **D-02**).
- **Screen reader behavior for disabled Save** — Lean default; align with codebase patterns if any (**CONTEXT D-09**).

## Deferred Ideas

None.
