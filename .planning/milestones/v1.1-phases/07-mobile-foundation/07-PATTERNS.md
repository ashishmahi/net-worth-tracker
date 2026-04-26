# Pattern Map — Phase 7 Mobile Foundation

**Purpose:** Closest existing analogs for offcanvas shell, top bar, and a11y.

---

| Planned file / area | Role | Closest existing analog | Notes |
|--------------------|------|-------------------------|--------|
| `AppSidebar.tsx` | `collapsible` + `useSidebar` + `setOpenMobile` on nav | `Sidebar` in `sidebar.tsx` — mobile `Sheet` branch | Change **only** `collapsible` from `"none"` to `"offcanvas"`; add `useSidebar` import from `@/components/ui/sidebar` |
| `App.tsx` + new top bar | Shell: bar above `SidebarInset` main | `SidebarProvider` + `AppSidebar` + `SidebarInset` already | Mirror **structure** of Phase 6 `App.tsx`; insert bar as **first** child of `SidebarInset` when mobile |
| Mobile menu affordance | `Button` + icon (not `SidebarTrigger`) | `SidebarTrigger` in `sidebar.tsx` uses `Button` `variant="ghost"` + `toggleSidebar` | Copy **onClick** pattern; swap icon to `Menu` from `lucide-react`; `className` for `min-h-[min(44px)]` / `min-w-[44px]` per UI-SPEC |
| Theme in top bar | Icon-only `Button` + `useTheme` | `AppSidebar` footer `Button` + `Sun`/`Moon` + `aria-label` | Reuse same **label strings**; omit footer `<span>` text in top bar only (D-02) |
| Sheet header strings | `SheetTitle` / `SheetDescription` | `sidebar.tsx` lines ~213–216 in mobile `Sheet` | Replace with 07-UI-SPEC copy |

**Code excerpt — `toggleSidebar` (reference):**

```tsx
// sidebar.tsx SidebarTrigger pattern
onClick={(event) => { onClick?.(event); toggleSidebar() }}
```

**Code excerpt — `openMobile` toggle (reference):**

```tsx
// SidebarProvider: mobile uses setOpenMobile in toggleSidebar
isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
```

---

## PATTERN MAPPING COMPLETE
