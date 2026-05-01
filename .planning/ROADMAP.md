# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)  
- ✅ **v1.1 — UX Polish** — Shipped 2026-04-26 — [full snapshot](milestones/v1.1-ROADMAP.md)  
- ✅ **v1.2 — Data reset** — Shipped 2026-04-26 — [full snapshot](milestones/v1.2-ROADMAP.md)  
- ✅ **v1.3 — Net worth history** — Shipped 2026-04-28 — [full snapshot](milestones/v1.3-ROADMAP.md)  
- ✅ **v1.4 — Multiple commodities** — Shipped 2026-05-01 — [full snapshot](milestones/v1.4-ROADMAP.md)
- 🔄 **v1.5 — Debt & Liabilities** — In progress

**Phase numbering:** v1.4 ended at **Phase 13**. v1.5 continues from **Phase 14**.

---

## v1.5 — Debt & Liabilities

### Phases

- [x] **Phase 14: Schema & Migration** (2/2) — 2026-05-01 — Add `liabilities` to `DataSchema`, migration, import/reset parity
- [x] **Phase 15: Calculation Utilities** (1/1) — 2026-05-01 — Pure functions for debt totals, net worth, and debt-to-asset ratio
- [x] **Phase 16: Property Liability Enrichment** (1/1) — 2026-05-01 — Extend property form with lender, EMI, and disambiguation hint
- [ ] **Phase 17: Liabilities Page CRUD** — New standalone loans page with full add/edit/delete and sidebar nav
- [ ] **Phase 18: Dashboard & Net Worth Integration** — Wire debt into headline net worth, Total Debt row, and ratio insight

---

## Phase Details

### Phase 14: Schema & Migration
**Goal**: The app loads and saves a data model that fully represents liabilities — old data files upgrade seamlessly, new snapshots support negative net worth, and import/reset handle the new field
**Depends on**: Nothing (schema foundation)
**Requirements**: DEBT-01, DEBT-02, DEBT-03, DEBT-04, DEBT-05, INFRA-01, INFRA-02
**Success Criteria** (what must be TRUE):
  1. An existing `data.json` without a `liabilities` key loads without error and gains `liabilities: []`
  2. `createInitialData()` returns an object that passes `DataSchema.safeParse()` including `liabilities: []`
  3. Importing a JSON file with a populated `liabilities` array succeeds; importing one without `liabilities` also succeeds via migration
  4. Data reset clears the liabilities list to `[]`
  5. A `NetWorthPointSchema` record with a negative `totalInr` passes validation
**Plans**: 2 plans
Plans:
- [x] 14-01-PLAN.md — Schema: LiabilityItemSchema, DataSchema liabilities, NetWorthPointSchema relaxation, migration function
- [x] 14-02-PLAN.md — Tests: LiabilityItemSchema validation and ensureLiabilities() migration unit tests

### Phase 15: Calculation Utilities
**Goal**: All debt arithmetic is implemented as pure, tested functions — no ad-hoc inline math in components
**Depends on**: Phase 14
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04
**Success Criteria** (what must be TRUE):
  1. `sumLiabilitiesInr(data)` returns the correct sum of all `outstandingInr` values across standalone liabilities
  2. `sumAllDebtInr(data)` correctly combines property `outstandingLoanInr` and standalone liability totals without double-counting
  3. `calcNetWorth(grossAssets, liabilitiesTotal)` subtracts only standalone liabilities from gross assets and returns negative values when debt exceeds assets
  4. `debtToAssetRatio(totalDebt, grossAssets)` returns 0% when `grossAssets` is 0 and a correct percentage otherwise
  5. All four functions have unit tests that pass under `npm test`
**Plans**: 1 plan
Plans:
- [x] 15-01-PLAN.md — TDD: implement and test four pure liability calc functions

### Phase 16: Property Liability Enrichment
**Goal**: Users can record lender name and EMI against a property liability, and are guided to the right place for standalone loan tracking
**Depends on**: Phase 14
**Requirements**: PROP-01, PROP-02, PROP-03
**Success Criteria** (what must be TRUE):
  1. When a user toggles on the liability switch on a property, an optional Lender field appears and can be saved
  2. When a user toggles on the liability switch on a property, an optional EMI (₹/month) field appears and can be saved
  3. The property form shows a visible hint directing users to the Liabilities page for loans not tied to a specific property
**Plans**: 1 plan
Plans:
- [x] 16-01-PLAN.md — Schema: PropertyItem lender + emiInr; PropertyPage hint + fields + save/load
**UI hint**: yes

### Phase 17: Liabilities Page CRUD
**Goal**: Users can manage a list of standalone loans — add, edit, delete — with clear type labelling and guidance on scope
**Depends on**: Phase 15
**Requirements**: LIAB-01, LIAB-02, LIAB-03, LIAB-04, LIAB-05, LIAB-06, INFRA-03
**Success Criteria** (what must be TRUE):
  1. User can add a loan with label, lender, outstanding balance, EMI, and loan type; it appears in the list immediately
  2. User can edit any field of an existing loan and save the changes
  3. User can delete a loan entry; the entry is removed from the list
  4. Each loan entry displays a badge showing its loan type (Home / Car / Personal / Other)
  5. When no loans exist the page shows an empty state with a prompt to add the first loan
  6. The Liabilities page is reachable from the sidebar navigation
**Plans**: TBD
**UI hint**: yes

### Phase 18: Dashboard & Net Worth Integration
**Goal**: The dashboard headline net worth reflects total debt, a Total Debt summary row is visible, and new snapshots capture the true (debt-adjusted) net worth
**Depends on**: Phase 15, Phase 17
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. The dashboard headline net worth figure equals gross assets minus standalone liabilities (decreases when a loan is added)
  2. A Total Debt row on the dashboard shows the combined property + standalone debt figure and links to the Liabilities page
  3. A Debt-to-Asset ratio percentage is displayed on the dashboard; it shows 0% when there are no assets
  4. Recording a new net worth snapshot captures the `calcNetWorth()` result; historical snapshots are unchanged
**Plans**: TBD
**UI hint**: yes

---

## Phases (historical)

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
| 14. Schema & Migration | v1.5 | 2/2 | Complete    | 2026-05-01 |
| 15. Calculation Utilities | v1.5 | 1/1 | Complete    | 2026-05-01 |
| 16. Property Liability Enrichment | v1.5 | 1/1 | Complete    | 2026-05-01 |
| 17. Liabilities Page CRUD | v1.5 | 0/? | Not started | - |
| 18. Dashboard & Net Worth Integration | v1.5 | 0/? | Not started | - |

---

_Milestone archives: `.planning/milestones/` · Next: `/gsd-discuss-phase 17` or `/gsd-plan-phase 17`_
