---
phase: 35
slug: reporting-currency-selector
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 35 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` (Vitest plugin) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~15–45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 35-01-01 | 01 | 1 | RC-01 | T-35-01 / — | No XSS: native `<select>` options from fixed enum | unit + tsc | `npm test -- --run` · `npx tsc -b` | ✅ | ⬜ pending |
| 35-01-02 | 01 | 1 | RC-02 | T-35-02 | Correct conversion / unavailable-rate UX | unit | `npm test -- --run` | ✅ | ⬜ pending |
| 35-01-03 | 01 | 1 | RC-03 | — | Persistence unchanged (localStorage via existing save) | manual + tsc | `npm test -- --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing Vitest + `npm test -- --run` covers project — **no new framework**

*Wave 0:* Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Topbar select placement & mobile tap targets | RC-01 | Visual / interaction | Open app: desktop — select after Live pill; mobile — select reachable, ≥44px |
| Dashboard updates without navigation | RC-02 | Browser integration | Change currency on Dashboard; numbers update without full reload |
| Reload persistence | RC-03 | Storage | Set USD → reload → still USD |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
