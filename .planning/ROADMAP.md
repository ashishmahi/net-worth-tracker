# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)  
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)  
- ✅ **v1.2 — Data reset** — Shipped 2026-04-26 — [full snapshot](milestones/v1.2-ROADMAP.md)  

**Phase numbering:** v1.2 completed **Phase 9**. The next milestone should continue with **Phase 10** (use `/gsd-new-milestone` — do not reset phase numbers).  

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

<details>
<summary>✅ v1.2 — Data reset (Phase 9) — SHIPPED 2026-04-26</summary>  

- [x] **Phase 9: Data reset** (2/2 plans) — 2026-04-26  
- **Artifacts:** [`.planning/milestones/v1.2-phases/09-data-reset/`](milestones/v1.2-phases/09-data-reset/) · [Roadmap snapshot](milestones/v1.2-ROADMAP.md) · [Requirements snapshot](milestones/v1.2-REQUIREMENTS.md)  

**Goal (recap):** Irreversibly clear all saved wealth data after a strong warning and non-accidental confirmation, restoring `INITIAL_DATA`-equivalent state via `saveData` / `POST` `/api/data`.  

</details>  

---

## Next milestone

*Not defined. Run `/gsd-new-milestone` to add goals, requirements, and roadmap for the next version (e.g. v1.3). That flow creates a new `.planning/REQUIREMENTS.md`.*  

---

## Progress (historical)

| Phase   | Milestone   | Plans (summary) | Status  | Completed |
|---------|------------|-----------------|---------|------------|
| 1–5     | v1.0       | (see snapshot)  | Complete| 2026-04-26 |
| 6. Dark Mode | v1.1  | 2/2            | Complete| 2026-04-26 |
| 7. Mobile Foundation | v1.1 | 1/1  | Complete| 2026-04-26 |
| 8. Mobile Page Fixes | v1.1 | 2/2 | Complete| 2026-04-26 |
| 9. Data reset | v1.2 | 2/2 | Complete| 2026-04-26 |

---

_`.planning/REQUIREMENTS.md` was archived to `milestones/v1.2-REQUIREMENTS.md` and removed at v1.2 close; recreate via `/gsd-new-milestone`._  
