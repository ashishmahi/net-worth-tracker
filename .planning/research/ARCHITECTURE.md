# Architecture Research — v1.7 localStorage Migration

**Domain:** Personal finance tracker — replacing Vite dev-server persistence with browser localStorage
**Researched:** 2026-05-02
**Confidence:** HIGH (based on direct code inspection of all relevant source files)

---

## Summary

The migration is a surgical swap inside `AppDataContext.tsx`. The public contract of the context
(`data`, `saveData`, `loadError`) does not change, so all 11 pages and every test that only
imports from `AppDataContext` need zero modifications. The Vite plugin and `data.json` are the
only things being retired. Everything else — schema, migration chain, zip export/import, reset,
schema versioning — stays exactly as-is.

---

## What Changes (Modified)

### 1. `src/context/AppDataContext.tsx` — THE only required change

This file is the sole coupling point between the app and the persistence layer. Only the
`useEffect` (load) and `saveData` function body change. The public API — exported types,
`createInitialData()`, `parseAppDataFromImport()`, `useAppData()`, migration helpers — is
**unchanged**.

**Current load (lines 138–151):**
```typescript
useEffect(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(raw => {
      const result = parseAppDataFromImport(raw)
      if (result.success) {
        setData(result.data)
      } else {
        console.warn('data.json schema mismatch:', result.zodError.issues)
        setLoadError('Saved data format is unrecognized. Starting with defaults to avoid data loss.')
      }
    })
    .catch(() => setLoadError('Could not load saved data. Starting with defaults.'))
}, [])
```

**Replacement load:**
```typescript
const LS_KEY = 'wealthData'

useEffect(() => {
  try {
    const stored = localStorage.getItem(LS_KEY)
    if (stored === null) {
      // First launch — no stored data, stay with createInitialData() defaults, no error
      return
    }
    let raw: unknown
    try {
      raw = JSON.parse(stored) as unknown
    } catch {
      setLoadError('Saved data is corrupted. Starting with defaults to avoid data loss.')
      return
    }
    const result = parseAppDataFromImport(raw)
    if (result.success) {
      setData(result.data)
    } else {
      console.warn('localStorage schema mismatch:', result.zodError.issues)
      setLoadError('Saved data format is unrecognised. Starting with defaults to avoid data loss.')
    }
  } catch {
    // localStorage unavailable (private browsing, quota, security policy)
    setLoadError('Could not access local storage. Data will not persist across reloads.')
  }
}, [])
```

**Current saveData (lines 153–170):**
```typescript
async function saveData(newData: AppData): Promise<void> {
  const previous = data
  setData(newData)
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    })
    if (!res.ok) {
      setData(previous)
      throw new Error(`Save failed: ${res.status}`)
    }
  } catch (err) {
    setData(previous)
    throw err
  }
}
```

**Replacement saveData:**
```typescript
async function saveData(newData: AppData): Promise<void> {
  const previous = data
  setData(newData)  // optimistic update preserved
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(newData))
  } catch (err) {
    setData(previous)  // rollback preserved
    throw err  // caller error surfaces unchanged
  }
}
```

The `async` signature and error-throwing contract are preserved verbatim. All callers (`saveData`
is awaited with try/catch in every page) continue to work without changes.

**`LS_KEY` constant:** `'wealthData'` — a new key separate from the existing `'theme'` key
(used by `ThemeContext`). Coexistence is safe; no conflicts.

---

### 2. `vite.config.ts` — Plugin reference removed

**Current:**
```typescript
import { dataPlugin } from './plugins/dataPlugin'
export default defineConfig({
  plugins: [react(), dataPlugin()],
  ...
})
```

**After:**
```typescript
export default defineConfig({
  plugins: [react()],
  ...
})
```

The `dataPlugin` import line and the plugin entry in the array are deleted.

---

## What Is Removed

### `plugins/dataPlugin.ts`

The entire file is deleted. It is not imported anywhere except `vite.config.ts`.

No test references this file. No `src/` code imports from `plugins/`.

### `data.json` — Retire, Do Not Remove Immediately

`data.json` at the repo root is no longer read or written by the running app after migration.

**Recommended handling:**

1. **Keep the file in the repo for v1.7** as a migration seed reference and historical record.
   Add a comment in `data.json` or a note in the commit message. Do not automatically seed
   localStorage from it — that would require server-side access during the Vite plugin era and
   adds complexity for zero user value.
2. **Add `data.json` to `.gitignore`** (or remove from tracking) in a follow-on cleanup if
   desired. It is safe to do either during the same milestone.

**Rationale for not seeding from `data.json`:** Users who have been running the app already have
their data in `data.json` via the Vite plugin. To migrate their data to localStorage, the app
would need to either (a) still serve `/api/data` temporarily alongside localStorage, or (b)
require a manual export/import step. For a personal local app with one known user, a one-time
manual import using the existing zip export/import flow in Settings is the cleanest path with no
added code complexity. Document this in migration notes.

