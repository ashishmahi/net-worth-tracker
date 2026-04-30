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
| **v1.3** | **Net worth history** — persisted **`netWorthHistory`**, **Record snapshot**, **JSON import** (10.1), **Dashboard** line/area chart + **NWH-04** empty state | 2026-04-28 |

Snapshots: `.planning/milestones/v1.0-ROADMAP.md` … `v1.3-ROADMAP.md` and matching `*-REQUIREMENTS.md` archives. Phase work: `v1.0-phases/` … `v1.3-phases/` under [`.planning/milestones/`](milestones/); **live** execution phases for v1.4+ live under [`.planning/phases/`](phases/) as they are opened.

## Current Milestone: v1.4 Multiple commodities

**Goal:** Track **more than gold** for physical commodities — at least **one additional type** (e.g. silver) with **manual INR pricing** in Settings and **full inclusion** in net worth, snapshots, import/export, and reset.

**Target features:**

- **Data:** Extend `DataSchema` + migration so existing `data.json` loads unchanged; new holdings + Settings prices for non-gold commodities.  
- **Calculations:** `dashboardCalcs` / snapshot totals include all commodities; missing prices behave like gold today.  
- **UX:** Dedicated flows for non-gold commodity lines; Dashboard/nav show commodity wealth clearly; gold’s karat/gram model preserved (**COM-06**).

**Requirements:** [`.planning/REQUIREMENTS.md`](REQUIREMENTS.md) · **Roadmap:** [`.planning/ROADMAP.md`](ROADMAP.md) (Phases **12–13**).

## Current state (post–Phase 12, v1.4 in progress)

- **Shipped v1.3:** Net worth **snapshots** in `data.json`, **Record snapshot**, **Import JSON** (Settings), **Net worth over time** chart (Recharts + shadcn charts), migration from v1.2, reset clears history.  
- **Phase 12 (2026-04-30):** `otherCommodities` on `DataSchema`, migration on import, Vitest unit tests, silver spot via `priceApi` + `LivePricesContext`, **Commodities** dashboard row with partial-total semantics.  
- **App:** `npm run dev` — local-only; persistence unchanged (`GET`/`POST` `/api/data`). **`npm test`** runs Vitest.  

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

### Validated (v1.3)

- [x] **NWH-01–NWH-05**, **IMP-01–IMP-02** — per [`.planning/milestones/v1.3-REQUIREMENTS.md`](milestones/v1.3-REQUIREMENTS.md) (snapshots, chart, reset, migration, import); Phases **10**, **10.1**, **11** (2026-04-28).  

### Validated (v1.4 — Phase 12)

- [x] **COM-01**, **COM-02**, **COM-05** — data model, net worth/snapshot alignment, import/reset/schema (see [`.planning/phases/12-commodities-data-net-worth/12-VERIFICATION.md`](phases/12-commodities-data-net-worth/12-VERIFICATION.md)).

### Active (v1.4 — Phase 13 next)

- [ ] **COM-03**, **COM-04**, **COM-06** — commodity CRUD UI, nav/dashboard polish, preserve gold UX; see [`.planning/REQUIREMENTS.md`](REQUIREMENTS.md).

### Deferred (post–v1.4 unless pulled in)

- [ ] Export / reports — PDF or CSV (JSON export exists; richer formats later)  
- [ ] Navigation overhaul, richer inline editing (future)  
- [ ] Align GSD Phase 01 planning artifacts with repo (optional)  
- [ ] Optional: automatic periodic snapshots (cron-like)  
- [ ] Live commodity spot feeds (manual pricing for v1.4)

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
- **Net worth history (v1.3):** `netWorthHistory` list; **Recharts** + `--chart-*` tokens; import uses same `DataSchema` path as boot  

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
| v1.3 | Snapshot list + chart on dashboard; import; migration; NWH-04 empty state | ✓ v1.3 2026-04-28 |  
| v1.4 (planning) | Commodities beyond gold; manual pricing; net worth + import/reset | In progress |  

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

**After each milestone** (via `/gsd-complete-milestone`): full review, validated requirements, key decisions, context.

<details>
<summary>Previous “Current milestone” blurb (v1.3 in planning — superseded 2026-04-28)</summary>  

*Former text referred to v1.3 deliverables in **Active**; those are now in **Validated (v1.3)** and the roadmap/requirements live under `milestones/v1.3-*`.*  

</details>  

---
*Last updated: 2026-04-30 — **v1.4** Phase 12 complete (commodities data + net worth); Phase 13 next.*  
