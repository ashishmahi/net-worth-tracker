# Personal Wealth Tracker

## What this is

A local-only **React + Vite** app for tracking personal net worth across **gold, non-gold commodities (e.g. silver + manual ₹ lines), mutual funds, stocks, Bitcoin, property, bank savings (INR/AED), retirement (NPS/EPF), and standalone liabilities (Liabilities page)**. It replaces a manual Excel workflow: wealth data persists in the browser (`localStorage` key **`wealth-tracker-data`** via `AppDataContext`). There is no backend, auth, or cloud sync in the shipped local product.

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
| **v1.7** | **localStorage migration** — no Vite data plugin; `AppDataContext` `localStorage` load/save; Settings copy + tests (`happy-dom`) | 2026-05-02 |
| **v2.0** | **Deploy & Beta** — Docker static image; Vite **`BASE_URL`** for GitHub Pages; **CI** (PR + **`main`**) + **Pages** deploy; README beta URL + client-only data | 2026-05-03 |

Snapshots: `.planning/milestones/v1.0-ROADMAP.md` … `v2.0-ROADMAP.md` and matching `*-REQUIREMENTS.md` archives. Executed phase artifacts for shipped milestones live under [`.planning/milestones/`](milestones/) (e.g. `v1.5-phases/`). Phase dirs **19–25** remain under [`.planning/phases/`](phases/) until optional **`/gsd-cleanup`**.

## Next milestone

*Not defined.* Run **`/gsd-new-milestone`** to capture goals, requirements, and roadmap for **v2.1** (or the next version).

## Current state (shipped through v2.0 — 2026-05-03)

- **Liabilities & net worth:** root **`liabilities`** list; **`calcNetWorth(gross, sumLiabilitiesInr)`** for headline + new snapshots; **`sumAllDebtInr`** for dashboard **Total Debt** row; property equity unchanged (`agreementInr − outstandingLoanInr`).  
- **Commodities (v1.4):** `assets.otherCommodities`; **`CommoditiesPage`**; live silver via **`useLivePrices`**.  
- **App:** `npm run dev` — local-only; persistence via **`localStorage`** (`wealth-tracker-data`). **`npm test`** — Vitest (+ **`happy-dom`** for context tests).  
- **Encryption & backup (v1.6):** **`cryptoUtils`** (Web Crypto, no npm crypto deps). Settings **Data**: export downloads **`wealth-tracker-YYYY-MM-DD.zip`** with **`data.json`** (optional AES zip encryption via passphrase); import **zip only** — **`wealthDataZip`** + modal passphrase flows; Phase 19 envelope JSON remains in codebase/tests but not on Settings download path after Phase 21.  
- **Docker preview (v2.0 — Phase 23, 2026-05-03):** production **`dist/`** is buildable as a static image — **`Dockerfile`** + **`docker/default.conf`** (SPA fallback); **`README`** documents **`docker build -t fin-wealth:local .`** and **`docker run --rm -p 8080:80 fin-wealth:local`** (no server-side wealth data).  
- **GitHub Pages base (v2.0 — Phase 24, 2026-05-03):** **`vite.config.ts`** sets **`base`** from **`BASE_URL`** (default **`/`**); **`BASE_URL=/net-worth-tracker/`** documented for Project Pages; **`README`** production build + **`npm run preview`** instructions.  
- **CI/CD & beta docs (v2.0 — Phase 25, 2026-05-03):** **`.github/workflows/ci-pages.yml`** — **`npm ci`**, **`npm test`**, **`npm run build`** with **`BASE_URL`**; artifact + deploy to Pages on **`push`** to **`main`** only; **`README`** **Beta (GitHub Pages)** section with **`https://…github.io/net-worth-tracker/`**, beta labeling, client-only persistence, and **Settings → Pages → Source: GitHub Actions** setup.

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
- [x] **DATA-03** — `createInitialData()` + `saveData` (v1.7+: **`localStorage`**); in-memory + forms re-sync  

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

### Validated (v1.7 — Phase 22)

- [x] **STORE-01**–**STORE-05**, **INFRA-01**–**INFRA-03**, **UX-01**, **TEST-01**, **TEST-02** — browser **`localStorage`** persistence (`wealth-tracker-data`); Vite data plugin removed; copy + Vitest — Phase **22** ([`22-VERIFICATION.md`](phases/22-localstorage-migration/22-VERIFICATION.md)); full list in [`v1.7-REQUIREMENTS.md`](milestones/v1.7-REQUIREMENTS.md).

### Validated (v2.0 — Phase 23)

- [x] **DOCKER-01**–**DOCKER-03** — multi-stage **`Dockerfile`** (Node build → **`nginx:alpine`**), SPA **`try_files`** config, **`.dockerignore`**, README **`docker build` / `docker run`** — Phase **23** ([`23-VERIFICATION.md`](phases/23-docker-containerized-static-server/23-VERIFICATION.md)).

### Validated (v2.0 — Phase 24)

- [x] **BUILD-01**–**BUILD-03** — Vite **`base`** from **`BASE_URL`** (`loadEnv` + **`normalizeBaseUrl`**); production build + **`dist/index.html`** asset paths under **`/net-worth-tracker/`**; **`.env.example`** + README — Phase **24** ([`24-VERIFICATION.md`](phases/24-production-build-github-pages-base-path/24-VERIFICATION.md)).

### Validated (v2.0 — Phase 25)

