# Personal Wealth Tracker

## What this is

A local-only **React + Vite** app for tracking personal net worth across **gold, mutual funds, stocks, Bitcoin, property, bank savings (INR/AED), and retirement (NPS/EPF)**. It replaces a manual Excel workflow: data lives in `data.json` via a small Vite dev-server API. There is no backend, auth, or cloud sync in the shipped local product.

## Core value

See **total net worth in INR** at a glance, with **live BTC and FX** where applicable and **manual** gold prices — minimal repeated data entry, everything else editable in the app.

## Shipped: v1.0 + v1.1

| Version | Focus | Shipped |
|---------|--------|---------|
| **v1.0** | Core wealth tracker: assets, property, dashboard, data model, live prices | 2026-04-26 |
| **v1.1** | **UX Polish** — manual dark mode; mobile offcanvas + top bar; page headers; scrollable sheets; property table on small screens | 2026-04-26 |

Snapshots: `.planning/milestones/v1.0-ROADMAP.md`, `v1.1-ROADMAP.md` and matching `*-REQUIREMENTS.md` archives. Phase work is under `v1.0-phases/`, `v1.1-phases/`.

## Current Milestone: v1.2 Data reset & clean slate

**Goal:** User can **clear all wealth data** and **start from an empty, schema-valid state** with a **strong warning** and **explicit confirmation** (no one-click data loss).

**Target features:**

- A **discoverable** place for a destructive “clear all” action (e.g. Settings — danger / data area).
- **Warning copy** that the action is **irreversible** and **removes all saved net-worth data**; **confirmation** that is hard to trigger by accident (e.g. dedicated dialog with explicit confirm, not a single unlabeled OK).
- **On success:** `data.json` and **React state** match the same **empty** shape the app already uses for a fresh run (`INITIAL_DATA` / `data.example.json` — version 1, empty collections, zero balances).

## Current state (v1.2 in planning)

- **Milestone in planning:** v1.2 (requirements and roadmap in `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`). Execute with `/gsd-discuss-phase 9` or `/gsd-plan-phase 9`.
- **App:** `npm run dev` — v1.0 and v1.1 capabilities shipped; v1.2 not yet implemented.

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

### Active (v1.2 — in planning; see `REQUIREMENTS.md`)

- [ ] **DATA-01** — Entry for “clear all” / reset data (see requirements file)  
- [ ] **DATA-02** — Irreversibility warning + non-accidental confirm  
- [ ] **DATA-03** — Persisted + in-memory data reset to `INITIAL_DATA`-equivalent  

### Deferred (post–v1.2)

- [ ] Charts & historical net worth (next after v1.2 unless reprioritized)  
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
| v1.2 | Full data reset: warning + confirm + `INITIAL_DATA` via `saveData` / POST `/api/data` | In planning |

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

---
*Last updated: 2026-04-26 — **v1.2 — Data reset** milestone started (new-milestone).*
