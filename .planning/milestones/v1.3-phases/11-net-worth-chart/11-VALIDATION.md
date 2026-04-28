---
phase: "11"
slug: net-worth-chart
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-28
---

# Phase 11 — Validation Strategy

> No Vitest/Jest in project; validation is **build + lint** + manual UAT per `11-RESEARCH.md` Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (TypeScript + ESLint only) |
| **Config file** | `tsconfig.*`, `eslint.config.js` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task / wave:** `npm run build` (and `npm run lint` for touched TS/TSX)
- **Before UAT:** Full `build` + `lint` green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 11-01-01 | 01 | 1 | NWH-04 | T-11-01-01 | Client-side only; no new persistence | build | `npm run build` | ⬜ |
| 11-01-01 | 01 | 1 | NWH-04 | — | Empty state copy | grep + manual | see PLAN verification | ⬜ |

---

## Wave 0 Requirements

Existing infrastructure: `npm run build` and `npm run lint`. No new test project.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chart with ≥2 points, both themes | NWH-04 | Visual | Record two snapshots (or import JSON with 2+ history rows); verify **Net worth over time** + series in **light** and **dark**. |
| Empty state 0–1 points | NWH-04 | Visual | Clear history or use one snapshot; verify **Need two snapshots to see a trend** and **no** misleading trend line. |
| Tooltip compact INR | 11-UI-SPEC | Visual | Hover a point; amount + date readable, not a tall block. |

---

## Validation Sign-Off

- [ ] `npm run build` green after implementation
- [ ] `npm run lint` green
- [ ] Manual UAT table executed

**Approval:** pending
