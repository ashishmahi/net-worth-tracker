# Phase 30: Bullion import uplift — settings UX & disclosure — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06  
**Phase:** 30 — Bullion import uplift — settings UX & disclosure  
**Areas discussed:** tuning philosophy, placement (resolved as no editors), discoverability + disclosure shell, educational depth, wrap-up  

---

## Tuning philosophy & placement

| Option | Description | Selected |
|--------|-------------|----------|
| Expose editable uplift in Settings | Per BLN-04 / Phase 29 persisted keys | |
| No tuning UI | Defaults + disclosure only | ✓ |

**User's choice:** No tuning in UI — default uplift via Phase 29 and add disclosure only.  
**Notes:** User asked why editing should exist; rationale recorded — roadmap/BLN-04 tension noted when omitting controls (**D-02** in CONTEXT.md).

---

## Discoverability (read-only) + disclosure prominence

| Option | Description | Selected |
|--------|-------------|----------|
| Show resolved rates from settings (read-only) | Numbers track exact stored decimals | |
| Ballpark copy (~10% / ~8%) | Short defaults messaging without binding display | ✓ |
| Disclaimer only | No numeric ballpark | |

| Option | Description | Selected |
|--------|-------------|----------|
| Prominent Alert above section | Single loud callout | |
| Per-card muted footnote | Under Gold card and Silver card | ✓ |
| Compact line + tooltip | Minimal chrome | |

**User's choice:** Ballpark read-only copy + per-card footnotes for approximation / non-advice messaging.

---

## Educational copy depth

| Option | Description | Selected |
|--------|-------------|----------|
| One line on uplift semantics | e.g. applied on parity ₹/g after spot×forex | ✓ |
| Short paragraph | 2–3 lines | |
| Learn more expander | Long text on demand | |

**User's choice:** One-liner level of explanation per card.

---

## Wrap-up

**User's choice:** Ready for context — proceed to CONTEXT.md.

## Claude's Discretion

- Exact copy strings, ordering under each card, and minor typography — left to planner/executor within captured constraints.

## Deferred Ideas

- In-app uplift editing — deferred per user (**D-01**).
- Disclosure on non-Settings pages — noted as out of scope for BLN-04 unless requirements expand.
