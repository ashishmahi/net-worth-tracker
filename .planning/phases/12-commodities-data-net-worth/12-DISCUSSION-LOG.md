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

---

## Revision (2026-04-30)

**User selected:** Redo requirements analysis — user wants freeform named assets (e.g. "Oil worth ₹10L") in addition to standard precious metals.

### Requirements Model

| Option | Description | Selected |
|--------|-------------|----------|
| Keep existing (silver + platinum, all manual) | Prior D-11: no live fetch | |
| Expand: standard (live) + freeform (manual) | Two item types in discriminated union | ✓ |

**User's choice:** Expand model.

### Standard Commodities — Live Price Fetch

| Option | Description | Selected |
|--------|-------------|----------|
| Live fetch (Recommended) | Metals API → USD/oz → INR/gram | ✓ |
| Manual only (keep D-11) | User enters INR/gram in Settings | |

**User's choice:** Live fetch — reverses prior D-11.

### Freeform Items

| Option | Description | Selected |
|--------|-------------|----------|
| Name + total INR value | Simple label + INR amount | ✓ |
| Name + quantity + unit + price | Structured | |

**User's choice:** Name + total INR value.

### Schema Shape

| Option | Description | Selected |
|--------|-------------|----------|
| One list, discriminated union (Recommended) | Single items[] with type: 'standard' \| 'manual' | ✓ |
| Two separate lists | standardCommodities + manualAssets | |

**User's choice:** Discriminated union.

### Standard Commodities — Which Metals

*User requested quick research. Finding: free live APIs exist for precious metals; MCX data for base metals/energy is behind broker APIs.*

| Option | Description | Selected |
|--------|-------------|----------|
| Silver only (Recommended) | Silver in v1.4; extend enum later | ✓ |
| Silver + Platinum | Both in v1.4 | |

**User's choice:** Silver only.

### Freeform Item Limit

| Option | Description | Selected |
|--------|-------------|----------|
| No limit, open-ended list | Same pattern as bank accounts | ✓ |
| Small limit (5–10) | | |

**User's choice:** No limit.

### Dashboard Row

| Option | Description | Selected |
|--------|-------------|----------|
| One combined 'Commodities' row (Recommended) | Silver + freeform summed together | ✓ |
| Two rows: Silver + Other | Separate | |

**User's choice:** Single "Commodities" row.

### Silver Price API

| Option | Description | Selected |
|--------|-------------|----------|
| Metals-API or similar free tier (Recommended) | Free endpoint + existing USD/INR | ✓ |
| You decide | | |

**User's choice:** Metals-API free tier.

### Phase 12 Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Schema + calcs + price fetch wiring (Recommended) | Phase 12 includes silver priceApi.ts | ✓ |
| Schema + calcs only | Keep fetch in Phase 13 | |

**User's choice:** Include price fetch wiring in Phase 12.

**All decisions captured in revised `12-CONTEXT.md` (2026-04-30).**
