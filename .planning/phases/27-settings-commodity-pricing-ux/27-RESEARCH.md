# Phase 27 — Technical Research

**Phase:** 27-settings-commodity-pricing-ux  
**Date:** 2026-05-03

## RESEARCH COMPLETE

### Current behavior (baseline)

| Area | Behavior |
|------|----------|
| **Gold** | `settings.goldPrices` + `goldPricesLocked`; `GoldSpotPricesSync` may persist live ₹/g when unlocked. Settings shows three **always-visible** `Input`s plus hints—a large vertical block. |
| **Silver** | No silver fields on `SettingsSchema`. `calcCategoryTotals` computes ₹/g only from **`silverUsdPerOz × usdInr`** in [`src/lib/dashboardCalcs.ts`](../../src/lib/dashboardCalcs.ts). Users cannot fix or inspect ₹/g on Settings. |
| **Forms** | Gold uses **react-hook-form** + zod string fields + `parseFinancialInput` on submit ([`SettingsPage.tsx`](../../src/pages/SettingsPage.tsx)). |

### Recommended approach

1. **Unified interaction model** — Two adjacent **Cards** (or one Card with two sections): **Gold ₹/g** and **Silver ₹/g**. Each has:
   - **`pricingHealthy`**: live quote(s) + forex for INR succeeded (`goldUsdPerOz` + `usdInr` for gold; `silverUsdPerOz` + `usdInr` for silver) and channel **not** in error state per UX-05.
   - **Read-only row**: show formatted effective ₹/g (gold: three karats in one compact line or stacked muted lines; silver: single ₹/g).
   - **`Edit`** (`Button` `variant="ghost"` or `secondary`, small): toggles **edit mode**; inputs prefilled from **effective** values (persisted if locked, else live-derived).
   - **`Cancel`**: discards dirty form state and returns to read-only.
   - **`Save`**: persists + sets **locked** `true` for that metal (gold already does; extend pattern to silver).
   - **Failure path (UX-06):** when `pricingHealthy` is **false** (loading settled to error, or required inputs null), **skip** read-only gate—show inputs **immediately** (edit mode default true).

2. **Silver persistence** — Add optional **`settings.silverInrPerGram`** and **`settings.silverPricesLocked`** mirroring gold semantics:
   - **Locked + value:** `sumCommoditiesInr` uses stored ₹/g for `standard` silver items.
   - **Unlocked:** live-derived ₹/g when spot+forex OK; allow **`SilverSpotPricesSync`** (parallel to `GoldSpotPricesSync`) to persist rounded live ₹/g with `silverPricesLocked: false` so dashboard works offline-ish after first fetch.
   - **No legacy carve-out** needed (unlike gold): historical data has **no** silver price keys—`shouldAutoSyncSilverFromSpot` can be `!silverPricesLocked`.

3. **Effective silver helper** — New module e.g. [`src/lib/silverLiveHints.ts`](../../src/lib/silverLiveHints.ts): `liveSilverInrPerGram(silverUsdPerOz, usdInr)`, `effectiveSilverInrPerGramForNetWorth(settings, live)`, `shouldAutoSyncSilverFromSpot(settings)`.

4. **Dashboard** — Replace inline silver gram math in `calcCategoryTotals` with the **effective** helper so locked manual silver and live/auto-sync stay consistent.

5. **Component size** — If `SettingsPage.tsx` grows further, extract **`SettingsGoldPricingCard`** and **`SettingsSilverPricingCard`** under `src/components/settings/` (or `src/pages/settings/`) with props: `data`, `saveData`, `live` slices, edit-mode state callbacks.

### Pitfalls

- **RHF + read-only:** Reset form defaults when switching **into** edit mode (`reset()` with values from effective snapshot), not only on mount—avoid stale drafts.
- **Loading vs edit-default-editable:** While gold/silver still loading, UX-06 applies only **after** we know fetch failed—use “still loading” spinner in read-only header; once **error** or **stable null** with completed load, flip to editable-without-Edit.

### Validation Architecture

Not applicable — no ML/evals; manual UAT on Settings flows.
