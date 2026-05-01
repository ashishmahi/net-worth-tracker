# Requirements: Personal Wealth Tracker

**Defined:** 2026-05-01
**Core Value:** See total net worth in INR at a glance — with all liabilities deducted, live prices where applicable, and minimal repeated data entry.

## v1.5 Requirements

### Data Model & Migration

- [ ] **DEBT-01**: `LiabilityItemSchema` defined with `id`, `label`, `lender`, `outstandingInr`, `emiInr`, `loanType` (home/car/personal/other), `createdAt`, `updatedAt`
- [ ] **DEBT-02**: `liabilities: LiabilityItem[]` added at `DataSchema` root (peer of `assets`, not inside it)
- [ ] **DEBT-03**: `ensureLiabilities()` migration ensures old `data.json` loads with `liabilities: []` without error
- [ ] **DEBT-04**: `createInitialData()` includes `liabilities: []`; `DataSchema.safeParse(createInitialData())` passes
- [ ] **DEBT-05**: `NetWorthPointSchema.totalInr` relaxed from `z.number().nonneg()` to `z.number()` to support debt > assets

### Calculation Utilities

- [ ] **CALC-01**: `sumLiabilitiesInr(data)` returns sum of all standalone liability `outstandingInr` values
- [ ] **CALC-02**: `sumAllDebtInr(data)` returns sum of property `outstandingLoanInr` values + `sumLiabilitiesInr(data)` (display only — no double-counting in net worth)
- [ ] **CALC-03**: `calcNetWorth(grossAssets, liabilitiesTotal)` = gross assets − standalone liabilities (new headline net worth function)
- [ ] **CALC-04**: `debtToAssetRatio(totalDebt, grossAssets)` returns percentage; handles division by zero (grossAssets = 0 → 0%)

### Property Liability Enrichment

- [ ] **PROP-01**: Property form adds optional `lender` field when liability is toggled on
- [ ] **PROP-02**: Property form adds optional `emiInr` field when liability is toggled on
- [ ] **PROP-03**: Property form shows disambiguation hint pointing users to Liabilities page for standalone loan tracking

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

- [ ] **INFRA-01**: Import from JSON handles `liabilities` array (validated via `DataSchema`; migration runs before parse)
- [ ] **INFRA-02**: Data reset (`createInitialData()`) clears liabilities list
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
| DEBT-01 | — | Pending |
| DEBT-02 | — | Pending |
| DEBT-03 | — | Pending |
| DEBT-04 | — | Pending |
| DEBT-05 | — | Pending |
| CALC-01 | — | Pending |
| CALC-02 | — | Pending |
| CALC-03 | — | Pending |
| CALC-04 | — | Pending |
| PROP-01 | — | Pending |
| PROP-02 | — | Pending |
| PROP-03 | — | Pending |
| LIAB-01 | — | Pending |
| LIAB-02 | — | Pending |
| LIAB-03 | — | Pending |
| LIAB-04 | — | Pending |
| LIAB-05 | — | Pending |
| LIAB-06 | — | Pending |
| DASH-01 | — | Pending |
| DASH-02 | — | Pending |
| DASH-03 | — | Pending |
| DASH-04 | — | Pending |
| INFRA-01 | — | Pending |
| INFRA-02 | — | Pending |
| INFRA-03 | — | Pending |

**Coverage:**
- v1.5 requirements: 25 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 25 ⚠️

---
*Requirements defined: 2026-05-01*
*Last updated: 2026-05-01 after initial definition*
