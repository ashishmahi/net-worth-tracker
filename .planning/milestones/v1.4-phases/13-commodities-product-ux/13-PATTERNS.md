# Phase 13 — Pattern map

## PATTERN MAPPING COMPLETE

| Intended artifact | Role | Closest analog | Notes |
|-------------------|------|----------------|-------|
| `CommoditiesPage.tsx` | List + sheet CRUD | `src/pages/GoldPage.tsx` | Same sheet open/reset pattern; array at `data.assets.otherCommodities.items` |
| Section registration | Nav + routing | `src/pages/MutualFundsPage.tsx`, `App.tsx` | Add `SectionKey` + `SECTION_COMPONENTS` entry |
| Dashboard row target | `NAV_KEY` | `src/pages/DashboardPage.tsx` lines 40–48 | Change `otherCommodities` mapping from `settings` to new key |

### Code excerpts (reference)

- **Gold sheet + submit:** `GoldPage.tsx` — `openAdd`, `onSubmit`, `saveData` spread for `assets.gold.items`.
- **Sidebar labels:** `AppSidebar.tsx` — `NAV_ITEMS` order mirrors product IA.
