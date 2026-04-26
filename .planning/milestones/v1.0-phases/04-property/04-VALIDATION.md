---
phase: 04
slug: property
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-26
---

# Phase 04 — Validation Strategy

> Per-phase validation for Phase 4 (Property). No dedicated unit-test framework in repo; build + lint + manual UAT.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript + ESLint (no vitest/jest) |
| **Config file** | `tsconfig.json`, `eslint.config.js` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** `npm run build`
- **After every plan wave:** `npm run build && npm run lint`
- **Before `/gsd-verify-work`:** Full command green + manual UAT pass
- **Max feedback latency:** at most ~2 minutes automated

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | D-11 | — | N/A | build | `npm run build` | data.ts | ⬜ pending |
| 04-01-02 | 01 | 1 | D-12 | — | N/A | build | `npm run build` | AppDataContext | ⬜ pending |
| 04-02-01 | 02 | 1 | D-01,D-04,D-06 | T-04-01 | no `dangerouslySetInnerHTML` | build+lint | `npm run build && npm run lint` | PropertyPage, ui/ | ⬜ pending |
| 04-02-02 | 02 | 1 | D-07–D-09, UI-SPEC | T-04-01 | loan fields client-only | manual | — | — | ⬜ pending |

---

## Wave 0 Requirements

- **Existing infrastructure covers verification** — `npm run build` + `npm run lint`. No new test project required for Phase 4.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sheet save/load | D-01, D-20 | Browser persistence | Add property, save, refresh page, confirm data in UI |
| Derived balance | D-05 | Floating UI | Set agreement and milestones; verify balance due matches manual calculation |
| Reconciliation message | 04-UI-SPEC | Visual | Make milestone total exceed agreement; see soft destructive text |

---

## Validation Sign-Off

- [ ] All tasks have automated verify (build/lint) or manual row above
- [ ] No watch-mode flags in verification commands
- [ ] `nyquist_compliant: true` in frontmatter when approved

**Approval:** pending
