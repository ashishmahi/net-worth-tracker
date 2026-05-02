# Personal Wealth Tracker

## What this is

A local-only **React + Vite** app for tracking personal net worth across **gold, non-gold commodities (e.g. silver + manual ₹ lines), mutual funds, stocks, Bitcoin, property, bank savings (INR/AED), retirement (NPS/EPF), and standalone liabilities (Liabilities page)**. It replaces a manual Excel workflow: data lives in `data.json` via a small Vite dev-server API. There is no backend, auth, or cloud sync in the shipped local product.

## Core value

See **total net worth in INR** at a glance (**debt-adjusted** headline minus standalone loans), with **live BTC, FX, and silver (USD→INR)** where applicable, **manual** gold prices, and **manual / gram-based commodity lines** — minimal repeated data entry, everything else editable in the app.

## Shipped versions

| Version | Focus | Shipped |
|---------|--------|---------|
| **v1.0** | Core wealth tracker: assets, property, dashboard, data model, live prices | 2026-04-26 |
| **v1.1** | **UX Polish** — manual dark mode; mobile offcanvas + top bar; page headers; scrollable sheets; property table on small screens | 2026-04-26 |
| **v1.2** | **Data reset** — Settings danger zone, AlertDialog, `createInitialData()` + `saveData` full clear, inline error/success; `localStorage` theme unchanged | 2026-04-26 |
| **v1.3** | **Net worth history** — persisted **`netWorthHistory`**, **Record snapshot**, **JSON import** (10.1), **Dashboard** line/area chart + **NWH-04** empty state | 2026-04-28 |
| **v1.4** | **Multiple commodities** — **`otherCommodities`** schema + migration + live silver; **`CommoditiesPage`** CRUD; Dashboard/nav wayfinding; gold UX preserved (**COM-06**) | 2026-05-01 |
| **v1.5** | **Debt & Liabilities** — root **`liabilities[]`**, **`liabilityCalcs`**, property lender/EMI + hint, **`LiabilitiesPage`** + nav, dashboard net worth + Total Debt + ratio | 2026-05-02 |
| **v1.6** | **Encrypted Export** — **`cryptoUtils`** (AES-GCM envelope); Settings **zip** export/import via **`@zip.js/zip.js`** (`wealthDataZip`), passphrase **AlertDialogs**, zip-only import | 2026-05-02 |

Snapshots: `.planning/milestones/v1.0-ROADMAP.md` … `v1.6-ROADMAP.md` and matching `*-REQUIREMENTS.md` archives. Executed phase artifacts for shipped milestones live under [`.planning/milestones/`](milestones/) (e.g. `v1.5-phases/`). Phase dirs **19–21** remain under [`.planning/phases/`](phases/) until optional **`/gsd-cleanup`**.

## Next milestone

Run **`/gsd-new-milestone`** — creates a fresh **`.planning/REQUIREMENTS.md`**, updates roadmap, and continues phase numbering from **22**.

## Current state (shipped through v1.6 — 2026-05-02)

- **Liabilities & net worth:** root **`liabilities`** list; **`calcNetWorth(gross, sumLiabilitiesInr)`** for headline + new snapshots; **`sumAllDebtInr`** for dashboard **Total Debt** row; property equity unchanged (`agreementInr − outstandingLoanInr`).  
- **Commodities (v1.4):** `assets.otherCommodities`; **`CommoditiesPage`**; live silver via **`useLivePrices`**.  
- **App:** `npm run dev` — local-only; **`GET`/`POST`** `/api/data` → **`data.json`**. **`npm test`** — Vitest.  
- **Encryption & backup (v1.6):** **`cryptoUtils`** (Web Crypto, no npm crypto deps). Settings **Data**: export downloads **`wealth-tracker-YYYY-MM-DD.zip`** with **`data.json`** (optional AES zip encryption via passphrase); import **zip only** — **`wealthDataZip`** + modal passphrase flows; Phase 19 envelope JSON remains in codebase/tests but not on Settings download path after Phase 21.  

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

### Validated (v1.5)

