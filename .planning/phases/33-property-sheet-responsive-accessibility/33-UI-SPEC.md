# Phase 33 — UI design contract (Property sheet responsive & a11y)

**Status:** Locked from [**33-CONTEXT.md**](33-CONTEXT.md) — presentation, focus, and keyboard behavior only (no new validation rules).

## Scope

Phase **33** delivers **PRA-01**: narrow-viewport usability and sensible **labels + focus order** for the Property add/edit **Sheet**, without changing Phase **31–32** business rules.

## Layout & breakpoints

| Region | Behavior |
|--------|----------|
| **Sheet shell** | Keep **`max-h-[100dvh]`**, scrollable body, **`sm:max-w-lg`** — no regression to core field clipping. |
| **Path picker (`radiogroup`)** | On **extra-small / narrow** widths, **stack** the three path **Button**s **vertically** (**D-05**). At **`sm+`**, retain a **single row** of three columns when space allows. |
| **Milestone table** | Keep **horizontal scroll** (`overflow-x-auto`) + wide **`min-w`** table (**D-01**). Add a **muted** user-visible hint that the grid **scrolls horizontally** (**D-02**). |
| **Primary actions** | Footer **Save** and destructive **Delete** remain reachable without horizontal overflow of **non-table** core fields (**PRA-01** / roadmap success criterion). |

## Interaction

| Element | Behavior |
|--------|----------|
| **Path buttons** | **`role="radio"`**, **`aria-checked`** — unchanged semantics; add **arrow-key** navigation **within** the group (**D-06**): **Left/Right** when laid out in a **row**, **Up/Down** when **stacked**. |
| **Tab order** | **Top-to-bottom** through each path control in **visual order**, then **Property name** (**D-07**). |
| **Sheet open** | **Initial focus** moves to the **first path control** explicitly (**D-08**, **D-13**) — not only Radix default. |
| **Sheet close** | **Radix** focus restoration — **no** custom override (**D-14**). |
| **`:focus-visible`** | Path **Button**s use **global Button** focus styling — **no** stronger ring only inside the path group (**D-16**). |
| **Disabled Save** | **No** new **`aria-describedby`** on Save (**D-10**); **no** extra visible footer helper line when disabled (**D-12**); match existing app patterns for SR where present (**D-09**); do **not** escalate Phase **32** inline validation **`role`** / assertive live regions (**D-11**). |

## Accessibility

- **No** milestone-only ARIA scaffolding that does not exist elsewhere (**D-04**).
- **No** skip link inside the sheet (**D-15**).
- **Touch targets:** follow **shadcn / default Button** sizing — **no** standalone 44×44 mandate unless an obvious miss appears (**D-03**).

## References

- [**33-CONTEXT.md**](33-CONTEXT.md) — **D-01**–**D-16**
- [**32-UI-SPEC.md**](../32-property-save-validation-schema/32-UI-SPEC.md) — Save disable / validation presentation locks
