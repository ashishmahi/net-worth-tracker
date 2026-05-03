---
phase: 28
slug: section-routing-home-header
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-03
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` / Vitest defaults |
| **Quick run command** | `npm test -- --run src/lib/__tests__/sectionRoutes.test.ts` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~10–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for routing tests when `sectionRoutes` or App shell changes
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite green + `npm run build`

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 28-01-01 | 01 | 1 | Phase goal | — | Internal routes only | unit | `npm test -- --run src/lib/__tests__/sectionRoutes.test.ts` | ✅ | ⬜ pending |
| 28-01-02 | 01 | 1 | Phase goal | T-baseline | No open redirects — whitelist paths | integration | `npm test -- --run` + `npm run build` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- Existing Vitest + happy-dom cover project — no Wave 0 install.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Refresh preserves section | Phase goal | Browser URL bar | Open `/gold`, refresh, still on Gold |
| Mobile Home link | UI-SPEC | Touch layout | From Settings, tap Home → Dashboard URL `/` |
| GitHub Pages base | RESEARCH | Env | Build with `BASE_URL=/fin/` preview; deep-link `/fin/settings` |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or manual table above
- [ ] No watch-mode flags in CI commands
- [ ] `nyquist_compliant: true` set in frontmatter when phase validates

**Approval:** pending
