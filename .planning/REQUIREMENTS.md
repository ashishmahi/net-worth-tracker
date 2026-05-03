# Requirements: Personal Wealth Tracker — Milestone v2.0.1

**Defined:** 2026-05-03  
**Core value:** See total net worth in INR with live prices where applicable; gold should use the same **fetch + context** pattern as silver, with **manual** saved prices still under user control.

## v2.0.1 Requirements

### Live spot (API & context)

- [ ] **SPOT-01**: App fetches **gold spot USD per troy ounce** from **gold-api.com** (e.g. **`/price/XAU`**) with response validation **consistent** with `fetchSilverUsdPerOz` (non-positive / shape errors throw).  
- [ ] **SPOT-02**: Client TTL for gold matches the **silver** channel (`GOLD_TTL_MS` same as `SILVER_TTL_MS` unless a comment documents an exception).  
- [ ] **SPOT-03**: `LivePricesContext` exposes **`goldUsdPerOz`**, **loading**, **error**, and includes gold in **`refetch`** and the same **stale-refresh** strategy as silver (mount, interval, visibility).  

### Product UX (hints)

- [ ] **UX-01**: When **gold spot** and **USD→INR** are available, the UI shows **read-only live ₹/gram hints** for **24K, 22K, and 18K**, derived from spot using **`TROY_OZ_TO_GRAMS`** and standard purity ratios (**22/24**, **18/24**). Primary placement: **Settings → Gold Prices**; **Gold** page may repeat hints for consistency.  
- [ ] **UX-02**: If spot or forex is missing or errored, the UI shows **loading / error** affordances **consistent with** existing live-price patterns (e.g. silver on Commodities, Session rates on Settings).  
- [ ] **UX-03**: Persisted **`settings.goldPrices`** remains the **source of truth** for saved values unless the phase plan explicitly adds an **apply-live** action; if added, it must be **deliberate** (user-triggered) and must not silently overwrite on every load.  

### Calculations & tests

- [ ] **CALC-01**: Shared helper(s) compute **INR per gram** from **USD/oz** and **`usdInr`** for each karat, **rounded** consistently with `roundCurrency` / existing commodity math.  
- [ ] **TEST-01**: Unit tests cover **gold API parse**, **derivation math**, and any new exports used by dashboard or Settings.  

## Future requirements (deferred)

- Optional: use live-derived gold prices **automatically** in `sumGoldInr` when `goldPrices` is absent (would change net-worth semantics — defer unless explicitly requested).  
- Additional commodities beyond gold/silver via gold-api.com.

## Out of scope

| Item | Reason |
|------|--------|
| Backend proxy for metal prices | Client-only app; same CORS assumptions as silver. |
| Historical gold charts | Snapshot/chart milestones handled separately. |
| Non-INR primary display for gold | INR remains primary per project constraints. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SPOT-01 | Phase 26 | Pending |
| SPOT-02 | Phase 26 | Pending |
| SPOT-03 | Phase 26 | Pending |
| UX-01 | Phase 26 | Pending |
| UX-02 | Phase 26 | Pending |
| UX-03 | Phase 26 | Pending |
| CALC-01 | Phase 26 | Pending |
| TEST-01 | Phase 26 | Pending |

**Coverage:** v2.0.1 requirements: **8** total · mapped to phases: **8** · unmapped: **0**

---
*Requirements defined: 2026-05-03 · Milestone v2.0.1*
