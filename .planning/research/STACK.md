# Technology Stack: v1.7 localStorage Migration

**Project:** Personal Wealth Tracker — fin
**Milestone:** v1.7 — Migrate persistence from Vite dev-server plugin to browser localStorage
**Researched:** 2026-05-02
**Overall confidence:** HIGH — conclusions drawn from direct codebase inspection and verified browser API behaviour

---

## Verdict: No new npm dependencies needed

The migration is a targeted swap of the I/O layer inside `AppDataContext.tsx`. Every existing capability — Zod schema, migration chain, `parseAppDataFromImport`, rollback pattern, `saveData` async signature — remains intact. The Web Storage API is already used in this codebase (`ThemeContext.tsx`) and provides the exact same pattern needed at larger scale.

---

## Recommended Approach: Plain `localStorage`

Replace the two `fetch('/api/data')` call sites in `AppDataContext.tsx` with `localStorage.getItem` / `localStorage.setItem`. Remove `dataPlugin` from `vite.config.ts`. Zero new packages.

**Why this is sufficient:**

| Factor | Detail |
|--------|--------|
| Data size | `data.json` is currently **4.5 KB** serialised. Even with 10 years of daily `netWorthHistory` snapshots (~1,500 entries) the blob stays under ~250 KB — well inside the 5 MB localStorage quota on every modern browser. |
| Existing pattern | `ThemeContext.tsx` already uses `localStorage.getItem` / `setItem` wrapped in `try/catch`. This is the proven in-project template. |
| Scope | The migration is only about swapping I/O. The data model, Zod schema, migration chain, and all callers are unchanged. |
| Async contract | `saveData` is already declared `async`. `localStorage.setItem` is synchronous; the `async` wrapper is kept to preserve the caller contract with no changes needed downstream. |

---

## Storage Key

Use a single key for the full app blob:

```ts
export const APP_DATA_KEY = 'wealthTrackerData' as const
```

Keep the theme key (`'theme'`) unchanged in `ThemeContext.tsx`. Do not merge the two.

---

## Implementation Pattern

### Load (replaces `fetch('/api/data')`)

```ts
useEffect(() => {
  try {
    const raw = localStorage.getItem(APP_DATA_KEY)
    if (!raw) return // first run or after deliberate clear — keep INITIAL_DATA, no error
    const result = parseAppDataFromImport(JSON.parse(raw))
    if (result.success) {
      setData(result.data)
    } else {
      console.warn('localStorage schema mismatch:', result.zodError.issues)
      setLoadError('Saved data format is unrecognised. Starting with defaults.')
    }
  } catch {
    setLoadError('Could not load saved data. Starting with defaults.')
  }
}, [])
```

- `JSON.parse` throws on corrupt stored strings — the outer `catch` handles it.
- `parseAppDataFromImport` runs the full migration chain unchanged (legacy bank accounts → netWorthHistory → otherCommodities → liabilities → safeParse).
- `null` return from `getItem` (first run, private browsing, or after data reset) falls through silently to `INITIAL_DATA`.

### Save (replaces `fetch('/api/data', { method: 'POST' })`)

```ts
async function saveData(newData: AppData): Promise<void> {
  const previous = data
  setData(newData) // optimistic update preserved (D-03)
  try {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(newData))
  } catch (err) {
    setData(previous) // revert on QuotaExceededError or SecurityError
    throw err // caller catches and shows inline error (D-02)
  }
}
```

- Rollback-on-failure behaviour is preserved identically.
- `QuotaExceededError` (storage full) and `SecurityError` (private-browsing block) are both thrown by `setItem` — the existing error-display path in callers handles them without changes.

---

## Libraries Considered and Rejected

### localforage (v1.10.0)

- **What it does:** Wraps IndexedDB / WebSQL / localStorage with an async `getItem` / `setItem` API; auto-selects the best backend.
- **Why considered:** Async-first, broadly cited in React persistence guides.
- **Why rejected:**
  - Last released in 2021 (v1.10.0) — effectively in maintenance mode. Confidence in long-term maintenance is LOW.
  - Async API means every `getItem` call in the boot `useEffect` needs `.then()` or `await`, and `saveData` needs genuine async unwrapping — more code, not less.
  - 8.8 KB minzipped for no user-visible benefit on a 4.5 KB blob.
  - IndexedDB backend adds no value for a single serialised document with no queries or indexes.

### idb-keyval (v6.2.x)

