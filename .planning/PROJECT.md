# Personal Wealth Tracker

## What this is

A local-only **React + Vite** app for tracking personal net worth across **gold, mutual funds, stocks, Bitcoin, property, bank savings (INR/AED), and retirement (NPS/EPF)**. It replaces a manual Excel workflow: data lives in `data.json` via a small Vite dev-server API; there is no backend, auth, or cloud sync in v1.

## Core value

See **total net worth in INR** at a glance, with **live BTC and FX** where applicable and **manual** gold prices — minimal repeated data entry, everything else editable in the app.

## Current Milestone: v1.1 UX Polish

**Goal:** Make the app comfortable to use on mobile devices and add a manual dark mode toggle.

**Target features:**
- Responsive layout — all pages usable on small screens (view and edit, not just read-only)
- Dark mode — in-app manual light/dark toggle

## Requirements

### Validated (v1.0 shipped)

- [x] **Gold, mutual funds, stocks** — per-platform / per-item entry; values in INR where applicable; persisted in JSON  
- [x] **Bank savings** — INR and AED accounts; AED converted with live or session `aedInr`  
- [x] **Retirement** — NPS + EPF balances; projected corpus on Retirement page using assumptions from Settings  
- [x] **Settings** — gold prices (per-gram, by karat), retirement assumptions, live rate readouts, session rate overrides (Phase 3)  
- [x] **Bitcoin** — quantity with **BTC/USD × USD/INR** via `useLivePrices()`; optional USD display on Bitcoin page  
- [x] **Property** — agreements, milestone table, optional liability / outstanding loan; equity-based net in dashboard calcs  
- [x] **Dashboard** — read-only net worth + per-category breakdown; `dashboardCalcs`; navigation to each asset section  
- [x] **Data** — versioned `data.json` root; `AppData` / Zod; no computed totals stored in JSON (recompute in UI)  
- [x] **INR** as primary display currency; formatting and `roundCurrency` conventions per `CLAUDE.md`  

### Active (v1.1)

- [ ] **UX-01**: Responsive mobile layout — all asset pages and dashboard usable on small screens (view + edit)
- [x] **UX-02**: Dark mode — in-app manual toggle (persisted across sessions) — validated in Phase 6

### Deferred (v1.2+)

- [ ] Charts & historical net worth tracking (v1.2)
- [ ] Export / reports — PDF or CSV snapshots (v1.3)
- [ ] Navigation overhaul, inline editing improvements (future)
- [ ] Tighten GSD Phase 01 planning artifacts to match the repo (optional)

### Out of scope (v1.0 — still valid for “default” product)

- User auth / multi-user  
- Cloud sync and hosted deployment (deferred)  
- First-class **AED** display column (INR remains primary)  
- Tax reporting (unless a future milestone re-opens)  

## Context (current state)

- **Stack:** React 18, Vite 5, TypeScript, shadcn/ui, Tailwind, RHF + Zod  
- **Persistence:** Vite plugin: `GET`/`POST` `/api/data` → `data.json`  
- **Prices:** `src/lib/priceApi.ts` + `LivePricesProvider` / `useLivePrices()`  
- **Theme:** `localStorage` key `theme` (`light` | `dark`); FOUC script in `index.html`; `ThemeProvider` in `src/main.tsx`; toggles in `AppSidebar` footer and `MobileTopBar` (mobile)  
- **Shell (v1.1):** `AppSidebar` `collapsible="offcanvas"`; `MobileTopBar` only below 768px; `Sidebar` mobile Sheet a11y copy in `src/components/ui/sidebar.tsx`  
- **Milestone v1.0** archived: `.planning/milestones/v1.0-ROADMAP.md`, `v1.0-REQUIREMENTS.md`, `MILESTONES.md`  
- **Milestone v1.1 (in progress):** Phases 6–7 complete 2026-04-26 (dark mode, mobile offcanvas + top bar); next: Phase 8 (Mobile Page Fixes)  

## Constraints

- **Tech stack:** React + Vite (see `package.json` and `CLAUDE.md`)  
- **Storage:** single local JSON file  
- **Scope (v1):** local-only; no auth  

## Key decisions

| Decision | Rationale | Outcome (v1.0) |
|----------|-----------|----------------|
| React + Vite | Component model + fast dev + simple deploy story later | Shipped |
| JSON file + Vite API | No DB for personal local use | Shipped |
| Live APIs for BTC + FX | Reduces manual FX/BTC updates | Shipped + session fallback in Settings |
| Gold prices manual | No reliable free India gold API in scope | Shipped |
| INR primary | User’s main lens; AED stored natively, converted in totals | Shipped |
| GSD phased delivery | Tracked in `.planning/`; v1.0 plan archive frozen | Shipped (with Phase 01 checkbox drift noted in `MILESTONES.md`) |

## Evolution

This file was fully reviewed at **v1.0 milestone close** (2026-04-26).

**After each milestone** (`/gsd-complete-milestone`): validate “What this is,” core value, and Out of scope; roll shipped items into **Validated**; set **Active** to empty or next milestone placeholders.

---
*Last updated: 2026-04-26 — Phase 7 (Mobile Foundation) complete; Phase 8 next*
