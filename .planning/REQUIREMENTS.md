# v1.7 Requirements — localStorage Migration

**Milestone:** v1.7  
**Goal:** Replace the Vite dev-server plugin (`GET`/`POST` `/api/data` → `data.json`) with browser `localStorage` as the sole persistence layer.  
**Status:** Active  
**Created:** 2026-05-02

---

## Active Requirements

### Persistence Layer Swap

- [x] **STORE-01**: User's app data loads from `localStorage` on boot (replacing `GET /api/data` fetch call)
- [x] **STORE-02**: User's app data saves to `localStorage` on every `saveData()` call (replacing `POST /api/data` fetch call)
- [x] **STORE-03**: Boot read uses `useState` lazy initializer (synchronous — eliminates flash-of-empty-state present with async fetch)
- [x] **STORE-04**: `saveData()` uses `setItem` only — never `localStorage.clear()` — to preserve the existing `theme` key
- [x] **STORE-05**: User sees a meaningful error message if `localStorage` write fails (e.g. `QuotaExceededError` including Safari private mode)

### Infrastructure Removal

- [x] **INFRA-01**: Vite dev-server plugin (`plugins/dataPlugin.ts`) is removed from `vite.config.ts`
- [x] **INFRA-02**: `plugins/dataPlugin.ts` file is deleted from the repo
- [x] **INFRA-03**: `data.json` is removed from active git tracking (added to `.gitignore` or removed via `git rm --cached`)

### UX Copy Cleanup

- [x] **UX-01**: All user-facing text referencing `data.json` or implying a running server (SettingsPage.tsx danger zone, import dialog, error messages) is updated to reference browser local storage

### Test Coverage

- [x] **TEST-01**: Existing Vitest tests pass after migration (fetch mocks replaced with `localStorage` mocks where needed)
- [x] **TEST-02**: Boot path (localStorage read → `DataSchema.safeParse` → `loadError` on invalid/absent data) is covered by unit tests

---

## Future Requirements (deferred)

- Cross-tab sync via `storage` event listener — deferred (single-user app, last-write-wins acceptable for v1.7)
- Storage quota monitoring UI — deferred (5 MB limit far exceeds realistic data size)
- Automatic migration of `data.json` contents to `localStorage` — out of scope (user exports zip from Settings before upgrading, imports after)

---

## Out of Scope

- Any data model / schema changes — the `DataSchema` (version: 1) is unchanged
- UI component changes beyond copy strings — no new pages, forms, or components
- Zip export/import flow changes — `wealthDataZip.ts` and `SettingsPage.tsx` export/import logic are persistence-agnostic and untouched
- Data reset logic changes — `createInitialData()` is unchanged; only the `saveData` I/O path changes
- Live prices, calculations, or dashboard changes — entirely unaffected

---

## Traceability

| REQ-ID | Phase | Plan |
|--------|-------|------|
| STORE-01 | 22 | TBD |
| STORE-02 | 22 | TBD |
| STORE-03 | 22 | TBD |
| STORE-04 | 22 | TBD |
| STORE-05 | 22 | TBD |
| INFRA-01 | 22 | TBD |
| INFRA-02 | 22 | TBD |
| INFRA-03 | 22 | TBD |
| UX-01 | 22 | TBD |
| TEST-01 | 22 | TBD |
| TEST-02 | 22 | TBD |
