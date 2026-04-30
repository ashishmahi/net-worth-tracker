---
phase: 13
slug: commodities-product-ux
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-30
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` and `npx tsc -b --noEmit`
- **Before `/gsd-verify-work`:** Full suite green + typecheck clean
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-T1 | 01 | 1 | COM-03 | — | N/A | unit + tsc | `npm test` && `npx tsc -b --noEmit` | ✅ | ⬜ pending |
| 13-01-T2 | 01 | 1 | COM-06 | — | No gold page edits | tsc | `npx tsc -b --noEmit` | ✅ | ⬜ pending |
| 13-02-T1 | 02 | 2 | COM-04 | — | N/A | tsc | `npx tsc -b --noEmit` | ✅ | ⬜ pending |
| 13-02-T2 | 02 | 2 | COM-06 | — | Dashboard gold cosmetic only | tsc | `npx tsc -b --noEmit` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- [x] Vitest + TS — delivered in Phase 12

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar + sheet UX | COM-03 | Interaction / visual | Add silver + manual item; edit; delete with confirm; empty state shows two actions |
| Dashboard navigation | COM-04 | Navigation | Click Commodities row → lands on Commodities page |
| Gold unchanged | COM-06 | Regression | Open Gold section — karat/grams sheets and list behave as before v1.4 Phase 13 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or manual map above
- [ ] Sampling continuity maintained
- [ ] No watch-mode flags in CI commands
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
