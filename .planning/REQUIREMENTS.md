# Personal Wealth Tracker — v2.4 Requirements

**Milestone:** v2.4 — Multi-Currency Reporting  
**Goal:** Allow users to hold assets in any currency (INR, USD, AED, EUR, GBP, SGD) and view all totals in a user-selected reporting currency, converted at live FX rates.  
**Seed:** [SEED-005](seeds/SEED-005-multi-currency-reporting.md) | **Full spec:** `docs/multi-currency.md`  
**Started:** 2026-05-08  
**Status:** Active

---

## v2.4 Requirements

### FX Infrastructure

- [x] **FX-01**: User can view converted totals using live EUR/INR, GBP/INR, and SGD/INR rates fetched from the FX feed (USD/INR and AED/INR already exist)
- [x] **FX-02**: System converts per-record amounts via `displayValue = originalValue × rate_to_reporting_currency`
- [x] **FX-03**: When a required FX rate is unavailable, the app shows the original currency value only with a "Rate unavailable" hint (no crash, no silent zero)

### Reporting Currency Selector

- [x] **RC-01**: User can select their reporting currency (INR, USD, AED, EUR, GBP, SGD) from a dropdown in the topbar
- [x] **RC-02**: Switching reporting currency recalculates all net worth aggregates, category totals, and breakdown rows in real time
- [x] **RC-03**: User's reporting currency preference is persisted in settings (not session-only; survives page reload)

### Data Model

- [x] **DM-01**: Every asset and liability record supports an optional `currency` field (defaults to reporting currency if absent)
- [x] **DM-02**: The settings schema gains a `reportingCurrency` field (default `"INR"`)
- [x] **DM-03**: Schema version is bumped; migration applies default `currency` values to existing records on load without data loss

### Asset Pages

- [ ] **AP-01**: Gold, MF, Stocks, Bank Savings, Retirement, Bitcoin, Commodities, Property, and Liabilities add/edit forms include a currency dropdown (INR, USD, AED, EUR, GBP, SGD)
- [ ] **AP-02**: App stores the original amount in the original currency; it never overwrites stored values with converted figures

### Display

- [x] **DSP-01**: Dashboard breakdown rows show reporting currency value as the primary number (bold); when the underlying record uses a different currency, the original amount appears below in smaller muted text
- [ ] **DSP-02**: Asset detail pages (MF platforms, stock brokers, bank accounts, gold holdings table, etc.) follow the same dual-currency display pattern as the dashboard
- [x] **DSP-03**: When record currency equals reporting currency, the secondary muted line is hidden entirely

### Settings Live Rates

- [x] **SET-01**: The Settings live rates card extends to show all supported FX pairs (EUR/INR, GBP/INR, SGD/INR alongside existing USD/INR, AED/INR)
- [x] **SET-02**: Session-only manual rate override covers the new EUR, GBP, and SGD currency pairs

### Snapshots

- [x] **SNP-01**: Net worth snapshots record the active reporting currency at time of capture
- [x] **SNP-02**: Net worth snapshots record the FX rates used at capture time so historical snapshot values remain meaningful when rates change later

### Export / Import

- [x] **EXP-01**: Zip export preserves the `currency` field on all asset and liability records
- [x] **EXP-02**: Zip import respects `currency` fields on all records (does not strip or overwrite them on load)

---

## Future Requirements (deferred)

- Mobile topbar reporting currency as compact badge/chip (opens same selector) — defer to a UX polish milestone
- Import-adjusted bullion pricing extended to non-INR reporting currencies
- Per-category FX rate override (e.g. manual EUR/INR for users without live EUR feed)

## Out of Scope

- Tax reporting in any currency — out of scope per prior milestones
- First-class AED display column — INR remains primary (AED is a record-level currency, not a second primary)
- User auth or cloud sync — deferred per v2.0 decision
- PDF/CSV statement import for MF/stocks — tracked in SEED-003

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| FX-01  | 34    | — |
| FX-02  | 34    | — |
| FX-03  | 34    | — |
| DM-01  | 34    | — |
| DM-02  | 34    | — |
| DM-03  | 34    | — |
| RC-01  | 35    | — |
| RC-02  | 35    | — |
| RC-03  | 35    | — |
| DSP-01 | 36    | — |
| DSP-03 | 36    | — |
| AP-01  | 37    | — |
| AP-02  | 37    | — |
| DSP-02 | 37    | — |
| SET-01 | 38    | — |
| SET-02 | 38    | — |
| SNP-01 | 38    | — |
| SNP-02 | 38    | — |
| EXP-01 | 38    | — |
| EXP-02 | 38    | — |
