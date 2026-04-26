# Requirements — v1.1 UX Polish

**Milestone:** v1.1 UX Polish  
**Goal:** Make the app comfortable to use on mobile devices and add a manual dark mode toggle.  
**Previous milestone snapshot:** `.planning/milestones/v1.0-REQUIREMENTS.md`

---

## Active Requirements

### Dark Mode

- [x] **DM-01**: User can toggle between light and dark mode via a button in the app UI
- [x] **DM-02**: Dark/light mode preference is saved to `localStorage` and restored on next page load

### Mobile Responsive

- [x] **MB-01**: Sidebar collapses to an offcanvas drawer on mobile with a visible hamburger trigger
- [ ] **MB-02**: All 7 asset page headers reflow vertically on narrow screens (title and action button stack instead of overflow)
- [ ] **MB-03**: Add/edit forms (Sheets) scroll correctly on mobile when the keyboard is open
- [ ] **MB-04**: Property milestone table is usable on mobile (horizontal scroll or stacked card layout at 375px)

---

## Future Requirements (deferred)

- FOUC prevention via `index.html` inline script (deferred — low priority for personal local app)
- System preference default (`prefers-color-scheme`) for dark mode initial state
- iOS Safari keyboard viewport resize explicit QA pass
- Navigation overhaul, inline editing improvements

---

## Out of Scope (v1.1)

- Charts and historical net worth tracking → v1.2
- Export / PDF / CSV reports → v1.3
- User auth, cloud sync, hosted deployment → not in roadmap
- First-class AED display column → not in roadmap

---

## Traceability

| REQ-ID | Description | Phase | Status |
|--------|-------------|-------|--------|
| DM-01  | Dark mode toggle button | Phase 6 | complete |
| DM-02  | localStorage persistence | Phase 6 | complete |
| MB-01  | Sidebar offcanvas drawer | Phase 7 | complete |
| MB-02  | Page header reflow | Phase 8 | pending |
| MB-03  | Sheet scroll on mobile | Phase 8 | pending |
| MB-04  | Property table on mobile | Phase 8 | pending |
