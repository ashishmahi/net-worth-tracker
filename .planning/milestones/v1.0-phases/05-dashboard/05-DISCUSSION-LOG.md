# Phase 05: Dashboard — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 05-dashboard
**Areas discussed:** Property in net worth, Retirement value shown, Dashboard layout, Live-price loading states

---

## Property in net worth

| Option | Description | Selected |
|--------|-------------|----------|
| Equity = agreementInr − outstandingLoanInr | Subtract outstanding loan from agreement value when hasLiability is true. No loan → full agreement value. Closest to true net worth. | ✓ |
| Amount paid so far | Sum of paid milestones (isPaid rows). Reflects cash deployed, ignores future liabilities. | |
| Full agreement value always | Ignore loan entirely — simplest, but overstates net worth. | |

**User's choice:** Equity = agreementInr − outstandingLoanInr
**Follow-up — no liability:** Full agreementInr (user owns it outright)

---

## Retirement value shown

| Option | Description | Selected |
|--------|-------------|----------|
| Current balance (NPS + EPF today) | What you actually have right now. Projected corpus stays on Retirement page. | ✓ |
| Projected corpus at retirement | Compounded future value. Inflates net worth vs liquid assets today. | |

**User's choice:** Current balance only

---

## Dashboard layout

| Option | Description | Selected |
|--------|-------------|----------|
| Total card + category rows below | Big total INR at top (card), then 7 rows with name + amount + % of total | ✓ |
| One card per category (grid) | 7 cards in a grid, each showing category name + value | |

**User's choice:** Total card + category rows below (confirmed via mockup preview)

**Follow-up — clickable rows:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, clicking a row navigates to that section | App.tsx section-switching via useState | ✓ |
| No, display only | Sidebar navigation only | |

**User's choice:** Clickable rows navigate to section

---

## Live-price loading states

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton placeholder, include in total when ready | skeleton.tsx shimmer for loading rows; total updates once prices resolve | ✓ |
| Show — and exclude from total | Display — while loading, omit from total | |

**User's choice:** Skeleton placeholder

**Follow-up — error state:**

| Option | Description | Selected |
|--------|-------------|----------|
| Show last cached value if available, else — with error hint | Use stale cached value from hook; fall back to — with indicator, exclude from total | ✓ |
| Show — with inline error message | Always — on error regardless of cached state | |

**User's choice:** Last cached value if available, else — with error hint

---

## Claude's Discretion

- Row styling (font size, dividers, hover/active state for clickable rows)
- Whether to show a "prices as of …" timestamp
- Whether to add a "Refresh prices" button on Dashboard or rely on Settings
- INR formatting (lakh notation vs plain thousands)

## Deferred Ideas

- Charts/visualizations — Out of Scope per PROJECT.md
- Historical net worth tracking — not in v1
- Tax calculations — out of scope
