# Phase 34: FX Infrastructure & Data Model - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 34-FX Infrastructure & Data Model
**Areas discussed:** FX feed extension, Conversion utility, Migration semantics, Currency types

---

## FX feed extension

| Option | Description | Selected |
|--------|-------------|----------|
| Extend fetchForex() | One GET; derive eurInr/gbpInr/sgdInr like aedInr | ✓ |
| Split fetch / extra HTTP | Isolation; more requests | |
| You decide | Minimal surface area | |

| Option | Description | Selected |
|--------|-------------|----------|
| Best-effort per pair | Valid pairs returned; null for bad EUR/GBP/SGD | ✓ |
| Fail entire fetch | Throw if any pair bad | |

| Option | Description | Selected |
|--------|-------------|----------|
| Session parity | eurInr/gbpInr/sgdInr on SessionRatePartial; clear on live fetch | ✓ |
| Phase 34 live-only | No session keys until Phase 38 | |

| Option | Description | Selected |
|--------|-------------|----------|
| INR per unit naming | eurInr, gbpInr, sgdInr = INR per 1 EUR/GBP/SGD | ✓ |
| Other convention | User did not take | |

**User's choice:** Extend single fetch; best-effort pairs; full session override parity; INR-per-unit field names.

**Notes:** User asked a cross-pair clarification (GBP→AED) — answered in discussion; captured under conversion (INR hub).

---

## Conversion utility

| Option | Description | Selected |
|--------|-------------|----------|
| INR hub | Any→INR→reporting using INR-per-unit rates | ✓ (confirmed "option A") |
| Multi-hop | Optional USD shortcut | |

| Option | Description | Selected |
|--------|-------------|----------|
| Pure function in src/lib | Explicit rates arg; Vitest-friendly | ✓ (via "You decide") |
| Hook wrapping useLivePrices | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Discriminated union | ok / rate_unavailable | ✓ |
| Nullable amount only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Round inside converter | | |
| Full precision; callers round | | ✓ (via "You decide" — full precision out, round at boundaries per dashboardCalcs) |

**User's choice:** INR hub; discriminated union; pure lib helper with explicit rates (discretion); full precision + boundary rounding (discretion).

---

## Migration semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Stamp currency: "INR" | Explicit default on legacy rows | ✓ |
| Leave absent | Default only at read time | |

| Option | Description | Selected |
|--------|-------------|----------|
| Stamp reportingCurrency "INR" if absent | | ✓ |
| Omit until Phase 35 | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Bump to version 2 + migration tests | | ✓ |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Same chain on import and cold load | | ✓ |
| You decide | | |

**User's choice:** Stamp INR on legacy rows and reportingCurrency; schema v2; unified migrate path for load and import.

---

## Currency types

| Option | Description | Selected |
|--------|-------------|----------|
| src/types/currency.ts | Shared const + types | ✓ |
| data.ts only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Widen bank enum to six now | | ✓ |
| Defer to Phase 37 | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Strict uppercase ISO in Zod | | ✓ (via "You decide") |
| Permissive parse | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Single shared union | reporting + records | ✓ (via "You decide") |
| Split types | | |

**User's choice:** Dedicated currency module; widen bank enum now; strict storage; one union for settings and records (discretion).

---

## Claude's Discretion

- Pure conversion module with explicit rates; rounding at aggregation/display boundaries.
- Strict persisted ISO codes via Zod; single six-code union for settings and records.

## Deferred Ideas

None recorded.
