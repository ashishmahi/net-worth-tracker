# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)  
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)  
- ✅ **v1.2 — Data reset** — Shipped 2026-04-26 — [full snapshot](milestones/v1.2-ROADMAP.md)  
- ✅ **v1.3 — Net worth history** — Shipped 2026-04-28 — [full snapshot](milestones/v1.3-ROADMAP.md)  
- ✅ **v1.4 — Multiple commodities** — Shipped 2026-05-01 — [full snapshot](milestones/v1.4-ROADMAP.md)  
- ✅ **v1.5 — Debt & Liabilities** — Shipped 2026-05-02 — [full snapshot](milestones/v1.5-ROADMAP.md)
- ✅ **v1.6 — Encrypted Export** — Shipped 2026-05-02 — [full snapshot](milestones/v1.6-ROADMAP.md)
- ✅ **v1.7 — localStorage Migration** — Shipped 2026-05-02 — [full snapshot](milestones/v1.7-ROADMAP.md)
- 🚧 **v2.0 — Deploy & Beta (GitHub Pages)** — In progress

---

## Phases

### v2.0 — Deploy & Beta (GitHub Pages)

- [x] **Phase 23: Docker & containerized static server** — Multi-stage **`Dockerfile`**, nginx (or equivalent) serves **`dist/`** with SPA-safe static hosting; documented **`docker build` / `docker run`**. — **2026-05-03**  
  **Requirements:** DOCKER-01, DOCKER-02, DOCKER-03

- [ ] **Phase 24: Production build & GitHub Pages base path** — Configurable Vite **`base`** for `/<repo>/` on Pages; **`npm run build`** verified with same base CI uses; no broken asset paths.  
  **Requirements:** BUILD-01, BUILD-02, BUILD-03

- [ ] **Phase 25: GitHub Actions CI/CD & beta access** — PR + **`main`** workflows (install, test, build); automated deploy to **GitHub Pages**; README beta URL + client-only data disclaimer.  
  **Requirements:** CI-01, CI-02, CI-03, DEPLOY-01, DEPLOY-02, BETA-01

---

## Phase Details

### Phase 23: Docker & containerized static server
**Goal**: Beta testers can run the same static build locally via Docker as CI produces.  
**Depends on**: Nothing  
**Requirements**: DOCKER-01, DOCKER-02, DOCKER-03  
**Success criteria**:
  1. `docker build` produces an image that serves the built SPA on a mapped port.
  2. Opening `/` in a browser shows the app shell (assets load).
  3. README documents how to build and run the container.

### Phase 24: Production build & GitHub Pages base path
**Goal**: Production bundles load correctly under **`https://<user>.github.io/<repo>/`**.  
**Depends on**: Phase 23 (reference image optional — may parallelize after Dockerfile exists)  
**Requirements**: BUILD-01, BUILD-02, BUILD-03  
**Success criteria**:
  1. Local dev still uses base `/` without manual hacks.
  2. CI/local can set repository base and `npm run build` succeeds.
  3. Spot-check built `index.html` / asset URLs respect base.

### Phase 25: GitHub Actions CI/CD & beta access
**Goal**: Every **`main`** update ships to Pages; contributors get CI on PRs; beta users know the URL and limitations.  
**Depends on**: Phase 24 (deploy must use correct `dist`)  
**Requirements**: CI-01, CI-02, CI-03, DEPLOY-01, DEPLOY-02, BETA-01  
**Success criteria**:
  1. PR workflow runs tests + build.
  2. Merge to **`main`** updates GitHub Pages within the workflow.
  3. README states live URL + beta + local-only data.

**UI hint**: no

---

## Progress

| Phase | Milestone | Plans complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5 | v1.0 | (see snapshot) | Complete | 2026-04-26 |
| 6-8 | v1.1 | (see snapshot) | Complete | 2026-04-26 |
| 9 | v1.2 | 2/2 | Complete | 2026-04-26 |
| 10, 10.1, 11 | v1.3 | 3/3 | Complete | 2026-04-26 / 2026-04-28 |
| 12 | v1.4 | 3/3 | Complete | 2026-04-30 |
| 13 | v1.4 | 2/2 | Complete | 2026-05-01 |
| 14. Schema & Migration | v1.5 | 2/2 | Complete | 2026-05-01 |
| 15. Calculation Utilities | v1.5 | 1/1 | Complete | 2026-05-01 |
| 16. Property Liability Enrichment | v1.5 | 1/1 | Complete | 2026-05-01 |
| 17. Liabilities Page CRUD | v1.5 | 1/1 | Complete | 2026-05-02 |
| 18. Dashboard & Net Worth Integration | v1.5 | 1/1 | Complete | 2026-05-02 |
| 19. Crypto Utilities | v1.6 | 1/1 | Complete | 2026-05-02 |
| 20. Settings UI — Encrypted Export & Import | v1.6 | 1/1 | Complete | 2026-05-02 |
| 21. Passphrase modals + zip export/import | v1.6 | 1/1 | Complete | 2026-05-02 |
| 22. localStorage Migration | v1.7 | 1/1 | Complete | 2026-05-02 |
| 23. Docker & containerized static server | v2.0 | 1/1 | Complete    | 2026-05-03 |
| 24. Production build & GitHub Pages base path | v2.0 | 0/1 | Not started | — |
| 25. GitHub Actions CI/CD & beta access | v2.0 | 0/1 | Not started | — |

