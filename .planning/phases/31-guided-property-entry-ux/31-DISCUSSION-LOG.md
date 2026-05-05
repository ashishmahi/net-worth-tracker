# Phase 31: Guided property entry UX — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in **CONTEXT.md**.

**Date:** 2026-05-06  
**Phase:** 31 — Guided property entry UX  
**Areas discussed:** Path picker pattern, Conditional layout, Helper copy & net-worth framing, Edit behavior & explicit entry kind

---

## Path picker pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented control | Tabs/segmented control at top of sheet | ✓ |
| Stacked cards | Selectable cards / radio rows with room for helper text | |
| You decide | Executor picks best fit for Sheet + shadcn | |

| Option | Description | Selected |
|--------|-------------|----------|
| Path first | Path selection first, then name and rest | ✓ |
| Name first | Name (and maybe agreement) first | |
| You decide | Optimize focus order | |

| Option | Description | Selected |
|--------|-------------|----------|
| Reset related | Clear fields belonging to the path being left | ✓ |
| Keep drafts | Hide sections only; keep typed values | |
| You decide | Balance safety vs annoyance | |

| Option | Description | Selected |
|--------|-------------|----------|
| Very short labels | e.g. Paid off / Builder / Loan | |
| Medium labels | e.g. Fully paid / Milestones / Mortgaged | ✓ |
| You decide | Avoid truncation | |

**User's choice:** Segmented control; path before name; reset related fields on path change; medium-length labels.

---

## Conditional layout

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden | Hide milestone block entirely on Fully paid | ✓ |
| Disclosure link | “Paying builder in stages?” reveals milestones | |
| You decide | Minimal clutter | |

| Option | Description | Selected |
|--------|-------------|----------|
| Loan first | Liability block before milestones | ✓ |
| Milestones first | Builder story before bank | |
| You decide | Skimmability | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hide loan toggle | No property-attached loan on Fully paid path | ✓ |
| Show loan toggle | Rare outstanding loan on “paid off” homes | |
| You decide | Simplicity vs edge cases | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep table | Same milestone table behavior | ✓ |
| Simplify presentation | Phase 33 for deep responsive/a11y | |
| You decide | No redesign unless trivial | |

**User's choice:** Hide milestones on Fully paid; loan section before milestones on Mortgaged; hide liability toggle on Fully paid; keep milestone table as today on Milestones path.

---

## Helper copy & net-worth framing

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic subtitle | Per-path subtitle under title | |
| Neutral subtitle | One shared line for all paths | ✓ |
| You decide | Clarity without verbosity | |

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit once | Clear net-worth connection statement | |
| Light touch | Short hints only; no lecture | ✓ |
| You decide | Match other sheets | |

| Option | Description | Selected |
|--------|-------------|----------|
| Near numbers | Next to agreement, loan, paid totals | |
| Summary boxes | Extend paid/balance summary areas | |
| You decide | Avoid repeating the same sentence | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Second person | “Your equity …” | ✓ |
| Neutral descriptive | “Equity is …” | |
| You decide | Align with PropertyPage | |

**User's choice:** Neutral sheet subtitle; light-touch net-worth hints; placement left to executor; second-person voice.

---

## Edit behavior & explicit entry kind

| Option | Description | Selected |
|--------|-------------|----------|
| Always segmented | Same control as Add; reset rules apply | ✓ |
| Badge + Change | Inferred label + opt-in to change path | |
| You decide | Avoid accidental data loss | |

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 31 if needed | Add entryKind only if inference insufficient | ✓ |
| Defer to Phase 32 | UI-only in 31 | |
| Prefer Phase 31 explicit | Always persist entryKind in 31 | |

**User's choice (free text):** No need to support ambiguous legacy saves — product not live yet.

| Option | Description | Selected |
|--------|-------------|----------|
| Confirm dialog | Confirm before clearing typed data on path change | |
| No confirm | Immediate reset like Add | |
| You decide | One destructive pattern for the app | ✓ |

**Summary:** Same segmented path UI on edit; **entryKind** only if planner proves need; no legacy ambiguity handling pre-live; confirmation before destructive path-change — executor discretion.

---

## Claude's discretion

- Net-worth **hint placement** (which fields/summary boxes get copy).
- **Confirm vs immediate reset** when switching path on Edit if data would be lost.

## Deferred Ideas

None recorded.
