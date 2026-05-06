---
phase: 31
slug: guided-property-entry-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (via Vite) |
| **Config file** | `vite.config.ts` / `package.json` test script |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~10–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run` and `npx tsc -b --pretty false`
- **After every plan wave:** Same
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | PRP-01, PRP-02, PRP-03 | T-31-01 / T-31-02 | N/A (local UI) | unit + build | `npm test -- --run` | ⬜ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/propertyEntryPath.test.ts` (or co-located) — tests for path inference / field-clear helpers if introduced
- [ ] **If no pure helpers:** "Existing infrastructure covers phase requirements" for unit tests; rely on `tsc` + manual UAT

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Three paths — no irrelevant clutter | PRP-01, PRP-02 | Visual/UX | Add property: select each path; confirm sections match **UI-SPEC** table. |
| Edit reopen — correct segment | PRP-01 | Session + inference | Save item per path; reopen; confirm segment and fields. |
| Helper copy voice + net-worth hints | PRP-02 | Wording | Read sheet for second-person, light hints. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
