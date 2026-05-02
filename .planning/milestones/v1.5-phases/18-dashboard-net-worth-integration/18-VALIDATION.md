---
phase: 18
slug: dashboard-net-worth-integration
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-02
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Typecheck** | `npx tsc -b --noEmit` |
| **Estimated runtime** | ~5–15 seconds |

---

## Sampling Rate

- **After every task commit:** `npm test` and `npx tsc -b --noEmit`
- **Before `/gsd-verify-work`:** Full suite + typecheck green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 18-01-01 | 01 | 1 | DASH-01–04 | T-18-01 / — | N/A local-only | unit + grep | `npm test`; `npx tsc -b --noEmit` | ⬜ pending |

---

## Wave 0 Requirements

- [x] Existing Vitest + liability calc tests cover pure functions — **no Wave 0 install**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| Headline decreases when loan added | DASH-01 | UI integration | Add standalone liability; confirm headline drops by outstanding amount |
| Total Debt row navigates | DASH-02 | SPA | Click row; Liabilities section renders |
| Ratio matches expectation | DASH-03 | Visual | Compare to spreadsheet for fixture data |
| Snapshot matches headline | DASH-04 | Persistence | Record snapshot; inspect `data.json` / history |

---

## Validation Sign-Off

- [ ] `npm test` green
- [ ] `npx tsc -b --noEmit` green
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
