# Phase 27 — Pattern map (inline)

**Generated:** 2026-05-03 (orchestrator — no mapper agent)

| New / changed | Closest existing analog | Notes |
|---------------|-------------------------|-------|
| `SilverSpotPricesSync` | [`src/context/GoldSpotPricesSync.tsx`](../../src/context/GoldSpotPricesSync.tsx) | Same `useEffect` + `shouldAuto*` + `saveData` pattern |
| Silver effective ₹/g | [`src/lib/goldLiveHints.ts`](../../src/lib/goldLiveHints.ts) + inline silver math in [`dashboardCalcs.ts`](../../src/lib/dashboardCalcs.ts) | Extract shared **`roundCurrency((usdOz / TROY_OZ_TO_GRAMS) * usdInr)`** |
| Settings read-only + Edit | Session rates / retirement cards on same page | Local `useState` edit toggles + RHF `reset()` when entering edit |
