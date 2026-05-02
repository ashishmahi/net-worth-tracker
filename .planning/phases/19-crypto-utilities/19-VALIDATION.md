---
phase: 19
slug: crypto-utilities
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/__tests__/cryptoUtils.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5–15 seconds (PBKDF2 600k iterations per encrypt/decrypt call) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/__tests__/cryptoUtils.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds (dominated by PBKDF2)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | ENC-02, ENC-03 | T-19-01 / T-19-02 | Tests assert envelope shape and crypto behavior | unit | `npx vitest run src/lib/__tests__/cryptoUtils.test.ts` | ✅ | ⬜ pending |
| 19-01-02 | 01 | 1 | ENC-02, ENC-03 | T-19-03 | No passphrase logging; typed error on failure | unit | `npx vitest run src/lib/__tests__/cryptoUtils.test.ts` && `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — Vitest + `vitest.config.ts` already present; no Wave 0 stub install.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| — | — | — | All phase behaviors have automated verification. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency acceptable for PBKDF2 cost
- [ ] `nyquist_compliant: true` set in frontmatter after execution

**Approval:** pending
