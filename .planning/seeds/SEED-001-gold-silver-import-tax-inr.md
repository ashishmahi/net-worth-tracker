---
id: SEED-001
status: dormant
planted: "2026-05-05"
planted_during: Between milestones — v2.1 shipped (STATE.md); no active phase
trigger_when: Revisit precious-metals live pricing, spot→INR derivation accuracy, or Settings gold/silver UX in a milestone focused on pricing realism for Indian users.
scope: Medium
---

# SEED-001: Model Indian import-style duties in gold/silver INR per gram (spot-derived)

## Why This Matters

Deriving ₹/g from international spot × USD/INR approximates **parity** metal price, not **landed** Indian market pricing. The government applies import-related charges on bullion; rough ballpark figures cited here are **~10% for gold** and **~8% for silver**. Rebuilding the derivation to incorporate these (as configurable factors or documented defaults) would align auto hints and net-worth metal valuations closer to what users expect when they think in “Indian market” terms—without pretending the app is a customs calculator.

## When to Surface

**Trigger:** A milestone or phase that touches **gold/silver live pricing**, **spot-to-INR conversion**, **Settings pricing cards**, or **accuracy of precious-metal valuations** for INR users.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:

- Work explicitly improves gold or silver **₹/g from spot** logic (not only forex).
- UX or copy promises “live” or “market” Indian bullion pricing and needs **duty/tax realism** called out or modeled.
- Refactors `goldLiveHints` / `silverLiveHints` or related tests for **maintainability** (good moment to add duty factors).

## Scope Estimate

**Medium** — touches core hint functions, possibly `LivePricesContext` / sync components, Settings cards, and tests; may need a **settings toggle** or **documented constant** so users understand what is included.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/lib/goldLiveHints.ts` — `liveInrPerGramPure`, `liveInrPerGramForKarat` (spot × forex only today).
- `src/lib/silverLiveHints.ts` — `liveSilverInrPerGram` (same pattern).
- `src/lib/priceApi.ts` — shared constants such as `TROY_OZ_TO_GRAMS` used by the above.
- `src/context/LivePricesContext.tsx` — live spot + forex wiring for hints.
- `src/components/settings/SettingsGoldPricingCard.tsx`, `src/components/settings/SettingsSilverPricingCard.tsx` — surfaces live-derived ₹/g hints and sync behavior.
- `STATE.md` — **v2.0.1** note: live gold spot + Settings gold/silver pricing UX shipped previously (foundation for this refinement).

## Notes

- Percentages are **rough policy-style placeholders**; implementation should allow **tuning** (settings or env) and clear **UI copy** that this is an approximation, not legal/tax advice.
- Consider **separate factors** for gold vs silver and whether duty applies to **all** karats equally (likely yes on metal value before purity split—confirm with product intent when executing).
