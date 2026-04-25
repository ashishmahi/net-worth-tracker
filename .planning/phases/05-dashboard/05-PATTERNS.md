# Phase 05 — Pattern map

Analogs for new/updated files (closest existing code and role).

| Planned area | Role | Closest analog | Excerpt / pattern to mirror |
|--------------|------|----------------|----------------------------|
| `src/lib/dashboardCalcs.ts` | Pure INR aggregation | `src/pages/BankSavingsPage.tsx` section total reduce | `roundCurrency` after every add; branch `currency === 'INR'` vs AED with `aedInr` null guard |
| Gold valuation | `grams × goldPrices[k24\|k22\|k18]` | `src/pages/GoldPage.tsx` | Karat → key map `24→k24`; return `null` if `settings.goldPrices` missing when items exist (match Gold empty handling) |
| Property equity | Per-item + sum | `05-CONTEXT` D-01 + `PropertyPage` mental model | `hasLiability` ? `roundCurrency(agreementInr - (outstandingLoanInr ?? 0))` : `agreementInr` |
| Bitcoin INR | Live prices | `src/pages/BitcoinPage.tsx` | `roundCurrency(quantity * btcUsd * usdInr)`; `null` if `btcUsd` or `usdInr` null |
| `DashboardPage` layout | Card + list-in-card + Separator | `src/pages/BankSavingsPage.tsx` | `Card` + `CardContent p-0` + row `<button>` + `Separator` between rows |
| Loading / error | Skeleton + `—` | `05-RESEARCH` Pattern 4–5, `skeleton.tsx` | Row-level Skeleton for BTC/forex-dependent rows; total card Skeleton when `btcLoading \|\| forexLoading` per D-06 |
| `App.tsx` navigation | Special-case one page with props | N/A (new) | `activeSection === 'dashboard' ? <DashboardPage onNavigate={setActiveSection} /> : <ActivePage />` — do **not** add props to `SECTION_COMPONENTS` map type |
| `aria` + `en-IN` currency | Accessibility + formatting | `BankSavingsPage.tsx` | `toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`; row `aria-label` = `Open {label} section` per `05-UI-SPEC` |

**Rule:** `dashboardCalcs.ts` stays free of React hooks; `DashboardPage` composes `useAppData` + `useLivePrices` + `useMemo` for totals.

---

## PATTERN MAPPING COMPLETE
