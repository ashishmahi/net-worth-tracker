---
phase: 18
slug: dashboard-net-worth-integration
status: approved
shadcn_initialized: true
source: context-sync
reviewed_at: 2026-05-02
---

# Phase 18 — UI Design Contract

> Visual and interaction contract for **Dashboard debt integration** in `DashboardPage.tsx`. No new pages; extends existing `Card` / `Separator` / row-button patterns from Phase 17 and current dashboard.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (existing: zinc, `cssVariables`) |
| Components | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Separator`, `Skeleton`, `Button` (unchanged stack) |
| Icon library | lucide-react (no new icons required for debt row) |

---

## Net Worth Card (headline)

| Element | Spec |
|--------|------|
| Primary figure | **Net worth** in INR — `calcNetWorth(grossAssets, sumLiabilitiesInr(data))` — same `inrNoDecimals` as today; may be negative |
| Secondary line (conditional) | Only when `sumAllDebtInr(data) > 0` — one line **below** the main figure, `text-sm text-muted-foreground` |
| Ratio copy | Short label + percentage, e.g. `Debt-to-asset ratio: 12%` (exact wording: **Debt-to-asset ratio:** + `debtToAssetRatio(sumAllDebtInr(data), grossAssets)` + `%`, 0% when no assets) |
| Loading | Unchanged: `Skeleton` for headline when `showNetWorthSkeleton` |

---

## Category Breakdown Card

| Element | Spec |
|--------|------|
| Asset rows | Unchanged grid: label, value, `%` — **% denominator is gross assets** (`sumForNetWorth(totals)`), not net worth |
| `%` column guard | Use **`grossAssets <= 0`** (not net worth) to show `—` for percentages |
| Separator | `<Separator />` between last asset row and Total Debt row |
| Total Debt row (conditional) | Only when `sumAllDebtInr(data) > 0` |
| Label | **Total Debt** (preferred) |
| Value | Positive INR figure (`inrNoDecimals(sumAllDebtInr(data))`) — **not** negated; **semantic color** `text-destructive` or `text-destructive/80` (match existing destructive usage elsewhere) |
| Interaction | `<button type="button">` — full-width row, same `hover:bg-muted/50` + padding as asset rows; **`onClick` → `onNavigate('liabilities')`** |
| `%` cell | Empty — show **—** or leave blank per CONTEXT |
| `aria-label` | e.g. `Open Liabilities section` or `View liabilities` |

---

## Snapshot Button

| Behavior | Spec |
|----------|------|
| Value stored | `roundCurrency(calcNetWorth(grossAssets, sumLiabilitiesInr(data)))` — **not** `sumForNetWorth(totals)` |
| Historical rows | Appended snapshot only; past points unchanged |

---

## Empty State Gate

| Rule | Spec |
|------|------|
| `noHoldingsYet` | Also **false** when `data.liabilities.length > 0` — user with loans but no assets sees full dashboard (₹0 gross, negative net worth, debt UI as applicable) |

---

## Copywriting Lock

- Total Debt label: **Total Debt**
- Ratio: **Debt-to-asset ratio:** prefix (see Net Worth Card)

---

*Phase: 18-dashboard-net-worth-integration · UI-SPEC from 18-CONTEXT.md*
