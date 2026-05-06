---
status: testing
phase: 33-property-sheet-responsive-accessibility
source:
  - 33-01-SUMMARY.md
started: "2026-05-06T02:35:00.000Z"
updated: "2026-05-06T20:38:15Z"
---

## Current Test

number: 6
name: List row copy matches property type
expected: |
  Save a fully paid property and a mortgaged property (with loan). On the Property list, fully paid does not label the full agreement as “due to builder”; mortgaged emphasizes lender/outstanding loan and only mentions builder dues if you added milestone rows.
awaiting: user response

## Tests

### 1. Path controls stack on narrow width
expected: At narrow viewport (~375px), Property sheet path options stack vertically and remain readable.
result: pass

### 2. Selected payment path stands out
expected: In the same sheet, the active path looks clearly selected (e.g. stronger surface/border/shadow) compared to the other two muted options.
result: pass

### 3. Opening sheet focuses first path control
expected: Open Add property (mouse or keyboard). Without pressing Tab first, keyboard focus is on the first path control (“Fully paid”), ready for arrows or Space/Enter as appropriate.
result: pass

### 4. Arrow keys move selection in path group
expected: With focus on a path button, Arrow Left/Right (when the sheet is wide enough, ≥640px) or Arrow Up/Down (when narrow) moves between Fully paid → Milestones → Mortgaged and wraps from last to first.
result: pass

### 5. Milestone row fits without losing delete control
expected: Choose Milestones or Mortgaged, add at least one milestone row. On a laptop-width sheet, Label, Amount, Paid checkbox, and remove (trash) stay visible together without needing horizontal scroll to reach delete.
result: pass

### 6. List row copy matches property type
expected: Save a fully paid property and a mortgaged property (with loan). On the Property list, fully paid does not label the full agreement as “due to builder”; mortgaged emphasizes lender/outstanding loan and only mentions builder dues if you added milestone rows.
result: [pending]

## Summary

total: 6
passed: 5
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps

<!-- populated when issues are reported -->
