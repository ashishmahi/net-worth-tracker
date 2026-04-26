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

## Current state (post–v1.2)

- **Milestone delivered:** v1.2 (Phase 9). **Next:** define the following milestone with `/gsd-new-milestone` (creates a fresh `.planning/REQUIREMENTS.md` and updates roadmap).  
- **App:** `npm run dev` — v1.0, v1.1, and v1.2 capabilities shipped.  

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

### Active (next milestone)

- [ ] *TBD* — use `/gsd-new-milestone` to capture the next set (e.g. charts, export—see **Deferred** below).  

### Deferred (typical follow-ons)

- [ ] Charts & historical net worth (unless reprioritized)  
- [ ] Export / reports — PDF or CSV  
- [ ] Navigation overhaul, richer inline editing (future)  
- [ ] Align GSD Phase 01 planning artifacts with repo (optional)  

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

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

<details>
<summary>Previous “Current milestone” blurb (v1.2 in planning — superseded 2026-04-26)</summary>

*Former text referred to v1.2 as in planning with DATA-01–03 in **Active**; those are now in **Validated (v1.2)**.*  

</details>  

---
*Last updated: 2026-04-26 after **v1.2 — Data reset** milestone complete (archive + tag).*  
