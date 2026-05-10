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
- ✅ **v2.3 — Property entry flow & validation** — Shipped 2026-05-06 (Phases **31–33**) — [full snapshot](milestones/v2.3-ROADMAP.md) · [requirements](milestones/v2.3-REQUIREMENTS.md)
- 🚧 **v2.4 — Multi-Currency Reporting** — In progress (Phases **34–38**) — [requirements](REQUIREMENTS.md)

**Phase numbering:** **v2.3** ended at Phase **33** ([SEED-006](seeds/SEED-006-property-entry-flow-validation.md)). **v2.4** continues from Phase **34** ([SEED-005](seeds/SEED-005-multi-currency-reporting.md)).

---

## v2.4 — Multi-Currency Reporting (Phases 34–38)

**Goal:** Allow users to hold assets in any currency (INR, USD, AED, EUR, GBP, SGD) and view all totals in a user-selected reporting currency, converted at live FX rates.

**Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md) | **Spec:** `docs/multi-currency.md`

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|-----------------|
| **34** | FX infrastructure & data model | Extend FX feeds, conversion utility, data model migration | FX-01–03, DM-01–03 | 5 |
| **35** | Reporting currency selector | Topbar picker, real-time recalculation, settings persistence | RC-01–03 | 3 |
| **36** | Dashboard dual-currency display | Dashboard rows: primary reporting + secondary original (muted) | DSP-01, DSP-03 | 3 |
| **37** | Asset pages — currency fields & display | All 9 asset/liability pages: currency dropdown + dual-currency display | AP-01–02, DSP-02 | 3 |
| **38** | Settings, snapshots & export/import | Settings rates card, manual overrides, snapshot rate capture, zip portability | SET-01–02, SNP-01–02, EXP-01–02 | 4 |

### Phase 34: FX Infrastructure & Data Model

**Goal:** Establish the FX data layer and record-level currency schema before any UI changes.

**Requirements:** FX-01, FX-02, FX-03, DM-01, DM-02, DM-03

**Success criteria:**
1. `priceApi.ts` fetches EUR/INR, GBP/INR, SGD/INR; `LivePricesContext` exposes them alongside existing pairs
2. `toReportingCurrency()` utility returns correct converted values; Vitest coverage ≥ 80%
3. When a rate is absent, the utility returns a sentinel and the "Rate unavailable" fallback path is tested
4. All record schemas in `data.ts` accept an optional `currency` field without breaking existing stored data
5. `reportingCurrency` exists on settings schema; schema version bumped; migration tested with a pre-migration fixture

### Phase 35: Reporting Currency Selector

**Goal:** Topbar dropdown lets user pick reporting currency, recalculates all aggregates instantly, persists choice.

**Requirements:** RC-01, RC-02, RC-03

**Success criteria:**
1. Topbar shows a `<select>` with INR, USD, AED, EUR, GBP, SGD; selected value matches stored `reportingCurrency`
2. Switching currency recalculates dashboard net worth and category totals without page reload
3. `reportingCurrency` persists in settings after page reload

### Phase 36: Dashboard Dual-Currency Display

**Goal:** Dashboard breakdown rows adopt the spec's dual-currency display pattern.

**Requirements:** DSP-01, DSP-03

**Success criteria:**
1. A dashboard row whose underlying records use a different currency shows the reporting-currency figure bold + original below in muted small text
2. A dashboard row whose records are all in reporting currency shows only the primary figure (no muted line)
3. "Rate unavailable" state shows original amount only with a hint label

### Phase 37: Asset Pages — Currency Fields & Display

**Goal:** All 9 asset/liability pages store and display per-record currency correctly.

**Requirements:** AP-01, AP-02, DSP-02

**Success criteria:**
1. Add/edit forms on Gold, MF, Stocks, Bank, Retirement, Bitcoin, Commodities, Property, and Liabilities include a currency dropdown defaulting to the current reporting currency
2. Saving a record in USD stores the original USD amount; the stored JSON contains `currency: "USD"` not the INR equivalent
3. Detail views on each asset page show the dual-currency pattern matching the dashboard spec

### Phase 38: Settings, Snapshots & Export/Import

**Goal:** Close the loop on live rates visibility, historical accuracy, and data portability.

**Requirements:** SET-01, SET-02, SNP-01, SNP-02, EXP-01, EXP-02

**Success criteria:**
1. Settings live rates card lists all 5 FX pairs (USD/INR, AED/INR, EUR/INR, GBP/INR, SGD/INR)
2. Session-only manual override inputs are available for EUR, GBP, and SGD pairs
3. Recording a net worth snapshot captures `reportingCurrency` and a rate map in the snapshot record
4. Zip export includes `currency` fields on all records; re-importing that zip preserves them

### Plans

- [x] Phase 34 — [34-01](phases/34-fx-infrastructure-data-model/34-01-PLAN.md) (`/gsd-execute-phase 34`)
- [x] Phase 35 — [35-01](phases/35-reporting-currency-selector/35-01-PLAN.md) (`/gsd-execute-phase 35`) — **2026-05-08**
- [x] Phase 36 — [36-01](phases/36-dashboard-dual-currency-display/36-01-PLAN.md) (`/gsd-execute-phase 36`) — **2026-05-09**
- [x] Phase 37 — [37-01](phases/37-asset-pages-currency-fields-display/37-01-PLAN.md) (`/gsd-execute-phase 37`) — **2026-05-09**
- [x] Phase 38 — [38-01](phases/38-settings-snapshots-export-import/38-01-PLAN.md) (`/gsd-execute-phase 38`) — **2026-05-10**

---

<details>
<summary>✅ v2.3 — Property entry flow & validation (Phases 31–33) — SHIPPED 2026-05-06</summary>

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
- [x] Phase 32 — [32-01](phases/32-property-save-validation-schema/32-01-PLAN.md) (`/gsd-execute-phase 32`)
- [x] Phase 33 — [33-01](phases/33-property-sheet-responsive-accessibility/33-01-PLAN.md) (`/gsd-execute-phase 33`)

**Roadmap / requirements:** [`milestones/v2.3-ROADMAP.md`](milestones/v2.3-ROADMAP.md) · [`milestones/v2.3-REQUIREMENTS.md`](milestones/v2.3-REQUIREMENTS.md)

**Phase directories (current location):** [`.planning/phases/31-guided-property-entry-ux/`](phases/31-guided-property-entry-ux/) · [`.planning/phases/32-property-save-validation-schema/`](phases/32-property-save-validation-schema/) · [`.planning/phases/33-property-sheet-responsive-accessibility/`](phases/33-property-sheet-responsive-accessibility/) — optional **`/gsd-cleanup`** later.

</details>

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

_Milestone archives: `.planning/milestones/` · **Last shipped:** **v2.3** (2026-05-06). **Active:** **v2.4 Multi-Currency Reporting** — Phases **34–38** — [requirements](REQUIREMENTS.md)._
