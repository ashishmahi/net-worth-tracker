# Phase 12: Commodities: data & net worth - Context

**Gathered:** 2026-04-28  
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the **persisted data model**, **load-time migration**, **Settings-based manual pricing**, **`createInitialData` / import / reset** alignment, and **net worth math** (including **Record snapshot** eligibility) for **commodities other than gold** — at minimum **silver** in grams with **INR per gram** in Settings.

**Out of this phase (Phase 13):** CRUD UI, nav labels, dashboard row copy, and **COM-06** gold UX polish. Phase 12 may touch **`dashboardCalcs.ts`** and **minimal** `DashboardPage.tsx** logic (`noHoldingsYet`, `excludedNames`, `canRecordSnapshot`) only where required so **COM-02** (totals + snapshot integrity) holds end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Persisted shape (keep gold intact)

- **D-01:** Leave **`assets.gold`** and **`settings.goldPrices`** unchanged for COM-06 compatibility; do **not** fold gold into a generic commodities tree in this milestone.
- **D-02:** Add a sibling **`assets.otherCommodities`** object shaped like other sections: `{ updatedAt: ISO datetime, items: OtherCommodityItem[] }`.
- **D-03:** **`OtherCommodityItem`** extends **`BaseItemSchema`** (`id`, `createdAt`, `updatedAt`) with **`kind: z.literal('silver')`** and **`grams: z.number().nonnegative()`** for v1.4. Future metals append new literals **or** extend `kind` union in a later phase — same table pattern.

### Settings pricing

- **D-04:** Add optional **`settings.silverPricePerGram`** — nonnegative **INR per gram**, aligned with gold’s “price lives in Settings” rule (see existing gold pattern in `dashboardCalcs`).
- **D-05:** Omit silver price from Settings UI work here if Phase 13 owns Settings forms — but **schema + defaults** must exist in Phase 12 so planners wire Phase 13 fields to this key. If Phase 12 ships Settings inputs for silver price, that is acceptable overlap; otherwise expose via JSON/edit until Phase 13.

### Dashboard calculations & snapshot behavior

- **D-06:** Extend **`CategoryTotals`** with **`otherCommodities: number | null`**: `null` when any **silver** line has `grams > 0` and **`settings.silverPricePerGram` is undefined**; `0` when there are no such items; else **sum(grams × silverPricePerGram)** with **`roundCurrency`** at each step (match `sumGoldInr` style).
- **D-07:** Append **`otherCommodities`** to **`DASHBOARD_CATEGORY_ORDER`** (position: **immediately after `gold`**) so mental ordering stays “metals together” and **`sumForNetWorth`** includes the new bucket without special cases.
- **D-08:** Update **`noHoldingsYet`**, snapshot **`excludedNames`**, and any **“incomplete total”** messaging to treat **`otherCommodities === null`** like gold: if user holds silver but price is missing, they are **excluded** from the displayed total and **Record snapshot** must stay **disabled** until price is set (same policy as `totals.gold === null`).

### Migration & parse path

- **D-09:** Stay on **`version: 1`** at the root; add an **`ensureOtherCommodities`** (or inline) step in **`parseAppDataFromImport`** / boot path that injects **`{ updatedAt: nowIso(), items: [] }`** when missing, mirroring **`ensureNetWorthHistory`**.
- **D-10:** **`createInitialData`** includes **`otherCommodities: { updatedAt, items: [] }`**; full reset clears it with the rest of `assets`.

### Claude's Discretion

- Exact **Zod** naming (`otherCommodities` vs `commodities`) if minor refactors improve consistency with existing `assets.*` keys.
- Whether Phase 12 adds a **minimal Settings** numeric field for silver price vs. schema-only — prefer whichever minimizes duplicate work with Phase 13 without breaking COM-05.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **COM-01, COM-02, COM-05** for Phase 12
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — v1.4 Phase 12 row (schema, migration, calcs, import, reset)

### Product constraints

- [`CLAUDE.md`](../../../../CLAUDE.md) — **never store computed totals in `data.json`**, **`roundCurrency`**, schema **version 1**

### Code hooks (integration)

- [`src/types/data.ts`](../../../../src/types/data.ts) — `DataSchema`, `GoldSchema`, `SettingsSchema`, `BaseItemSchema`
- [`src/context/AppDataContext.tsx`](../../../../src/context/AppDataContext.tsx) — `parseAppDataFromImport`, `createInitialData`, `migrateLegacyBankAccounts`, `ensureNetWorthHistory`
- [`src/lib/dashboardCalcs.ts`](../../../../src/lib/dashboardCalcs.ts) — `calcCategoryTotals`, `sumForNetWorth`, `DASHBOARD_CATEGORY_ORDER`
- [`src/pages/DashboardPage.tsx`](../../../../src/pages/DashboardPage.tsx) — `canRecordSnapshot`, `excludedNames`, `noHoldingsYet`, `grandTotal` / snapshot write

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`parseAppDataFromImport`** — single choke point for boot + JSON import; add migration **before** `DataSchema.safeParse`.
- **`sumGoldInr` / `CategoryTotals`** — template for nullable category totals when manual rates are missing.
- **`BaseItemSchema`** — reuse for silver line items.

### Established patterns

- **Optional Settings slices** — `goldPrices.optional()` pattern; mirror with **`silverPricePerGram.optional()`**.
- **Migration helpers** — pure functions mutating raw JSON prior to Zod (see `migrateLegacyBankAccounts`, `ensureNetWorthHistory`).

### Integration points

- **`calcCategoryTotals`** → **`DashboardPage`** `totals` / **`sumForNetWorth`** → snapshot **`totalInr`** must all pick up **`otherCommodities`** once schema exists.

</code_context>

<specifics>
## Specific Ideas

- First additional commodity is **silver**, **grams**, **INR/gram** — matches Indian bullion thinking and existing gold **grams** UX.

</specifics>

<deferred>
## Deferred Ideas

- **Live** silver spot APIs — future milestone (manual only for v1.4).
- **Platinum / generic commodity** rows — extend `kind` union when needed.
- Rich **Settings** UX for multiple metals — Phase 13 (COM-03/04/06).

</deferred>

---

*Phase: 12-commodities-data-net-worth*  
*Context gathered: 2026-04-28*
