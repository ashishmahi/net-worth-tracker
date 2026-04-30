# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)  
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)  
- ✅ **v1.2 — Data reset** — Shipped 2026-04-26 — [full snapshot](milestones/v1.2-ROADMAP.md)  
- ✅ **v1.3 — Net worth history** — Shipped 2026-04-28 — [full snapshot](milestones/v1.3-ROADMAP.md)  
- **v1.4 — Multiple commodities** — **In planning / build** — [REQUIREMENTS](REQUIREMENTS.md) · Phase artifacts: [`.planning/phases/`](phases/) (as created)

**Phase numbering:** v1.3 ended at **Phase 11** (with **10.1** inserted). **v1.4** continues from **Phase 12**.

---

## v1.4 — Multiple commodities

**Goal:** Support **commodities beyond gold** (at least one additional type, e.g. silver) with **manual INR pricing**, **migration** from current `data.json`, and **full** net worth / snapshot / import / reset alignment.

| Phase | Name | Goal | Requirements | Success criteria (high level) |
|-------|------|------|----------------|------------------------------|
| **12** | Commodities: data & net worth | Schema, migration, Settings pricing model, `createInitialData`, import validation, reset; **`dashboardCalcs`** + snapshot path include new commodities | COM-01, COM-02, COM-05 | Existing files load; new installs initialize; totals + snapshots reflect commodities; missing prices match gold-style null behavior; import + reset consistent with schema |
| **13** | Commodities: product UX | CRUD UI for non-gold lines; Dashboard + nav; preserve gold karat/gram UX (**COM-06**) | COM-03, COM-04, COM-06 | User can manage non-gold items; dashboard/nav understandable; gold behavior unchanged for legacy data |

**Depends on:** v1.3 shipped (history + import patterns). **Phase 12** before **13** (UI needs model + calcs).

**Plans:** 3 plans

Plans:
- [ ] 12-01-PLAN.md — Schema + migration + Vitest setup + init/import/reset alignment
- [ ] 12-02-PLAN.md — Silver price fetch (priceApi.ts) + LivePricesContext silver channel
- [ ] 12-03-PLAN.md — dashboardCalcs (sumCommoditiesInr) + DashboardPage Commodities row

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

<details>
<summary>✅ v1.3 — Net worth history (Phases 10, 10.1, 11) — SHIPPED 2026-04-28</summary>  

- [x] **Phase 10: History & schema** (1/1) — 2026-04-26  
- [x] **Phase 10.1: JSON import** (1/1) — 2026-04-26  
- [x] **Phase 11: Net worth chart** (1/1) — 2026-04-28  
- Artifacts: [`milestones/v1.3-phases/10-history-schema/`](milestones/v1.3-phases/10-history-schema/) · [`milestones/v1.3-phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/`](milestones/v1.3-phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/) · [`milestones/v1.3-phases/11-net-worth-chart/`](milestones/v1.3-phases/11-net-worth-chart/) · [v1.3-ROADMAP](milestones/v1.3-ROADMAP.md) · [v1.3-REQUIREMENTS](milestones/v1.3-REQUIREMENTS.md)  

</details>  

---

## Progress

| Phase | Milestone | Plans (summary) | Status | Completed |
|-------|-----------|-----------------|--------|------------|
| 1–5 | v1.0 | (see snapshot) | Complete | 2026-04-26 |
| 6–8 | v1.1 | (see snapshot) | Complete | 2026-04-26 |
| 9 | v1.2 | 2/2 | Complete | 2026-04-26 |
| 10, 10.1, 11 | v1.3 | 3/3 | Complete | 2026-04-26 / 2026-04-28 |
| 12–13 | v1.4 | 0/3 | **Planning** | — |

---

_Milestone archives: `.planning/milestones/` · Live requirements: [`REQUIREMENTS.md`](REQUIREMENTS.md)._
