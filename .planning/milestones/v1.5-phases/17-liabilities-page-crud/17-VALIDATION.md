---
phase: 17
slug: liabilities-page-crud
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` (test block) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | INFRA-03 / wiring | T-17-01 | Local-only; no new trust boundaries | manual + tsc | `npx tsc -b --noEmit` | ✅ | ⬜ pending |
| 17-01-02 | 01 | 1 | CALC EMI aggregate (if task adds helper) | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 17-01-03 | 01 | 1 | LIAB-01–06 | T-17-02 | React escaping; no `dangerouslySetInnerHTML` | tsc + UAT | `npx tsc -b --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing Vitest + `src/lib/__tests__/` covers liability calcs; no new framework install.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar shows Liabilities after Property | INFRA-03 | No RTL harness | Open app; confirm order and navigation to empty Liabilities page |
| Inline delete confirm | LIAB-03 | UI interaction | Delete flow: cancel restores row; confirm removes and persists refresh |
| Banner always visible | LIAB-06 | Copy/layout | With 0 and 1+ loans, banner text matches UI-SPEC |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or documented manual steps
- [ ] Sampling continuity maintained
- [ ] No watch-mode flags in CI commands
- [ ] Feedback latency acceptable
- [ ] `nyquist_compliant: true` set in frontmatter when approved

**Approval:** pending
