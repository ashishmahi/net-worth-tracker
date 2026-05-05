---
phase: 31
slug: guided-property-entry-ux
status: ready
shadcn_initialized: true
created: 2026-05-06
---

# Phase 31 — UI Design Contract

> Guided **path selection** and **conditional Property sheet** for **PRP-01–PRP-03**, per [`31-CONTEXT.md`](31-CONTEXT.md). Save-blocking validation and Zod depth are **Phase 32**.

## Design system

- **Sheet:** Existing [`Sheet`](../../../src/pages/PropertyPage.tsx) shell — `sm:max-w-lg`, scrollable body, sticky footer pattern unchanged unless CONTEXT forces a tweak.
- **Path control:** **Segmented control** at **top of sheet body** (below header block): three mutually exclusive options — **Fully paid** / **Milestones** / **Mortgaged** (**D-01**, **D-04**). Visual treatment: **equal-width segments**, single selected state, keyboard focusable (roving `tabindex` or native `radiogroup` pattern). Prefer existing primitives (`Button` `variant` + `aria-pressed`) over new dependencies unless `toggle-group` is already added elsewhere.
- **Typography:** Path-specific helper lines use **`text-sm text-muted-foreground`**; section titles **`text-sm font-semibold`** where used today.

## Sheet header

| Element | Spec |
|--------|------|
| **Title** | Keep **Add property** / **Edit property** — no path name in title (**D-09**). |
| **Subtitle** | **One neutral line** shared across paths (**D-09**) — replaces today’s builder-centric default line with copy that works for all paths (executor finalizes wording; must **not** imply milestones-only). |

## Field order (**D-02**)

1. **Path segments** (always first in scroll body).
2. **Property name**
3. **Agreement value (INR)**
4. Path-dependent blocks (see below).

## Conditional visibility

| Path | Milestones block | Has home loan switch | Loan fields |
|------|------------------|----------------------|-------------|
| **Fully paid** | **Hidden** (**D-05**) | **Hidden** (**D-06**) | N/A |
| **Milestones** | Shown (existing table + add row + summaries) | Shown | If switch on → debt-first: loan block **above** milestones (**D-07**) |
| **Mortgaged** | Shown if product keeps builder stages; at minimum show section per **D-08** (visibility adjustment only — no table redesign) | Shown; loan block **before** milestones when both matter (**D-07**) |

**Note:** **D-07** / **D-08:** Preserve existing **Table** + **Checkbox** milestone UX; Phase **33** owns responsive depth.

## Helper copy (**D-09–D-12**)

- **Voice:** **Second person** for new helper strings (**D-12**).
- **Net worth / equity:** **Light touch** — **one or two** short hints at anchor points (agreement, outstanding loan, paid-to-builder summary) — **non-repetitive** (**D-10**, **D-11**).
- **Do not** add long educational essays or duplicate the same sentence in multiple blocks.

## Path change (**D-03**, **Claude's discretion**)

- When the user **changes segment** after entering data: **clear fields belonging to the path left** (milestone drafts, loan strings, liability flag per CONTEXT).
- **Confirm dialog vs immediate reset:** Pick **one** pattern and use for **Add and Edit** consistently (document in plan task).

## PRP-03 / persistence

- **Default:** **No** new persisted **`entryKind`** if **open-sheet inference** from `PropertyItem` reliably sets the initial segment (**D-14**, **D-15** greenfield).
- If plans introduce **`entryKind`**: optional field on persisted object + load defaults — **only** if executor proves inference insufficient (same file touch as [`PropertyItem`](../../../src/types/data.ts)).

## A11y

- Path control exposes **role="radiogroup"** (or **tablist** if tabs) + **aria-checked** / **aria-selected** on segments.
- Existing **`aria-describedby`** on sheet description preserved.
- **Phase 33** owns narrow-viewport hardening; Phase **31** must not **regress** focus order for core fields.

## Out of scope (explicit)

- **Save** validation changes blocking persist (**Phase 32**).
- **Zod** shape changes beyond optional **`entryKind`** if required (**Phase 32** for alignment).
- Milestone **table** layout redesign (**Phase 33**).
