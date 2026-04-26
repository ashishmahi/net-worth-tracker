---
phase: 03
slug: live-prices-bitcoin
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (optional Wave 0 — add if Plan 01 tasks require unit tests) / otherwise TypeScript + manual |
| **Config file** | `vitest.config.ts` (if added) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` and (if Vitest present) `npx vitest run` |
| **Estimated runtime** | ~5–20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit` and any Vitest suite if present
- **Before `/gsd-verify-work`:** Typecheck must pass; manual UAT for live API behavior in browser

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01 | 01 | 1 | D-01..D-04 (price surface) | T-03-01 / N/A | Fixed API URLs; no user-controlled fetch targets | tsc + grep | `npx tsc --noEmit` + grep for `fetch` in pages | ⬜ W0 | ⬜ pending |
| 03-02 | 02 | 2 | D-05..D-10 | T-03-02 / N/A | Session rates not in data.json | tsc + manual | `npx tsc --noEmit` | — | ⬜ pending |
| 03-03 | 03 | 2 | D-11..D-12 | T-03-03 / N/A | No secrets in local JSON | tsc + migration smokes | `npx tsc --noEmit` | — | ⬜ pending |

---

## Wave 0 Requirements

- [ ] (Optional) `vitest` + `src/lib/*.test.ts` for pure conversion helpers if Plan 01 adds them
- *If none: "Rely on `npx tsc --noEmit` and grep acceptance criteria in PLAN.md tasks."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Live price refresh, TTL, session override | D-02, D-04, D-10 | Browser + network + time | With dev server: confirm rates load, error UI on offline, manual session values apply, then clear when back online |
| CORS to chosen APIs | D-01 | Environment-specific | If browser blocks, adjust proxy or endpoint per RESEARCH |

---

## Validation Sign-Off

- [ ] All tasks have grep/tsc or manual verify
- [ ] `nyquist_compliant: true` when Phase 3 execution completes

**Approval:** pending
