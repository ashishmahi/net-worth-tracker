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
- ✅ **v2.2 — Import-adjusted bullion pricing** — Shipped 2026-05-06 — [REQUIREMENTS.md](REQUIREMENTS.md) · Phases **29–30** (below)

**Phase numbering:** **v2.1** ended at Phase **28**. **v2.2** continues with Phases **29–30**.

---

## v2.2 — Import-adjusted bullion pricing (Phases 29–30)

**Goal:** Apply configurable **import-style uplift** (~10% gold / ~8% silver defaults per [SEED-001](seeds/SEED-001-gold-silver-import-tax-inr.md)) when deriving live ₹/g from international spot × USD/INR, so hints and dependent valuations read closer to **Indian market-style** expectations—with explicit **non-advice** copy.

### Phase 29: Bullion import uplift — data & calculations

**Goal:** Schema + migration for uplift factors; extend `goldLiveHints` / `silverLiveHints`, sync components, and effective net-worth paths; Vitest.

**Requirements:** BLN-01, BLN-02, BLN-03, BLN-05

### Phase 30: Bullion import uplift — settings UX & disclosure

**Goal:** Settings gold/silver cards: tuning affordances as needed; prominent approximation / not-tax-advice messaging.

**Requirements:** BLN-04

| Phase | Name | Goal (summary) | Requirements |
|-------|------|----------------|--------------|
| **29** | Bullion import uplift — data & calculations | Schema + migration for uplift factors; extend `goldLiveHints` / `silverLiveHints`, sync components, and effective net-worth paths; Vitest | BLN-01, BLN-02, BLN-03, BLN-05 |
| **30** | Bullion import uplift — settings UX & disclosure | Settings gold/silver cards: tuning affordances as needed; prominent approximation / not-tax-advice messaging | BLN-04 |

### Success criteria

**Phase 29**

1. With healthy feeds, unlocked gold/silver pricing shows ₹/g that matches parity × (1 + uplift) for configured defaults (within rounding rules).
2. Older `localStorage` payloads load without error; new fields default sensibly and round-trip through export/import paths used by the app.
3. Automated tests fail if uplift math or migration regressions slip in.

**Phase 30**

1. A user can discover **what** the uplift is and **that** it is tunable (when controls exist) from Settings alone.
2. Copy states clearly that the feature is an approximation—not legal, customs, or tax guidance.

### Plans

- [x] [`29-01-PLAN.md`](phases/29-bullion-import-uplift-data-calculations/29-01-PLAN.md) — bullion uplift schema, math, sync, dashboard
- [x] [`30-01-PLAN.md`](phases/30-bullion-import-uplift-settings-ux-disclosure/30-01-PLAN.md) — Settings disclosure + ballpark uplift copy (**BLN-04**)

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

_Milestone archives: `.planning/milestones/` · **Current:** **v2.2** — Phases **29–30** (import-adjusted bullion pricing)._
