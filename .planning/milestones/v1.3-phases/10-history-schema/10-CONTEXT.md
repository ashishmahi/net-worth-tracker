# Phase 10: History & schema - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend `DataSchema` / `AppData` with a top-level **ordered list of net worth snapshots** (`netWorthHistory`); **migrate** v1.2 and older `data.json` that lack the field to **`[]`**; ensure **`createInitialData()`** includes an **empty** list; on **Clear all data** the history is cleared with the rest of wealth data (**NWH-05**). Add a **Dashboard** control to **Record snapshot** that persists the **current** `sumForNetWorth` total (same inputs as the existing net worth row) via **`saveData`** / **POST** `/api/data` with **schema validation**. **Out of scope:** chart UI (**Phase 11**), except what the roadmap may allow as an optional stub (not in this discussion — defer to plan).

**Requirements (product):** **NWH-01**, **NWH-02**, **NWH-05**, **NWH-03** (the record + persist part; chart/empty state for the series is **NWH-04** / Phase 11).

</domain>

<decisions>
## Implementation Decisions

### A — Schema: field name and row shape (NWH-01)
- **D-01:** Add a top-level key **`netWorthHistory`**: an **array** of objects **`{ recordedAt: string, totalInr: number }`** where:
  - **`recordedAt`**: **ISO 8601** (use **`new Date().toISOString()`** at the moment the user’s action completes — *Claude’s discretion:* if tests need determinism, inject clock only in test).
  - **`totalInr`**: **non-negative** number, values aligned with the same **INR** net worth definition the Dashboard already uses via **`sumForNetWorth`** / **`calcCategoryTotals`**.
- **D-02:** **No** per-row **`id` UUID** in v1.3 — keep rows **minimal**; a future phase can add identifiers if needed for export/edit.

### B — Load & migration (NWH-02)
- **D-03:** If `data.json` (or parsed object) **lacks** `netWorthHistory`, migration sets it to **`[]`** before/through the same path as `DataSchema.safeParse` (exact layering matches existing **`migrateLegacyBankAccounts`** + parse pattern; *planner/research* picks **pre-parse default** vs **Zod** `.default([])` as long as behavior is identical for users).
- **D-04:** **Sort order for display/Phase 11:** store **append** order matching user actions; for chart, **sort by `recordedAt` when rendering** (time series) if needed — *Claude’s discretion* whether to also sort on write (not required for Phase 10 if read path sorts once).

### C — Record snapshot: guardrails (NWH-03 alignment)
- **D-05:** **Disable** the **Record snapshot** control when the **Dashboard net worth total** is not a **fully resolved** `sumForNetWorth` — i.e. while **BTC/FX (or any)** path leaves the **total in a loading/skeleton** state or a **partial** total (e.g. excluded categories). The stored `totalInr` must not represent an **accidentally incomplete** aggregate relative to a fully loaded dashboard.
- **D-06:** **No** “deduplicate/merge if same second or same `totalInr` as previous row” rule. **Two** explicit user actions **after** prior saves may produce **two** rows (even identical `totalInr` / close timestamps) — **D-07** limits accidental double-POST, not business dedupe.
- **D-08:** **While `saveData` is in progress** (record flow), **disable** the control (or equivalent) so a **single** UI gesture cannot enqueue duplicate saves; **intentional** second tap after success appends a **second** row.
- **D-09:** **NWH-03 idempotency:** one **new** list entry per **explicit** user activation of the control, not from background retries — align with existing **`saveData`** retry/rollback behavior (*implementation detail* for the planner).

### D — Dashboard placement & copy (NWH-03)
- **D-10:** Place an **outline** (secondary) **`Button`** **immediately under** the main **net worth total `Card`**, **above** the category breakdown rows, label **`Record snapshot`**.

### E — Reset (NWH-05)
- **D-11:** **Clear all data** path continues to use **`createInitialData()`** + **`saveData`**; that factory must return `netWorthHistory: []` (and not preserve old history).

