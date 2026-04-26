---
phase: 06
slug: dark-mode
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-26
---

# Phase 6 — Validation Strategy

> Per-phase validation for dark mode: build/lint automation + mandatory manual 9-page and FOUC checks.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None for Phase 6 — existing `tsc` + Vite build + ESLint |
| **Config file** | `tsconfig.json`, `eslint.config.js`, `vite.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** `npm run build` (or `npx tsc -b` if plan specifies)
- **After every plan wave:** `npm run lint && npm run build`
- **Before UAT / verify-work:** Build green + manual theme checklist in plan 02
- **Max feedback latency:** ~2 minutes (manual pass excluded)

---

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| theme-provider | 01 | 1 | DM-02 | T-06-01 | localStorage errors swallowed; no crash | build | `npm run build` | ⬜ |
| index-script | 01 | 1 | DM-02 | T-06-01 | no throw to window | build + manual | build + reload | ⬜ |
| sidebar-toggle | 02 | 1 | DM-01 | T-06-02 | a11y labels on control | build + manual | `npm run build` | ⬜ |

---

## Wave 0 Requirements

- [x] No new test framework — "Existing infrastructure" = `tsc` + Vite + ESLint only for this phase

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No light flash on reload in dark | DM-02, D-06 | Browser paint | Set dark, hard reload, confirm no full-frame light shell before `dark` applies |
| 9 pages readable in dark | Success #3 | Visual / contrast | With dark on, visit Dashboard + 8 nav sections; no raw white viewport, no invisible text |
| Toggle a11y | DM-01, UI-SPEC | Screen reader / axe | Theme control has correct `aria-label` per spec |

---

## Validation Sign-Off

- [ ] All plans executed with build green
- [ ] Manual table completed for this phase
- [ ] `nyquist_compliant: true` when human approves

**Approval:** pending
