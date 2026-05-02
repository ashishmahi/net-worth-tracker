---
phase: 21
slug: improve-ui-passphrase-modal-zip-export
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (Vitest plugin) / project defaults |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | ~10–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | Zip utility (D-01–D-03, D-12) | T-21-01 | AES-256 only; no passphrase logs | unit | `npm test` | ✅ `src/lib/*.test.ts` | ⬜ pending |
| 21-01-02 | 01 | 1 | Settings UI (D-04–D-11, D-13–D-14) | T-21-02… | Modal-only secrets | integration | `npm test && npm run build` | ✅ `SettingsPage.tsx` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing Vitest + `npm test` covers `cryptoUtils` — extend with zip module tests in Wave 1

*Wave 0:* Existing infrastructure covers crypto; zip tests added in Plan 01 Task 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| Export modal focus + zip download | UI-SPEC | Browser file download | Export → modal → blank passphrase → open zip → `data.json` present |
| Encrypted export | D-01 | OS unzip may prompt | Set passphrase → download → unzip with password → valid JSON |
| Import branches | D-07–D-10 | File picker + dialogs | `.zip` plain vs encrypted vs wrong `.json` error path |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual table above
- [ ] Sampling continuity: zip unit tests between UI edits
- [ ] No watch-mode flags in CI commands
- [ ] Feedback latency < 60s for automated slice
- [ ] `nyquist_compliant: true` set in frontmatter after UAT

**Approval:** pending
