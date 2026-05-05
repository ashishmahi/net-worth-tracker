# Personal Wealth Tracker — Roadmap

## Milestones (summary)

- ✅ **v1.0 — MVP** — Shipped  
- ✅ **v1.1 — Mutual funds** — Shipped  
- ✅ **v1.2 — Crypto & dashboard chart** — Shipped  
- ✅ **v1.3 — History & net worth chart** — Shipped  
- ✅ **v1.4 — Multiple commodities** — Shipped 2026-05-01  
- ✅ **v2.0 — Session assets & live silver** — Shipped 2026-05-02 — [full snapshot](milestones/v2.0-ROADMAP.md)  
- ✅ **v2.0.1 — Live gold spot** — Shipped 2026-05-03 — [full snapshot](milestones/v2.0.1-ROADMAP.md)
- ✅ **v2.1 — Section routing & home nav** — Shipped 2026-05-04 — [full snapshot](milestones/v2.1-ROADMAP.md)
- ✅ **v2.2 — Import-adjusted bullion pricing** — Shipped 2026-05-06 — [full snapshot](milestones/v2.2-ROADMAP.md)
- 🚧 **v2.3 Property entry flow & validation** — Planning — live below · [`REQUIREMENTS.md`](REQUIREMENTS.md)

**Phase numbering:** **v2.2** shipped Phases **29–30**. **v2.3** continues with Phases **31–33** ([SEED-006](seeds/SEED-006-property-entry-flow-validation.md)).

---

## v2.3: Property entry flow & validation (Phases 31–33)

**Goal:** Guided paths for common property ownership situations and **save-blocking validation** so inconsistent milestones and loan fields do not reach `localStorage`.

### Phase 31: Guided property entry UX

**Goal:** Path or mode selection (paid off / builder milestones / mortgaged); conditional sections and copy on **Property** add/edit.

**Requirements:** PRP-01, PRP-02, PRP-03

### Phase 32: Property save validation & schema

**Goal:** Enforce financial consistency at save time; align **Zod** with UI; **Vitest** for helpers/schema.

**Requirements:** PRV-01, PRV-02, PRV-03, PRV-04, PRV-05

### Phase 33: Property sheet responsive & accessibility

**Goal:** Narrow-viewport usability and sensible a11y for new controls alongside existing milestone table patterns.

**Requirements:** PRA-01

| Phase | Name | Goal (summary) | Requirements |
|-------|------|----------------|--------------|
| **31** | Guided property entry UX | Paths + conditional UI + copy | PRP-01, PRP-02, PRP-03 |
| **32** | Property save validation & schema | Block bad saves; Zod parity; tests | PRV-01–PRV-05 |
| **33** | Property sheet responsive & accessibility | Mobile + a11y pass | PRA-01 |

### Success criteria

**Phase 31**

1. User can complete add/edit along **fully paid**, **builder milestones**, or **mortgaged** paths without irrelevant fields cluttering the flow.
2. Helper copy connects each path to how equity and milestones affect net worth.

**Phase 32**

1. Save is rejected when milestone totals exceed agreement per **PRV-01** (with clear errors).
2. Loan rules (**PRV-02**, **PRV-03**) behave per documented warn-vs-block decisions.
3. Tests fail if validation helpers or schema regress.

**Phase 33**

1. Primary actions and milestone grid remain reachable on small screens; no blocking horizontal overflow for core fields.

### Plans

- [x] Phase 31 — [31-01](phases/31-guided-property-entry-ux/31-01-PLAN.md) (`/gsd-execute-phase 31`)
- [ ] Phase 32 — plan TBD (`/gsd-plan-phase 32`)
- [ ] Phase 33 — plan TBD (`/gsd-plan-phase 33`)

---

<details>
<summary>✅ v2.2 — Import-adjusted bullion pricing (Phases 29–30) — SHIPPED 2026-05-06</summary>

| Phase | Name | Plans |
|-------|------|-------|
| **29** | Bullion import uplift — data & calculations | [29-01](phases/29-bullion-import-uplift-data-calculations/29-01-PLAN.md) |
| **30** | Bullion import uplift — settings UX & disclosure | [30-01](phases/30-bullion-import-uplift-settings-ux-disclosure/30-01-PLAN.md) |

**Roadmap / requirements:** [`milestones/v2.2-ROADMAP.md`](milestones/v2.2-ROADMAP.md) · [`milestones/v2.2-REQUIREMENTS.md`](milestones/v2.2-REQUIREMENTS.md)

