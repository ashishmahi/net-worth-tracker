---
phase: 08
slug: mobile-page-fixes
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-26
---

# Phase 8 — Validation Strategy

> Per-phase validation for **Mobile Page Fixes** (UI-only, **MB-02**–**MB-04**).

---

## Test infrastructure

| Property | Value |
|----------|--------|
| **Automated** | `npm run build` — `tsc -b && vite build` (no unit test framework in repo) |
| **Config** | `package.json` scripts / `tsconfig` |
| **Quick run** | `npm run build` |
| **Full suite** | `npm run build` + `npm run lint` (optional secondary) |
| **Runtime** | ~20–40s typical |

---

## Sampling rate

- **After every task or logical commit:** `npm run build`
- **After each plan wave:** `npm run build` (and `lint` if touched ESLint)
- **Before UAT sign-off:** build must be green

---

## Per-task mapping (illustrative)

| Task / area | Plan | Wave | Requirement | Test type | Command |
|-------------|------|------|-------------|------------|---------|
| PageHeader + pages | 01 | 1 | MB-02 | build + **manual 375** | `npm run build` + resize |
| Sheet scroll + Property table | 02 | 2 | MB-03, MB-04 | build + **manual** | `npm run build` + keyboard/table |

*Detailed checklists belong in `08-VERIFICATION.md` after execution; UAT in `08-UAT.md`.*

---

## Wave 0

- [x] Existing `npm run build` — no new test harness required for v1.1
- *No* new stub files for this phase

---

## Manual-only verifications

| Behavior | Requirement | Why manual | Instructions |
|----------|-------------|------------|--------------|
| Header reflow 375px | MB-02 | Viewport + overflow | For each of Dashboard + 7 asset pages: DevTools 375px; no horizontal page scroll; title + CTA (where present) stacked; CTA full width. |
| Sheet + keyboard | MB-03 | OS keyboard + viewport | On **Gold** and **Property** (longest): open Add/Edit, focus a low field; form body scrolls; can reach Save. |
| Milestone table | MB-04 | Real narrow width | In Property **sheet**: all milestone columns readable via horizontal scroll or stacked cards at 375px. |

---

## Sign-off (post-exec)

- [ ] `npm run build` green at end of phase
- [ ] Manual table above executed or issues logged in UAT
- [ ] `nyquist_compliant` may stay `false` (no automated E2E in repo)

**Approval:** pending
