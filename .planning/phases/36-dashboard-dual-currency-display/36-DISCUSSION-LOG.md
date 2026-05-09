# Phase 36: Dashboard Dual-Currency Display - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 36-Dashboard dual-currency display
**Areas discussed:** Scope, Mixed currencies, Original format, Rate unavailable (interactive answers skipped; defaults documented in CONTEXT.md)

---

## Scope (hero vs breakdown)

| Option | Description | Selected |
|--------|-------------|----------|
| Breakdown + Total Debt only | Dual pattern only on Breakdown card rows + Total Debt | ✓ (via CONTEXT D-01) |
| Include hero mini-stats | Gross/Total debt under Net worth | |
| Include Net worth headline | Full hero dual line | |
| Minimal scope | Planner defaults | |

**User's choice:** Gray areas were selected for discussion; **questionnaire was skipped**. **D-01** in `36-CONTEXT.md` locks **Breakdown card + Total Debt** only.

**Notes:** Aligned with roadmap phrase *breakdown rows* and existing UI section title **Breakdown**.

---

## Mixed currencies within a category

| Option | Description | Selected |
|--------|-------------|----------|
| Single foreign code → one summed original line | One muted secondary with summed amounts in that currency | ✓ (D-02) |
| Multiple foreign codes → no secondary | Avoid misleading single “original” | ✓ (D-02) |
| Always show something | e.g. “Multiple currencies” | Deferred |

**User's choice:** **D-02** as written in CONTEXT.

---

## Original-line format

| Option | Description | Selected |
|--------|-------------|----------|
| ISO code + amount | Per `docs/multi-currency.md` §3 example | ✓ (D-03) |
| Symbol-first | | |
| Match fmt helpers | Reuse/extend `wealthFormat` | ✓ (D-03) |

---

## Rate unavailable

| Option | Description | Selected |
|--------|-------------|----------|
| Hint + prefer originals when interpretable | FX-03 alignment | ✓ (D-04) |
| Keep INR-only fallback | Legacy / mixed cases | ✓ (D-04) |

---

## Claude's Discretion

- Optional **presentational component** extract vs inline — left to planner (CONTEXT).

## Deferred Ideas

- Hero card dual-currency typography.
- Explicit **“Multiple currencies”** label on mixed rows.
