# Phase 29: Bullion import uplift — data & calculations — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in **29-CONTEXT.md**.

**Date:** 2026-05-05  
**Phase:** 29 — Bullion import uplift — data & calculations  
**Areas discussed:** Factor storage shape, Math order, Phase 29 vs 30 boundary, Net-worth parity  
**Note:** ROADMAP.md was updated with `### Phase 29:` / `### Phase 30:` headings so `gsd-sdk query init.phase-op "29"` resolves phases defined in tables (SDK parses `##/### Phase N:` headings, not table rows alone).

---

## Factor storage shape

| Option | Description | Selected |
|--------|-------------|----------|
| Decimal uplift rates on parity | e.g. 0.10 / 0.08; `goldImportUpliftRate` / `silverImportUpliftRate` | ✓ |
| Whole-number percent fields | 10 / 8 stored | |
| Store multipliers | 1.10 / 1.08 | |
| You decide | | |

**User's choice:** Decimal rates + explicit field names **`goldImportUpliftRate`** / **`silverImportUpliftRate`**.

**Migration defaults:** User chose **you decide** — CONTEXT recommends explicit normalization for deterministic export (**29-CONTEXT.md D-03**).

**Validation:** **Nonnegative, uncapped**.

---

## Math order

| Question | Selected |
|----------|----------|
| Pure ₹/g uplift before karat split | ✓ Yes |
| Rounding | ✓ Single `roundCurrency` at end of uplifted pipeline |
| Uplift scope | ✓ Live-derived paths only — not manual authoritative ₹/g |
| Silver | ✓ Mirror gold (symmetric uplift on parity silver ₹/g) |

---

## Phase 29 vs Phase 30 boundary

| Topic | Selected |
|-------|----------|
| Settings UI this phase | ✓ **No UI change** — data + math + tests only |
| BLN-03 vs BLN-04 split | ✓ Phase **29** persists fields; Phase **30** exposes/edits same fields |
| Testing emphasis | ✓ **Math + migration** focus |
| Feature flags | ✓ **None** — always-on path |

**Skipped prompt:** Export/import verification depth — left to planner (**BLN-03**).

---

## Net-worth parity

| Topic | Selected |
|-------|----------|
| Gold dashboard/model | ✓ **Effective pricing like silver** when unlocked/live applies |
| `calcCategoryTotals` | ✓ Extend **`live`** with **`goldUsdPerOz`** + thread call sites |
| Silver effective path | ✓ Must use uplifted spot derivation consistently |
| UI vs lib | ✓ **Single centralized math path** — UI stays thin |

---

## Claude's discretion

- Migration timing / explicit defaults (**D-03**).
- Export/import test depth after skipped question.

## Deferred ideas

- Settings UX / disclosure (**Phase 30**).
