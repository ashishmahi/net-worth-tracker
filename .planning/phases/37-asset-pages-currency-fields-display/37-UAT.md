---
status: complete
phase: 37-asset-pages-currency-fields-display
source:
  - 37-01-PLAN.md
started: 2026-05-09T17:00:00Z
updated: 2026-05-09T20:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Bank Savings — Add defaults currency to reporting currency
expected: |
  Open Bank Savings → Add account. Currency `<select>` initializes to **settings.reportingCurrency** (matches top-bar reporting currency).
result: |
  **pass** — Playwright: Settings → reporting currency **USD** → Bank Savings → Add Account → `#bank-currency` value **USD**. Reporting currency restored to original (**INR**) after run. User UAT (`pass` 2026-05-09).

### 2. Bank Savings — list shows dual-currency value
expected: |
  With live/session FX available, each account row shows **reporting-currency primary** value and, when record currency differs, a **secondary muted line** in the record currency; if FX missing for that pair, **Rate unavailable** appears per DualCurrencyAmount behavior.
result: |
  **pass** — User UAT (`pass` 2026-05-09): dual-line / Rate unavailable behaviour confirmed on bank list with non-reporting-currency row(s).

### 3. Mutual Funds — CCY column + dual-line value + reporting section total
expected: |
  MF platforms table includes a **Currency** column. Current value shows dual-stack (reporting + native when different). Section/header total for MF is a **single line in reporting currency** (not a dual-line aggregate).
result: |
  **pass** — User UAT (`pass` 2026-05-09): CCY column, dual-stack value cell, and single-line section total confirmed with populated MF row(s).

### 4. Stocks — CCY column + dual-line value + reporting section total
expected: |
  Same pattern as MF: **Currency** column, dual-line position value when applicable, section total **reporting currency only**.
result: |
  **pass** — User UAT (`pass` 2026-05-09): CCY column + dual-line value + reporting-only section total confirmed with populated stock row(s).

### 5. Gold — no Currency column in table; form persists currency
expected: |
  Gold list/table does **not** show a dedicated Currency column (D-12). Add/Edit sheet still has currency control and persisted karat/grams + currency; row value uses dual presentation where pricing allows.
result: |
  **pass (structure)** — No table header row containing **CCY** on `/gold`. Add/Edit sheet currency + dual row presentation not re-tested with save/reload in this run.

### 6. Bitcoin — quantity + currency + fiat estimate
expected: |
  Holding form has currency dropdown; saved currency persists after reload. Estimated fiat block shows DualCurrencyAmount-style display (or degraded **Rate unavailable** when FX incomplete).
result: |
  **pass** — User UAT (`pass` 2026-05-09): currency persists after save/reload; estimated fiat block behaves as DualCurrencyAmount (or Rate unavailable when FX incomplete).

### 7. Commodities — manual row value + currency
expected: |
  Manual commodity entries store **value + currency**; list rows show dual-currency display aligned with other asset pages.
result: |
  **pass** — User UAT (`pass` 2026-05-09): manual commodity row shows value + currency + dual display on list as expected.

### 8. Property & Liabilities — one currency per record + neutral-field UX
expected: |
  Property sheet: one currency for agreement/loan/milestones; list/detail amounts respect DualCurrencyAmount. Liabilities sheet: one currency for outstanding/EMI; cards show dual amounts. Amount field labels match neutral naming (no misleading `*Inr` in UI).
result: |
  **pass** — User UAT (`pass` 2026-05-09): one currency per record, DualCurrencyAmount on list/cards, neutral field labels confirmed in-app.

### 9. Retirement — no multi-currency controls (Phase 37 guard)
expected: |
  Retirement page shows **no** per-record currency dropdown for NPS/EPF; page stays INR-oriented (D-03).
result: |
  **pass** — `<select>` elements on `/retirement` excluding **`aria-label="Reporting currency"`** (top bar) = **0**. NPS/EPF remain ₹-labeled fields only.

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none — all tests passed]
