# Requirements — v1.2 Data reset & clean slate

**Milestone:** v1.2  
**Goal:** User can **clear all wealth data** and return to a **valid empty state** (same as a fresh `INITIAL_DATA` load) after an **unmissable warning** and **non-accidental confirmation** — not one stray click.  

**Previous / shipped:** v1.1: [`.planning/milestones/v1.1-REQUIREMENTS.md`](milestones/v1.1-REQUIREMENTS.md)

**Research (lightweight):** `.planning/research/SUMMARY.md` — no parallel agents; in-repo patterns only.

---

## Active requirements (v1.2)

### Data — clear all

- [ ] **DATA-01**: User can start a “clear all data” / “reset app data” flow from a **discoverable** location (e.g. **Settings**, separated visually as a “Danger” or data-management block so it is not confused with normal saves).  
- [ ] **DATA-02**: Before any delete runs, the UI shows a **clear warning** that: (a) the action is **irreversible**, (b) **all** net-worth and asset rows stored in `data.json` will be removed, (c) optional backup is *your* existing JSON export in Settings. The user must **confirm** in a way that **cannot** happen from a single accidental click (e.g. **AlertDialog** with Cancel as default and a distinct **destructive** confirm label, **or** a second step, **or** typing a short phrase such as `DELETE` — final UX is chosen in plan-phase, must meet the non-accidental bar).  
- [ ] **DATA-03**: On confirmed reset, the app **persists** a document equivalent to the existing **`INITIAL_DATA`** in `AppDataContext` (same `version: 1`, empty collections, zero numerics, fresh `updatedAt` where applicable) via **`saveData` / POST `/api/data`**, and the **in-memory** `data` in context matches that state so the app reflects a clean slate **without requiring a full manual reload** (barring any documented edge case).

---

## Future requirements (deferred)

- **Per-row / per-entity delete** in tables (items, accounts, property rows) with row-level confirm — *not* required for v1.2; only **full** reset.  
- **Optional backup nudge** before clear (e.g. link to export) — nice-to-have; can fold into DATA-01/DATA-02 if low effort.  
- Charts, export, nav overhaul — as in `PROJECT.md` **Deferred (post–v1.2)**.  

---

## Out of scope (v1.2)

- New backend routes beyond `GET/POST` `/api/data`  
- **Theme** / `localStorage` for dark mode: **unchanged** unless reset accidentally wipes it — *default: do not* clear `localStorage` theme; only `data.json` **wealth** data (align with v1.1 `localStorage` only for theme)  
- Cloud, auth, sync  

---

## Traceability

| REQ-ID  | Description                         | Phase   | Status  |
|---------|-------------------------------------|---------|---------|
| DATA-01 | Entry point for full reset         | Phase 9 | open    |
| DATA-02 | Warning + non-accidental confirm   | Phase 9 | open    |
| DATA-03 | `INITIAL_DATA` + persist + state   | Phase 9 | open    |
