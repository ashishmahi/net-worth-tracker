---
status: passed
phase: 28
completed: 2026-05-03
---

# Phase 28 — Verification

## Must-haves (from plan)

| Criterion | Evidence |
|-----------|----------|
| `BrowserRouter` uses `basename={import.meta.env.BASE_URL}` | `src/main.tsx` |
| Each `SectionKey` maps to one path; refresh on `/gold` stays on Gold | `src/lib/sectionRoutes.ts`, `src/App.tsx` routes |
| `MobileTopBar` shows Home when not on dashboard index | `src/components/MobileTopBar.tsx` (`House`, `section !== 'dashboard'`) |
| Unknown paths redirect to dashboard | `src/App.tsx` — `<Route path="*" element={<Navigate to="/" replace />} />` |
| `sectionRoutes` exports helpers | `src/lib/sectionRoutes.ts` |
| `28-UAT.md` documents refresh + mobile Home | `.planning/phases/28-section-routing-home-header/28-UAT.md` |

## Automated checks

- `npm test -- --run` — pass (full suite, 94 tests)
- `npm run build` — pass

## Requirement IDs

- Plan `requirements: []` — N/A

## Human verification

- **`28-UAT.md`** — complete (2026-05-04): 4/4 passed (deep links + refresh, mobile Home, sidebar active state).
