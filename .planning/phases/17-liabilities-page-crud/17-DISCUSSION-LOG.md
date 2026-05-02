# Phase 17: Liabilities Page CRUD - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 17-liabilities-page-crud
**Areas discussed:** List view layout, Delete confirmation, Disambiguation copy placement, Sidebar placement

---

## List View Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Card per loan | One card per item, matching GoldPage / BankSavingsPage. Label + badge, lender + EMI secondary, balance prominent. | ✓ |
| Table rows | All loans in one table — Label / Type / Outstanding / Lender / EMI / Actions. Compact, matches PropertyPage. | |

**User's choice:** Card per loan

---

| Option | Description | Selected |
|--------|-------------|----------|
| Total outstanding only | One aggregate line. Mirrors other pages. | |
| Total + total EMI/month | Two lines: outstanding balance AND combined monthly EMI. | ✓ |
| No page total | Leave aggregation to Dashboard. | |

**User's choice:** Total + total EMI/month

---

| Option | Description | Selected |
|--------|-------------|----------|
| Color-coded per type | Home=blue, Car=green, Personal=orange, Other=grey. | |
| Uniform secondary style | All badges same muted/secondary color. Simpler, consistent. | ✓ |

**User's choice:** Uniform secondary style

---

## Delete Confirmation

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate delete | Matches all other pages. No extra click. | |
| Inline confirm step | Clicking delete replaces action row with Confirm/Cancel. | ✓ |
| Dialog confirmation | Modal confirm dialog. | |

**User's choice:** Inline confirm step

---

## Disambiguation Copy Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent page banner | Muted info banner always visible at top of Liabilities page. | ✓ |
| Inside Add/Edit form only | Helper text below loan type selector in Sheet. | |
| Near the Add button | Small muted text below page header area. | |

**User's choice:** Persistent page banner

---

| Option | Description | Selected |
|--------|-------------|----------|
| Plain text only | No nav coupling. | ✓ |
| Link to Property section | 'Property' is clickable and navigates. | |

**User's choice:** Plain text only

---

## Sidebar Placement

| Option | Description | Selected |
|--------|-------------|----------|
| After Property | Thematic pairing — assets then counterpart debt. | ✓ |
| Just before Settings | Separate bottom grouping. | |

**User's choice:** After Property (Dashboard → Gold → … → Property → **Liabilities** → Bank Savings → Retirement → Settings)

---

## Claude's Discretion

- Form field order inside the Sheet
- Exact Tailwind card spacing
- Placeholder and helper text copy for optional fields

## Deferred Ideas

None.
