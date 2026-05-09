---
phase: 36
slug: dashboard-dual-currency-display
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-09
---

# Phase 36 — Validation Strategy

> Per-phase validation contract for Phase 36 (**Dashboard breakdown dual-currency**).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (project default) |
| **Config file** | `vite.config.ts` / `vitest.config` as repo uses |
| **Quick run command** | `npm test -- --run src/lib/__tests__/dashboardBreakdown.test.ts` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | \< 120 s |

---

## Sampling Rate

- **After every task commit:** `npx tsc -b --pretty false` + quick test command when TS/lib files touched
- **After Wave 1:** `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|----------------|-----------|-------------------|--------|
| 36-01-01 | 01 | 1 | DSP-01 DSP-03 | — | Local-only correctness | unit + tsc | `npm test -- --run …dashboardBreakdown` | ⬜ pending |
| 36-01-02 | 01 | 1 | DSP-01 DSP-03 | — | No silent wrong FX totals | component logic via unit tests on formatters/meta | Vitest | `npm test -- --run …dashboardBreakdown` | ⬜ pending |
| 36-01-03 | 01 | 1 | DSP-01 DSP-03 | — | **Rate unavailable** surfaces | grep + Vitest degraded fixture | Vitest | `grep -q 'Rate unavailable' src/pages/DashboardPage.tsx` | ⬜ pending |

---

## Wave 0 Requirements

Existing Vitest infrastructure — **none** install.

---

## Manual-Only Verifications

| Behavior | Requirement | Instructions |
|----------|-------------|----------------|
| Visual stack spacing | DSP-01 | Toggle reporting currency vs USD holdings; confirm **bold primary** + **smaller muted** secondary **only** when spec says |
| No secondary on Total Debt row | D-01 | Inspect Breakdown footer — single line |

---

## Validation Sign-Off

- [ ] All tasks carry automated verify statements
- [ ] `npm test -- --run` passes before marking phase executed
- [ ] `nyquist_compliant: true` set when phase verified
