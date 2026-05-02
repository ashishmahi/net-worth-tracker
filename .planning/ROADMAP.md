# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)  
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)  
- ✅ **v1.2 — Data reset** — Shipped 2026-04-26 — [full snapshot](milestones/v1.2-ROADMAP.md)  
- ✅ **v1.3 — Net worth history** — Shipped 2026-04-28 — [full snapshot](milestones/v1.3-ROADMAP.md)  
- ✅ **v1.4 — Multiple commodities** — Shipped 2026-05-01 — [full snapshot](milestones/v1.4-ROADMAP.md)  
- ✅ **v1.5 — Debt & Liabilities** — Shipped 2026-05-02 — [full snapshot](milestones/v1.5-ROADMAP.md)
- 🚧 **v1.6 — Encrypted Export** — In progress

---

## Phases

### v1.6 — Encrypted Export (Phases 19–20)

- [x] **Phase 19: Crypto Utilities** — Pure `src/lib/cryptoUtils.ts` with `encryptData`/`decryptData` using Web Crypto API, unit tested (completed 2026-05-02)
- [ ] **Phase 20: Settings UI — Encrypted Export & Import** — Passphrase field in Export, auto-detect on Import, inline error handling

---

## Phase Details

### Phase 19: Crypto Utilities
**Goal**: The app has a tested, dependency-free encryption library that can AES-256-GCM encrypt and decrypt a JSON payload given a passphrase
**Depends on**: Nothing (self-contained utility)
**Requirements**: ENC-02, ENC-03
**Success Criteria** (what must be TRUE):
  1. `encryptData(plaintext, passphrase)` returns an envelope object with `encrypted: true`, `version`, `salt`, `iv`, and ciphertext `data` fields
  2. `decryptData(envelope, passphrase)` returns the original plaintext when given the correct passphrase
  3. `decryptData` throws a typed error when given the wrong passphrase
  4. Vitest unit tests pass for all three cases (round-trip, correct decrypt, wrong-passphrase rejection)
**Plans**: 1/1 plans complete

### Phase 20: Settings UI — Encrypted Export & Import
**Goal**: Users can export an AES-256-GCM encrypted file with a passphrase and import it back with a matching passphrase, with clear inline feedback at every step
**Depends on**: Phase 19
**Requirements**: ENC-01, ENC-04, ENC-05, ENC-06
**Success Criteria** (what must be TRUE):
  1. User can leave the passphrase field blank on Export and download a plain JSON file (existing behavior unchanged)
  2. User can enter a passphrase on Export and download a file that is visibly different from plain JSON (envelope with `encrypted: true`)
  3. When Import receives a plain JSON file, no passphrase is asked and data loads as before
  4. When Import receives an encrypted file, a passphrase field appears automatically before load proceeds
  5. Entering the correct passphrase on an encrypted import loads the data normally with a success state
  6. Entering a wrong or blank passphrase on an encrypted import shows a clear inline error message without changing loaded data
**Plans**: TBD
**UI hint**: yes

---

## Phases (historical)

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
| 20. Settings UI — Encrypted Export & Import | v1.6 | 0/1 | Not started | - |

---

_Milestone archives: `.planning/milestones/` · **Current:** v1.6 — Encrypted Export (phases 19–20)._
