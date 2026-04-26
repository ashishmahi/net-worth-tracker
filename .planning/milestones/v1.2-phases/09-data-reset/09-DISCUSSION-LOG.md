# Phase 9: Data reset - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `09-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 9 — Data reset
**Areas discussed:** A — Danger zone on Settings, B — Non-accidental confirmation, C — Empty state payload, D — Success / failure UX

---

## A — Settings entry: danger zone layout (DATA-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Integrated into existing "Data" only | Single block with export + clear | |
| **Dedicated "Danger zone" **Card** below Export** | Export stays non-destructive; new heading + copy | ✓ |
| New route for reset | | |

**User's choice:** User selected **all** areas; locked **dedicated** block **below** Export, **"Clear all data"** on **destructive**-styled control, distinct from Save cards.

**Notes:** Aligns with ROADMAP discoverability and REQUIREMENTS *danger / data* separation.

---

## B — Non-accidental confirmation (DATA-02)

| Option | Description | Selected |
|--------|-------------|----------|
| **AlertDialog + Cancel + separate destructive confirm** | Meets examples in DATA-02; shadcn + Radix (new dep) | ✓ |
| Require typing `DELETE` | Higher friction; optional for later if needed | |
| Two separate pages / steps | Heavier than needed for v1.2 | |

**User's choice:** **AlertDialog** with safe cancel and **explicit destructive** confirm label; **no** mandatory typed phrase in v1.2.

**Notes:** Repo had **no** `AlertDialog` before discuss-phase — add `@radix-ui/react-alert-dialog` + shadcn wrapper.

---

## C — `INITIAL_DATA` and reset payload (DATA-03)

| Option | Description | Selected |
|--------|-------------|----------|
| **`createInitialData()`** + `INITIAL_DATA = createInitialData()` at module init | Single source; reset uses fresh timestamps | ✓ |
| Reuse static `INITIAL_DATA` for reset | Stale `updatedAt` vs new reset time | |

**User's choice:** Factory + refactor `INITIAL_DATA` to use it; `settings` empty-slate is `{ updatedAt }` only.

---

## D — Success and failure

| Option | Description | Selected |
|--------|-------------|----------|
| **Inline** error in danger block | Match other Settings errors | ✓ (failure) |
| **Inline** success copy | No toast stack in project | ✓ (success) |
| Toast (e.g. Sonner) | | |

**User's choice:** **Inline** failure + **inline** success; dialog body includes **export backup** nudge (DATA-02c).

**Notes:** `saveData` already reverts on failure; UI must *surface* the error.

---

## Claude's Discretion

- Exact a11y strings, minor copy edits, and success message **duration** / **clear** behavior in implementation.
- `Dialog` only as **fallback** if `alert-dialog` install blocked — same **behavior** as D-04–D-05.

## Deferred Ideas

- Typed phrase confirmation as **extra** guard if UAT warrants it (post v1.2 or within phase if required).

---