---

## What Stays Exactly the Same

| Component | Why Unchanged |
|-----------|--------------|
| `src/types/data.ts` | Schema, types, `DataSchema`, `AppData` — untouched |
| `parseAppDataFromImport()` | Migration chain is persistence-agnostic; same function handles zip import, localStorage, and future sources |
| `createInitialData()` | First-launch and reset logic unchanged |
| `INITIAL_DATA` export | Unchanged |
| `ensureLiabilities()`, `ensureOtherCommodities()`, `ensureNetWorthHistory()`, `migrateLegacyBankAccounts()` | All migration helpers unchanged |
| All 11 page components | Consume only `useAppData()` — zero awareness of storage backend |
| `src/lib/wealthDataZip.ts` | Export/import zip flows are in-memory (`JSON.stringify(data)` → zip). They call `saveData()` via `onConfirmImport()` in SettingsPage, which now writes to localStorage. Zero changes needed. |
| `src/context/ThemeContext.tsx` | Already uses `localStorage` with key `'theme'`. No changes, no key conflicts. |
| `src/context/LivePricesContext.tsx` | Price caching is in-memory session state. Unchanged. |
| `src/lib/dashboardCalcs.ts` | Pure computation, no I/O. Unchanged. |
| `src/lib/cryptoUtils.ts` | Web Crypto utility, no I/O. Unchanged. |
| `src/lib/__tests__/` | All existing tests remain valid |
| `src/context/__tests__/AppDataContext.test.ts` | Tests `createInitialData()` and `parseAppDataFromImport()` — no fetch or filesystem. Remain valid. |
| Schema versioning (`"version": 1`) | Lives in `createInitialData()` and `DataSchema`. Load path still runs `parseAppDataFromImport()` which enforces `z.literal(1)`. Unchanged. |

---

## Data Flow Diagram (Before and After)

### Before (v1.6)

```
Browser                        Vite Dev Server              Filesystem
──────                         ────────────────             ──────────
AppDataProvider boot
  fetch('GET /api/data') ──►  dataPlugin handler
                               fs.readFileSync(data.json) ──► data.json
                          ◄──  200 { …AppData JSON… }
  JSON.parse → parseAppDataFromImport → setData

user action → page calls saveData(newData)
  setData(newData) [optimistic]
  fetch('POST /api/data') ──► dataPlugin handler
                               JSON.parse(body)
                               fs.writeFileSync(data.json) ──► data.json
                         ◄──  200 { ok: true }
```

### After (v1.7)

```
Browser                                           Filesystem (unchanged)
──────                                            ──────────────────────
AppDataProvider boot
  localStorage.getItem('wealthData')              [data.json ignored]
  → JSON.parse → parseAppDataFromImport → setData

user action → page calls saveData(newData)
  setData(newData) [optimistic, preserved]
  localStorage.setItem('wealthData', JSON.stringify(newData))
  (synchronous — no network, no promise needed)
  [saveData is still async, throw on setItem failure]
```

### Export/Import Flow (v1.7 — unchanged path)

```
Export: data (AppData in memory) → JSON.stringify → createWealthExportZip → .zip download
Import: .zip file → extractDataJsonFromZip → JSON.parse → parseAppDataFromImport
         → setPendingImport → onConfirmImport → saveData(pendingImport)
         → localStorage.setItem('wealthData', …)   ← only this line changes
```

### Data Reset Flow (v1.7 — unchanged path)

```
SettingsPage "Clear all data"
  → saveData(createInitialData())
  → localStorage.setItem('wealthData', JSON.stringify(createInitialData()))
  ← same as before, different storage target
```

---

## Schema Versioning Interaction

`version: 1` is enforced by `DataSchema = z.object({ version: z.literal(1), … })`.

The load path runs `parseAppDataFromImport()` on the string parsed from localStorage, which
includes the full migration chain and `DataSchema.safeParse()`. If a future version bumps to
`version: 2`, the load fails the literal check and falls into the `setLoadError` path — same
behaviour as with the file-based approach.

**No changes needed to schema versioning for this migration.** The key insight is that
`parseAppDataFromImport()` is persistence-agnostic: it accepts `unknown` and returns a typed
result. The localStorage migration does not change the invariant at all.

---

## `localStorage` Storage Capacity Consideration

A typical full `AppData` payload (all asset classes with real data, hundreds of net-worth history
points) serialises to roughly 50–200 KB of JSON. `localStorage` quota is 5 MB in all major
browsers. This is not a concern for this personal local app.

The quota guard is handled by the `try/catch` around `localStorage.setItem()` in `saveData` —
a `QuotaExceededError` will be caught, the optimistic `setData` will roll back, and the error
propagates to the page's inline error state (existing pattern).

---

## Integration Points: New vs Modified

