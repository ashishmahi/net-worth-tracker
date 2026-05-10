---
phase: 38
slug: settings-snapshots-export-import
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 38 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` / `vitest` inline |
| **Quick run command** | `npm test -- --run src/lib/__tests__/wealthDataZip.phase38.test.ts` (after task adds file) |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** `npx tsc -b --pretty false && npm test -- --run` (scoped test file when present)
- **After every plan wave:** `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 38-01-01 | 01 | 1 | SNP-01, SNP-02 | T-38-01 / — | Snapshot JSON valid; no PII in new fields | unit | `npm test -- --run src/lib/__tests__/netWorthSnapshot.test.ts` | ❌ W0 | ⬜ pending |
| 38-01-02 | 01 | 1 | SET-01, SET-02 | — | Session overrides remain client-only | unit+tsc | `npx tsc -b --pretty false` | ✅ | ⬜ pending |
| 38-01-03 | 01 | 1 | EXP-01, EXP-02 | T-38-02 / — | Import uses same Zod path as production | unit | `npm test -- --run src/lib/__tests__/wealthDataZip.phase38.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/netWorthSnapshot.test.ts` — NetWorthPoint schema accepts new optional fields
- [ ] `src/lib/__tests__/wealthDataZip.phase38.test.ts` — zip round-trip preserves `currency` + snapshot metadata

*Wave 0 stubs created during execution tasks 01 / 03.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Settings Edit toggles and session explainer | SET-02 | DOM + copy | Open Settings → Live rates → confirm merged card, Edit, Apply, reload clears session |
| Snapshot in exported zip | SNP-01, SNP-02 | File inspection | Record snapshot, export zip, verify `data.json` contains `reportingCurrency` / `rates` on last history point |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
