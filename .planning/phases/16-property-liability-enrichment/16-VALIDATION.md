---
phase: 16
slug: property-liability-enrichment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (vitest section) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency** — suite runtime

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | PROP-01, PROP-02, PROP-03 | T-16-01 / — | React text nodes; no `dangerouslySetInnerHTML` | suite | `npm test` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- Existing infrastructure covers this phase — **no Wave 0 stub required**.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lender + EMI visible when liability on | PROP-01, PROP-02 | UX | Open Property sheet, toggle liability, confirm fields appear |
| Hint visible without toggle | PROP-03 | UX | Open sheet; confirm hint paragraph shows above conditional fields |

---

## Validation Sign-Off

- [ ] All tasks have automated verify (`npm test`) or documented manual steps
- [ ] Sampling continuity maintained
- [ ] No watch-mode flags in verify commands
- [ ] `nyquist_compliant: true` set in frontmatter when approved

**Approval:** pending