- [x] **DEBT-01–DEBT-05**, **INFRA-01**, **INFRA-02** — `LiabilityItemSchema`, root `liabilities`, migration, negative snapshot totals, import/reset ([`14-VERIFICATION.md`](milestones/v1.5-phases/14-schema-migration/14-VERIFICATION.md)).  
- [x] **CALC-01–CALC-04** — `src/lib/liabilityCalcs.ts` ([`15-VERIFICATION.md`](milestones/v1.5-phases/15-calculation-utilities/15-VERIFICATION.md)).  
- [x] **PROP-01–PROP-03** — Property lender, EMI, hint ([`16-VERIFICATION.md`](milestones/v1.5-phases/16-property-liability-enrichment/16-VERIFICATION.md)).  
- [x] **LIAB-01–LIAB-06**, **INFRA-03** — `LiabilitiesPage`, sidebar ([`17-VERIFICATION.md`](milestones/v1.5-phases/17-liabilities-page-crud/17-VERIFICATION.md)).  
- [x] **DASH-01–DASH-04** — Dashboard debt integration ([`18-VERIFICATION.md`](milestones/v1.5-phases/18-dashboard-net-worth-integration/18-VERIFICATION.md)).  
- Full list: [`.planning/milestones/v1.5-REQUIREMENTS.md`](milestones/v1.5-REQUIREMENTS.md).

### Validated (v1.6 — Phase 19)

- [x] **ENC-02** — AES-256-GCM + PBKDF2 encryption primitive (`src/lib/cryptoUtils.ts`) — Phase **19** ([`19-VERIFICATION.md`](phases/19-crypto-utilities/19-VERIFICATION.md)).  
- [x] **ENC-03** — Self-describing envelope `{ encrypted, version, salt, iv, data }` — Phase **19**.

### Validated (v1.6 — Phase 20)

- [x] **ENC-01** — Optional passphrase on Export; blank → plain JSON unchanged — Phase **20** ([`20-VERIFICATION.md`](phases/20-settings-ui-encrypted-export-import/20-VERIFICATION.md)) — *superseded for Settings UX by Phase 21 zip export.*  
- [x] **ENC-04**–**ENC-06** — Import auto-detect, decrypt before load, wrong/empty passphrase inline errors — Phase **20** — *Settings import path superseded by zip + modals in Phase 21.*

### Validated (v1.6 — Phase 21)

- [x] **Zip export/import UX** — Password-protected **`.zip`** (`data.json`); shadcn **AlertDialog** passphrases; legacy **`.json`** file picker removed from Settings — Phase **21** ([`21-VERIFICATION.md`](phases/21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to-/21-VERIFICATION.md)).

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
- **Debt (v1.5):** **`liabilityCalcs`** + **`LiabilitiesPage`**; Dashboard **`grossAssets`** denominator for **%** column; headline **`netWorth`** deducts standalone **`liabilities`** only  

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
| v1.5 | Liabilities schema + pure calcs + property enrichment + Liabilities CRUD + dashboard debt UX | ✓ Shipped 2026-05-02 |  
| v1.6 | Web Crypto `cryptoUtils` + Settings encrypted export/import; then zip + modal UX (`@zip.js/zip.js`) for at-rest export protection | ✓ Shipped 2026-05-02 |  

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

**After each milestone** (via `/gsd-complete-milestone`): full review, validated requirements, key decisions, context.

<details>
<summary>Previous “Current milestone” blurbs (superseded)</summary>  

- *v1.3: deliverables moved to **Validated (v1.3)**; roadmap/requirements under `milestones/v1.3-*`.*  
- *v1.4: deliverables moved to **Validated (v1.4)**; roadmap/requirements under `milestones/v1.4-*`.*  
- *v1.5: deliverables moved to **Validated (v1.5)**; roadmap/requirements under `milestones/v1.5-*`; phases archived under `milestones/v1.5-phases/`.*  

</details>  

---
*Last updated: 2026-05-02 — **v1.6 milestone complete** (Phases **19**–**21**); see [`v1.6-REQUIREMENTS.md`](milestones/v1.6-REQUIREMENTS.md) archive for ENC traceability and Phase 21 UX notes.*  
