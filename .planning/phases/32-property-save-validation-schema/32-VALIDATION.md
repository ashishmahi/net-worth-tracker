---
phase: 32
slug: property-save-validation-schema
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` / Vitest defaults |
| **Quick run command** | `npm test -- --run src/lib/__tests__/propertyValidation.test.ts` |
| **Full suite command** | `npm test -- --run && npx tsc -b --pretty false` |
| **Estimated runtime** | ~15–45 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command covering new/edited tests
- **After every plan wave:** Full suite + `tsc`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | PRV-01–PRV-03 | T-32-01 | No inconsistent tuples persisted | unit | `npm test -- --run src/lib/__tests__/propertyValidation.test.ts` | ⬜ W0 | ⬜ pending |
| 32-01-02 | 01 | 1 | PRV-04 | T-32-02 | Schema rejects bad shapes | unit | `npm test -- --run src/lib/__tests__/schema.test.ts` | ✅ | ⬜ pending |
| 32-01-03 | 01 | 1 | PRV-04–PRV-05 | — | UI mirrors schema | unit + manual | `npm test -- --run && npx tsc -b` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- Existing Vitest + TypeScript cover this phase — **no** new framework install.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Save disabled tracks typing | PRV-04 | UX timing | Open sheet — toggle invalid combo — Save stays disabled until fixed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
