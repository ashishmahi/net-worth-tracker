# Phase 18: Dashboard & Net Worth Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 18-dashboard-net-worth-integration
**Areas discussed:** Total Debt row, Debt-to-Asset ratio, % column, Empty state

---

## Total Debt Row

| Option | Description | Selected |
|--------|-------------|----------|
| After last asset row | Appended at the bottom of the existing category list, separated by a Separator. Same clickable row style. | ✓ |
| Separate card below | A standalone card beneath the category breakdown card. | |
| Footer row in breakdown | Visually distinct footer inside the same card. | |

**User's choice:** After last asset row, navigates to Liabilities page on click.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Conditional — only when debt > 0 | Hidden when no loans exist. | ✓ |
| Always visible | Shown even at ₹0 to make it discoverable. | |

**User's choice:** Conditional — only shown when `sumAllDebtInr > 0`.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Positive in destructive color | Show ₹1,20,000 in red/muted-destructive. Debt is positive you owe. | ✓ |
| Negative number | Show -₹1,20,000 in normal text. | |

**User's choice:** Positive value, destructive color.

---

## Debt-to-Asset Ratio

| Option | Description | Selected |
|--------|-------------|----------|
| Inside headline net worth card | Small secondary line below the net worth figure. | ✓ |
| Row in breakdown card | Appears below the Total Debt row. | |
| Badge below headline card | Compact metric chip between headline and Record snapshot button. | |

**User's choice:** Inside the headline net worth card, below the net worth figure.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Conditional — only when debt > 0 | Hidden when no loans. | ✓ |
| Always shown | Shows 0% when no debt. | |

**User's choice:** Conditional.

---

## % Column

| Option | Description | Selected |
|--------|-------------|----------|
| Gross assets (denominator) | % = asset_value / gross_assets. Adds to ~100%. | ✓ |
| Net worth (denominator) | % = asset_value / net_worth. Rows sum to >100% when debt exists. | |

**User's choice:** Gross assets — keeps the composition view meaningful.

---

## Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Show debt info, skip empty state | `noHoldingsYet` returns false when liabilities exist. | ✓ |
| Keep empty state | 'No holdings yet' still shown even with liabilities. | |

**User's choice:** Show dashboard when liabilities exist even with no assets.

---

## Claude's Discretion

- Exact Tailwind destructive color class
- Label text for the Total Debt row
- Exact format for the debt ratio line

## Deferred Ideas

None.
