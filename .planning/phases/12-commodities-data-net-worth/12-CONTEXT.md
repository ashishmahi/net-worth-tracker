# Phase 12: Commodities: data & net worth - Context

**Gathered:** 2026-04-28  
**Revised:** 2026-04-28 — multi-kind commodities, `commodityPrices` map, explicit **no live fetch** for v1.4  
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the **persisted data model**, **load-time migration**, **Settings-based manual pricing**, **`createInitialData` / import / reset** alignment, and **net worth math** (including **Record snapshot** eligibility) for **commodities other than gold**.

**Non-gold commodities in scope for the **data model**: **two kinds** in v1.4 — **`silver`** and **`platinum`** — both tracked in **grams**, each with **manual INR per gram** in Settings (see **D-04**). **Product/UI** may expose **one or both** in Phase 13; the schema is ready for either.

**Pricing source:** **Manual entry only** for all non-gold commodities in v1.4 (**D-11**). No HTTP/API **fetch** for silver or platinum spots in this milestone — aligns with gold (manual `goldPrices`) and [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) **Future** section.

**Out of this phase (Phase 13):** CRUD UI, nav labels, dashboard row copy, Settings **forms** for each commodity price, and **COM-06** gold UX polish.

**Phase 12 vs Dashboard:** Implement **`dashboardCalcs`** + **`DataSchema`** + migration + **`parseAppDataFromImport`** + **`createInitialData`** in full. Touch **`DashboardPage.tsx`** only as much as needed for **COM-02**: **`noHoldingsYet`**, **`excludedNames`**, **`canRecordSnapshot`**, and labels for **incomplete total** / blocked snapshot — **no** new commodity section pages here (**D-12**).

</domain>

<decisions>
## Implementation Decisions

### Persisted shape (keep gold intact)

- **D-01:** Leave **`assets.gold`** and **`settings.goldPrices`** unchanged for COM-06 compatibility; do **not** fold gold into a generic commodities tree in this milestone.
- **D-02:** Add a sibling **`assets.otherCommodities`** object: `{ updatedAt: ISO datetime, items: OtherCommodityItem[] }`.
- **D-03:** **`OtherCommodityItem`** extends **`BaseItemSchema`** with **`kind: z.enum(['silver', 'platinum'])`** and **`grams: z.number().nonnegative()`**. More metals later → extend the enum + add matching optional price keys under **`commodityPrices`**.

### Settings pricing (multi-commodity, all manual)

- **D-04:** Add **`settings.commodityPrices`** — an object whose **keys align with `kind`** (at minimum **`silver`** and **`platinum`**), each value **nonnegative INR per gram**. Use **`.optional()`** on the whole object **and/or** **partial keys** so legacy `data.json` without it still parses; treat missing key for a **held** kind as “no price” (same as missing karat price for gold).
- **D-05:** **Deprecated single-field approach:** do **not** use **`silverPricePerGram`** alone — the **map** scales to **N** commodities without schema churn. **Migration:** no production reliance on the earlier CONTEXT draft; if any dev JSON used a flat key, one-off migrate into **`commodityPrices.silver`** in the same **pre-parse** pipeline (optional).
- **D-11 (price fetch):** **No** automated price fetch for silver/platinum in v1.4. **Future milestone** could add optional feeds that **populate** manual fields or a separate “stale” indicator — **out of scope** for Phase 12–13.

### Dashboard calculations & snapshot behavior

- **D-06:** Extend **`CategoryTotals`** with **`otherCommodities: number | null`**. **`null`** if **any** line has **`grams > 0`** and **`commodityPrices[kind]`** is missing for that **`kind`**; **`0`** if there are no non-gold commodity items; else **Σ roundCurrency(grams × price)** per line (same rounding discipline as **`sumGoldInr`**).
- **D-07:** Append **`otherCommodities`** to **`DASHBOARD_CATEGORY_ORDER`** **immediately after `gold`**.
- **D-08:** **`noHoldingsYet`**, **`excludedNames`**, and snapshot gating treat **`otherCommodities === null`** like **`totals.gold === null`**: incomplete total, **Record snapshot** disabled, user messaging points to **Settings** for missing **commodity** prices (copy can say “commodity prices” or list kinds — Phase 13 can polish strings).

