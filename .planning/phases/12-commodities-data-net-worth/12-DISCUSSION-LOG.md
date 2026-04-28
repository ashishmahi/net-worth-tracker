# Phase 12: Commodities: data & net worth - Discussion Log

> **Audit trail only.** Decisions are captured in `12-CONTEXT.md`.

**Date:** 2026-04-28  
**Phase:** 12 — Commodities: data & net worth  
**Areas discussed:** Persisted shape, Settings pricing, dashboard totals & snapshot rules, migration  

**Note:** `gsd-sdk query init.phase-op 12` returned **`phase_found: false`** (roadmap table format). Session proceeded from [`.planning/ROADMAP.md`](../../ROADMAP.md). Interactive gray-area multi-select was not available in this runtime; **architect defaults** were applied and recorded in CONTEXT.

---

## Persisted shape

| Option | Description | Selected |
|--------|-------------|----------|
| Sibling `assets.otherCommodities` + unchanged gold | Matches COM-06; minimal migration risk | ✓ |
| Unified `assets.commodities` tree | Would touch gold — rejected for v1.4 |  |

**User's choice:** Recommended default (documented in CONTEXT **D-01–D-03**).

---

## Settings pricing

| Option | Description | Selected |
|--------|-------------|----------|
| Optional `settings.silverPricePerGram` | Parallels per-gram mental model; simple for first metal | ✓ |
| Map `settings.commodityPrices` only | Heavier upfront; defer until second metal needs it |  |

**User's choice:** Recommended default (**D-04**).

---

## Category totals & snapshot

| Option | Description | Selected |
|--------|-------------|----------|
| New `CategoryTotals.otherCommodities` + order after `gold` | Clear COM-02 wiring; Phase 13 can label rows | ✓ |
| Merge into `gold` | Violates COM-06 |  |

**User's choice:** Recommended default (**D-06–D-08**).

---

## Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Stay `version: 1`, optional keys + ensure helper | Matches net worth history migration style | ✓ |
| Bump `data.version` | Unnecessary if optional keys suffice |  |

**User's choice:** Recommended default (**D-09–D-10**).

---

## Claude's Discretion

- Minor Settings UI placement in Phase 12 vs 13 (**D-05**).

## Deferred Ideas

- Live commodity feeds; additional metals — see CONTEXT `<deferred>`.
