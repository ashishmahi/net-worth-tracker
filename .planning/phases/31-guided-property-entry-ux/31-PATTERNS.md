# Phase 31 — Pattern Map

## Analog: modal form with local state

| New / changed | Closest existing | Notes |
|---------------|------------------|-------|
| Property **Sheet** body structure | [`PropertyPage.tsx`](../../../src/pages/PropertyPage.tsx) | Same `Sheet` + `useState` drafts; extend with **path** state ahead of existing fields. |
| Segmented **exclusive choice** | Settings toggles / switches elsewhere | No exact segment primitive — mirror **button group** patterns from shadcn docs or mutual exclusion via controlled state. |
| **Conditional sections** | Existing `{hasLiability && (...)}` block | Generalize to **path-dependent** trees per **31-UI-SPEC**. |

## Data flow

- **Read:** `useAppData()` → `PropertyItem` on edit.
- **Write:** Unchanged `saveData` payload shape unless **`entryKind`** added (**optional**).

## Code excerpts (reference)

`PropertyPage` already gates loan fields:

```406:467:../../../src/pages/PropertyPage.tsx
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="has-liability">Has home loan / liability</Label>
                    ...
```

Phase **31** wraps similar logic with **path-first** visibility (**D-05–D-08**).
