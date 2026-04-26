# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)  
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)  
- ✅ **v1.2 — Data reset** — Shipped 2026-04-26 — [full snapshot](milestones/v1.2-ROADMAP.md)  
- **v1.3 — Net worth history** — *In planning* — this file  

**Phase numbering:** v1.2 ended at **Phase 9**. v1.3 uses **Phases 10, 10.1, 11** (no `--reset-phase-numbers`); **10.1** was inserted after Phase 10 for **JSON import** before the chart.

---

## v1.3 — Net worth history (Phases 10, 10.1, 11)

**Goal:** Persist **net worth snapshots** (INR + timestamp) in `data.json`, let the user **record** the current total from the **Dashboard**, and show a **line/area chart** of history; **full data reset** clears history; **migrate** old files without the new field.

| Phase | Name                 | Summary goal | Requirements   |
|-------|----------------------|--------------|---------------|
| 10    | **History & schema** | Extend `DataSchema`, migration, `createInitialData`, `record` flow + **Reset** clears history, POST validates | NWH-01, NWH-02, NWH-03, NWH-05 |
| 10.1  | **JSON import** *(INSERTED)* | Quick import from a chosen JSON file; validate with `DataSchema` + `saveData` (pair with existing Export) | IMP-01, IMP-02 (see [REQUIREMENTS](REQUIREMENTS.md)) |
| 11    | **Net worth chart**  | Recharts(ish) line/area on Dashboard, NWH-04 empty state, **dark**/**light** | NWH-04 |

### Phase 10: History & schema

- **Focus:** Zod + TypeScript `AppData` (e.g. `netWorthHistory: { recordedAt, totalInr }[]` at a stable path); **load** migrates missing field to `[]`; `createInitialData()` **[]**; `saveData` on record; v1.2 **Clear all** clears history; **Dashboard** “Record snapshot” using **same** total as existing net worth row (`dashboardCalcs` / `sumForNetWorth` — single source of truth).  
- **Out of** this phase: **chart** rendering (Phase 11) except optional stub.  

**Success criteria (observable):**  

1. `npm run build` passes; new field appears in `data.json` after record.  
2. Deleting/resetting all data via existing reset removes **entire** snapshot list.  
3. Opening an old v1.2 `data.json` in dev **does not** throw; migration adds the list.  
4. User can tap **Record snapshot** (or equivalent) and see a new point after save + reload.  

**Depends on:** v1.2; `AppDataContext`, Vite `data` plugin, `src/types/data.ts`, `dashboardCalcs`.  

**Plans:** [10-01-PLAN.md](phases/10-history-schema/10-01-PLAN.md) (1/1)  

### Phase 10.1: JSON import — quick import from file to match existing JSON export (INSERTED)

**Goal:** The app already **exports** wealth `AppData` as JSON from Settings; add a **Import JSON** (or equivalent) path so users can **load** a file, validate it against the same `DataSchema`, and **persist** via `saveData` / `POST` `/api/data` — with clear **error** if the file is invalid or the save fails.

**Focus:** `input type="file"`, `FileReader` or `fetch` blob, `DataSchema.safeParse` + `migrateLegacyBankAccounts` (or same path as initial load), `saveData`; place near **Export** in **Settings**; **non-destructive** by default? (confirm: replace in-memory + disk in one go vs preview — in planning.)

**Requirements:** **IMP-01**, **IMP-02** in `REQUIREMENTS.md`  

**Depends on:** Phase 10 (recommended so data-model changes for history land first; if import is independent, planner may adjust).

**Plans:** [10.1-01-PLAN.md](phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/10.1-01-PLAN.md) (1/1) — *implemented 2026-04-26*  

### Phase 11: Net worth chart

- **Focus:** Install **recharts** (or agreed lightweight chart), **line/area** of `recordedAt` x `totalInr`, responsive width, `ChartContainer` / shadcn chart pattern if project adopts it; **NWH-04** when `<2` points.  
- **Out of** this phase: PDF/CSV export, server APIs.  

**Success criteria (observable):**  

1. With **≥2** snapshots, the Dashboard shows a legible **time series** in **dark** and **light** theme.  
2. With **0–1** snapshots, user sees the **insufficient data** / empty state (no fake trend line).  

**Depends on:** Phase 10.1 (import can ship before history in theory, but v1.3 order is 10 → 10.1 → 11; chart must follow any schema field added in 10/10.1).  

**Plans:** TBD — `/gsd-plan-phase 11`  

---

## Phases (historical)

<details>
<summary>✅ v1.0 — Local wealth tracker (Phases 1–5) — SHIPPED 2026-04-26</summary>  

[`.planning/milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md)  

</details>  

<details>
<summary>✅ v1.1 — UX Polish (Phases 6–8) — SHIPPED 2026-04-26</summary>  

[`.planning/milestones/v1.1-ROADMAP.md`](milestones/v1.1-ROADMAP.md)  

</details>  

<details>
<summary>✅ v1.2 — Data reset (Phase 9) — SHIPPED 2026-04-26</summary>  

- [x] **Phase 9: Data reset** (2/2) — 2026-04-26  
- Artifacts: [`.planning/milestones/v1.2-phases/09-data-reset/`](milestones/v1.2-phases/09-data-reset/) · [v1.2-ROADMAP](milestones/v1.2-ROADMAP.md) · [v1.2-REQUIREMENTS](milestones/v1.2-REQUIREMENTS.md)  

</details>  

---

## Progress

| Phase   | Milestone   | Plans (summary) | Status       | Completed |
|---------|------------|-----------------|--------------|-------------|
| 1–5     | v1.0       | (see snapshot)  | Complete     | 2026-04-26 |
| 6–8     | v1.1       | (see snapshot)  | Complete     | 2026-04-26 |
| 9       | v1.2       | 2/2            | Complete     | 2026-04-26 |
| **10. History & schema** | **v1.3**  | 1/1  | *Planned* | —  |
| **10.1. JSON import**  | **v1.3**  | 1/1  | *Complete* | 2026-04-26  |
| **11. Net worth chart**  | **v1.3**  | TBD  | *Not started* | —  |

---

_Milestone v1.2 archives remain under `milestones/`. v1.3 in-flight detail: `.planning/phases/10-*/` (e.g. `10.1-*/`), `11-*/` after planning._  
