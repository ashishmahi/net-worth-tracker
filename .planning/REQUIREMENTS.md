# Requirements: Personal Wealth Tracker — Milestone v2.2

**Defined:** 2026-05-05  
**Core value:** Total net worth in INR at a glance with live bullion hints where applicable — uplift modeling must stay honest (approximation, not tax advice).

## v2.2 Requirements

Requirements for **v2.2 — Import-adjusted bullion pricing**. Each maps to one roadmap phase.

### Bullion import uplift (parity → landed-style INR)

- [x] **BLN-01**: Live-derived **gold** ₹/g (pure and per-karat) applies a configurable **import-style uplift** after spot×forex parity math, using a default consistent with SEED-001 (~10%) unless the user overrides.

- [x] **BLN-02**: Live-derived **silver** ₹/g applies a configurable uplift after spot×forex parity math, with a default consistent with SEED-001 (~8%) unless the user overrides.

### Data model & persistence

- [x] **BLN-03**: **Settings** persist optional gold and silver uplift inputs (percentages or equivalent) with **safe defaults**, **migration** from older saves that omit these fields, and serialization compatible with existing import/export flows.

### Product UX & disclosure

- [ ] **BLN-04**: **Settings** gold/silver pricing surfaces explain what the uplift represents, expose tuning when required by implementation, and include visible copy that figures are **approximate** and **not legal or tax advice**.

### Verification

- [x] **BLN-05**: **Vitest** (and existing project test patterns) cover uplift math, defaults/migration, and critical paths where uplifted ₹/g feeds hints, sync, or net-worth calculations.

## Future requirements

Deferred; not part of v2.2 roadmap.

### Export & reporting

- **EXP-F01**: CSV/PDF export of holdings or history — JSON/zip backup exists; richer formats later.

### Other seeds (not selected)

- **SEED-002** … **SEED-006** remain in [`.planning/seeds/`](seeds/) for future milestones.

## Out of scope

| Item | Reason |
|------|--------|
| Exact customs/duty computation for India | Policy varies; app uses **user-tunable approximation** only |
| Backend or authoritative spot/auth feeds beyond existing APIs | Unchanged architecture |
| Changing locked manual gold/silver prices without user action | User-controlled overrides preserved |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BLN-01 | Phase 29 — Bullion import uplift: data & calculations | Complete |
| BLN-02 | Phase 29 — Bullion import uplift: data & calculations | Complete |
| BLN-03 | Phase 29 — Bullion import uplift: data & calculations | Complete |
| BLN-05 | Phase 29 — Bullion import uplift: data & calculations | Complete |
| BLN-04 | Phase 30 — Bullion import uplift: settings UX & disclosure | Pending |

**Coverage:**

- v2.2 requirements: **5** total  
- Mapped to phases: **5**  
- Unmapped: **0**

---
*Requirements defined: 2026-05-05*  
*Last updated: 2026-05-05 — roadmap creation (`/gsd-new-milestone` SEED-001)*
