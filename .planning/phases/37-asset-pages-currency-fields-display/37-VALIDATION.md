---
phase: 37
slug: asset-pages-currency-fields-display
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-09
---

# Phase 37 — Validation Strategy

> Per-phase validation contract for **asset pages currency fields & dual-currency display** (**AP-01**, **AP-02**, **DSP-02**).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` (project default) |
| **Quick run command** | `npx tsc -b --pretty false` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | &lt; 120 s |

---

## Sampling Rate

- **After every task:** `npx tsc -b --pretty false`
- **After tasks touching `src/lib/` or `src/components/`:** targeted Vitest when tests exist for touched modules
- **After each wave:** `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 37-01-01 | 01 | 1 | AP-01 AP-02 DSP-02 | T-37-01 | N/A — local UI | unit + tsc | `npm test -- --run src/components/__tests__/DualCurrencyAmount.test.tsx` | ⬜ pending |
| 37-01-02 | 01 | 1 | AP-01 AP-02 DSP-02 | T-37-02 | N/A | tsc + smoke | `npx tsc -b --pretty false` | ⬜ pending |
| 37-01-03 | 01 | 2 | AP-01 AP-02 DSP-02 | T-37-02 | N/A | tsc | `npx tsc -b --pretty false` | ⬜ pending |
| 37-01-04 | 01 | 2 | AP-01 AP-02 DSP-02 | T-37-02 | N/A | tsc | `npx tsc -b --pretty false` | ⬜ pending |
| 37-01-05 | 01 | 3 | AP-01 AP-02 DSP-02 | T-37-02 | N/A | tsc | `npx tsc -b --pretty false` | ⬜ pending |
| 37-01-06 | 01 | 3 | AP-01 AP-02 DSP-02 | T-37-02 | N/A | tsc | `npx tsc -b --pretty false` | ⬜ pending |
| 37-01-07 | 01 | 4 | AP-01 AP-02 DSP-02 | T-37-01 | Correct persisted amounts | unit + tsc | `npm test -- --run` (includes migration/schema tests when added) | ⬜ pending |

---

## Wave 0 Requirements

Existing Vitest + Vite — **no** new framework install.

---

## Manual-Only Verifications

| Behavior | Requirement | Instructions |
|----------|-------------|----------------|
| MF USD save preserves units | AP-02 | Add platform in USD; inspect stored JSON — `currentValue` matches entry, `currency` is `USD` |
| Property single-currency rule | D-07 | Set AED; agreement + milestones all labeled consistent; saved JSON uses neutral keys post-migration |
| Retirement no dropdown | D-03 | Open Retirement sheet — no Currency fieldset |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or documented manual row above
- [ ] No watch-mode in CI commands
- [ ] `nyquist_compliant: true` when execution completes

**Approval:** pending
