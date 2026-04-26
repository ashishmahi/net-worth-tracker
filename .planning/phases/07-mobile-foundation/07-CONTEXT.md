# Phase 7: Mobile Foundation - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

On **viewports under 768px** (same threshold as `useIsMobile` / `MOBILE_BREAKPOINT`), users can **open the main navigation in an offcanvas (slide-in) drawer** from a **visible control in a mobile top bar**, **navigate to any section, and have the drawer close** on selection. The **light/dark theme control is available from the top bar** without opening the drawer. On **768px and wider**, the **inline sidebar** remains; **no mobile top bar** is shown, and layout matches current desktop behavior (per ROADMAP and **MB-01**).

**Explicitly in scope (from ROADMAP success criteria, not re-decided here):** hamburger visible at 375px; drawer is slide-in; nav item tap navigates and closes drawer; theme in top bar without opening drawer; desktop unchanged at 768px+.

**Out of this phase:** Per-page header reflow, sheet scroll with keyboard, property table layout (**Phase 8**).

</domain>

<decisions>
## Implementation Decisions

### Mobile top bar structure
- **D-01:** The user **deferred layout to implementer** (“Claude decide”). **Default and intended shape:** a **thin top bar** with only **(1) menu trigger** and **(2) theme control** on mobile — i.e. **no app title and no current-section title** in the top bar for Phase 7, so we do not duplicate in-page headers before Phase 8. If implementation needs a **compact** “Wealth Tracker” (or similar) for balance or a11y, the planner may add it without expanding Phase 7 scope to full “section title in bar.”

### Top bar — theme control presentation
- **D-02:** Theme in the **mobile top bar** is **icon-only** (same Moon/Sun idiom as today), with a **non-decorative** `aria-label` (e.g. “Switch to dark mode” / “Switch to light mode” matching `AppSidebar` intent).

### Mobile — one vs two theme controls
- **D-03:** On mobile, the theme control appears in **two places** by design: the **top bar** (MB-01) **and** the **sidebar footer** when the offcanvas is open. **Do not** hide the footer theme on `isMobile` to enforce a single control; both remain for consistency with the existing sidebar and explicit user choice.

### Offcanvas shell and menu affordance
- **D-04:** Use the existing shadcn `Sidebar` pattern with **`collapsible="offcanvas"`** (replace `collapsible="none"` in `AppSidebar`) so mobile uses the **Sheet**-backed drawer already implemented in `src/components/ui/sidebar.tsx`.
- **D-05:** The control that opens the mobile drawer is visually a **hamburger (Menu icon)**. **Override** the default `SidebarTrigger` / panel icon to use **lucide `Menu`**, while keeping the same `toggleSidebar` / accessibility behavior (e.g. `sr-only` “Toggle Sidebar” or aligned copy).

### Nav close behavior
- **D-06:** **Close the mobile drawer** when the user **selects a nav item** (same section or another) — this matches ROADMAP; wire `onSelect` in `AppSidebar` to call `setOpenMobile(false)` (or the equivalent from `useSidebar()`) in addition to updating the active section. **Overlay / Esc close** may follow the **Sheet** defaults unless they conflict; no separate product decision required unless QA finds a gap.

### Breakpoint
- **D-07:** **Single breakpoint** for “mobile top bar + offcanvas” vs “inline sidebar”: **768px**, consistent with `src/hooks/use-mobile.tsx` and ROADMAP “768px+”.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap and product
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, dependency on Phase 6
- `.planning/REQUIREMENTS.md` — **MB-01** (offcanvas + hamburger)
- `.planning/PROJECT.md` — v1.1 scope, stack
- `.planning/STATE.md` — v1.1 notes (e.g. offcanvas `collapsible` change)

### Prior phase (theme contract)
- `.planning/phases/06-dark-mode/06-CONTEXT.md` — `localStorage` key `theme` (`light` | `dark`), FOUC, sidebar footer theme (Phase 7 adds top bar access)

### Code (integration points)
- `src/components/AppSidebar.tsx` — `Sidebar` props, nav, footer theme, `onSelect`
- `src/App.tsx` — `SidebarProvider`, `SidebarInset` layout; place **mobile top bar** adjacent to the shell pattern (planner to choose exact tree — often a bar above `SidebarInset` that only renders when `isMobile`)
- `src/components/ui/sidebar.tsx` — `SidebarProvider`, `useSidebar`, `SidebarTrigger`, mobile Sheet, cookies for desktop `sidebar:state` (separate from theme)
- `src/hooks/use-mobile.tsx` — `MOBILE_BREAKPOINT = 768`
- `src/context/ThemeContext.tsx` — reuse for top bar icon-only toggle

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **`@/components/ui/sidebar`:** Full shadcn sidebar: `useSidebar` (`isMobile`, `setOpenMobile`, `toggleSidebar`), `SidebarTrigger` with default `PanelLeft`, mobile branch renders **Sheet** for offcanvas.
- **`AppSidebar`:** `collapsible="none"` today — switching to `"offcanvas"` enables mobile behavior; `SidebarMenuButton` already uses `onClick` → add mobile close on select.
- **`useIsMobile`:** 768px breakpoint; matches ROADMAP desktop floor.

### Established patterns
- **Theme:** `useTheme()` in `AppSidebar` footer; top bar should **reuse** the same hook and labels semantics (icon-only per D-02).
- **Touch targets:** `min-h-[44px]` already on nav and footer control — top bar row should keep **≥44px** tap height where possible.

### Integration points
- **Shell:** `SidebarProvider` wraps the app; the **mobile top bar** must call `useSidebar().toggleSidebar` (via `SidebarTrigger` or a button that uses the same API).
- **Desktop:** When `!isMobile`, the top bar must be **omitted** (ROADMAP: no top bar at 768px+).

</code_context>

<specifics>
## Specific Ideas

- ROADMAP uses the word “hamburger”; user chose **lucide `Menu`** for the trigger (D-05).
- **Minimal top bar** as the default for deferred layout (D-01) keeps Phase 7 focused on **navigation + theme access**, not duplicating page titles before Phase 8.

</specifics>

<deferred>
## Deferred Ideas

- **Page header reflow, form sheets with keyboard, property table** — Phase 8.
- **Section title in the app chrome** (if product later wants it) could be a small follow-up; not required by Phase 7 discussion.

**None** — other discussion stayed within phase scope.

</deferred>

---

*Phase: 07-mobile-foundation*  
*Context gathered: 2026-04-26*
