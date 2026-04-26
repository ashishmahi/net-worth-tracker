# Phase 7: Mobile Foundation — Technical Research

**Researched:** 2026-04-26  
**Question:** What is needed to plan and implement offcanvas nav, mobile top bar, and ROADMAP success criteria (MB-01) without duplicating desktop chrome?

---

## 1. Current code vs target

| Area | Current | Target (CONTEXT / UI-SPEC) |
|------|---------|----------------------------|
| `AppSidebar` `collapsible` | `"none"` (static `div`, no Sheet) | `"offcanvas"` — enables `sidebar.tsx` mobile `Sheet` branch |
| `SidebarMenuButton` `onClick` | `onSelect` only | Also `setOpenMobile(false)` when `isMobile` |
| Mobile hamburger + theme in chrome | None | `MobileTopBar` (or equivalent) in `App.tsx` / `SidebarInset`, `md:hidden` or render only when `useSidebar().isMobile` |
| `SidebarTrigger` icon | `PanelLeft` | Top bar: **`Menu`** from `lucide-react` (D-05) — do not reuse default trigger; use `Button` + `useSidebar().toggleSidebar` to avoid editing shared `SidebarTrigger` unless we add optional icon (prefer dedicated mobile bar) |
| Sheet a11y copy | `SheetTitle>Sidebar` / generic description | `07-UI-SPEC`: "Main navigation" + specific description — edit `src/components/ui/sidebar.tsx` mobile `SheetHeader` only |

`useIsMobile` uses **768px** (`MOBILE_BREAKPOINT`), matching ROADMAP and CONTEXT D-07.

---

## 2. `useSidebar` API (from `src/components/ui/sidebar.tsx`)

- `isMobile: boolean` — from `useIsMobile()` inside provider
- `openMobile`, `setOpenMobile` — control Sheet
- `toggleSidebar()` — on mobile, toggles `openMobile`

`AppSidebar` is already under `SidebarProvider`; import `useSidebar` and call `setOpenMobile(false)` after `onSelect(key)` when `isMobile` is true.

---

## 3. Top bar layout

- **Placement:** First child inside `SidebarInset` (or equivalent), **above** existing `<main className="p-6">` so the bar spans the content column, not the drawer.
- **Visibility:** Only when `isMobile` — return `null` or `className` with `flex md:hidden` and ensure desktop has **no** extra row (ROADMAP: 768px+ unchanged).
- **Z-index:** `z-40` per `07-UI-SPEC` so it stays above scrolling content; Sheet remains `z-50` and covers when open.
- **Theme control:** `useTheme()` from `ThemeContext` — same `aria-label` pattern as `AppSidebar` footer ("Switch to dark mode" / "Switch to light mode"); top bar is **icon-only** (D-02).

---

## 4. Desktop regression risk

- With `collapsible="offcanvas"`, the **non-mobile** branch in `Sidebar` is `hidden md:block` fixed sidebar — behavior matches “inline sidebar” at 768px+; verify visually that no double spacing or missing rail (Phase 6 already shipped).

---

## 5. Files to touch (summary)

1. `src/components/AppSidebar.tsx` — `collapsible`, `useSidebar`, close on nav
2. `src/App.tsx` — mobile top bar (new component or inline) inside `SidebarInset`
3. `src/components/MobileTopBar.tsx` (new) — **recommended** to keep `App.tsx` small; or single-file if user prefers minimal files (CONTEXT allows implementer; plan recommends new file)
4. `src/components/ui/sidebar.tsx` — `SheetHeader` / `SheetTitle` / `SheetDescription` strings in mobile block only

---

## Validation Architecture

> Nyquist: Phase 7 has **no new automated test framework**. Validation = **TypeScript build** + **ESLint** + **manual viewport / touch checks** for MB-01 and UI-SPEC dimensions.

| Dimension | How verified |
|-----------|----------------|
| Build / types | `npm run build` |
| MB-01 functional | Manual: 375px — hamburger opens drawer; nav navigates and closes; theme in bar without opening drawer; 768px+ no top bar, sidebar inline |
| a11y strings | Grep: `Main navigation`, `Toggle main navigation` or equivalent, theme `aria-label` substrings in new/edited files |

`07-VALIDATION.md` maps tasks to these checks.

---

## RESEARCH COMPLETE

No external dependencies required. shadcn `Sidebar` + `Sheet` already in tree.
