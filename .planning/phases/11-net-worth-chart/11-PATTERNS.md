# Phase 11 — Pattern map (PATTERNS.md)

## PATTERN MAPPING COMPLETE

| Planned touch | Role | Closest analog | Notes |
|---------------|------|----------------|-------|
| New chart section on Dashboard | Page composition + Card | `DashboardPage.tsx` — existing `Card` for net worth + category table | Insert between snapshot controls and category `Card`; `space-y-4` page rhythm. |
| Currency display | Formatting | `inrNoDecimals()` in `DashboardPage.tsx` | Tooltip/Y ticks should align with **en-IN** INR style per CLAUDE.md / dashboard. |
| Theme tokens | CSS variables | `src/index.css` `:root` / `.dark` | After `shadcn add chart`, **`--chart-1`** (etc.) must exist in both themes. |
| Read-only history | Props | `data.netWorthHistory` already on `AppData` | No new context API; pass slice or read inside child component. |

### Excerpt — Dashboard Card stack (integration anchor)

```tsx
// src/pages/DashboardPage.tsx — category Card follows snapshot block; chart belongs between them when !empty
<Card>
  <CardContent className="p-0">
    {DASHBOARD_CATEGORY_ORDER.map(/* ... */)}
  </CardContent>
</Card>
```

### Excerpt — snapshot append (data shape consumer)

```tsx
netWorthHistory: [
  ...data.netWorthHistory,
  { recordedAt: new Date().toISOString(), totalInr },
],
```

Planner: chart **sorts** for display only; does not mutate `data.json`.