**Phase directories (current location):** [`.planning/phases/29-bullion-import-uplift-data-calculations/`](phases/29-bullion-import-uplift-data-calculations/) · [`.planning/phases/30-bullion-import-uplift-settings-ux-disclosure/`](phases/30-bullion-import-uplift-settings-ux-disclosure/) — optional **`/gsd-cleanup`** later.

</details>

---


<details>
<summary>✅ v2.0 — Session assets & live silver (Phases 22–25) — SHIPPED 2026-05-02</summary>

| Phase | Name | Plans |
|-------|------|-------|
| 22 | localStorage migration | [22-01](../phases/22-localstorage-migration/22-01-PLAN.md) |
| 23 | Docker static server | [23-01](../phases/23-docker-containerized-static-server/23-01-PLAN.md) |
| 24 | Session assets | [24-01](../phases/24-session-assets-usd-inr/24-01-PLAN.md) |
| 25 | Live silver spot | [25-01](../phases/25-live-silver-spot-price/25-01-PLAN.md) |

**Requirements:** [v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v2.0.1 — Live gold spot (Phases 26–27) — SHIPPED 2026-05-03</summary>

| Phase | Name | Plans |
|-------|------|-------|
| 26 | Live gold spot price | [26-01](../phases/26-live-gold-spot-price/26-01-PLAN.md) |
| 27 | Settings gold & silver pricing UX | [27-01](../phases/27-settings-commodity-pricing-ux/27-01-PLAN.md) |

**Requirements:** [v2.0.1-REQUIREMENTS.md](milestones/v2.0.1-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v2.1 — Section routing & home nav (Phase 28) — SHIPPED 2026-05-04</summary>

| Phase | Name | Plans |
|-------|------|-------|
| 28 | Section routing & dashboard home link | [28-01](../phases/28-section-routing-home-header/28-01-PLAN.md) |

**Requirements:** [v2.1-REQUIREMENTS.md](milestones/v2.1-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.0 — MVP (Phases 1-5) — SHIPPED</summary>

- [x] **Phase 1: Foundation & dashboard shell** (3/3)  
- [x] **Phase 2: Bank accounts** (1/1)  
- [x] **Phase 3: Real estate** (1/1)  
- [x] **Phase 4: Commodity holdings** (1/1)  
- [x] **Phase 5: Dashboard charts & polish** (1/1)  
- Artifacts: [`.planning/milestones/v1.0-phases/`](milestones/v1.0-phases/) · [v1.0-ROADMAP](milestones/v1.0-ROADMAP.md) · [v1.0-REQUIREMENTS](milestones/v1.0-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.1 — Mutual funds (Phases 6-7) — SHIPPED</summary>

- [x] **Phase 6: Mutual funds data & net worth** (1/1)  
- [x] **Phase 7: Mutual funds product UX** (1/1)  
- Artifacts: [`.planning/milestones/v1.1-phases/6-mutual-funds-data-net-worth/`](milestones/v1.1-phases/6-mutual-funds-data-net-worth/) · [`.planning/milestones/v1.1-phases/7-mutual-funds-product-ux/`](milestones/v1.1-phases/7-mutual-funds-product-ux/) · [v1.1-ROADMAP](milestones/v1.1-ROADMAP.md) · [v1.1-REQUIREMENTS](milestones/v1.1-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.2 — Crypto & dashboard chart (Phases 8-9) — SHIPPED</summary>

- [x] **Phase 8: Crypto data & net worth** (1/1)  
- [x] **Phase 9: Crypto product UX & dashboard chart** (1/1)  
- Artifacts: [`.planning/milestones/v1.2-phases/8-crypto-data-net-worth/`](milestones/v1.2-phases/8-crypto-data-net-worth/) · [`.planning/milestones/v1.2-phases/9-crypto-product-ux-dashboard-chart/`](milestones/v1.2-phases/9-crypto-product-ux-dashboard-chart/) · [v1.2-ROADMAP](milestones/v1.2-ROADMAP.md) · [v1.2-REQUIREMENTS](milestones/v1.2-REQUIREMENTS.md)

</details>

<details>
<summary>✅ v1.3 — History & net worth chart (Phases 10-11) — SHIPPED 2026-04-28</summary>

- [x] **Phase 10: History schema & capture** (2/2) — 2026-04-27  
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

_Milestone archives: `.planning/milestones/` · **Last shipped:** **v2.2** (2026-05-06). **In progress:** **v2.3** — [`REQUIREMENTS.md`](REQUIREMENTS.md)._
