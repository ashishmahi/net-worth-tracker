---
phase: 5
slug: dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test runner installed in project |
| **Config file** | none |
| **Quick run command** | `npm run build` (TypeScript compile check) |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` — must exit 0
- **After every plan wave:** Run `npm run build` + manual browser verification
- **Before `/gsd-verify-work`:** Build green + all manual checks complete
- **Max feedback latency:** ~5 seconds (build) + manual inspection

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DASH-01 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | DASH-01 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | DASH-01 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test framework to install. All verification is manual.

*Existing infrastructure covers all phase requirements (TypeScript type-checking via `npm run build` is the primary automated gate).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| calcCategoryTotals returns correct INR per category | DASH-01 | No test runner | Open browser, add sample data to each section, verify dashboard totals match manual calculation |
| Bitcoin row shows skeleton while loading | DASH-01 | Visual state | Throttle network in DevTools, verify skeleton appears on BTC/forex loading |
| Bitcoin row shows `—` when btcUsd is null | DASH-01 | Error state simulation | Mock null price, verify row shows `—` and total excludes BTC |
| Property equity = agreementInr − loan when hasLiability=true | DASH-01 | Domain logic | Add property with loan, verify dashboard shows equity not gross value |
| Gold row shows `—` when goldPrices not configured | DASH-01 | Missing config state | Clear Settings gold prices, verify gold row shows `—` |
| Clickable rows navigate to correct section | DASH-01 | Navigation behavior | Click each category row, verify correct page loads |
| grandTotal excludes null categories with disclaimer | DASH-01 | Error state | Simulate null price, verify disclaimer appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
