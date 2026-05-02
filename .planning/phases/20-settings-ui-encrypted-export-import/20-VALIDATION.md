---
phase: 20
slug: settings-ui-encrypted-export-import
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | ENC-01 | — | exportBusy disables button during async op | manual | — | — | ⬜ pending |
| 20-01-02 | 01 | 1 | ENC-04 | — | encrypted: true triggers passphrase prompt | manual | — | — | ⬜ pending |
| 20-01-03 | 01 | 1 | ENC-05 | — | correct passphrase decrypts and loads data | integration | `npm test` | ✅ existing | ⬜ pending |
| 20-01-04 | 01 | 1 | ENC-06 | — | wrong passphrase shows inline error, data unchanged | integration | `npm test` | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — existing infrastructure covers all phase requirements.

*Existing infrastructure covers all phase requirements. Phase 19 tests in `src/lib/__tests__/cryptoUtils.test.ts` cover ENC-05 and ENC-06 crypto correctness. ENC-01 and ENC-04 are DOM-interaction behaviors verified by manual smoke-test.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blank passphrase → plain JSON export downloaded | ENC-01 | File download requires full browser DOM + Blob API | Enter blank passphrase, click Export, verify file is plain JSON |
| Non-blank passphrase → encrypted file downloaded | ENC-01 | File download requires full browser DOM | Enter passphrase, click Export, verify file has `encrypted: true` field |
| Plain JSON import → no passphrase prompt, data loads | ENC-04 | Requires DOM file input interaction | Select plain JSON file, verify no decrypt UI appears, data loads normally |
| Encrypted file import → passphrase field appears | ENC-04 | Requires DOM file input interaction | Select encrypted JSON file, verify passphrase field + Decrypt button appear inline |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
