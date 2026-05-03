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
- ✅ **v2.0 — Deploy & Beta (GitHub Pages)** — Shipped 2026-05-03 — [full snapshot](milestones/v2.0-ROADMAP.md)
- 🚧 **v2.0.1 — Live gold spot** — In progress — [`.planning/REQUIREMENTS.md`](REQUIREMENTS.md)

---

## Phases

### v2.0.1 — Live gold spot

| # | Phase | Goal | Requirements | Success criteria (observable) |
|---|--------|------|--------------|------------------------------|
| **26** | **Live gold spot price** | Gold spot **USD/oz** via **gold-api.com** (XAU), **`LivePricesContext`** parity with silver, **Settings** (± **Gold** page) **₹/g** hints + tests | SPOT-01–03, UX-01–03, CALC-01, TEST-01 | (1) Loading the app triggers gold fetch alongside silver; **Refresh**/visibility refresh updates stale gold quotes. (2) With spot + INR/USD, Settings shows **live ₹/g** for **24K / 22K / 18K**. (3) Missing data shows loading/error consistent with existing live channels. (4) Unit tests pass for API + math. |
| **27** | **Settings gold & silver pricing UX** | **Same Settings pattern** for **gold** and **silver**: compact **read-only** effective prices when live data is healthy; **Edit** reveals inputs **prefilled** from fetch (and saved values); **editable by default** when fetch **fails** or data **missing**; silver gains parity with gold (visible + overridable, not live-only silent) | UX-04–UX-07 | (1) With successful live feeds, gold and silver pricing blocks are **not** large always-on forms—user sees read-only summary until **Edit**. (2) **Edit** opens editable fields with sensible defaults from live (and persistence rules unchanged unless plan says otherwise). (3) On live **error** or missing quotes, inputs are **editable without** an extra Edit click. (4) Silver is no longer “auto price with no user control” in Settings relative to gold. |

**Depends on:** prior **`usdInr`** / forex fetch (unchanged). **Phase 26** before **27** for gold spot + settings wiring. **Build order (26):** `priceApi` → `LivePricesContext` → Settings/Gold UI → tests. **Build order (27):** UX spec → Settings layout refactor → silver parity (schema/calcs if needed) → tests/UAT.

---

## Progress

| Phase | Milestone | Plans complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| **26** | **v2.0.1** | 1/1 | Implemented — verify/UAT | 2026-05-03 |
| **27** | **v2.0.1** | 1/1 | Planned — ready to execute | — |
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
| 24. Production build & GitHub Pages base path | v2.0 | 1/1 | Complete    | 2026-05-03 |
| 25. GitHub Actions CI/CD & beta access | v2.0 | 1/1 | Complete    | 2026-05-03 |

---

## Phases (historical)

<details>
<summary>✅ v2.0 — Deploy & Beta (Phases 23–25) — SHIPPED 2026-05-03</summary>

- [x] **Phase 23: Docker & containerized static server** (1/1) — 2026-05-03  
- [x] **Phase 24: Production build & GitHub Pages base path** (1/1) — 2026-05-03  
- [x] **Phase 25: GitHub Actions CI/CD & beta access** (1/1) — 2026-05-03  

Artifacts: [`.planning/phases/23-docker-containerized-static-server/`](phases/23-docker-containerized-static-server/) · [`.planning/phases/24-production-build-github-pages-base-path/`](phases/24-production-build-github-pages-base-path/) · [`.planning/phases/25-github-actions-ci-cd-beta-access/`](phases/25-github-actions-ci-cd-beta-access/) · [`v2.0-ROADMAP.md`](milestones/v2.0-ROADMAP.md) · [`v2.0-REQUIREMENTS.md`](milestones/v2.0-REQUIREMENTS.md)

</details>

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

_Milestone archives: `.planning/milestones/` · **Current:** **v2.0.1** — Phase **26** shipped; Phase **27** (commodity pricing UX) next — **`/gsd-plan-phase 27`**._
