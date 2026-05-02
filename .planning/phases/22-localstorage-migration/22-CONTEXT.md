# Phase 22: localStorage Migration - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace `AppDataContext`'s `fetch`/`data.json` I/O with `localStorage`, remove the Vite dev-server plugin and `data.json` from active tracking, update user-facing copy, and update/add Vitest tests. Single coherent change — no schema, data model, or UI component changes beyond copy strings.

</domain>

<decisions>
## Implementation Decisions

### saveData() API Contract
- **D-01:** Keep `saveData()` as `async Promise<void>` — no caller changes needed. localStorage.setItem runs synchronously under the hood but the async wrapper stays for interface compatibility. Remove the optimistic-rollback pattern (previous-snapshot variable) since localStorage writes are atomic and don't need it.

### Error Handling (STORE-05)
- **D-02:** On `localStorage.setItem` failure (e.g. `QuotaExceededError`), `saveData()` throws the error — callers handle it in their existing `try/catch` blocks. No new context-level `saveError` state needed. This is already how the current fetch-based `saveData()` works — the pattern is unchanged.

### localStorage Key
- **D-03:** Use `"wealth-tracker-data"` as the localStorage key for app data. This is distinct from the existing `"theme"` key (used by `ThemeContext`). `saveData()` must only call `setItem("wealth-tracker-data", ...)` — never `localStorage.clear()` — to preserve `"theme"`.

### First-Boot with No Data
- **D-04:** Silent fresh start — when `"wealth-tracker-data"` is absent or unparseable, fall back to `createInitialData()` silently (same behaviour as today when `data.json` is absent). No banner or hint UI needed. Users who need to restore data use the zip import in Settings.

### Boot Read Pattern
- **D-05:** Replace `useEffect + fetch` with a `useState` lazy initializer — synchronous read of `localStorage.getItem("wealth-tracker-data")` → `parseAppDataFromImport()` → `createInitialData()` fallback. Eliminates flash-of-empty-state (STORE-03).

### Claude's Discretion
- How to expose `loadError` when the localStorage value exists but fails `DataSchema.safeParse` — same string copy as today is fine, or adjust to say "browser storage" instead of `data.json`.
- Test mock strategy for `localStorage` in Vitest — use `vi.stubGlobal` or a minimal in-memory mock; either approach is acceptable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Persistence Layer
- `src/context/AppDataContext.tsx` — current fetch-based implementation; the boot `useEffect` and `saveData()` are the two functions being replaced
- `src/context/__tests__/AppDataContext.test.ts` — existing tests; fetch mocks to be replaced with localStorage mocks

### Plugin to Remove
- `plugins/dataPlugin.ts` — Vite dev-server plugin; to be deleted entirely
- `vite.config.ts` — remove `dataPlugin()` from `plugins` array

### Copy Strings to Update (UX-01)
- `src/pages/SettingsPage.tsx` — two occurrences: danger zone copy (`data.json`) and zip import error message

### Existing localStorage Pattern (reference)
- `src/context/ThemeContext.tsx` — shows how `localStorage` is used for `"theme"` key; `saveData` must not disturb this key

### Requirements
- `.planning/REQUIREMENTS.md` — v1.7 requirements (STORE-01–05, INFRA-01–03, UX-01, TEST-01–02)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `parseAppDataFromImport()` — already handles the full migration chain (legacy bank accounts, netWorthHistory, otherCommodities, liabilities → safeParse). Boot read uses the same function; no new parse logic needed.
- `createInitialData()` — fallback for absent/invalid data; unchanged.
- `ThemeContext.tsx` — existing `localStorage` usage pattern in the codebase.

### Established Patterns
- `saveData()` throws on failure; callers use `try { await saveData(...) } catch (err) { setError(...) }` — this pattern is preserved.
- `loadError: string | null` in context value — signals boot-time parse failure to the UI; unchanged.
- Optimistic update (`setData(newData)` before the async I/O) — can be retained or simplified; since `setItem` is synchronous there is no intermediate "pending" state to roll back from.

### Integration Points
- `AppDataProvider` in `src/main.tsx` (or `App.tsx`) wraps the tree — no changes to provider placement.
- `data.json` at repo root — to be removed from git tracking (`git rm --cached data.json` + `.gitignore` entry).
- `wealthDataZip.ts` / zip export/import — persistence-agnostic, untouched.

</code_context>

<specifics>
## Specific Ideas

- No specific UI references — the change is entirely in the context and infrastructure layer.
- The boot path changes from async `useEffect` → synchronous `useState(() => { ... })` lazy initializer. This is the key structural change.

</specifics>

<deferred>
## Deferred Ideas

- Cross-tab sync via `storage` event listener — already deferred in REQUIREMENTS.md (single-user, last-write-wins acceptable).
- Storage quota monitoring UI — already deferred (5 MB limit far exceeds realistic data size).
- Automatic migration of `data.json` → `localStorage` — out of scope; user exports zip before upgrading, imports after.

</deferred>

---

*Phase: 22-localstorage-migration*
*Context gathered: 2026-05-02*
