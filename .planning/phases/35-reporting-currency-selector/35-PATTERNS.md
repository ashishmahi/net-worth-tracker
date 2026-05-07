# Phase 35 — Pattern Map

| Planned touch | Role | Closest analog | Excerpt / pattern |
|---------------|------|----------------|-------------------|
| Topbar + mobile control | Settings mutation + presentational | `BankSavingsPage.tsx` | `useAppData()`, `toReportingCurrency`, `data.settings.reportingCurrency ?? 'INR'` |
| Rate snapshot for conversion | Bridge context → pure fn | `BankSavingsPage.tsx` | Build `{ usdInr, aedInr, eurInr, gbpInr, sgdInr }` from **`useLivePrices()`** into **`ForexRateSnapshot`** |
| Persist settings | localStorage | `AppDataContext.tsx` **`saveData`** | Spread **`settings`**, set **`updatedAt`** via **`nowIso()`** from **`@/lib/financials`** |
| Compact money display | Formatting | `src/lib/wealthFormat.ts` | **`fmtCompactInr`** — extend or add sibling for **`Intl`** non-INR |
| Dashboard INR totals | Source of truth unchanged | `dashboardCalcs.ts` **`calcCategoryTotals`** | Convert **outputs** only at **`DashboardPage`** for Phase 35 |

## PATTERN MAPPING COMPLETE
