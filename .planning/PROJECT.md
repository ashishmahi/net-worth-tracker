# Personal Wealth Tracker

## What this is

A local-only **React + Vite** app for tracking personal net worth across **gold, mutual funds, stocks, Bitcoin, property, bank savings (INR/AED), and retirement (NPS/EPF)**. It replaces a manual Excel workflow: data lives in `data.json` via a small Vite dev-server API. There is no backend, auth, or cloud sync in the shipped local product.

## Core value

See **total net worth in INR** at a glance, with **live BTC and FX** where applicable and **manual** gold prices — minimal repeated data entry, everything else editable in the app.

## Shipped versions

| Version | Focus | Shipped |
|---------|--------|---------|
| **v1.0** | Core wealth tracker: assets, property, dashboard, data model, live prices | 2026-04-26 |
| **v1.1** | **UX Polish** — manual dark mode; mobile offcanvas + top bar; page headers; scrollable sheets; property table on small screens | 2026-04-26 |
| **v1.2** | **Data reset** — Settings danger zone, AlertDialog, `createInitialData()` + `saveData` full clear, inline error/success; `localStorage` theme unchanged | 2026-04-26 |

Snapshots: `.planning/milestones/v1.0-ROADMAP.md` … `v1.2-ROADMAP.md` and matching `*-REQUIREMENTS.md` archives. Phase work: `v1.0-phases/`, `v1.1-phases/`, `v1.2-phases/` under [`.planning/milestones/`](milestones/).  

## Current Milestone: v1.3 Net worth history

**Goal:** Let users **see how total net worth changes over time** with stored **snapshots** and a **chart** on the dashboard — still local-only, same `data.json` persistence.

**Target features:**

- **Persisted history** — append-only list of point-in-time totals in INR (with timestamps), validated in the `AppData` / Zod schema, cleared on full data reset.  
- **Record snapshot** — user-triggered action (e.g. on Dashboard) to save the current computed total.  
- **Chart** — simple line (or area) view of history on the dashboard; empty state when there is not enough data to draw a trend.  
- **Schema evolution** — extend the data model in a way that **migrates** existing `data.json` (no data loss for users upgrading from v1.2).  

## Current state (milestone in planning)

- **Active work:** v1.3 (requirements and roadmap in `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`).  
- **App:** `npm run dev` — v1.0–v1.2 capabilities shipped; v1.3 not yet implemented.  

## Requirements

### Validated (v1.0 + core)

- [x] **Gold, mutual funds, stocks** — per-platform / per-item entry; persisted in JSON  
- [x] **Bank savings** — INR and AED; AED via `aedInr`  
- [x] **Retirement** — NPS + EPF; projected corpus from Settings assumptions  
- [x] **Settings, Bitcoin, Property, Dashboard, Data model** — per v1.0  
- [x] **INR** primary; `roundCurrency` and input conventions per `CLAUDE.md`  

### Validated (v1.1)

- [x] **UX-01** — Responsive mobile layout: usable on small screens (Phases 7–8)  
- [x] **UX-02** — Dark mode: manual toggle + `localStorage` (Phase 6)  
- [x] **DM-01, DM-02, MB-01…MB-04** — per `.planning/milestones/v1.1-REQUIREMENTS.md`  

### Validated (v1.2)

- [x] **DATA-01** — Discoverable “clear all” / danger zone in Settings (below Export)  
- [x] **DATA-02** — Irreversibility + backup hint + non-accidental confirm (AlertDialog)  
- [x] **DATA-03** — `createInitialData()` + `saveData` / `POST` `/api/data`; in-memory + forms re-sync  

### Active (v1.3)

See [REQUIREMENTS.md](REQUIREMENTS.md) in `.planning/` — **NWH-01** through **NWH-05** (net worth history, chart, reset, migration).    

### Deferred (post–v1.3 unless pulled in)

- [ ] Export / reports — PDF or CSV (JSON export exists; richer formats later)  
- [ ] Navigation overhaul, richer inline editing (future)  
- [ ] Align GSD Phase 01 planning artifacts with repo (optional)  
- [ ] Optional: automatic periodic snapshots (cron-like) — not required for v1.3  

### Out of scope (unchanged)

- User auth, cloud sync, hosted deployment (deferred)  
- First-class AED display column (INR remains primary)  
- Tax reporting (unless a future milestone re-opens)  

## Context (technical)

- **Stack:** React 18, Vite 5, TypeScript, shadcn/ui, Tailwind, RHF + Zod  
- **Persistence:** Vite plugin `GET`/`POST` `/api/data` → `data.json`  
- **Prices:** `priceApi` + `useLivePrices()`  
- **Theme:** `localStorage` `theme` (`light` | `dark`); FOUC script in `index.html`  
- **Layout:** `AppSidebar` offcanvas on mobile; `MobileTopBar`; `PageHeader` on section pages; asset sheets with scroll regions + property milestone horizontal scroll on narrow widths  
- **Data reset (v1.2):** `createInitialData()` in `AppDataContext`; shadcn `AlertDialog` in Settings danger zone  
- **Planned (v1.3):** net worth snapshot list + chart (e.g. Recharts) on dashboard — details in `REQUIREMENTS.md` / `ROADMAP.md`  

## Constraints

- Single local JSON file; no server in v1.x local scope  
- Tech per `package.json` and `CLAUDE.md`  

## Key decisions

| Decision | Rationale | Outcome |
|----------|-----------|--------|
| React + Vite | Fast dev, simple local app | v1.0+ |
| JSON + Vite API | No DB for personal use | v1.0+ |
| v1.1 mobile | Phases 6–8: theme, offcanvas, headers, sheets, table | ✓ v1.1 2026-04-26 |
| GSD planning | Phased delivery in `.planning/` | Ongoing |
| v1.1 scope | `localStorage` only for theme; no `data.json` version bump for theme | ✓ Shipped |
| v1.2 data reset | Danger zone + dialog + `createInitialData` + `saveData`; no theme wipe | ✓ v1.2 2026-04-26 |
| v1.3 (planned) | Snapshot list + chart on dashboard; INR total from existing `dashboardCalcs`; migration for existing files | *In progress* |  

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

**After each milestone** (via `/gsd-complete-milestone`): full review, validated requirements, key decisions, context.

<details>
<summary>Previous “Current milestone” blurb (v1.2 in planning — superseded 2026-04-26)</summary>  

*Former text referred to v1.2 as in planning with DATA-01–03 in **Active**; those are now in **Validated (v1.2)**.*  

</details>  

---
*Last updated: 2026-04-26 — **v1.3 — Net worth history** milestone started (`/gsd-new-milestone`).*  
