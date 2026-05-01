# Requirements: Personal Wealth Tracker

**Defined:** 2026-05-01
**Core Value:** See total net worth in INR at a glance — with all liabilities deducted, live prices where applicable, and minimal repeated data entry.

## v1.5 Requirements

### Data Model & Migration

- [x] **DEBT-01**: `LiabilityItemSchema` defined with `id`, `label`, `lender`, `outstandingInr`, `emiInr`, `loanType` (home/car/personal/other), `createdAt`, `updatedAt`
- [x] **DEBT-02**: `liabilities: LiabilityItem[]` added at `DataSchema` root (peer of `assets`, not inside it)
- [x] **DEBT-03**: `ensureLiabilities()` migration ensures old `data.json` loads with `liabilities: []` without error
- [x] **DEBT-04**: `createInitialData()` includes `liabilities: []`; `DataSchema.safeParse(createInitialData())` passes
- [x] **DEBT-05**: `NetWorthPointSchema.totalInr` relaxed from `z.number().nonneg()` to `z.number()` to support debt > assets

### Calculation Utilities

- [x] **CALC-01**: `sumLiabilitiesInr(data)` returns sum of all standalone liability `outstandingInr` values
- [x] **CALC-02**: `sumAllDebtInr(data)` returns sum of property `outstandingLoanInr` values + `sumLiabilitiesInr(data)` (display only — no double-counting in net worth)
- [x] **CALC-03**: `calcNetWorth(grossAssets, liabilitiesTotal)` = gross assets − standalone liabilities (new headline net worth function)
- [x] **CALC-04**: `debtToAssetRatio(totalDebt, grossAssets)` returns percentage; handles division by zero (grossAssets = 0 → 0%)

### Property Liability Enrichment

- [x] **PROP-01**: Property form adds optional `lender` field when liability is toggled on
- [x] **PROP-02**: Property form adds optional `emiInr` field when liability is toggled on
- [x] **PROP-03**: Property form shows disambiguation hint pointing users to Liabilities page for standalone loan tracking

### Liabilities Page

- [ ] **LIAB-01**: User can add a standalone loan (label, lender, outstanding balance, EMI, loan type)
- [ ] **LIAB-02**: User can edit an existing loan entry
- [ ] **LIAB-03**: User can delete a loan entry
- [ ] **LIAB-04**: Each loan entry displays a `loanType` badge (Home / Car / Personal / Other)
- [ ] **LIAB-05**: Empty state shown when no loans exist, with prompt to add first loan
- [ ] **LIAB-06**: Page shows disambiguation copy: home loans tied to a property should use the property's liability section

### Dashboard & Net Worth

- [ ] **DASH-01**: Dashboard headline net worth uses `calcNetWorth()` (gross assets − standalone liabilities)
- [ ] **DASH-02**: Dashboard shows a Total Debt row with `sumAllDebtInr()` linking to the Liabilities page
- [ ] **DASH-03**: Dashboard shows Debt-to-Asset ratio from `debtToAssetRatio()`
- [ ] **DASH-04**: New net worth snapshots record `calcNetWorth()` result (historical snapshots unchanged)

### Import / Reset / Nav

- [x] **INFRA-01**: Import from JSON handles `liabilities` array (validated via `DataSchema`; migration runs before parse)
- [x] **INFRA-02**: Data reset (`createInitialData()`) clears liabilities list
- [ ] **INFRA-03**: Liabilities added to sidebar navigation

## Future Requirements

### Payoff Tracking

- **PAY-01**: Loan payoff projection with interest rate + tenure
- **PAY-02**: Months-to-payoff countdown per loan
- **PAY-03**: Amortization schedule view

### Extended Debt Types

- **EXT-01**: Credit card balance tracking (revolving credit model)
- **EXT-02**: Gold loan (loan against gold asset)
- **EXT-03**: Multi-currency loan support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payoff projection / amortization | Requires interest rate + tenure; higher complexity; deferred to future milestone |
| Credit card tracking | Different payment model (revolving); out of scope for v1.5 |
| Multi-currency loans | INR-only is correct for target user; adds unnecessary complexity |
| Tax reporting on debt | Out of scope across all milestones |
| Unifying property liability into standalone liabilities list | Property equity calc (`agreementInr - outstandingLoanInr`) would break; deferred |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEBT-01 | Phase 14 | Complete |
| DEBT-02 | Phase 14 | Complete |
| DEBT-03 | Phase 14 | Complete |
| DEBT-04 | Phase 14 | Complete |
| DEBT-05 | Phase 14 | Complete |
| CALC-01 | Phase 15 | Complete |
| CALC-02 | Phase 15 | Complete |
| CALC-03 | Phase 15 | Complete |
| CALC-04 | Phase 15 | Complete |
| PROP-01 | Phase 16 | Complete |
| PROP-02 | Phase 16 | Complete |
| PROP-03 | Phase 16 | Complete |
| LIAB-01 | Phase 17 | Pending |
| LIAB-02 | Phase 17 | Pending |
| LIAB-03 | Phase 17 | Pending |
| LIAB-04 | Phase 17 | Pending |
| LIAB-05 | Phase 17 | Pending |
| LIAB-06 | Phase 17 | Pending |
| INFRA-03 | Phase 17 | Pending |
| DASH-01 | Phase 18 | Pending |
| DASH-02 | Phase 18 | Pending |
| DASH-03 | Phase 18 | Pending |
| DASH-04 | Phase 18 | Pending |
| INFRA-01 | Phase 14 | Complete |
| INFRA-02 | Phase 14 | Complete |

**Coverage:**
- v1.5 requirements: 25 total
- Mapped to phases: 25 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-01*
*Last updated: 2026-05-01 — traceability filled after roadmap creation*