- [x] **CI-01**–**CI-03**, **DEPLOY-01**–**DEPLOY-02**, **BETA-01** — PR + **`main`** CI; **`npm ci`** / **`npm test`** / **`npm run build`** with **`BASE_URL=/net-worth-tracker/`**; pinned **`actions/*`** majors; deploy on **`main`** **`push`** only; README beta URL + **localStorage**-only data — Phase **25** ([`25-VERIFICATION.md`](phases/25-github-actions-ci-cd-beta-access/25-VERIFICATION.md)).

### Deferred (backlog / future)

- [ ] Export / reports — PDF or CSV (JSON export exists; richer formats later)  
- [ ] Navigation overhaul, richer inline editing (future)  
- [ ] Align GSD Phase 01 planning artifacts with repo (optional)  
- [ ] Optional: automatic periodic snapshots (cron-like)  
- [ ] Additional live commodity feeds beyond shipped silver USD channel

### Out of scope (unchanged)

- User auth, cloud sync (deferred). **v2.0** ships **GitHub Pages** as static hosting only (no app backend).  
- First-class AED display column (INR remains primary)  
- Tax reporting (unless a future milestone re-opens)  

## Context (technical)

- **Stack:** React 18, Vite 5, TypeScript, shadcn/ui, Tailwind, RHF + Zod  
- **Persistence:** Browser **`localStorage`** key **`wealth-tracker-data`** (`AppDataContext`); theme uses separate **`theme`** key  
- **Prices:** `priceApi` + `useLivePrices()`  
- **Theme:** `localStorage` `theme` (`light` | `dark`); FOUC script in `index.html`  
- **Layout:** `AppSidebar` offcanvas on mobile; `MobileTopBar`; `PageHeader` on section pages; asset sheets with scroll regions + property milestone horizontal scroll on narrow widths  
- **Data reset (v1.2):** `createInitialData()` in `AppDataContext`; shadcn `AlertDialog` in Settings danger zone  
- **Net worth history (v1.3):** `netWorthHistory` list; **Recharts** + `--chart-*` tokens; import uses same `DataSchema` path as boot  
- **Commodities (v1.4):** `otherCommodities` items; **`CommoditiesPage`**; silver **`TROY_OZ_TO_GRAMS`** INR/gram derivation aligned with **`dashboardCalcs`**  
- **Debt (v1.5):** **`liabilityCalcs`** + **`LiabilitiesPage`**; Dashboard **`grossAssets`** denominator for **%** column; headline **`netWorth`** deducts standalone **`liabilities`** only  

## Constraints

- Single-user browser storage + optional zip backup; no hosted backend in shipped local scope  
- Tech per `package.json` and `CLAUDE.md`  

## Key decisions

| Decision | Rationale | Outcome |
|----------|-----------|--------|
| React + Vite | Fast dev, simple local app | v1.0+ |
| JSON / localStorage persistence | No DB for personal use | v1.0+ (v1.7: **`localStorage`** replaces dev API) |
| v1.1 mobile | Phases 6–8: theme, offcanvas, headers, sheets, table | ✓ v1.1 2026-04-26 |
| GSD planning | Phased delivery in `.planning/` | Ongoing |
| v1.1 scope | `localStorage` only for theme; no `data.json` version bump for theme | ✓ Shipped |
| v1.2 data reset | Danger zone + dialog + `createInitialData` + `saveData`; no theme wipe | ✓ v1.2 2026-04-26 |
| v1.3 | Snapshot list + chart on dashboard; import; migration; NWH-04 empty state | ✓ v1.3 2026-04-28 |  
| v1.4 | Commodities beyond gold; silver + manual lines; net worth + import/reset + product UX | ✓ Shipped 2026-05-01 |  
| v1.5 | Liabilities schema + pure calcs + property enrichment + Liabilities CRUD + dashboard debt UX | ✓ Shipped 2026-05-02 |  
| v1.6 | Web Crypto `cryptoUtils` + Settings encrypted export/import; then zip + modal UX (`@zip.js/zip.js`) for at-rest export protection | ✓ Shipped 2026-05-02 |  
| v1.7 | **`localStorage`**-only wealth persistence; remove Vite **`dataPlugin`**; sync boot; Settings copy; **happy-dom** tests | ✓ Shipped 2026-05-02 |  
| v2.0 | Docker + **`BASE_URL`** + GitHub Actions CI/Pages; static hosting only; README beta URL + client-only data | ✓ Shipped 2026-05-03 |  

## Evolution

This file is updated at **milestone completion** to avoid drift between plans and the running app.

**After each milestone** (via `/gsd-complete-milestone`): full review, validated requirements, key decisions, context.

<details>
<summary>Previous “Current milestone” blurbs (superseded)</summary>  

- *v1.3: deliverables moved to **Validated (v1.3)**; roadmap/requirements under `milestones/v1.3-*`.*  
- *v1.4: deliverables moved to **Validated (v1.4)**; roadmap/requirements under `milestones/v1.4-*`.*  
- *v1.5: deliverables moved to **Validated (v1.5)**; roadmap/requirements under `milestones/v1.5-*`; phases archived under `milestones/v1.5-phases/`.*  
- *v1.7: requirements archived at [`v1.7-REQUIREMENTS.md`](milestones/v1.7-REQUIREMENTS.md); live roadmap awaits **`/gsd-new-milestone`**.*  
- *v2.0: requirements archived at [`v2.0-REQUIREMENTS.md`](milestones/v2.0-REQUIREMENTS.md); live **`REQUIREMENTS.md`** removed at close — start next milestone with **`/gsd-new-milestone`**.*  

</details>  

---
*Last updated: 2026-05-03 — **v2.0** archived; [`v2.0-ROADMAP.md`](milestones/v2.0-ROADMAP.md) · [`v2.0-REQUIREMENTS.md`](milestones/v2.0-REQUIREMENTS.md).*  
