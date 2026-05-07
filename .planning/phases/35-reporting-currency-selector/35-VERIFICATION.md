---
phase: 35-reporting-currency-selector
status: passed
verified: 2026-05-08
---

# Phase 35 verification — Reporting currency selector

## Goal (from roadmap)

**RC-01–RC-03:** Native reporting currency control in top chrome; Dashboard aggregates reflect selected currency using live FX; choice persists in settings.

## Requirement traceability

| ID | Evidence |
|----|----------|
| RC-01 | `ReportingCurrencySelect.tsx`: native `<select>`, `CURRENCY_CODES`, labels D-04; `AppTopbar` / `MobileTopBar` wire `saveData` + `updatedAt` |
| RC-02 | `DashboardPage.tsx`: `forexSnapshot` from `useLivePrices`, `toReportingCurrency`, `fmtCompactForReporting`, hero/breakdown/ring conversion; `Rate unavailable` + INR fallback paths |
| RC-03 | Settings path `reportingCurrency` + `nowIso()` on change (same mechanism as other settings persistence) |

## Automated checks

- `npx tsc -b --pretty false` — **pass**
- `npm test -- --run` — **141 passed** (includes `wealthFormat.reporting.test.ts`)
- Plan acceptance greps (`toReportingCurrency`, `fmtCompactForReporting`, `ForexRateSnapshot`, `Rate unavailable`) — **pass**

## Must-haves (from plan frontmatter)

| Truth | Result |
|-------|--------|
| Native `<select>` only; six currency options | `ReportingCurrencySelect` iterates `CURRENCY_CODES` |
| Top bar placement / 44px mobile | Desktop order Live prices → select → USD/INR; mobile `min-h-[44px]` on select |
| `saveData` updates `reportingCurrency` and `updatedAt` | Both top bars |
| Dashboard uses `toReportingCurrency` + live snapshot | `forexSnapshot` useMemo; conversions on monetary displays |
| `rate_unavailable` → hint, no throw | Hero, rows, gross/debt use degraded branches |

## Human verification

1. Select **USD** on Dashboard — figures rescale without navigation.
2. Reload — **USD** remains selected (**RC-03**).

## Notes

Schema drift gate (`verify.schema-drift 35`) — **valid** (no blocking drift).
