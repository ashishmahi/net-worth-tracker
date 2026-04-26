---
phase: 07
slug: mobile-foundation
status: draft
nyquist_compliant: false
created: 2026-04-26
---

# Phase 7 — Validation Strategy

> mobile shell: build/lint + mandatory manual viewport, navigation, and a11y checks for **MB-01**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None new — `tsc` + Vite + ESLint |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~30–60 seconds (automated) |

---

## Sampling Rate

- After every task: `npm run build`
- After wave: `npm run lint && npm run build`
- Before UAT: build green + manual **MB-01** checklist in plan 01

---

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Test Type | Automated | Status |
|------|------|------|-------------|-----------|-----------|--------|
| offcanvas + close on nav | 01 | 1 | MB-01 | build + manual | `npm run build` | ⬜ |
| mobile top bar + theme | 01 | 1 | MB-01 | build + manual | `npm run build` | ⬜ |
| sheet a11y copy | 01 | 1 | MB-01, UI-SPEC | build + grep | build + grep | ⬜ |

---

## Manual-Only Verifications

| Behavior | Requirement | Test Instructions |
|----------|-------------|-------------------|
| Hamburger at 375px | MB-01, ROADMAP #1 | DevTools 375px; **Menu** visible in top bar; tap opens slide-in drawer |
| Nav closes drawer | MB-01, ROADMAP #2 | With drawer open, tap any item — route/section changes, drawer closes |
| Theme without drawer | MB-01, ROADMAP #3 | With drawer **closed**, tap Sun/Moon in top bar — theme toggles |
| Desktop unchanged | ROADMAP #4 | ≥768px: no mobile top bar; sidebar visible inline (not overlay) |
| Sheet copy | 07-UI-SPEC | Inspect / screen reader: `SheetTitle` is not generic "Sidebar" only |

---

## Validation Sign-Off

- [ ] All plans executed with build green
- [ ] Manual table completed
- [ ] `nyquist_compliant: true` when human approves

**Approval:** pending
