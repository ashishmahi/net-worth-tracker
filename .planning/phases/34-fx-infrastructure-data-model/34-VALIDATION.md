---
phase: 34
slug: fx-infrastructure-data-model
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 34 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` / `vitest` section |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npx tsc -b --pretty false && npm test -- --run` |
| **Estimated runtime** | ~15–45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run full suite (`tsc` + `npm test`)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 34-01-01 | 01 | 1 | FX-01, DM-01 | T-34-01 | N/A (client FX fetch — no secrets) | unit + integration | `npm test -- --run` | ✅ | ⬜ pending |
| 34-01-02 | 01 | 1 | FX-02, FX-03 | T-34-02 | No invented rates when null | unit | `npm test -- --run` | ✅ | ⬜ pending |
| 34-01-03 | 01 | 2 | DM-01–03 | T-34-03 | Strict enum storage — no injection via currency strings | unit | `npm test -- --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing Vitest infrastructure covers new tests — **no new framework install**

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live open.er-api returns plausible EUR/GBP/SGD | FX-01 | Network + third-party variability | Optional: load app, confirm context shows non-null quotes when API healthy |

*Primary verification is mocked/unit — manual row optional.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
