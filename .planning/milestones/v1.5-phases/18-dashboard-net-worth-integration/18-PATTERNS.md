# Phase 18 — Pattern Map

**Phase directory:** `.planning/phases/18-dashboard-net-worth-integration/`

## Target file

| New / changed | Role | Closest analog |
|---------------|------|----------------|
| `src/pages/DashboardPage.tsx` | Debt-aware net worth + rows | **Self** — existing category `button` rows (L298–368), `Separator` between rows, `Card` headline |

## Navigation

| Pattern | File | Excerpt / rule |
|---------|------|----------------|
| `onNavigate` + `SectionKey` | `src/pages/DashboardPage.tsx` | `onClick={() => onNavigate(NAV_KEY[key])}` — Total Debt uses `onNavigate('liabilities')` |
| Sidebar key | `src/components/AppSidebar.tsx` | `'liabilities'` already registered (Phase 17) |

## Calculations (import-only)

| Function | File |
|----------|------|
| `sumForNetWorth`, `calcCategoryTotals`, `percentOfTotal` | `src/lib/dashboardCalcs.ts` |
| `sumLiabilitiesInr`, `sumAllDebtInr`, `calcNetWorth`, `debtToAssetRatio` | `src/lib/liabilityCalcs.ts` |
| `roundCurrency` | `src/lib/financials` (snapshot) |

## Styling

| Element | Pattern source |
|---------|----------------|
| Destructive debt value | Project: `text-destructive` on error copy in same file (`snapshotError`) |
| Muted secondary line | `text-sm text-muted-foreground` (`CardDescription` on net worth card) |
| Row button | `hover:bg-muted/50 flex w-full items-center justify-between gap-2 px-4 py-3` (asset rows) |

---

## PATTERN MAPPING COMPLETE
