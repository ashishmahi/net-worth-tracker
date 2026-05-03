# Phase 27: Settings gold & silver pricing UX — Context

**Gathered:** 2026-05-03  
**Updated:** 2026-05-03  
**Status:** Ready for execution

## Phase boundary

Deliver a **unified Settings UX** for **gold** and **silver** spot-derived **₹/g**: **compact read-only** summaries when live feeds are healthy; **Edit** reveals inputs prefilled from effective values; **editable-by-default** when feeds fail or required quotes are missing (**UX-04–UX-06**). Add **silver** pricing parity with optional persisted **`settings.silverInrPerGram`** + lock flag + background sync when unlocked (**UX-07**), wiring **`calcCategoryTotals`** to **effective** silver ₹/g.

## Implementation decisions

### D-01 — Read-only vs edit (UX-05 / UX-06)

- **`pricingHealthyGold`** = `goldUsdPerOz != null` && `usdInr != null` && `!goldError` (and forex not blocking—reuse existing `goldHintLoading` logic where appropriate).
- **`pricingHealthySilver`** = `silverUsdPerOz != null` && `usdInr != null` && `!silverError`.
- When healthy → default **`editMode = false`** (read-only summary + **Edit**).
- When **not** healthy (after loading completes toward error/missing) → **`editMode = true`** without requiring **Edit**.

### D-02 — Silver schema

- Add **`silverInrPerGram?: number`** (nonnegative) and **`silverPricesLocked?: boolean`** to **`SettingsSchema`** in [`src/types/data.ts`](../../src/types/data.ts).
- No migration function: optional keys; Zod **`.passthrough()`** already on settings.

### D-03 — Effective silver for net worth

- Implement **`effectiveSilverInrPerGram(settings, { silverUsdPerOz, usdInr })`** in new [`src/lib/silverLiveHints.ts`](../../src/lib/silverLiveHints.ts) (name exact per implementation).
- **`shouldAutoSyncSilverFromSpot(settings)`** returns **`false`** iff **`silverPricesLocked === true`** (no gold-style legacy carve-out).
- Update **`calcCategoryTotals`** / **`sumCommoditiesInr`** call path so **`standard` silver** lines use the **effective** ₹/g (live > unlocked persisted cache > null).

### D-04 — SilverSpotPricesSync

- New **`SilverSpotPricesSync`** alongside **`GoldSpotPricesSync`**: when auto-sync allowed and computed live ₹/g differs from **`settings.silverInrPerGram`**, **`saveData`** with **`silverPricesLocked: false`** and **`updatedAt`**.

### D-05 — Settings layout

- Refactor **Gold Prices** card per [**27-UI-SPEC.md**](27-UI-SPEC.md): compact read-only summary; **Edit** expands existing three-field form.
- Add **Silver price** card with same pattern (one field).
- Preserve **Use live spot** flows for **gold** (and add **silver** equivalent when locked).
- Extract **`SettingsGoldPricingSection`** / **`SettingsSilverPricingSection`** if **`SettingsPage.tsx`** exceeds ~900 lines after refactor (executor discretion).

### D-06 — Downstream pages

- **`DashboardPage`** / **`CommoditiesPage`**: adjust loading/skeleton only if **effective silver** no longer depends on live fetch when locked—prefer showing totals without blocking on **`silverLoading`** when locked persisted rate exists (optional polish in same phase if low risk).

## Canonical references

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **UX-04–UX-07**
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — Phase **27** goal
- [**27-RESEARCH.md**](27-RESEARCH.md), [**27-UI-SPEC.md**](27-UI-SPEC.md)
- [`src/context/GoldSpotPricesSync.tsx`](../../src/context/GoldSpotPricesSync.tsx) — mirror for silver sync
- [`src/pages/SettingsPage.tsx`](../../src/pages/SettingsPage.tsx) — primary edit surface
- [`src/lib/dashboardCalcs.ts`](../../src/lib/dashboardCalcs.ts) — silver effective wiring

## Deferred

- Collapsing **Live market rates** `<dl>` into a drawer.
- Historical metal charts.

---

*Phase: 27-settings-commodity-pricing-ux*
