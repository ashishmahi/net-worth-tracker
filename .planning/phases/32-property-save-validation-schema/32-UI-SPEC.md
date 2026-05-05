# Phase 32 — UI design contract (validation & save affordances)

**Status:** Locked from [**32-CONTEXT.md**](32-CONTEXT.md) — no new visual theme; behaviors only.

## Scope

Phase **32** does **not** introduce new layout, typography, or color tokens. It constrains **when Save works** and **where validation copy appears** relative to existing Property sheet sections.

## Interaction

| Element | Behavior |
|--------|----------|
| **Save** (`type="submit"` in sheet footer) | **Disabled** while the sheet would fail validation (**D-05**, **D-12**, **D-13**). Uses the **same rules** as submit blocking — no lighter heuristic. |
| **Milestone total > agreement** | Keep existing destructive line: **“Milestone total exceeds agreement. Check amounts.”** under milestone block (**D-07**). |
| **Loan vs agreement / outstanding** | Inline message anchored to **outstanding loan** field / helper (**D-04**). |
| **Multiple failures** | Errors **only** under the relevant section — **no** consolidated bullet list in the footer for validation (**D-06**). Footer **`saveError`** reserved for **name required** and **async/persistence** failures (**D-08**). |

## Accessibility

No new **row-level** `aria-invalid` for milestones in Phase **32** unless bundled trivially (**D-07**). Existing **`aria-live`** on milestone summary block remains valid.

## References

- [**32-CONTEXT.md**](32-CONTEXT.md) — D-05–D-08, D-12–D-14