### F — Import compatibility (10.1 already shipped)
- **D-12:** **JSON import** uses the same **`DataSchema` + migration** as boot. After the new field is added, **imported** files that omit `netWorthHistory` are treated like legacy files: **migration to `[]`**; files that **include** the list must **validate** under the updated schema. **D-13:** *Regression-test* import + export round-trip after **Phase 10** schema work.

### Claude's Discretion
- Exact **disabled** / **aria-** / helper text when recording is blocked (e.g. “Waiting for live prices…”). Minor **wording** next to the button. Whether **sorting** the array on write is worth doing before Phase 11. **Optional** stub on Dashboard for chart — out of this context unless the plan needs a placeholder component.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product
- `.planning/REQUIREMENTS.md` — **NWH-01**, **NWH-02**, **NWH-03** (record path), **NWH-05**; import **IMP-01/02** re-validation after schema change
- `.planning/ROADMAP.md` — Phase 10 goal, depends, success criteria; Phase 10.1 / 11 boundaries
- `.planning/PROJECT.md` — v1.3 milestone, local JSON, no new HTTP routes
- `.planning/STATE.md` — current position (optional)

### Inserted / adjacent phase
- `.planning/phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/10.1-CONTEXT.md` — same **`DataSchema`** + **import** must stay aligned with `AppData`

### Prior milestone contexts (consistency)
- `.planning/milestones/v1.0-phases/05-dashboard/05-CONTEXT.md` — `sumForNetWorth` / `calcCategoryTotals` meaning of total; do not use projected retirement corpus
- `.planning/milestones/v1.2-phases/09-data-reset/09-CONTEXT.md` — **`createInitialData()`** + **`saveData`**; danger zone; inline errors

### Code
- `src/types/data.ts` — `DataSchema` / `AppData`
- `src/context/AppDataContext.tsx` — load migration, `saveData`, `createInitialData` / `INITIAL_DATA`
- `src/lib/dashboardCalcs.ts` — `sumForNetWorth`, `calcCategoryTotals`
- `src/pages/DashboardPage.tsx` — `grandTotal`, `showNetWorthSkeleton` / loading gates
- `src/pages/SettingsPage.tsx` — import/export **Data** block (post–Phase 10 regression)
- `plugins/dataPlugin.ts` — **POST** `/api/data` body must remain schema-valid
- `data.example.json` — example shape for docs/tests
- `CLAUDE.md` — float rules, `roundCurrency`, no storing **live** net worth as the only source of truth (snapshots in **history** are **historical** points, per NWH-01)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **`sumForNetWorth` / `calcCategoryTotals`** in `src/lib/dashboardCalcs.ts` — **single** definition of the total to snapshot.
- **`DashboardPage`** — top **Card** for total, category list, `showNetWorthSkeleton` / exclusion logic — wire **Record snapshot** to **`useAppData().saveData`**, append to **`netWorthHistory`**, and respect loading gates.
- **`useAppData()`** — `data`, `saveData`; follow existing **rollback** on failed **POST** (no partial disk write with stale memory).

### Established patterns
- **Zod** at `DataSchema` boundary; **Vite** plugin **POST** validates the full **JSON** body.
- **Settings** / **import** (10.1) — `parseAppDataFromImport` must stay in lockstep with the **new** `AppData` shape.

### Integration points
- **`DataSchema`**: new **`netWorthHistory`** key at root (alongside `version`, `settings`, `assets` — *exact* mirror of planner’s `DataSchema` edit).
- **`createInitialData`**: include **`netWorthHistory: []`**; **`INITIAL_DATA`** derives from the factory.
- **Dashboard** — new button + `saveData` from record handler; may need **`useLivePrices`** in scope for the same `totals` the card uses, or a small shared helper to avoid double logic.

</code_context>

<specifics>
## Specific Ideas

- User selected **`netWorthHistory`** with **minimal** rows, **no** per-row `id` for v1.3. **Record** is **disabled** when the dashboard total is **not stable/complete**; **outline** button **“Record snapshot”** **under** the total **Card**. **No** time/amount **dedupe**; **only** `saveData` **busy** guard to prevent accidental double-saves from one gesture.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-history-schema*
*Context gathered: 2026-04-26*
