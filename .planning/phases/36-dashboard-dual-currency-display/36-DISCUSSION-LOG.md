# Phase 36: Dashboard Dual-Currency Display - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 36-dashboard-dual-currency-display
**Areas discussed:** Context restart, design prototype extraction, scope (surface), mixed currencies, format, rate unavailable

---

## Prior context corrupted / restart

| Option | Description | Selected |
|--------|-------------|----------|
| Keep file | Continue from existing CONTEXT.md | |
| Delete and restart | Remove phase context artifacts and re-gather | ✓ |

**User's choice:** Delete unintended edits and restart Phase 36 discussion.
**Notes:** Kid had typed into planning artifacts.

---

## Design reference

**User's choice:** Place Claude Code design bundle at `.planning/phases/36-dashboard-dual-currency-display/design/net-worth-tracker-redesign-v2/`; use **only** Phase-relevant slices (Breakdown `.val`/`.val-local`, hero single-line, Total Debt row single-line). Full redesign (themes, other routes) **out of scope** for CONTEXT.

**Notes:** Actual folder name **`net-worth-tracker-redesign-v2`** (not `net-worth-redesign-v2`).

---

## Surface (Breakdown vs hero)

| Option | Description | Selected |
|--------|-------------|----------|
| Breakdown category rows only + hero single-line | Matches prototype & roadmap breakdown wording | ✓ |
| Include hero dual-line | | |
| Planner discretion | | |

**User's choice:** Locked via prototype review + user confirmation to write CONTEXT.
**Notes:** Total Debt **inside** Breakdown remains **single-line** in prototype; implemented as **D-01**.

---

## Mixed foreign currencies in one category

| Option | Description | Selected |
|--------|-------------|----------|
| One non-reporting code → one aggregated secondary; 2+ → omit | Honest aggregation; prototype has only one illustrative local pair per row | ✓ |
| Multiple muted lines | | |
| “Multiple currencies” label | Deferred | |

---

## Format

| Option | Description | Selected |
|--------|-------------|----------|
| Vertical stack + primary/secondary typography per `.val`/`.val-local`; wealthFormat/spec for strings | Aligns prototype CSS with shipped stack | ✓ |

---

## Rate unavailable

| Option | Description | Selected |
|--------|-------------|----------|
| Hint + prefer single foreign original else INR degraded path; no invented rates | FX-03 + Phase 34 | ✓ |

---

## Claude's Discretion

- Extract **`DualCurrencyCell`** vs inline JSX — left to planner/implementer (**D-01–D-04** semantics centralized).

## Deferred Ideas

- Hero dual-currency parity; explicit “multiple currencies” label; optional mobile omission of secondary to match **`PhoneDashboard`** prototype.
