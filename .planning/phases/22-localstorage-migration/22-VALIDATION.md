---
phase: 22
slug: localstorage-migration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` (Vitest section) / `vitest` defaults |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** `npm test`
- **After every plan wave:** `npm test` && `npm run build`
- **Before `/gsd-verify-work`:** Full suite green
- **Max feedback latency:** &lt; 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 1 | STORE-01..05 | T-22-01 / — | No `clear()`; throws on quota | unit + build | `npm test && npm run build` | ✅ | ⬜ pending |
| 22-01-02 | 01 | 1 | TEST-01, TEST-02 | — | Boot paths covered | unit | `npm test` | ✅ | ⬜ pending |
| 22-01-03 | 01 | 1 | INFRA-01..03 | — | No plugin / api routes | grep + build | `npm run build` | ✅ | ⬜ pending |
| 22-01-04 | 01 | 1 | UX-01 | — | Copy grep | grep | `rg` / `grep` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing Vitest infrastructure covers this phase — **no new test runner install**.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No flash of empty dashboard on refresh | Roadmap SC 1 | Visual | Load app with populated storage → refresh → data visible first paint |
| Theme survives save cycle | Roadmap SC 3 | Browser integration | Set theme, edit asset, reload — theme + data both preserved |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency &lt; 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
