# Personal Wealth Tracker

## What this is

A local-only **React + Vite** app for tracking personal net worth across **gold, non-gold commodities (e.g. silver + manual ₹ lines), mutual funds, stocks, Bitcoin, property, bank savings (INR/AED), and retirement (NPS/EPF)**. It replaces a manual Excel workflow: data lives in `data.json` via a small Vite dev-server API. There is no backend, auth, or cloud sync in the shipped local product.

## Core value

See **total net worth in INR** at a glance, with **live BTC, FX, and silver (USD→INR)** where applicable, **manual** gold prices, and **manual / gram-based commodity lines** — minimal repeated data entry, everything else editable in the app.

## Shipped versions

| Version | Focus | Shipped |
|---------|--------|---------|
| **v1.0** | Core wealth tracker: assets, property, dashboard, data model, live prices | 2026-04-26 |
| **v1.1** | **UX Polish** — manual dark mode; mobile offcanvas + top bar; page headers; scrollable sheets; property table on small screens | 2026-04-26 |
| **v1.2** | **Data reset** — Settings danger zone, AlertDialog, `createInitialData()` + `saveData` full clear, inline error/success; `localStorage` theme unchanged | 2026-04-26 |
| **v1.3** | **Net worth history** — persisted **`netWorthHistory`**, **Record snapshot**, **JSON import** (10.1), **Dashboard** line/area chart + **NWH-04** empty state | 2026-04-28 |
| **v1.4** | **Multiple commodities** — **`otherCommodities`** schema + migration + live silver; **`CommoditiesPage`** CRUD; Dashboard/nav wayfinding; gold UX preserved (**COM-06**) | 2026-05-01 |

Snapshots: `.planning/milestones/v1.0-ROADMAP.md` … `v1.4-ROADMAP.md` and matching `*-REQUIREMENTS.md` archives. Executed phase artifacts for shipped milestones live under [`.planning/milestones/`](milestones/) (e.g. `v1.4-phases/`). New work uses [`.planning/phases/`](phases/) once **`/gsd-new-milestone`** opens the next version.

## Next milestone

**Not started.** Use **`/gsd-new-milestone`** to define v1.5+ goals, **`REQUIREMENTS.md`**, and **`ROADMAP.md`** phases (continuing from **Phase 14** unless you reset numbering).

## Current state (shipped v1.4 — 2026-05-01)

- **Commodities:** `assets.otherCommodities` (**standard** silver by gram + **manual** ₹ lines); **`sumCommoditiesInr`** + Dashboard row; **Commodities** nav page; live silver via **`useLivePrices`** (with exclusion semantics when rates missing).  
- **Prior milestones:** v1.3 snapshots + chart + import; v1.2 reset; v1.1 responsive + theme; v1.0 core assets.  
- **App:** `npm run dev` — local-only; **`GET`/`POST`** `/api/data` → **`data.json`**. **`npm test`** — Vitest.  

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

### Validated (v1.4)

- [x] **COM-01**, **COM-02**, **COM-05** — data model, net worth/snapshot alignment, import/reset/schema ([`12-VERIFICATION.md`](milestones/v1.4-phases/12-commodities-data-net-worth/12-VERIFICATION.md)).  
- [x] **COM-03**, **COM-04**, **COM-06** — commodity CRUD UI, dashboard/nav wayfinding, gold UX preserved ([`13-VERIFICATION.md`](milestones/v1.4-phases/13-commodities-product-ux/13-VERIFICATION.md)).

### Active (next milestone)

- *(None yet — define via `/gsd-new-milestone`.)*

### Deferred (backlog / future)

- [ ] Export / reports — PDF or CSV (JSON export exists; richer formats later)  
- [ ] Navigation overhaul, richer inline editing (future)  
- [ ] Align GSD Phase 01 planning artifacts with repo (optional)  
- [ ] Optional: automatic periodic snapshots (cron-like)  
- [ ] Additional live commodity feeds beyond shipped silver USD channel

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
- **Commodities (v1.4):** `otherCommodities` items; **`CommoditiesPage`**; silver **`TROY_OZ_TO_GRAMS`** INR/gram derivation aligned with **`dashboardCalcs`**  

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
| v1.4 | Commodities beyond gold; silver + manual lines; net worth + import/reset + product UX | ✓ Shipped 2026-05-01 |  

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

**After each milestone** (via `/gsd-complete-milestone`): full review, validated requirements, key decisions, context.

<details>
<summary>Previous “Current milestone” blurbs (superseded)</summary>  

- *v1.3: deliverables moved to **Validated (v1.3)**; roadmap/requirements under `milestones/v1.3-*`.*  
- *v1.4: deliverables moved to **Validated (v1.4)**; roadmap/requirements under `milestones/v1.4-*`.*  

</details>  

---
*Last updated: 2026-05-01 — **v1.4** milestone archived (commodities data + product UX).*  
