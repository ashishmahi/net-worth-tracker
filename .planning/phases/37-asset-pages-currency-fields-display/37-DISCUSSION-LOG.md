# Phase 37: Asset Pages — Currency Fields & Display - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 37-Asset Pages — Currency Fields & Display
**Areas discussed:** Form defaults, Dual-currency UI, Property & Liabilities semantics, Tables & density

---

## Form defaults

| Option | Description | Selected |
|--------|-------------|----------|
| Always default to reportingCurrency | Matches roadmap SC1 | ✓ |
| Always INR | Keep current Bank behavior | |
| Discretion | Per page | |

**User's choice:** Always default new rows to **reportingCurrency**.

| Option | Description | Selected |
|--------|-------------|----------|
| Effective reporting | Show reportingCurrency when `currency` absent; DM-01 | ✓ |
| INR migration | D-09 stamped INR | |
| Discretion | Per record type | |

**User's choice:** **Effective reporting** for missing optional `currency`.

**Notes (freeform):** User **defers** multi-currency **Retirement** — keep **INR-only** for now; future phase for reusable retirement across India/US/Europe/Singapore. Captured as Phase 37 **exception** (see CONTEXT.md **D-03**).

| Option | Description | Selected |
|--------|-------------|----------|
| Keep draft unchanged | No auto-mutation when reporting changes | |
| Snap draft | Track new reporting currency | |
| Discretion | Implementer chooses | ✓ |

**User's choice:** **Discretion** — CONTEXT recommends leaving drafts unchanged by default.

---

## Dual-currency UI

| Option | Description | Selected |
|--------|-------------|----------|
| Mandatory shared component | `src/components/` smart dual widget | ✓ |
| Guidelines only | Match Dashboard inline | |
| Discretion | Reuse where cheap | |

**User's choice:** **Mandatory shared** smart component.

| Option | Description | Selected |
|--------|-------------|----------|
| Refactor Dashboard too | Single source everywhere | |
| Asset pages only | Narrow Phase 37 diff | ✓ |
| Discretion | By extraction effort | |

**User's choice:** **Asset pages only**; Dashboard defer.

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard + Bank patterns | Same helpers/style | ✓ |
| docs-only fresh formatting | | |
| Discretion | Feel consistent | |

**User's choice:** Align with **Dashboard + BankSavingsPage** patterns.

| Option | Description | Selected |
|--------|-------------|----------|
| Smart (conversion inside) | Pass numbers + currencies + snapshot | ✓ |
| Dumb (strings only) | Parent converts | |
| Hybrid | | |

**User's choice:** **Smart** component.

---

## Property & Liabilities semantics

| Option | Description | Selected |
|--------|-------------|----------|
| One currency all fields | Agreement, loan, EMI, milestones | ✓ |
| Agreement only | Loan/milestones INR-semantic | |
| Discretion | Migration safety | |

**User's choice:** **One currency** for all property monetary fields.

| Option | Description | Selected |
|--------|-------------|----------|
| One currency | Outstanding + EMI | ✓ |
| Outstanding only | | |
| Discretion | | |

**User's choice:** **One currency** for liability amounts.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep JSON keys | Values in record currency; semantic shift | |
| Rename neutral keys | Migration + clarity | ✓ |
| Discretion | Risk/size | |

**User's choice:** **Rename** to neutral keys.

| Option | Description | Selected |
|--------|-------------|----------|
| Full sweep | All references + calcs + tests | |
| Surface + schema | UI/schema primary; helpers optional | ✓ |
| Discretion | Tests must pass | |

**User's choice:** **Surface + schema** first scope.

---

## Tables & density

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal scroll | overflow-x on card | |
| Stack cards | xs/sm | |
| Discretion | Per page | ✓ |

**User's choice:** **Discretion** per page.

| Option | Description | Selected |
|--------|-------------|----------|
| Reporting-only total | Single-line aggregate | ✓ |
| Mirror dashboard D-02 | Secondary when one foreign code | |
| Discretion | | |

**User's choice:** **Reporting-only** section totals.

**Gold (follow-up):** User asked how gold currency works with grams. Clarified grams stay stored; optional currency tags fiat presentation. User selected **defer explicit Gold Currency column** until non-INR bullion pricing path exists.

| Option | Description | Selected |
|--------|-------------|----------|
| MF/Stocks explicit column | Currency + dual Value | ✓ |
| Dual-line only | Denser | |
| Discretion | | |

**User's choice:** **MF/Stocks** — **Currency column + dual-line Value**.

---

## Claude's Discretion

- Draft currency behavior when **reporting currency** changes while a sheet is open (**Form defaults**).
- Narrow-view table layout per page (**Tables & density**).
- Gold form/wiring details consistent with **defer column** decision.

## Deferred Ideas

- Retirement internationalization (multi-country schemes).
- Dashboard adoption of shared dual-currency component.
- Gold table Currency column when bullion supports non-INR-native pricing.
- Deep internal identifier rename pass after neutral JSON keys.
