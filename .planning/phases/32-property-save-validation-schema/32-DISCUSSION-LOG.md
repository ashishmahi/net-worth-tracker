# Phase 32: Property save validation & schema — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06  
**Phase:** 32 — Property save validation & schema  
**Areas discussed:** Outstanding vs agreement (LTV edge cases), Blocked-save error UX, EMI sanity, Validation layering  

---

## Outstanding vs agreement (LTV edge cases)

| Option | Description | Selected |
|--------|-------------|----------|
| Block save | User must fix numbers | ✓ |
| Warn + override | Explicit save-anyway path | |
| Warn only | Strong warning, no block | |

**User's choice:** Block save when outstanding &gt; agreement; no override path in Phase 32.  
**Notes:** Block when `hasLiability` but outstanding is 0. Allow outstanding === agreement. Primary error emphasis on outstanding loan field/helper.

---

## Blocked-save error UX

| Topic | Options | Selected |
|-------|---------|----------|
| Save interaction | Disable while invalid / on click / hybrid | Disable while invalid |
| Multiple errors | Footer list / inline only / first only | Inline under each section only |
| Milestone &gt; agreement | Keep line only / add row highlight | Keep existing destructive line as main signal |
| State channel | Separate from `saveError` / merge into footer | Separate — `saveError` for name + persistence |

**User's choice:** Disable Save when invalid; inline-only multi-errors; keep milestone message as-is; validation separate from `saveError`.

---

## EMI sanity

| Topic | Options | Selected |
|-------|---------|----------|
| EMI required? | Strict required / optional + hint | Optional |
| EMI ≥ outstanding | Block / warn inline | Block |
| Explicit EMI = 0 | Block / treat as blank | Treat as blank (permissive) |
| Tenure hints | Include muted hints / skip | Skip in Phase 32 |

**User's choice:** Optional EMI; block when EMI entered and EMI ≥ outstanding; explicit zero allowed like blank; no tenure hints.

---

## Validation layering (PRV-04 / PRV-05)

| Topic | Options | Selected |
|-------|---------|----------|
| Structure | Helpers + Zod + UI / Zod only / UI only | Pure helpers + Zod superRefine + UI same helpers |
| Disable vs submit | Same rules / subset disable | Same rules |
| Tests | Helpers only / helpers + Zod / page tests | Helpers exhaustively; minimal schema smoke |
| `entryKind` | Never / if planner finds ambiguity / always | Add only if planner finds inference ambiguity |

**User's choice:** Shared helpers module; identical disable and submit rules; Vitest focused on helpers; conditional `entryKind`.

---

## Claude's Discretion

None explicitly deferred — discretion noted in CONTEXT.md for filenames, issue codes, recompute frequency, and exact copy.

## Deferred Ideas

None captured for future phases.
