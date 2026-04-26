# Personal Wealth Tracker — Roadmap

## Milestones

- ✅ **v1.0 — Local wealth tracker** — Shipped 2026-04-26 — [full snapshot](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 — UX Polish** — Phases 6-8 (in progress)

---

## Phases

<details>
<summary>✅ v1.0 — Local wealth tracker (Phases 1–5) — SHIPPED 2026-04-26</summary>

All phase goals, plan checklists, and progress table are preserved in:
`.planning/milestones/v1.0-ROADMAP.md`

**Note:** GSD Phase 01 checkboxes in that snapshot show `0/3` while the running app includes scaffold, data layer, and shell — a known planning-artifact drift; the shipped app reflects foundation work.

</details>

---

### 🚧 v1.1 — UX Polish (In Progress)

**Milestone Goal:** Make the app comfortable to use on mobile devices and add a manual dark mode toggle.

- [ ] **Phase 6: Dark Mode** - Theme toggle with localStorage persistence
- [ ] **Phase 7: Mobile Foundation** - Offcanvas sidebar drawer and mobile top bar
- [ ] **Phase 8: Mobile Page Fixes** - Page header reflow, sheet scroll, and property table

---

## Phase Details

### Phase 6: Dark Mode
**Goal**: Users can switch between light and dark mode and have their preference remembered across sessions
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: DM-01, DM-02
**Success Criteria** (what must be TRUE):
  1. User can click a Sun/Moon toggle button and the entire app switches to dark or light mode immediately
  2. User reloads the page (or opens the app fresh) and the previously selected theme is restored without a flash of the wrong theme
  3. All 9 pages are readable and visually consistent in dark mode (no raw white backgrounds or invisible text)
**Plans**: 2 (`06-01-PLAN` FOUC + ThemeContext + wrap; `06-02-PLAN` sidebar toggle + token audit)
**UI hint**: yes

### Phase 7: Mobile Foundation
**Goal**: Users on a phone can navigate the app via an offcanvas sidebar drawer and reach the theme toggle without opening the sidebar
**Depends on**: Phase 6
**Requirements**: MB-01
**Success Criteria** (what must be TRUE):
  1. On a 375px viewport, a hamburger icon is visible in a top bar and tapping it opens the sidebar as a slide-in drawer
  2. Tapping any nav item in the mobile drawer navigates to that page and closes the drawer
  3. The Moon/Sun theme toggle is accessible from the mobile top bar without opening the sidebar
  4. On desktop (768px+), the layout is unchanged — sidebar renders inline, no top bar visible
**Plans**: TBD
**UI hint**: yes

### Phase 8: Mobile Page Fixes
**Goal**: Users can view and edit all asset pages on a 375px screen — headers do not overflow, forms are fully scrollable with the keyboard open, and the property milestone table is usable
**Depends on**: Phase 7
**Requirements**: MB-02, MB-03, MB-04
**Success Criteria** (what must be TRUE):
  1. On all 7 asset pages and the dashboard, the page header (title + action button) stacks vertically at 375px with no horizontal overflow or clipped buttons
  2. Opening an Add/Edit sheet on any of the 6 affected asset pages and tapping a field near the bottom of the form with the software keyboard open still shows that field without the user needing to dismiss the keyboard first
  3. The Property page milestone table is usable at 375px — either via horizontal scroll with a visible scrollbar, or via a stacked card layout — with no columns hidden or truncated
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | — | Complete | 2026-04-26 |
| 2. Manual Asset Sections | v1.0 | — | Complete | 2026-04-26 |
| 3. Live Prices + Bitcoin | v1.0 | — | Complete | 2026-04-26 |
| 4. Property Section | v1.0 | — | Complete | 2026-04-26 |
| 5. Dashboard | v1.0 | — | Complete | 2026-04-26 |
| 6. Dark Mode | v1.1 | 2/2 planned | Ready to execute | - |
| 7. Mobile Foundation | v1.1 | 0/? | Not started | - |
| 8. Mobile Page Fixes | v1.1 | 0/? | Not started | - |
