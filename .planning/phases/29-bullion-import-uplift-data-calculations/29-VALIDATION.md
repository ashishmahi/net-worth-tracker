---
phase: 29
slug: bullion-import-uplift-data-calculations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` / project defaults |
| **Quick run command** | `npm test -- --run src/lib/__tests__/goldLiveHints.test.ts src/lib/__tests__/silverLiveHints.test.ts src/lib/__tests__/dashboardCalcs.test.ts` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command covering touched test files
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | BLN-03 | T1 / — | Nonnegative rates; no eval | unit + parse | `npm test -- --run src/context/__tests__/AppDataContext.test.tsx` | ✅ | ⬜ pending |
| 29-01-02 | 01 | 2 | BLN-01 | — | N/A | unit | `npm test -- --run src/lib/__tests__/goldLiveHints.test.ts` | ✅ | ⬜ pending |
| 29-01-03 | 01 | 2 | BLN-02 | — | N/A | unit | `npm test -- --run` (silver hints file) | ✅ | ⬜ pending |
| 29-01-04 | 01 | 3 | BLN-01 / BLN-02 | — | N/A | unit + tsc | `npm test -- --run` + `npx tsc -b --pretty false` | ✅ | ⬜ pending |
| 29-01-05 | 01 | 4 | BLN-05 / D-12–D-14 | — | N/A | unit | `npm test -- --run src/lib/__tests__/dashboardCalcs.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing Vitest infrastructure covers Phase 29 — **no new framework install**.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| *None* | — | — | All behaviors targeted have automated coverage |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
