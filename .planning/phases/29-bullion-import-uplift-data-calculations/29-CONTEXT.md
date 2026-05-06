# Phase 29: Bullion import uplift — data & calculations — Context

**Gathered:** 2026-05-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement **import-style uplift** on spot×forex **parity** ₹/g for gold and silver: **schema + migration** for persisted uplift factors (`goldImportUpliftRate` / `silverImportUpliftRate`), extend **`goldLiveHints`** / **`silverLiveHints`** and **`GoldSpotPricesSync`** / **`SilverSpotPricesSync`** so unlocked live pricing matches uplifted math; extend **effective net-worth** wiring (**`calcCategoryTotals`** and helpers) so totals align with hints; **Vitest** for uplift math, defaults/migration, and critical paths (**BLN-01–03**, **BLN-05**). **No Settings UX / disclosure work** in this phase (**BLN-04** → Phase **30**).

</domain>

<decisions>
## Implementation Decisions

### Factor storage (BLN-03)

- **D-01:** Persist uplift as **optional decimal rates** on **`Settings`**, applied as `parity_inr_per_gram * (1 + rate)`. Field names: **`goldImportUpliftRate`** and **`silverImportUpliftRate`**. Defaults align with SEED-001 ballpark intent (**~0.10** gold, **~0.08** silver) when keys are absent after migration.
- **D-02:** **Validation:** rates must be **nonnegative**; **no upper cap** (allow users to model extreme spreads if desired).
- **D-03 (migration — user discretion):** When legacy payloads omit uplift keys, **prefer normalizing to explicit default rates on load/save** so serialized JSON and export remain **deterministic** and satisfy **BLN-03** round-trip expectations — exact mechanism is planner/executor discretion.

### Math pipeline (BLN-01 / BLN-02)

- **D-04:** Apply uplift to **24K parity ₹/g first**, then derive **22K / 18K** via purity ratios (**duty-on-metal-before-karat** semantics).
- **D-05:** **`roundCurrency` once at the end** of the pipeline (`parity × forex × (1 + rate)` style per metal/karat), **not** round-then-uplift — expect minor numeric drift vs today’s parity-only rounded intermediates; tests lock intended behavior.
- **D-06:** Uplift applies only on **live-derived** paths from spot×forex — **not** to user-authored manual ₹/g when those values are authoritative (locked/manual semantics unchanged).
- **D-07:** **Silver** mirrors gold: single uplift on parity silver ₹/g before rounding; **same schema keys** feed hints and net-worth helpers.

### Phase 29 vs Phase 30

- **D-08:** **No Settings UI changes** in Phase **29** — uplift keys exist in data + calculations + tests only; **Phase 30** adds copy, tuning affordances, and disclosure (**BLN-04**) wired to the **same persisted fields** (**D-09:** avoid duplicate schema work in Phase 30).
- **D-10:** **No feature flag / env kill-switch** — single production path using stored rates (defaults when missing).
- **D-11 — Testing emphasis:** Concentrate Vitest on **uplift math + migration/load defaults** (`goldLiveHints` / `silverLiveHints` tests + schema migration patterns).

### Net-worth parity

- **D-12:** Introduce an **effective gold ₹/g model analogous to** **`effectiveSilverInrPerGramForNetWorth`** — when unlocked/live rules call for spot-derived pricing, **dashboard gold totals** use **uplifted** live ₹/g per karat (locked / legacy carve-outs follow existing **`shouldAutoSyncGoldFromSpot`** semantics).
- **D-13:** Extend **`calcCategoryTotals`** **`live`** argument with **`goldUsdPerOz`** (and uplift reads from `settings`) — update **all call sites**; avoid duplicate uplift math in UI components (**single lib path**).
- **D-14:** **Silver effective net worth** must apply the **same uplift** when deriving from spot (consistent with hints).

### Claude's discretion

- **Migration/export specifics:** User chose **you decide** for migration persistence timing — **D-03** captures the recommended direction (**explicit defaults for deterministic serialization**).
- **Export/import proof:** User skipped the explicit questionnaire — satisfy **BLN-03** with **minimal duplication**; prioritize migration + unit coverage; add zip round-trip checks only if gaps appear during implementation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **BLN-01–03**, **BLN-05** (v2.2 bullion uplift).
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — Phase **29** goal, success criteria, canonical **`### Phase 29:`** section.
- [`.planning/PROJECT.md`](../../PROJECT.md) — Local-only app, INR primary, gold/silver live pricing context.

### Seeds & prior phase context

- [`.planning/seeds/SEED-001-gold-silver-import-tax-inr.md`](../../seeds/SEED-001-gold-silver-import-tax-inr.md) — Rationale (~10% / ~8% ballpark), tunable approximation, not legal/tax advice.
- [`.planning/phases/27-settings-commodity-pricing-ux/27-CONTEXT.md`](../27-settings-commodity-pricing-ux/27-CONTEXT.md) — Effective silver for net worth, Settings locks, sync patterns.
- [`.planning/phases/26-live-gold-spot-price/26-CONTEXT.md`](../26-live-gold-spot-price/26-CONTEXT.md) — **`goldLiveHints`** derivation origins, parity baseline.

### Implementation touchpoints (repo)

- [`src/types/data.ts`](../../../src/types/data.ts) — **`SettingsSchema`** extension point for uplift keys.
- [`src/lib/goldLiveHints.ts`](../../../src/lib/goldLiveHints.ts) — Pure/karat parity helpers → uplift injection site.
- [`src/lib/silverLiveHints.ts`](../../../src/lib/silverLiveHints.ts) — Silver parity + **`effectiveSilverInrPerGramForNetWorth`** uplift alignment.
- [`src/lib/dashboardCalcs.ts`](../../../src/lib/dashboardCalcs.ts) — **`calcCategoryTotals`**, **`sumGoldInr`** evolution for effective uplifted paths.
- [`src/context/GoldSpotPricesSync.tsx`](../../../src/context/GoldSpotPricesSync.tsx), [`src/context/SilverSpotPricesSync.tsx`](../../../src/context/SilverSpotPricesSync.tsx) — Persisted rate sync vs uplifted live.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`goldLiveHints` / `silverLiveHints`** — Central places to apply `(1 + rate)` after combining spot and forex; existing tests in `__tests__` extend for uplift cases.
- **`effectiveSilverInrPerGramForNetWorth`** — Template for **gold** effective pricing helper.
- **`LivePricesContext` + sync components** — Thread uplift-aware computed ₹/g into save/compare logic.

### Established patterns

- **`roundCurrency`** financial discipline; Phase **26–27** locked parity formulas — uplift layer wraps parity output.
- **Legacy gold carve-out** in **`shouldAutoSyncGoldFromSpot`** — preserve when extending effective net worth.

### Integration points

- **Dashboard + pages** calling **`calcCategoryTotals`** — must receive **`goldUsdPerOz`** once signature widens.
- **Settings zip export/import** — new optional keys flow through existing **`SettingsSchema`** / migration patterns (**BLN-03**).

</code_context>

<specifics>
## Specific Ideas

- Numeric alignment with **SEED-001** defaults (~**10%** gold, ~**8%** silver) expressed as **0.10 / 0.08** decimal rates unless user overrides (Phase **30** UI).

</specifics>

<deferred>
## Deferred Ideas

- **BLN-04** — Settings copy, tuning affordances, **not tax/legal advice** messaging (**Phase 30**).
- **Export/import deep zip E2E** — covered under Phase **30** or planner discretion if BLN-03 gaps emerge.

</deferred>

---

*Phase: 29-bullion-import-uplift-data-calculations*  
*Context gathered: 2026-05-05*
