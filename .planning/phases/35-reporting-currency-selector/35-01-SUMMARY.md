---
phase: 35-reporting-currency-selector
plan: "01"
subsystem: ui
tags: [react, tailwind, forex, vitest, dashboard]

requires:
  - phase: 34-
    provides: LivePricesContext forex legs (usdInr–sgdInr), toReportingCurrency
provides:
  - Native reporting currency select in AppTopbar and MobileTopBar wired to settings.reportingCurrency
  - Dashboard net worth, summaries, breakdown, and allocation ring converted to reporting currency via toReportingCurrency
  - fmtCompactForReporting / splitReportingHero helpers with Vitest coverage
affects:
  - reporting-currency-selector

tech-stack:
  added: []
  patterns:
    - Pure formatters in wealthFormat for INR vs Intl compact currency display
    - Dashboard derives ForexRateSnapshot from LivePricesContext useMemo for stable conversion

key-files:
  created:
    - src/components/ReportingCurrencySelect.tsx
    - src/lib/__tests__/wealthFormat.reporting.test.ts
  modified:
    - src/components/AppTopbar.tsx
    - src/components/MobileTopBar.tsx
    - src/lib/wealthFormat.ts
    - src/pages/DashboardPage.tsx
    - src/components/NetWorthOverTimeCard.tsx

key-decisions:
  - Consolidated net-worth card layout so hero swaps unavailable vs FX while sharing delta and gross/debt rows
  - Allocation ring hidden when INR→reporting FX legs are incomplete (blockFx guard)

patterns-established:
  - formatReportingDash / formatRowReporting helpers for dashboard INR hub conversions

requirements-completed:
  - RC-01
  - RC-02
  - RC-03

duration: 25min
completed: 2026-05-08
---

# Phase 35 Plan 01: Reporting currency selector Summary

**Native six-option reporting `<select>` in desktop and mobile top bars persists `settings.reportingCurrency`; Dashboard headline, delta chip, gross/debt, breakdown rows, and allocation slices rescale via `toReportingCurrency` and live forex snapshot, with “Rate unavailable” plus INR fallback when FX legs are missing.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-08T01:30:00Z
- **Completed:** 2026-05-08T01:37:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- `ReportingCurrencySelect` + top bar placement (Live prices → select → USD/INR on desktop)
- `fmtCompactForReporting` / `splitReportingHero` with reporting Vitest file
- Dashboard conversion path including allocation ring and INR history caption on `NetWorthOverTimeCard`

## Task Commits

1. **35-01-01 — ReportingCurrencySelect + top bars** — `ce61d9c`
2. **35-01-02 / 35-01-03 — Formatters + Dashboard** — `5389b25` (single commit: wealthFormat tests + Dashboard + chart caption)

## Files Created/Modified

- `src/components/ReportingCurrencySelect.tsx` — Controlled `<select>` from `CURRENCY_CODES`, `aria-label="Reporting currency"`
- `src/components/AppTopbar.tsx` — `saveData` updates `reportingCurrency` + `updatedAt`
- `src/components/MobileTopBar.tsx` — Same wiring; `min-h-[44px]` on select
- `src/lib/wealthFormat.ts` — `fmtCompactForReporting`, `splitReportingHero`
- `src/lib/__tests__/wealthFormat.reporting.test.ts` — INR/USD formatting smoke tests
- `src/pages/DashboardPage.tsx` — Reporting conversion for hero, stats, rows, ring; degradation copy
- `src/components/NetWorthOverTimeCard.tsx` — Optional `historyCaption` for non-INR reporting

## Decisions Made

- Reused single card layout for unavailable vs converted hero to avoid duplicating snapshot buttons and gross/debt blocks

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- First `git commit` for wealthFormat hit transient `cannot lock ref HEAD` — subsequent commit bundled formatter + dashboard changes into one commit.

## User Setup Required

None.

## Next Phase Readiness

- Manual UAT: switch to USD → confirm Dashboard rescales; reload → selection persists (RC-03).
- Phase verification via `/gsd-verify-work` or orchestrator verifier step.

## Self-Check: PASSED

- `npm test -- --run` — pass
- `npx tsc -b --pretty false` — pass

---
*Phase: 35-reporting-currency-selector*
*Completed: 2026-05-08*
