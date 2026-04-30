---
phase: 12
status: passed
verified: "2026-04-30"
---

## Scope

Phase **12 — Commodities: data & net worth**: COM-01, COM-02, COM-05 (schema, silver pricing channel, dashboard aggregation + snapshot alignment).

## Must-haves checked

| Requirement | Evidence |
|-------------|----------|
| COM-01 — Model + silver live fetch | `OtherCommodityItemSchema` in `src/types/data.ts`; `fetchSilverUsdPerOz`, `SILVER_TTL_MS`, `TROY_OZ_TO_GRAMS` in `src/lib/priceApi.ts`; `LivePricesContext` exposes silver fields |
| COM-02 — Net worth includes commodities | `sumCommoditiesInr`, `otherCommodities` on `CategoryTotals`, `DASHBOARD_CATEGORY_ORDER`; Dashboard **Commodities** row |
| COM-05 — Import / reset / schema | `ensureOtherCommodities` in `parseAppDataFromImport`; `createInitialData` includes `otherCommodities`; tests cover old JSON without key |

## Automated verification

- `npx vitest run` — 24 tests passed (schema, migration, AppDataContext, dashboardCalcs)
- `npx tsc -b --noEmit` — clean
- `npm run build` — success

## Human verification (optional)

- Run `npm run dev`; confirm Dashboard lists Commodities and network calls include silver endpoint when standard silver holdings exist (Phase 13 will add CRUD UI).

## Gaps

None identified.
