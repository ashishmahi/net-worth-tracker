# Phase 28 — Pattern map

## New files (analogs)

| New file | Role | Closest analog |
|----------|------|----------------|
| `src/lib/sectionRoutes.ts` | Pure route map + parsers | `src/lib/` calculators — small, tested utilities |
| `src/App.tsx` (refactor) | Shell + outlets | Current `App.tsx` layout + `SidebarProvider` |

## Modified files

| File | Pattern to match |
|------|------------------|
| `src/main.tsx` | Provider ordering from existing tree — insert **`BrowserRouter`** wrapping app subtree that needs routing (typically outside **`App`** or inside **`main`** after **`ThemeProvider`** — keep **`LivePricesProvider`** unchanged). |
| `src/components/AppSidebar.tsx` | **`SidebarMenuButton`** + **`min-h-[44px]`** — switch to **`NavLink`** or **`Link`** + **`navigate`** while preserving mobile **`setOpenMobile`**. |
| `src/components/MobileTopBar.tsx` | Same flex row + **`Button`** ghost pattern as existing menu/theme. |
| `src/pages/DashboardPage.tsx` | Preserve **`onNavigate`** signature but implementation becomes **`navigate(...)`** from caller. |

## Code excerpts (reference)

**Section list** — `AppSidebar.tsx` **`NAV_ITEMS`** + **`SectionKey`** export.

**Shell layout** — `App.tsx` **`SidebarProvider`** → **`AppSidebar`** + **`SidebarInset`** → **`MobileTopBar`** + **`main`**.

---

## PATTERN MAPPING COMPLETE
