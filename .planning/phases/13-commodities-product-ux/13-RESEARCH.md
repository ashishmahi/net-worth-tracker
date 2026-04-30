# Phase 13 — Technical research

## RESEARCH COMPLETE

**Question:** What do we need to know to plan Commodities product UX well?

### Findings

1. **Navigation:** `SectionKey` and `NAV_ITEMS` live in `src/components/AppSidebar.tsx`; `SECTION_COMPONENTS` in `src/App.tsx` maps keys to page components. New section requires extending both and inserting a route between Gold and Mutual Funds (per CONTEXT).

2. **Dashboard wiring:** `NAV_KEY.otherCommodities` is currently `'settings'` in `src/pages/DashboardPage.tsx` — must change to the new section key. Row already has `isCommoditiesRow` subtext for silver errors.

3. **CRUD patterns:** `GoldPage.tsx` uses local sheet state, `openAdd`/`openEdit`, `zodResolver`, string fields with `parseFinancialInput` on submit, `createId`/`nowIso`, `saveData` spreading `data.assets.*`. Same pattern applies to `otherCommodities.items` array updates.

4. **Types:** `OtherCommodityItem` is a discriminated union (`standard` | `manual`) in `src/types/data.ts` — UI branches on `item.type`; no schema edits in Phase 13.

5. **Live silver:** Consumers use `useLivePrices()` from `LivePricesContext` — pages must not call `priceApi` directly (`CLAUDE.md`).

6. **COM-06:** Do not edit `GoldPage.tsx` behavior or layout; dashboard Gold row may receive cosmetic-only tweaks.

### Pitfalls

- Reset form **before** opening sheet (`GoldPage` pattern) to avoid stale values.
- Manual items use **valueInr** directly; standard items never persist computed INR from live prices into JSON.

---

## Validation Architecture

**Automated verification for this phase**

| Layer | Tool | Command |
|-------|------|---------|
| Types + unit | Vitest (existing) | `npm test` |
| Typecheck | TypeScript | `npx tsc -b --noEmit` |

**Sampling:** Run `npm test` and `npx tsc -b --noEmit` after each plan wave before UAT.

**Manual UAT (COM-03/COM-04/COM-06):** Add/edit/delete silver and manual lines; confirm Dashboard row navigates to Commodities; confirm Gold section unchanged.
