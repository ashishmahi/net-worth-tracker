---
phase: 25
slug: github-actions-ci-cd-beta-access
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-03
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (Vitest via Vite) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10–60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | CI-01, CI-02, CI-03, DEPLOY-01, DEPLOY-02 | T-25-01 / T-25-02 | Fork PRs cannot deploy; token minimal | workflow + grep | `npm test` / grep workflow | ✅ | ⬜ pending |
| 25-01-02 | 01 | 1 | BETA-01 | — | N/A (docs) | grep README | `grep -q beta README.md` (example) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] *Existing Vitest suite covers app regressions; no Wave 0 stubs required for YAML-only phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pages deploy succeeds | DEPLOY-01 | Requires GitHub-hosted runner + repo Settings | Enable Pages (GitHub Actions), merge to `main`, confirm green deploy job and live URL |
| Live site loads SPA | DEPLOY-02 | Hosted URL | Open `https://<user>.github.io/net-worth-tracker/`; confirm shell and assets load |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
