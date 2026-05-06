# Phase 29 — Pattern map

Analogs for new/modified behavior (from **`29-CONTEXT.md`** + codebase scan).

| Planned touch | Role | Closest existing analog | Notes |
|---------------|------|-------------------------|--------|
| `src/types/data.ts` — optional uplift fields on **Settings** | Schema | Existing **`silverInrPerGram`**, **`goldPricesLocked`** optional fields | Keep **`.passthrough()`**; nonnegative numbers only |
| `src/context/AppDataContext.tsx` — migration | Pre-parse normalize | **`ensureNetWorthHistory`**, **`ensureOtherCommodities`**, **`ensureLiabilities`** | Insert **`ensureImportUpliftRates`** before **`safeParse`**; update **`parseAppDataFromImport` comment chain** |
| `src/lib/goldLiveHints.ts` — uplifted parity | Pure math | Current **`liveInrPerGramPure`** / **`liveInrPerGramForKarat`** | Add rate parameter + **single final `roundCurrency` per output karat** |
| `src/lib/silverLiveHints.ts` — uplift + effective | Pure math | **`liveSilverInrPerGram`**, **`effectiveSilverInrPerGramForNetWorth`** | Uplift only on live-derived branch |
| `src/context/GoldSpotPricesSync.tsx` | Persist hints | Current **`useMemo` → `liveInrPerGramForKarat`** | Pass resolved gold uplift rate from **`data.settings`** |
| `src/context/SilverSpotPricesSync.tsx` | Persist hint | Current **`liveSilverInrPerGram`** | Pass resolved silver uplift rate |
| `src/components/settings/SettingsGoldPricingCard.tsx` | Display hints | **`liveInrPerGramForKarat`** in **`useMemo`** | Add uplift deps |
| `src/pages/GoldPage.tsx` | Display hints | Same as Settings card | Add uplift deps |
| `src/lib/dashboardCalcs.ts` — **`calcCategoryTotals`** | Aggregation | Current **`effectiveSilverInrPerGramForNetWorth`** pattern | Add **`goldUsdPerOz`** to **`live`**; gold effective helper |
| `src/pages/DashboardPage.tsx` | Wiring | **`calcCategoryTotals(data, { btcUsd, usdInr, … })`** | Include **`goldUsdPerOz`** from **`useLivePrices()`** |
| Tests | Vitest | **`goldLiveHints.test.ts`**, **`dashboardCalcs.test.ts`**, **`AppDataContext.test.tsx`** | Use explicit rates (**`0`**) to isolate karat math where needed |