- **What it does:** Minimal promisified IndexedDB key-value wrapper; ~600 bytes minzipped.
- **Why considered:** Smallest possible IndexedDB abstraction, tree-shakeable.
- **Why rejected:** Same async-API overhead as localforage. IndexedDB is designed for large structured datasets with indexes — none of which this app uses. For a single JSON blob, the complexity is pure overhead.

### zustand + persist middleware (v5.x)

- **What it does:** Replaces React Context with a global store; the `persist` middleware serialises selected state to localStorage automatically.
- **Why considered:** Would eliminate manual `getItem` / `setItem`; handles partitioning persistent vs transient state.
- **Why rejected:** Migrating from `AppDataContext` to Zustand is a separate, larger refactor that is orthogonal to v1.7's goal. The existing context is well-tested, has clear rollback semantics, and its `saveData` async contract is used throughout the codebase. Expanding scope to a state-management rewrite introduces unnecessary risk for a 10-line I/O swap.

### use-local-storage-state / use-local-storage (hook wrappers)

- **Why rejected:** These hooks replace the context's load/save with a hook-level primitive, which would require redesigning `AppDataProvider`. The existing context abstraction is the right boundary — do not dissolve it into a hook.

---

## Files to Change

| File | Change |
|------|--------|
| `src/context/AppDataContext.tsx` | Replace `fetch('/api/data')` GET with `localStorage.getItem(APP_DATA_KEY)` + `JSON.parse`; replace `fetch('/api/data', POST)` with `localStorage.setItem(APP_DATA_KEY, JSON.stringify(newData))` |
| `vite.config.ts` | Remove `dataPlugin()` from the `plugins` array; remove `import { dataPlugin }` |
| `plugins/dataPlugin.ts` | Delete entirely |
| `data.json` | Delete (active persistence moves to localStorage; zip export/import is the backup path) |

---

## What Does NOT Change

| Concern | Status |
|---------|--------|
| `AppData` schema, Zod types, `DataSchema` | Unchanged |
| `parseAppDataFromImport` full migration chain | Unchanged |
| `createInitialData()` | Unchanged |
| `saveData` async signature and rollback pattern | Unchanged |
| `loadError` state and error UI | Unchanged |
| `netWorthHistory`, snapshots | Unchanged |
| Zip export / import (`wealthDataZip`, `cryptoUtils`) | Unchanged — operates on `AppData` objects; persistence layer is transparent |
| `useLivePrices`, `priceApi` | Unchanged |
| `ThemeContext` and `'theme'` key | Unchanged |
| All page components, hooks, callers of `useAppData()` | Unchanged |
| Vitest test suite | Unchanged — context tests mock `fetch`; after migration they mock `localStorage` |

---

## Test Considerations

`src/context/__tests__/AppDataContext.test.ts` currently tests `parseAppDataFromImport` and `createInitialData` only — it does not test the `fetch` calls. After migration, if integration tests for boot/save are added, use `vitest`'s `vi.stubGlobal('localStorage', ...)` or a `localStorage` mock — no new test library needed.

---

## Storage Size Headroom

| Scenario | Estimated size |
|----------|---------------|
| Current `data.json` (v1.6) | 4.5 KB |
| 365 snapshots (1 year daily) | ~55 KB |
| 3,650 snapshots (10 years daily) | ~550 KB |
| localStorage quota (all modern browsers) | 5 MB |

Quota is not a practical concern for this app's data model.

---

## Version / Compatibility Notes

| Item | Notes |
|------|-------|
| `localStorage` Web API | Native browser API; no polyfill; available in all environments this app targets |
| `JSON.stringify` / `JSON.parse` | Native; no library |
| `QuotaExceededError` | Thrown by `setItem` when storage is full; `SecurityError` thrown in some private-browsing contexts — both caught by the existing `try/catch` pattern |
| No new npm packages | Zero version pinning concerns for this milestone |

---

## Installation

```bash
# No new packages. No version changes.
# This milestone is a pure code change + file deletion.
```

---

## Sources

- In-project: `src/context/AppDataContext.tsx`, `src/context/ThemeContext.tsx`, `plugins/dataPlugin.ts`, `vite.config.ts`, `package.json`
- MDN Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- localStorage limits and QuotaExceededError: https://rxdb.info/articles/localstorage.html
- localforage npm (maintenance status): https://www.npmjs.com/package/localforage
- idb-keyval vs localforage comparison: https://npm-compare.com/dexie,idb-keyval,localforage
- zustand persist middleware: https://zustand.docs.pmnd.rs/reference/middlewares/persist

---
*Stack research for: v1.7 localStorage Migration — Personal Wealth Tracker*
*Researched: 2026-05-02*