| Artifact | Status | Change |
|----------|--------|--------|
| `src/context/AppDataContext.tsx` | **Modified** | Replace `useEffect` fetch with `localStorage.getItem`; replace `saveData` body with `localStorage.setItem`; add `LS_KEY` constant |
| `vite.config.ts` | **Modified** | Remove `dataPlugin` import and plugin entry |
| `plugins/dataPlugin.ts` | **Deleted** | Entire file deleted |
| `data.json` | **Retired** | No longer read/written; keep in repo for v1.7, optional cleanup after |
| All `src/pages/*.tsx` | **Unchanged** | Consume `useAppData()` — zero awareness of storage backend |
| `src/lib/wealthDataZip.ts` | **Unchanged** | Works with in-memory data; `saveData()` target is transparent |
| `src/context/ThemeContext.tsx` | **Unchanged** | Already uses localStorage with different key |
| `src/types/data.ts` | **Unchanged** | Schema and types unaffected |
| All `src/lib/*.ts` | **Unchanged** | Pure utilities, no I/O |
| All existing tests | **Unchanged** | AppDataContext tests test pure functions only |

---

## Suggested Build Order

Dependencies flow strictly from the context layer outward. There is only one phase of real work.

```
Phase 22 (single phase — all changes in one coherent unit)

  Step 1: Add LS_KEY constant to AppDataContext.tsx
  Step 2: Replace useEffect fetch block with localStorage.getItem + JSON.parse
          (preserves same error message strings for loadError)
  Step 3: Replace saveData async body with localStorage.setItem
          (preserves async signature, optimistic update, rollback on error)
  Step 4: Remove dataPlugin import and array entry from vite.config.ts
  Step 5: Delete plugins/dataPlugin.ts
  Step 6: Run npm test — all existing tests pass without changes
  Step 7: Manual smoke test: reload page, edit data, confirm persistence across reload
  Step 8: Manual migration test: export via zip in Settings, clear, import, verify round-trip
  Step 9: Update danger-zone copy in SettingsPage.tsx (line 963):
          "local data.json file" → "browser's local storage"
          (Minor copy-only change — no logic change)
  Step 10: Update AppDataContext comment at line 80 from
           "GET /api/data load" to "localStorage load"
```

All 10 steps are in one phase because they are tightly coupled — an intermediate state where
`vite.config.ts` has `dataPlugin` removed but `AppDataContext` still calls `fetch('/api/data')`
is non-functional. The phase should be committed atomically.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Adding a localStorage abstraction layer

**What some do:** Create a `src/lib/storage.ts` with `getItem`/`setItem` wrappers, then call
those from `AppDataContext`, to make the persistence layer swappable.

**Why to skip it for this project:** The project constraints explicitly state there is no backend,
no deployment, no cloud sync in v1.x. Abstraction adds indirection with zero current benefit.
`ThemeContext` calls `localStorage` directly with no wrapper and has been correct since v1.1.
Follow the same pattern.

### Anti-Pattern 2: Seeding localStorage from data.json on first load

**What some do:** On first boot, if `localStorage.getItem('wealthData')` is null, serve a
one-time fallback `GET /api/data` to migrate existing `data.json` into localStorage.

**Why to skip it:** This requires keeping the Vite plugin alive during migration, adds async
complexity to the boot path, and creates a two-step "load from file, then save to localStorage"
path that is indistinguishable from normal load to the user. For a personal local app, the
clean path is: document the one-time manual export/import step, remove the plugin cleanly, and
start fresh from localStorage. Fewer moving parts.

### Anti-Pattern 3: Making saveData synchronous

**What some do:** Change `saveData` from `async function` to a plain function since
`localStorage.setItem` is synchronous.

**Why to skip it:** The public contract of `AppDataContextValue` is `saveData: (newData: AppData) => Promise<void>`. Every page awaits it inside a `try/catch`. Changing the return type to `void`
breaks all 11 call sites and changes the TypeScript type. Keep `async` — an async function that
does synchronous work is perfectly valid and zero cost.

### Anti-Pattern 4: Parsing localStorage value inside saveData callers

**What some do:** Have pages call `localStorage.getItem` directly for reading, bypassing context.

**Why it's wrong:** `AppDataContext` is the single source of truth for `AppData`. Direct
localStorage reads in pages bypass the migration chain, Zod parsing, and the `data` state
reference. All reads must go through `useAppData()`.

---

## Sources

- Direct inspection: `src/context/AppDataContext.tsx` — full load/save implementation
- Direct inspection: `plugins/dataPlugin.ts` — complete Vite plugin (48 lines, no hidden behaviour)
- Direct inspection: `vite.config.ts` — plugin registration
- Direct inspection: `src/context/ThemeContext.tsx` — existing localStorage pattern in this codebase
- Direct inspection: `src/pages/SettingsPage.tsx` — zip export/import flow, saveData call sites
- Direct inspection: `src/types/data.ts` — DataSchema, version literal
- Context: `.planning/PROJECT.md` — v1.7 milestone goals

---
*Architecture research for: v1.7 localStorage Migration — Personal Wealth Tracker*
*Researched: 2026-05-02*
