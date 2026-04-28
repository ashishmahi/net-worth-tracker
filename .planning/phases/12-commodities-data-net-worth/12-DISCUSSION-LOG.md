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

---

## Revision (2026-04-28)

**User selected:** Update existing context; revise **persisted shape**, **pricing**, **totals**, **scope**, plus freeform: *how many commodities & price fetch*.

**Captured in `12-CONTEXT.md`:**

- **Kinds:** `silver` **and** `platinum` in **`kind` enum** (two non-gold metals); grams; **`settings.commodityPrices`** map (INR/gram per kind), replacing single **`silverPricePerGram`**.
- **Totals:** **`otherCommodities`** remains one nullable bucket; sum uses **per-kind** prices from the map; **null** if any held line lacks its price.
- **Price fetch:** **D-11** — **no** live fetch in v1.4; manual only; feeds deferred.
- **Scope:** **D-12** — Phase 12 = schema + calcs + minimal dashboard gating; Phase 13 = Settings forms & section UI.
