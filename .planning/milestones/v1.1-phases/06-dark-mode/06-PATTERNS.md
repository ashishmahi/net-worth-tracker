# Pattern Map — Phase 6 Dark Mode

**Purpose:** Closest existing analogs for new theme code and touch points.

---

| Planned file / area | Role | Closest existing analog | Notes |
|--------------------|------|-------------------------|--------|
| `index.html` inline script | Pre-React `localStorage` + `classList` on `<html>` | Not present yet; pattern described in `STATE.md` + `06-CONTEXT` D-05 | Must run **before** `script type=module` |
| `src/context/ThemeContext.tsx` (new) | `createContext` + `useState` for theme, sync to DOM + storage | `src/context/AppDataContext.tsx` | No async load; no fetch — mirror provider shape only |
| `src/main.tsx` | Wrap tree with new provider | Already wraps `AppDataProvider` > `LivePricesProvider` > `App` | Add `ThemeProvider` — recommend **outermost** of app UI concerns: e.g. `AppData` inner or outer; use **inner** to theme only React tree: `AppData` > `LivePrices` > `App` is fine; put `ThemeProvider` as **sibling** concern: `ThemeProvider` wrapping the same as today so `useAppData` is unchanged. Simplest: `ThemeProvider` outside `AppDataProvider` to avoid re-fetch on theme (no relation). **Best:** `StrictMode` > `ThemeProvider` > `AppDataProvider` > … |
| `AppSidebar` footer | New `SidebarFooter` with button | `SidebarHeader` + `SidebarContent` in `AppSidebar.tsx` | Import `SidebarFooter` from same `@/components/ui/sidebar` as header |
| Theme control button | shadcn `Button` + lucide icons | `SidebarMenuButton` in same file | Per UI-SPEC: `variant` ghost, not primary; `min-h-[44px]` like nav |
| Styling | Tailwind `dark:` variants / tokens | `App.tsx` `main` uses semantic classes | `bg-background` already; audit pages for raw colors |

**Code excerpt — provider cookie pattern (reference only, theme uses localStorage not cookie):** `sidebar.tsx` sets `document.cookie` in `set` — theme uses `localStorage.setItem('theme', ...)` only, key `theme`.

---

## PATTERN MAPPING COMPLETE
