# Phase 10: History & schema - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in **10-CONTEXT.md** — this log preserves alternatives considered.

**Date:** 2026-04-26  
**Phase:** 10 — History & schema  
**Areas discussed:** Field & row shape; loading guard; Dashboard control; double-save / dedupe

---

## Field name & record shape

| Option | Description | Selected |
|--------|-------------|----------|
| `netWorthHistory` + `{ recordedAt, totalInr }` only | Matches roadmap, minimal; no per-row `id` in v1.3 | ✓ |
| `netWorthSnapshots` + same row shape | Aligns wording with NWH-01 | |
| `netWorthHistory` + `id` on each row | Stronger for later edit/delete | |

**User's choice:** `netWorthHistory` with minimal two-field rows, no per-row `id` in v1.3.  
**Notes:** 10.1 / boot must use same `DataSchema` after the change.

---

## Record while net worth is loading

| Option | Description | Selected |
|--------|-------------|----------|
| Disable until stable full total | No snapshot while skeleton / partial / excluded-categories case | ✓ |
| Allow with warning | User may capture incomplete total | |
| Allow anytime | User’s responsibility | |

**User's choice:** Disable **Record snapshot** when the total is not a stable, complete `sumForNetWorth` (loading/partial).  
**Notes:** Aligns stored `totalInr` with the “real” dashboard definition.

---

## Dashboard placement & copy

| Option | Description | Selected |
|--------|-------------|----------|
| Outline under total Card, “Record snapshot” | Above category rows, secondary style | ✓ |
| Primary under total Card | Stronger visual weight | |
| Inside total Card (header/footer) | Tighter to the number | |
| Claude’s discretion | NWH-03 family wording | |

**User's choice:** Outline **Record snapshot** directly **under** the top net worth **`Card`**, above category rows, label **“Record snapshot”**.

---

## Double-click & back-to-back snapshots

| Option | Description | Selected |
|--------|-------------|----------|
| busy-only (saveData in flight) | No time/amount dedupe; two intentional actions = two rows | ✓ |
| Short debounce (e.g. 300–500ms) | Absorb accidental double-click | |
| Reject/merge if matches last row | Stricter; conflicts with “two actions = two rows” | |

**User's choice:** Only disable while `saveData` in progress; no merge/dedupe by time or `totalInr`.  
**Notes:** Intentional repeat after save is allowed, including same amount.

## Claude's Discretion

(Reserved in CONTEXT.md for a11y copy, minor layout, and migration layering details.)

## Deferred Ideas

None recorded.
