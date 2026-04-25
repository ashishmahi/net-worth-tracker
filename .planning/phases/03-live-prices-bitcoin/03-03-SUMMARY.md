---
phase: 03-live-prices-bitcoin
plan: 03
subsystem: ui
tags: zod, migration, bank, aed

requires:
  - phase: 03-01
    provides: useLivePrices aedInr
provides:
  - BankAccount currency INR|AED with native balance
  - Load-time migration from balanceInr
  - BankSavingsPage currency radios, AED INR equivalent, section total in INR
affects: []

tech-stack:
  added: []
  patterns:
    - "Radio group for currency where shadcn Select is absent"
    - "Section total skips AED→INR when rate missing with visible error"

key-files:
  created: []
  modified:
    - src/types/data.ts
    - src/context/AppDataContext.tsx
    - src/pages/BankSavingsPage.tsx

key-decisions:
  - "AED rows excluded from total when aedInr null; destructive alert explains session/live rate need"

requirements-completed:
  - D-11
  - D-12

duration: 25min
completed: 2026-04-25
---

# Phase 03 Plan 03: Bank AED + migration Summary

**Zod bank model uses native `balance` + `currency`, legacy JSON migrates `balanceInr`→INR before parse, and Bank Savings totals INR using effective `aedInr` with clear UX when the rate is missing.**

## Task Commits

1. **Task 1: Schema** + **Task 2: Migration** — `b08aede` (schema + `migrateLegacyBankAccounts` in AppDataContext)
2. **Task 3: BankSavingsPage** — `0856d4c`

## Verification

- `npx tsc --noEmit` → 0
- `grep "fetch(" src/pages/BankSavingsPage.tsx` → no matches

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED
