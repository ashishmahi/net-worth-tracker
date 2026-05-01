# Phase 15: Calculation Utilities - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 15-calculation-utilities
**Areas discussed:** calcNetWorth handoff, File placement

---

## calcNetWorth handoff

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both, Phase 18 wires them | sumForNetWorth stays for gross total. calcNetWorth = sumForNetWorth result minus liabilities. Phase 18 decides the call site. No changes to dashboardCalcs.ts in Phase 15. | ✓ |
| calcNetWorth replaces sumForNetWorth | Phase 15 deprecates sumForNetWorth. calcNetWorth becomes the single net worth entry point. Requires updating DashboardPage.tsx now (touches Phase 18 scope). | |

**User's choice:** Keep both, Phase 18 wires them
**Notes:** Clean separation — Phase 15 only adds new functions; Phase 18 handles the dashboard wiring.

---

## File placement

| Option | Description | Selected |
|--------|-------------|----------|
| New src/lib/liabilityCalcs.ts | Keeps debt logic isolated from dashboard display logic. dashboardCalcs.ts stays focused on category totals + display. Clean separation for Phase 18 imports. | ✓ |
| Extend dashboardCalcs.ts | All calc functions in one place. Phase 18 imports from one file. File already imports AppData and roundCurrency. | |

**User's choice:** New `src/lib/liabilityCalcs.ts`
**Notes:** Tests in new `src/lib/__tests__/liabilityCalcs.test.ts` — mirrors source file, consistent with one-test-file-per-source-module pattern.

---

## Claude's Discretion

- Test case selection depth and edge case coverage — follow dashboardCalcs.test.ts style

## Deferred Ideas

None
