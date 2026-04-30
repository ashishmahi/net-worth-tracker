---
phase: 12
slug: commodities-data-net-worth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-30
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (not yet installed — Wave 0 installs) |
| **Config file** | None — Wave 0 creates `vitest.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| schema-01 | schema | 0 | COM-01 | — | N/A | unit | `npx vitest run src/lib/__tests__/schema.test.ts` | ❌ W0 | ⬜ pending |
| migration-01 | migration | 0 | COM-01 | — | N/A | unit | `npx vitest run src/lib/__tests__/migration.test.ts` | ❌ W0 | ⬜ pending |
| calcs-01 | calcs | 1 | COM-02 | — | N/A | unit | `npx vitest run src/lib/__tests__/dashboardCalcs.test.ts` | ❌ W0 | ⬜ pending |
| calcs-02 | calcs | 1 | COM-02 | — | N/A | unit | `npx vitest run src/lib/__tests__/dashboardCalcs.test.ts` | ❌ W0 | ⬜ pending |
| calcs-03 | calcs | 1 | COM-02 | — | N/A | unit | `npx vitest run src/lib/__tests__/dashboardCalcs.test.ts` | ❌ W0 | ⬜ pending |
| calcs-04 | calcs | 1 | COM-02 | — | N/A | unit | `npx vitest run src/lib/__tests__/dashboardCalcs.test.ts` | ❌ W0 | ⬜ pending |
| calcs-05 | calcs | 1 | COM-02 | — | N/A | unit | `npx vitest run src/lib/__tests__/dashboardCalcs.test.ts` | ❌ W0 | ⬜ pending |
| context-01 | context | 1 | COM-05 | — | N/A | unit | `npx vitest run src/context/__tests__/AppDataContext.test.ts` | ❌ W0 | ⬜ pending |
| context-02 | context | 1 | COM-05 | — | N/A | unit | `npx vitest run src/context/__tests__/AppDataContext.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install Vitest: `npm install --save-dev vitest`
- [ ] `src/lib/__tests__/schema.test.ts` — COM-01: DataSchema accepts old data.json after migration; accepts standard + manual items
- [ ] `src/lib/__tests__/migration.test.ts` — COM-01: ensureOtherCommodities injects empty shell when key absent
- [ ] `src/lib/__tests__/dashboardCalcs.test.ts` — COM-02: sumCommoditiesInr — empty=0, manual-only, silver-null, silver-priced, mixed
- [ ] `src/context/__tests__/AppDataContext.test.ts` — COM-05: createInitialData has otherCommodities; parseAppDataFromImport validates union

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Silver live price fetch resolves in browser | COM-02 | Network call, no mock needed | Run `npm run dev`; open Dashboard; verify "Commodities" row appears with silver value (or silver-unavailable message) |
| Existing data.json loads without errors | COM-01 | End-to-end migration path | Run `npm run dev` with pre-existing data.json (no otherCommodities key); verify app loads and dashboard shows 0 for Commodities |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