### Migration & parse path

- **D-09:** Stay on **`version: 1`**; add **`ensureOtherCommodities`** before **`DataSchema.safeParse`** to inject **`{ updatedAt: nowIso(), items: [] }`** when absent.
- **D-10:** **`createInitialData`** includes **`otherCommodities`** empty shell; **`settings`** may omit **`commodityPrices`** until the user sets prices (optional object).

### Phase 12 surface area (scope)

- **D-12:** **Required in Phase 12:** schema, migration, **`commodityPrices`** shape, **`sumOtherCommoditiesInr`-style** helper, **`CategoryTotals`** + **`DASHBOARD_CATEGORY_ORDER`**, snapshot eligibility parity, **`parseAppDataFromImport`** / reset. **Defer to Phase 13:** user-facing Settings inputs for silver/platinum (unless a **minimal** dev-only field is needed for local verification — Claude’s discretion).

### Claude's Discretion

- Exact **Zod** shape for **`commodityPrices`** (`z.object({ silver: optional, platinum: optional })` vs **`z.record`**) as long as validation matches **`kind`** and **partial** keys behave correctly on import.
- Wording of **excludedNames** entries for the new bucket (“Other commodities” vs listing metals).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **COM-01, COM-02, COM-05**; **Future:** live spot feeds deferred
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — v1.4 Phase 12 row

### Product constraints

- [`CLAUDE.md`](../../../../CLAUDE.md) — **never store computed totals in `data.json`**, **`roundCurrency`**, schema **version 1**

### Code hooks (integration)

- [`src/types/data.ts`](../../../../src/types/data.ts) — `DataSchema`, `GoldSchema`, `SettingsSchema`, `BaseItemSchema`
- [`src/context/AppDataContext.tsx`](../../../../src/context/AppDataContext.tsx) — `parseAppDataFromImport`, `createInitialData`, migration helpers
- [`src/lib/dashboardCalcs.ts`](../../../../src/lib/dashboardCalcs.ts) — `calcCategoryTotals`, `sumForNetWorth`, `DASHBOARD_CATEGORY_ORDER`
- [`src/pages/DashboardPage.tsx`](../../../../src/pages/DashboardPage.tsx) — `canRecordSnapshot`, `excludedNames`, `noHoldingsYet`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`parseAppDataFromImport`** — add **`ensureOtherCommodities`** alongside **`ensureNetWorthHistory`**.
- **`sumGoldInr`** — pattern for **nullable** category when prices missing.
- **`BaseItemSchema`** — line items for each **`otherCommodities`** row.

### Established patterns

- **Optional Settings** — `goldPrices.optional()`; mirror with **`commodityPrices.optional()`** (partial keys per metal).
- **Migration helpers** — pure JSON transforms before **`safeParse`**.

### Integration points

- **`calcCategoryTotals`** → **`sumForNetWorth`** → Dashboard snapshot **`totalInr`** must include **`otherCommodities`**.

</code_context>

<specifics>
## Specific Ideas

- **Silver** is the primary **COM-01** “additional commodity”; **platinum** is included in the **same** schema so users can hold **two** non-gold metals without a follow-up migration.
- **Grams + INR/gram** throughout — consistent with gold’s gram mental model.

</specifics>

<deferred>
## Deferred Ideas

- **Live / fetched** spot prices for silver, platinum, or other commodities — **not v1.4**; would require product rules (frequency, override) — separate milestone (**D-11**).
- Additional **`kind`** values (e.g. palladium) — extend enum + **`commodityPrices`** keys when needed.
- Rich **Settings** UX for many metals — Phase 13.

</deferred>

---

*Phase: 12-commodities-data-net-worth*  
*Context gathered: 2026-04-28 · Revised: 2026-04-28*
