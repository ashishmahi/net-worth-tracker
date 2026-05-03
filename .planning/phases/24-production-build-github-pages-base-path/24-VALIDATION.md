---
phase: 24
slug: production-build-github-pages-base-path
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-03
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (Vitest via `vitest run`) |
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
| 24-01-01 | 01 | 1 | BUILD-01 | T-24-01 | Base defaults to `/` when unset | unit + grep | `npm test` + grep `vite.config.ts` | ✅ | ⬜ pending |
| 24-01-02 | 01 | 1 | BUILD-02 | — | N/A | build | `BASE_URL=/net-worth-tracker/ npm run build` | ✅ | ⬜ pending |
| 24-01-03 | 01 | 1 | BUILD-03 | — | N/A | manual | See Manual-Only table | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — no new test stubs required for Wave 0.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| Subpath asset load in browser | BUILD-03 | Requires browser Network tab / visual | After `BASE_URL=/net-worth-tracker/ npm run build`, run `npm run preview`, open the printed URL, confirm app loads and chunks return 200 under `/net-worth-tracker/` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
