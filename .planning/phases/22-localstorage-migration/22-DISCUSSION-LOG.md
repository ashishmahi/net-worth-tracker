# Phase 22: localStorage Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 22-localstorage-migration
**Areas discussed:** saveData() API contract, QuotaExceeded error UX, localStorage key name, First-boot with no data

---

## saveData() API Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Keep async Promise\<void\> | No caller changes needed; localStorage.setItem runs synchronously but async wrapper stays | ✓ |
| Simplify to sync void | More honest API; requires updating ~10 call sites to remove await/try-catch | |
| Keep async, drop optimistic rollback | Stay async, remove snapshot-rollback pattern (not needed for localStorage) | |

**User's choice:** Keep async Promise\<void\>
**Notes:** Callers unchanged; rollback pattern can be removed as a simplification since localStorage is atomic.

---

## QuotaExceeded Error UX (STORE-05)

| Option | Description | Selected |
|--------|-------------|----------|
| New saveError state in context | Add saveError: string \| null alongside loadError; pages show inline error banner | |
| Throw the error, callers handle | saveData() throws on failure; existing catch blocks surface it inline | ✓ |
| Reuse loadError for all errors | Repurpose loadError as general appError; simpler but semantically blurry | |

**User's choice:** Throw the error, callers handle
**Notes:** Consistent with current fetch-based saveData() which already throws on failure.

---

## localStorage Key Name

| Option | Description | Selected |
|--------|-------------|----------|
| "fin-data" | Short, matches repo name | |
| "wealth-tracker-data" | More descriptive, matches app purpose | ✓ |
| "app-data" | Generic — risks collision with other apps on same origin | |

**User's choice:** "wealth-tracker-data"
**Notes:** Must not collide with existing "theme" key.

---

## First-Boot with No Data

| Option | Description | Selected |
|--------|-------------|----------|
| Silent fresh start | Start with createInitialData() silently; user imports zip from Settings if needed | ✓ |
| One-time hint banner | Show dismissible banner on first load with empty localStorage | |
| You decide | Leave to Claude's discretion | |

**User's choice:** Silent fresh start
**Notes:** Same behaviour as today when data.json is absent.

---

## Claude's Discretion

- `loadError` copy update: adjust string to say "browser storage" instead of `data.json` reference — Claude decides exact wording.
- Vitest localStorage mock strategy: `vi.stubGlobal` or in-memory mock — Claude decides approach.

## Deferred Ideas

- Cross-tab sync via `storage` event — deferred to future milestone.
- Storage quota monitoring UI — deferred (realistic data far below 5 MB limit).
- Auto-migration of `data.json` → `localStorage` — out of scope for v1.7.
