---
phase: 33
slug: property-sheet-responsive-accessibility
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 33 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (existing) |
| **Config file** | `vite.config.ts` / Vitest inline |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run` (scoped when possible) + `npx tsc -b --pretty false`
- **After every plan wave:** Full test suite + `tsc`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 33-01-01 | 01 | 1 | PRA-01 | — | N/A | unit+tsc | `npm test -- --run && npx tsc -b --pretty false` | ✅ | ⬜ pending |
| 33-01-02 | 01 | 1 | PRA-01 | — | N/A | unit+tsc | `npm test -- --run && npx tsc -b --pretty false` | ✅ | ⬜ pending |
| 33-01-03 | 01 | 1 | PRA-01 | — | N/A | unit+tsc | `npm test -- --run && npx tsc -b --pretty false` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- **Existing infrastructure covers** Vitest + TypeScript — no new Wave 0 stubs required unless execution adds new test files.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Narrow viewport layout & milestone horizontal scroll | PRA-01 | Layout/focus in real browser | Open sheet at ~320–390px width; confirm path stack, scroll hint, table scroll |
| Arrow keys + initial focus | PRA-01 | Radix portal / focus | Open add/edit; verify focus lands on first path; arrows move selection |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
