---
phase: 30
slug: bullion-import-uplift-settings-ux-disclosure
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-06
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + happy-dom (existing) |
| **Config file** | `vite.config.ts` / `vitest` inline |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | BLN-04 | T30-01 | Clear non-advice copy | unit + grep | `npm test -- --run` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

Existing Vitest infrastructure covers this phase; no Wave 0 install.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Disclosure readable on small viewport | BLN-04 | Layout | Resize to mobile width; scroll Settings pricing section |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity maintained
- [x] No watch-mode flags in verify commands
- [ ] `nyquist_compliant: true` set in frontmatter — **true** above

**Approval:** pending execution