---

## Phases (historical)

<details>
<summary>✅ v1.7 — localStorage Migration (Phase 22) — SHIPPED 2026-05-02</summary>

- [x] **Phase 22: localStorage Migration** (1/1) — 2026-05-02  
- Artifacts: [`.planning/phases/22-localstorage-migration/`](phases/22-localstorage-migration/) · [`v1.7-ROADMAP.md`](milestones/v1.7-ROADMAP.md) · [`v1.7-REQUIREMENTS.md`](milestones/v1.7-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.6 — Encrypted Export (Phases 19–21) — SHIPPED 2026-05-02</summary>

- [x] **Phase 19: Crypto Utilities** (1/1) — 2026-05-02  
- [x] **Phase 20: Settings UI — Encrypted Export & Import** (1/1) — 2026-05-02  
- [x] **Phase 21: Passphrase modals + zip export/import** (1/1) — 2026-05-02  

Artifacts: [`.planning/phases/19-crypto-utilities/`](phases/19-crypto-utilities/) · [`.planning/phases/20-settings-ui-encrypted-export-import/`](phases/20-settings-ui-encrypted-export-import/) · [`.planning/phases/21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to-/`](phases/21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to-/) · [v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md) · [v1.6-REQUIREMENTS.md](milestones/v1.6-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.5 — Debt & Liabilities (Phases 14–18) — SHIPPED 2026-05-02</summary>

- [x] **Phase 14: Schema & Migration** (2/2) — 2026-05-01  
- [x] **Phase 15: Calculation Utilities** (1/1) — 2026-05-01  
- [x] **Phase 16: Property Liability Enrichment** (1/1) — 2026-05-01  
- [x] **Phase 17: Liabilities Page CRUD** (1/1) — 2026-05-02  
- [x] **Phase 18: Dashboard & Net Worth Integration** (1/1) — 2026-05-02  

Artifacts: [`.planning/milestones/v1.5-phases/`](milestones/v1.5-phases/) · [v1.5-ROADMAP](milestones/v1.5-ROADMAP.md) · [v1.5-REQUIREMENTS](milestones/v1.5-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.0 — Local wealth tracker (Phases 1-5) — SHIPPED 2026-04-26</summary>  

[`.planning/milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md)  

</details>  

<details>
<summary>✅ v1.1 — UX Polish (Phases 6-8) — SHIPPED 2026-04-26</summary>  

[`.planning/milestones/v1.1-ROADMAP.md`](milestones/v1.1-ROADMAP.md)  

</details>  

<details>
<summary>✅ v1.2 — Data reset (Phase 9) — SHIPPED 2026-04-26</summary>  

- [x] **Phase 9: Data reset** (2/2) — 2026-04-26  
- Artifacts: [`.planning/milestones/v1.2-phases/09-data-reset/`](milestones/v1.2-phases/09-data-reset/) · [v1.2-ROADMAP](milestones/v1.2-ROADMAP.md) · [v1.2-REQUIREMENTS](milestones/v1.2-REQUIREMENTS.md)  

</details>  

<details>
<summary>✅ v1.3 — Net worth history (Phases 10, 10.1, 11) — SHIPPED 2026-04-28</summary>  

- [x] **Phase 10: History & schema** (1/1) — 2026-04-26  
- [x] **Phase 10.1: JSON import** (1/1) — 2026-04-26  
- [x] **Phase 11: Net worth chart** (1/1) — 2026-04-28  
- Artifacts: [`milestones/v1.3-phases/10-history-schema/`](milestones/v1.3-phases/10-history-schema/) · [`milestones/v1.3-phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/`](milestones/v1.3-phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/) · [`milestones/v1.3-phases/11-net-worth-chart/`](milestones/v1.3-phases/11-net-worth-chart/) · [v1.3-ROADMAP](milestones/v1.3-ROADMAP.md) · [v1.3-REQUIREMENTS](milestones/v1.3-REQUIREMENTS.md)  

</details>  

<details>
<summary>✅ v1.4 — Multiple commodities (Phases 12-13) — SHIPPED 2026-05-01</summary>  

- [x] **Phase 12: Commodities data & net worth** (3/3) — 2026-04-30  
- [x] **Phase 13: Commodities product UX** (2/2) — 2026-05-01  
- Artifacts: [`.planning/milestones/v1.4-phases/12-commodities-data-net-worth/`](milestones/v1.4-phases/12-commodities-data-net-worth/) · [`.planning/milestones/v1.4-phases/13-commodities-product-ux/`](milestones/v1.4-phases/13-commodities-product-ux/) · [v1.4-ROADMAP](milestones/v1.4-ROADMAP.md) · [v1.4-REQUIREMENTS](milestones/v1.4-REQUIREMENTS.md)  

</details>  

---

_Milestone archives: `.planning/milestones/` · **Current:** **v2.0** — Phases **23–25**._
