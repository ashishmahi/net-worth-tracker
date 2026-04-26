# Requirements — v1.3 Net worth history

**Milestone:** v1.3  
**Goal:** Users can **record** point-in-time **total net worth in INR** and see a **chart** of change over time on the **Dashboard**, with data **persisted** in `data.json` and **cleared** on full data reset (aligned with v1.2).  

**Previous / shipped:** v1.2: [`.planning/milestones/v1.2-REQUIREMENTS.md`](milestones/v1.2-REQUIREMENTS.md)  

**Research:** Not run in `new-milestone` (GSD project researchers unavailable); implementation may add lightweight `09-RESEARCH` from `/gsd-plan-phase` (e.g. Recharts + schema migration patterns).  

---

## Active requirements (v1.3)

### Net worth history — data

- [ ] **NWH-01**: The persisted `AppData` (or an agreed slice) includes an ordered list of **snapshots** ` { recordedAt: string (ISO 8601), totalInr: number }` where `totalInr` is **non-negative** and matches the same **INR** net worth definition the Dashboard already uses (`sumForNetWorth` / `dashboardCalcs` total). **Versions:** new installs and migrations load without error; `createInitialData()` includes an **empty** list.  
- [ ] **NWH-02**: A **version or migration** path upgrades existing v1.2 (and earlier) `data.json` that lack the new field so **load** + `DataSchema.safeParse` succeed without manual editing.  
- [ ] **NWH-05**: A **full data reset** (v1.2 **Clear all data** flow) **removes** net worth history along with other wealth data so on-disk and in-app state match an empty `INITIAL_DATA`-style slate (history empty).  

### Net worth history — UX

- [ ] **NWH-03**: The user can **add a snapshot** of the **current** total (from the same aggregate as the dashboard) via an explicit **primary control** on the **Dashboard** (wording e.g. “Record snapshot” / “Save point in time” — final copy in plan). The action **persists** through `saveData` / `POST` `/api/data` and is **idempotent** per user intent (one new row per action, not duplicate unless user triggers twice).  
- [ ] **NWH-04**: The **Dashboard** shows a **line or area** chart of **totalInr** over **recordedAt** (time axis), readable in **light and dark** theme. If there are **fewer than two** snapshots, show a clear **empty / insufficient data** state with guidance to **record** a first (and second) snapshot — **no** misleading “flat” line from a single point.  

---

## Future requirements (deferred)

- **Automatic** daily/weekly snapshots without user action — not v1.3.  
- **Per-asset** history or breakdown in the chart — not v1.3 (total only).  
- **Export** chart as image / CSV of snapshots — v1.4+ unless folded in after scope check.  
- **Backend / cloud** sync of history — out of product scope for v1.x.  

---

## Out of scope (v1.3)

- New HTTP routes other than **existing** `GET` / `POST` `/api/data` (same plugin surface)  
- Re-identifying users or multi-device merge  
- Changing **primary** currency from INR for the **stored** total (INR only for v1.3)  

---

## Traceability

| REQ-ID  | Description                                      | Phase   | Status  |
|---------|--------------------------------------------------|---------|---------|
| NWH-01  | Schema + `createInitialData` + snapshot shape  | 10     | open    |
| NWH-02  | Migration from v1.2 / missing key                | 10     | open    |
| NWH-05  | Reset clears history                            | 10     | open    |
| NWH-03  | “Record snapshot” on Dashboard + persist         | 10/11  | open    |
| NWH-04  | Chart + empty state (≥2 points)                  | 11     | open    |

*Phase column finalized in [`.planning/ROADMAP.md`](ROADMAP.md) — 10: model + record + wire reset; 11: chart + polish.*  
