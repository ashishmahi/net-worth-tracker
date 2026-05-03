---
phase: 28-section-routing-home-header
plan: "01"
subsystem: ui
tags: [react-router-dom, vite, spa-routing, basename]

requires:
  - phase: 27-settings-commodity-pricing-ux
    provides: Settings and commodity UX baseline for navigation targets
provides:
  - Canonical section URL paths with basename-safe BrowserRouter
  - Refresh-safe deep links per wealth section
  - Mobile top bar Home affordance to dashboard
affects:
  - Any future phase adding sections or changing URLs

tech-stack:
  added: [react-router-dom]
  patterns:
    - "Whitelist-only navigation via sectionToPath(SectionKey)"
    - "SectionKey and paths centralized in src/lib/sectionRoutes.ts"

key-files:
  created:
    - src/lib/sectionRoutes.ts
    - src/lib/__tests__/sectionRoutes.test.ts
    - .planning/phases/28-section-routing-home-header/28-UAT.md
  modified:
    - package.json
    - package-lock.json
    - src/main.tsx
    - src/App.tsx
    - src/components/AppSidebar.tsx
    - src/components/MobileTopBar.tsx

key-decisions:
  - "BrowserRouter lives in main.tsx inside LivePricesProvider so hooks see router context"
  - "AppSidebar uses NavLink + pathToSection(location.pathname) for active state"

patterns-established:
  - "Add new sections by extending SectionKey, SEGMENT_BY_KEY, and a Route in App.tsx"

requirements-completed: []

duration: 25min
completed: 2026-05-03
---

# Phase 28: Section routing & dashboard home link Summary

**React Router with `basename` from Vite, whitelist `sectionRoutes` helpers with Vitest, and URL-driven sidebar plus mobile Home — refresh stays on the chosen section.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-03T23:55:00Z
- **Completed:** 2026-05-04T00:05:00Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Installed `react-router-dom` and added typed path helpers with round-trip tests.
- Replaced in-memory `activeSection` with nested routes, `Outlet`, and catch-all `Navigate` to `/`.
- Sidebar links use `NavLink`; mobile header shows House **Home** between menu and theme off-dashboard.

## Task Commits

1. **Task 1: react-router-dom + sectionRoutes + Vitest** — `296ec3b` (feat)
2. **Task 2: BrowserRouter basename + App layout Routes + sidebar/mobile/dashboard wiring** — `f37280f` (feat)
3. **Task 3: 28-UAT.md manual script** — `b797d14` (docs)

## Files Created/Modified

- `src/lib/sectionRoutes.ts` — `SectionKey`, `SECTION_PATHS`, `sectionToPath`, `pathToSection`, `listSectionPaths`
- `src/lib/__tests__/sectionRoutes.test.ts` — routing helper tests
- `src/main.tsx` — `BrowserRouter` with `basename={import.meta.env.BASE_URL}`
- `src/App.tsx` — `Routes`/`Route`/`Outlet`/`Navigate`; `DashboardRoute` wraps `navigate(sectionToPath(key))`
- `src/components/AppSidebar.tsx` — `NavLink`, URL-derived active state
- `src/components/MobileTopBar.tsx` — `House` link to dashboard when not on index
- `.planning/phases/28-section-routing-home-header/28-UAT.md` — manual QA checklist

## Decisions Made

- Kept `SectionKey` as the single export surface by re-exporting from `AppSidebar` via `@/lib/sectionRoutes` for existing imports.
- Used `Button asChild` + `Link` for mobile Home to preserve 44×44 touch targets and theme alignment.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Section URLs are stable; new sections should extend `sectionRoutes` and add one `Route` each.
- Run `28-UAT.md` checks after deploy (especially `basename` on GitHub Pages).

---

## Self-Check: PASSED

- Key files from plan exist; `npm test -- --run` and `npm run build` passed during execution.

---
*Phase: 28-section-routing-home-header*
*Completed: 2026-05-03*
