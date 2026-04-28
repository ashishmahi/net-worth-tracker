---
phase: "10"
slug: history-schema
status: approved
shadcn_initialized: true
preset: default
baseColor: zinc
created: 2026-04-26
source: "Derived from 10-CONTEXT (discuss) — unblocks /gsd-plan-phase without separate /gsd-ui-phase"
---

# Phase 10 — UI design contract: Record snapshot (Dashboard)

> **Scope:** A single new control and optional inline feedback on the Dashboard. **Out:** chart (Phase 11). Inherits shadcn + Tailwind from the app; matches **Phase 5** Dashboard and **10-CONTEXT** D-05, D-08, D-10.

---

## Placement

| Element | Position |
|--------|----------|
| **Record snapshot** | **`Button` `variant="outline"`** in a new row **immediately below** the top **“Net worth”** `Card` and **above** the second `Card` (category breakdown). Use `className` consistent with page rhythm (`mt-0` on wrapper if inside `space-y-4`, or a small `className` gap) — **do not** put the control inside the green/total `Card` header. |
| **Optional** success line | Inline, **after** the button (or under it), `text-sm text-muted-foreground`, `role="status"`, *Claude’s discretion* string (e.g. *Snapshot saved.*) — clears on navigation or next action per app minimal pattern. |
| **Help when disabled** | *Claude’s discretion:* one line `text-sm text-muted-foreground` *or* `title` on the disabled button: when blocked because of **loading** (skeleton) vs **incomplete/partial** total (excludes note). **Must not** rely on color alone for the reason. |

## States

| State | `button` / UX |
|-------|---------------|
| **Default (can record)** | Enabled; `Record snapshot` label. |
| **No holdings (empty dashboard)** | No new control: existing **No holdings** empty state only (no `Card` + no action). |
| **Net worth still loading** (`showNetWorthSkeleton`) | **Disabled** — total not stable. |
| **Partial / excluded total** (exclusion disclaimer visible — gold/BTC rate missing, etc.) | **Disabled** — not a full `sumForNetWorth` over all holdings. |
| **Save in progress** (record) | **Disabled** + `Loader2` *inline* or on button (match Settings busy pattern). |
| **Error** | Inherit `saveData` error handling: *Claude’s discretion* — inline `text-destructive` with `role="alert"` for failed `POST` on record (same *tone* as other inline errors) **or** rely on `throw` to a **caller catch** with visible message. |

## Copy (locked from discuss)

- Primary label: **Record snapshot** (exact, user-facing).  
- Do not use “Save” for this action (avoids conflict with “Save” on section pages).  

## Accessibility

- Button has an **`aria-label`** or visible text sufficient for the action (e.g. *Record net worth snapshot* on top of *Record snapshot* if needed for a11y — *Claude’s discretion*; minimum: visible *Record snapshot* is acceptable if `title` holds extra context).  
- When `disabled`, preserve screen reader awareness: use `aria-disabled` + `aria-busy` for save-in-flight, or *Claude’s discretion* `aria-describedby` pointing to helper text.  

## Theme

- **Light and dark:** outline button uses `variant="outline"`; text uses semantic tokens (no new hex). Same as 10.1/Settings **outline** affordances.  

## References

- `.planning/phases/10-history-schema/10-CONTEXT.md` (D-05, D-08, D-10)  
- `10.1-UI-SPEC` for Settings density (if aligning spacing tokens only)  
