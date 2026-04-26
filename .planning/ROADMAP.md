# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)
- **v1.2 — Data reset** — *In planning* — this file

**Phase numbering:** continued from v1.1 (next phase is **9**; no `--reset-phase-numbers` for this run).

---

## v1.2 — Data reset (Phases 9)

**Goal:** Irreversibly **clear all saved wealth data** after a **strong warning** and **non-accidental** confirmation, restoring app state to the same empty shape as **`INITIAL_DATA`**.

| Phase | Name            | Summary goal                                                                 | Requirements      |
|-------|-----------------|-------------------------------------------------------------------------------|-------------------|
| 9     | **Data reset**  | Settings (or equivalent) entry, warning + confirm UX, `saveData(INITIAL_DATA…)` + UI sync | DATA-01, DATA-02, DATA-03 |

### Phase 9: Data reset

- **Focus:** One cohesive vertical slice: danger-zone UI, **AlertDialog** (or equivalent) with irreversible copy, then wire **`saveData`** with **`INITIAL_DATA`** (refresh timestamps as needed in plan).  
- **Out of** this phase: row-level deletes, new API routes, charts/export.

**Success criteria (observable):**

1. User can open Settings (or the chosen page) and find a **clear** path to “clear all data / reset” without it looking like a normal “Save.”  
2. The first time the user attempts reset, they see **warning** text and **cannot** complete reset with a **single** mistaken click; confirm and cancel are **unambiguous** (e.g. destructive red confirm).  
3. After successful reset, **all** prior asset rows and non-default settings in **wealth** data are gone: dashboard and sections show **empty/zero** as on first load, and a refresh still loads empty data from disk (or dev hot-reload sees same).  
4. `POST` `/api/data` receives a body that **validates** against the existing `DataSchema` and matches the **intended** empty app state (no ad-hoc partial object).  
5. On failed save, the user **sees** an error and **data** is not left in a **half-cleared** state (align with `saveData` rollback).  

**Depends on:** v1.0–v1.1 shipped; `AppDataContext`, `SettingsPage`, Vite `data` plugin.  

**Plans:** `09-01-PLAN` (data factory + alert-dialog) · `09-02-PLAN` (Settings danger zone) — under `.planning/phases/09-data-reset/`.  

---

## Phases (historical)

<details>
<summary>✅ v1.0 — Local wealth tracker (Phases 1–5) — SHIPPED 2026-04-26</summary>

All phase goals, plan checklists, and the progress table for v1.0 are preserved in:
[`.planning/milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md)

**Note:** GSD Phase 01 checkboxes in that snapshot can show `0/3` while the shipped app includes foundation work — known planning-artifact drift.

</details>

<details>
<summary>✅ v1.1 — UX Polish (Phases 6–8) — SHIPPED 2026-04-26</summary>

Goal: comfortable mobile use + manual dark mode. Phases 6–8 (dark mode, mobile shell, page headers and scrollable sheets) are complete. Full text and success criteria: [`.planning/milestones/v1.1-ROADMAP.md`](milestones/v1.1-ROADMAP.md)

- [x] **Phase 6: Dark Mode** — 2026-04-26
- [x] **Phase 7: Mobile Foundation** — 2026-04-26
- [x] **Phase 8: Mobile Page Fixes** — 2026-04-26

</details>

---

## Progress

| Phase   | Milestone   | Plans (summary) | Status  | Completed |
|---------|------------|-----------------|---------|------------|
| 1–5     | v1.0       | (see snapshot)  | Complete| 2026-04-26 |
| 6. Dark Mode | v1.1  | 2/2            | Complete| 2026-04-26 |
| 7. Mobile Foundation | v1.1 | 1/1  | Complete| 2026-04-26 |
| 8. Mobile Page Fixes | v1.1 | 2/2 | Complete| 2026-04-26 |
| **9. Data reset**    | **v1.2**  | 2/2  | _Implemented_ | 2026-04-26 |

---

_For historical v1.0 / v1.1 detail, see `.planning/milestones/`. v1.2 in-flight detail will accumulate under `.planning/phases/09-*/` once planning runs._
