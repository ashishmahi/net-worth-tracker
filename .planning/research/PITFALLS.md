# Pitfalls Research — v1.7 localStorage Migration

**Domain:** Migrating a React + Vite personal finance app from a Vite dev-server API (`GET`/`POST /api/data` → `data.json`) to browser `localStorage`
**Researched:** 2026-05-02
**Confidence:** HIGH — based on direct code inspection of `AppDataContext.tsx`, `ThemeContext.tsx`, `SettingsPage.tsx`, `plugins/dataPlugin.ts`, `data.json`, and `src/types/data.ts`, supplemented by current web sources

---

## Migration Context

The app currently persists data via a Vite plugin that reads/writes `data.json` on disk. `AppDataContext` calls `fetch('/api/data')` on boot and `fetch('/api/data', { method: 'POST' })` on every save. `ThemeContext` already uses `localStorage` (key `"theme"`). The migration goal is to make `localStorage` the sole persistence layer and remove the plugin entirely.

**Current localStorage surface before v1.7:**
- `"theme"` — `"light"` | `"dark"` (used by `ThemeContext.tsx` and the FOUC script in `index.html`)

**What v1.7 adds:**
- A new key (e.g. `"wealthData"`) holding the entire `AppData` object as a JSON string.

---

## Critical Pitfalls

### Pitfall 1: Using `localStorage.clear()` in the Danger-Zone Data Reset

**What goes wrong:**
`SettingsPage` danger-zone calls `await saveData(createInitialData())`. After migration, `saveData` will write to `localStorage`. If `saveData` is naively implemented as `localStorage.clear(); localStorage.setItem('wealthData', ...)`, the `clear()` wipes **every key** on the origin — including the `"theme"` key. The user's dark/light mode preference is silently destroyed by a data reset. On the next page load, the FOUC script reads `localStorage.getItem('theme')` → `null` → defaults to light, causing a theme flash even for users who had dark mode configured.

**Why it happens:**
`localStorage.clear()` is origin-scoped and removes all keys. It is the most obvious "start fresh" primitive, but it is wrong here because `"theme"` must survive a wealth-data reset. The two concerns (data persistence, theme persistence) share the same origin storage.

**Prevention:**
- `saveData` must call `localStorage.setItem('wealthData', JSON.stringify(newData))` only — never `localStorage.clear()`.
- Data reset path: `await saveData(createInitialData())` as-is. The context calls `saveData`, which calls `setItem` on `'wealthData'` only. Theme is untouched.
- Add a test or manual checklist item: after data reset, `localStorage.getItem('theme')` must still be the user's prior preference.

**Phase:** Phase 22 (AppDataContext migration) — the constraint on `saveData` is the definition of the function contract.

---

### Pitfall 2: Quota Exceeded Crash on `setItem`

**What goes wrong:**
`localStorage.setItem()` throws a `DOMException` with `name === 'QuotaExceededError'` (Chrome/Firefox) or `name === 'NS_ERROR_DOM_QUOTA_REACHED'` (Firefox legacy) when the origin's storage budget is exceeded. The budget is typically 5 MiB per origin but varies by browser. In Safari private browsing the quota is **zero** — every `setItem` throws even when storage is empty. If the `saveData` function does not catch this error, the exception propagates through the React tree as an unhandled promise rejection, leaving the in-memory state updated while the persisted state remains stale or absent.

The current `data.json` for this app is ~4.5 KB. Even with aggressive history growth (hundreds of net-worth snapshots) the data is unlikely to reach 5 MB in practice, but the throw path must still be handled to avoid a silent data-loss scenario in private/restricted environments.

**Why it happens:**
`localStorage.setItem` is synchronous and throws synchronously. The current `saveData` correctly has a rollback pattern (optimistic update + revert on failure). But the API `fetch` throws an async error. `localStorage.setItem` throws synchronously, so a `try/catch` around `setItem` is required — an `await` won't catch it.

**Prevention:**
```typescript
function saveToLocalStorage(data: AppData): void {
  try {
    localStorage.setItem('wealthData', JSON.stringify(data))
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22)
    ) {
      throw new Error('Storage quota exceeded. Free up browser storage and try again.')
    }
    throw err
  }
}
```
- Keep the existing rollback pattern: `setData(newData)` optimistically, then call `saveToLocalStorage(newData)`, catch the error, `setData(previous)` to revert.
- The caller (`SettingsPage`, form submit handlers) already catches errors and shows inline error messages — no UI change needed, just the error text should be storage-specific.
- `saveData` can remain `async` (returns a resolved `Promise`) to keep all callers unchanged.

**Phase:** Phase 22 (AppDataContext migration) — add the `try/catch` wrapper as part of the `saveData` rewrite.

---

### Pitfall 3: One-Time Migration of `data.json` Content Is Skipped or Runs Repeatedly

**What goes wrong:**
On first load after the v1.7 upgrade, `localStorage.getItem('wealthData')` returns `null` (the key does not exist yet). The app falls back to `createInitialData()`, discarding any data the user had in `data.json`. The user's financial history is gone on first upgrade. Alternatively, if the migration seed path is left in indefinitely and the user clears `localStorage` manually, the app re-seeds from a stale `data.json` that should no longer be authoritative.

**Why it happens:**
`data.json` is a file on the developer's local disk, not accessible by the browser. The browser cannot read it directly. The Vite plugin is being removed. There is no automatic migration path from file to `localStorage`. The developer must either: (a) build a one-time migration seeding step, or (b) instruct users to export their data before upgrading and re-import afterward.

**Prevention:**
- The correct approach for this personal local app: export your `data.json` as a zip backup via the existing export flow **before** deploying v1.7, then import it after the migration.
- Do NOT attempt to wire a fallback fetch to `/api/data` on first boot — the plugin is removed, so the endpoint no longer exists, and this would add complexity for zero benefit in a single-user local app.
- Document the upgrade step explicitly: "Before upgrading to v1.7, use Settings → Export Data to back up your data. After upgrading, use Import from Zip to restore it."
- In code: if `localStorage.getItem('wealthData')` is `null` at boot, show a one-time banner: "No data found. Import from a previous export to restore your data, or start fresh."
- Do NOT seed from a hardcoded `data.json` path via an extra `fetch` call — this is dev-only and would regress the entire point of removing the plugin.

**Phase:** Phase 22 (AppDataContext migration) — the boot `useEffect` must handle `null` gracefully and surface a recoverable empty state, not an error.

---

### Pitfall 4: Stale In-Memory State After Cross-Tab Edits

**What goes wrong:**
A user opens the app in two tabs. Tab A saves new gold holdings. `localStorage['wealthData']` is updated. Tab B's `AppDataContext` still holds the old in-memory state — it read `localStorage` once at mount and never re-reads it. Tab B then saves its own change (e.g. updating retirement assumptions). Tab B calls `saveData({ ...data, settings: { ...data.settings, retirement: {...} } })` where `data` is the stale Tab A snapshot. This overwrites Tab A's gold holdings with old values. Last-write-wins, and the last write includes stale data.

**Why it happens:**
`localStorage` changes fire a `"storage"` event in **other** tabs but not the writing tab. The current `AppDataContext` reads once on mount and has no cross-tab listener. This is the same in-memory staleness risk that existed with the API — but the API had a network round-trip that surfaced conflicts; `localStorage.setItem` is silent.

For a single-user personal finance app used mainly in one tab, this is LOW probability but HIGH impact if it occurs (silent data overwrite).

**Prevention:**
- Add a `window.addEventListener('storage', handler)` in `AppDataContext.useEffect` that listens for `key === 'wealthData'` and calls `parseAppDataFromImport(JSON.parse(event.newValue))` → `setData(parsed)` to resync when another tab writes.
- This must be cleaned up: return `() => window.removeEventListener('storage', handler)` from the effect.
- The listener does NOT fire in the writing tab, so there is no re-render loop risk.
- Keep the pattern simple: parse + validate on storage event using the existing `parseAppDataFromImport` function — same migration chain as boot.

**Phase:** Phase 22 (AppDataContext migration) — the cross-tab listener is a two-line addition to the boot `useEffect` cleanup.

---

### Pitfall 5: `localStorage.getItem` Called Before React Hydrates (FOUC / Stale Read)

**What goes wrong:**
In this app (pure client-side SPA, no SSR), true React hydration mismatch is not possible. However, if `AppDataContext` initializes `useState` with a value derived directly from `localStorage.getItem('wealthData')` in the `useState` initializer function (the lazy initial state pattern), this runs synchronously during render — before `useEffect` — which is correct and fast. The risk is the opposite: if the boot read is placed in `useEffect` (as it currently is with `fetch('/api/data')`), there is a frame where `data === INITIAL_DATA` (empty state). Any component that renders before the effect fires sees empty data and may flash a "no holdings" empty state.

The current API-based code already has this exact pattern and it works because the flash is acceptable. After migration, the localStorage read is synchronous — it can be moved into the `useState` initializer to avoid the flash entirely.

**Why it happens:**
`useEffect` is asynchronous from the rendering perspective. The `fetch` made it unavoidable. `localStorage.getItem` is synchronous and can be called during the initial render without `useEffect`.

**Prevention:**
- Move the boot read into a `useState` lazy initializer:
  ```typescript
  const [data, setData] = useState<AppData>(() => {
    const raw = localStorage.getItem('wealthData')
    if (!raw) return INITIAL_DATA
    try {
      const result = parseAppDataFromImport(JSON.parse(raw))
      if (result.success) return result.data
    } catch { /* malformed JSON */ }
    return INITIAL_DATA
  })
  ```
- This eliminates the "flash of empty state" that currently exists with `useEffect` + `fetch`.
- The `useEffect` is still needed for the cross-tab `"storage"` event listener (Pitfall 4), but not for the initial read.
- `loadError` state should still be set when the parse fails, so the user sees a banner. This can be done via a separate `useState` initialized from the same read, or via a `useEffect` that validates the stored value.

**Phase:** Phase 22 (AppDataContext migration) — design decision with meaningful UX impact.

---

### Pitfall 6: Export Zip Reads `data` from In-Memory State, Not from `localStorage` Directly — Import Must Update Both

**What goes wrong:**
The export flow in `SettingsPage` calls `JSON.stringify(data, null, 2)` where `data` comes from `useAppData()`. This is the in-memory `AppData`. After migration this remains correct — the in-memory state is always the authoritative source; `localStorage` is a mirror.

The risk is on import: `onConfirmImport` calls `await saveData(pendingImport)`. After migration `saveData` will write to `localStorage` AND update `setData`. Both happen in the existing `saveData` body. This is safe.

The actual pitfall is if someone rewrites `saveData` to only call `setItem` without calling `setData(newData)` — the in-memory state stays stale until the next page reload.

**Why it happens:**
The current implementation optimistically calls `setData(newData)` first, then sends the `POST`. A naive `localStorage` rewrite might call only `localStorage.setItem(...)` and forget the `setData(newData)` call that makes the UI update.

**Prevention:**
- `saveData` must always call both `setData(newData)` (optimistic update) and `localStorage.setItem(...)`. Rollback: `setData(previous)` if `setItem` throws.
- The existing `saveData` body structure already has this pattern; preserve it exactly.
- After import: verify in manual testing that the app data visually updates across all pages immediately without a reload.

**Phase:** Phase 22 (AppDataContext migration) — preservation test: import a zip and confirm Dashboard reflects new data without page reload.

---

### Pitfall 7: JSON Serialization of Non-JSON-Safe Values

**What goes wrong:**
`JSON.stringify` silently drops `undefined` values in objects and `NaN`/`Infinity` in numbers (they become `null`). The `DataSchema` uses `z.number().nonnegative()` across most numeric fields. If any code path writes `undefined` or `NaN` into the data object, the `setItem` call will not throw — it will serialize, but the `getItem` + `JSON.parse` on next load will produce `null` for those fields, causing a Zod validation failure.

With the API approach, `JSON.parse(body)` on the server also had this risk — but the round-trip through `DataSchema.safeParse` on load would catch it. With localStorage the risk surface is identical; the JSON parse on read still runs through `parseAppDataFromImport`, which will catch malformed data and fall back to `INITIAL_DATA`.

The specific scenario to watch: `settings.goldPrices.k24 = NaN` (from `parseFinancialInput('')`). `JSON.stringify` converts this to `null`. On reload `DataSchema.safeParse` fails on `null` where `z.number()` is expected. The user's gold prices are lost and `loadError` fires.

**Prevention:**
- `parseFinancialInput` must never return `NaN` — it should return `0` for empty/invalid input. (Already the case per `src/lib/financials.ts`, but verify.)
- Before writing to `localStorage`, run `DataSchema.safeParse(newData)` and refuse the write if it fails. This is a defence-in-depth check:
  ```typescript
  const valid = DataSchema.safeParse(newData)
  if (!valid.success) {
    throw new Error('Internal: attempted to save invalid data shape')
  }
  localStorage.setItem('wealthData', JSON.stringify(valid.data))
  ```
- This is especially important during the migration phase when `saveData` is being rewritten.

**Phase:** Phase 22 — add the pre-write validation check as part of the `saveData` rewrite.

---

## Moderate Pitfalls

### Pitfall 8: `localStorage` Key Name Not Namespaced

**What goes wrong:**
If the key is just `"data"` or `"appData"`, it risks collision with other apps or browser extensions running on the same `localhost` origin. A collision silently overwrites wealth data with unrelated JSON.

**Prevention:**
- Use a descriptive, app-specific key: `"wealthData"` or `"fin:wealthData"`.
- Document the chosen key as a constant: `export const WEALTH_DATA_KEY = 'wealthData' as const` in `AppDataContext.tsx`, mirroring the existing `STORAGE_KEY = 'theme'` pattern in `ThemeContext.tsx`.
- Never use `localStorage.clear()` anywhere in the app.

**Phase:** Phase 22 — one constant definition, document alongside `STORAGE_KEY`.

---

### Pitfall 9: `data.json` Left Active in the Repo After Migration

**What goes wrong:**
If `data.json` is left in the repo and the Vite plugin is not fully removed, a future developer may re-add the plugin (or leave it commented out) thinking it is still in use. More practically: if `data.json` contains production wealth data and is committed to git, it leaks sensitive financial information in the repository history.

**Prevention:**
- After migration, add `data.json` to `.gitignore` (it may already be there; verify).
- Remove the `dataPlugin` import and call from `vite.config.ts`.
- Archive or delete `plugins/dataPlugin.ts` — it has no further role.
- Do not commit the final `data.json` content to the migration commit.

**Phase:** Phase 22 or a cleanup phase — explicit checklist item: `git status` must not include `data.json` as tracked.

---

### Pitfall 10: `saveData` Error Messages Reference the API or `data.json`

**What goes wrong:**
The current error messages in `SettingsPage` and other pages say things like "Check that the app is running and try again." This made sense when the Vite dev server had to be running for the API to work. After migration, the save can only fail from a `QuotaExceededError` or a data validation failure — both are browser-side. The "check that the app is running" hint is confusing and wrong.

**Prevention:**
- Update inline error strings for the save failure path to be storage-specific: "Could not save — browser storage may be full or restricted."
- The danger-zone "clear all data" dialog text currently references `data.json` by name: "...in your local `data.json` file." Update to reference localStorage.
- Search the codebase for all user-facing strings referencing `data.json` or `api/data` and update them.

**Phase:** Phase 22 — string sweep after the functional migration is complete.

---

## Minor Pitfalls

### Pitfall 11: `JSON.parse` Throws on Malformed `localStorage` Content

**What goes wrong:**
`localStorage.getItem('wealthData')` can return a truncated or corrupt string if the browser crashed mid-write in a previous session (rare but possible). `JSON.parse` on a truncated string throws a `SyntaxError`. Without a `try/catch`, this propagates and crashes the boot `useState` initializer.

**Prevention:**
- Wrap `JSON.parse(raw)` in a `try/catch` in the boot read path. Already shown in the Pitfall 5 code example above.
- On parse failure: set `loadError` to "Saved data was unreadable. Starting with defaults. Use Import to restore from a backup." and return `INITIAL_DATA`.

**Phase:** Phase 22 — the `try/catch` is part of the boot-read implementation.

---

### Pitfall 12: Debounce Is Not Needed, but Synchronous Blocking Is Worth Noting

**What goes wrong:**
`localStorage.setItem` is synchronous and blocks the main thread for the duration of the JSON serialization. For this app's data size (~4.5 KB today, unlikely to exceed 50 KB even with extensive history), this is imperceptible. However, if the save is called on every keystroke (e.g., a future controlled input wired directly to `saveData`), it would produce noticeable lag.

**Prevention:**
- No debouncing needed for the current architecture: `saveData` is called on explicit form submit, not on every input change. The pattern is correct as-is.
- Do not introduce `useEffect(() => { localStorage.setItem(...) }, [data])` as a reactive auto-save — this would fire on every `setData` call including the optimistic update in `saveData` itself, causing a double-write per save.
- If auto-save is ever added in a future milestone, debounce at 500–1000 ms.

**Phase:** N/A for v1.7 — note for future milestones only.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 22: AppDataContext rewrite | `localStorage.clear()` used in data reset (Pitfall 1) | Use `setItem` only; never `clear()` |
| Phase 22: AppDataContext rewrite | `QuotaExceededError` not caught (Pitfall 2) | Wrap `setItem` in `try/catch`; throw descriptive error; rollback |
| Phase 22: AppDataContext rewrite | `data.json` content lost on first upgrade (Pitfall 3) | Export/import workflow; show empty-state banner on null boot |
| Phase 22: AppDataContext rewrite | Cross-tab overwrite (Pitfall 4) | Add `"storage"` event listener that re-reads and re-parses |
| Phase 22: AppDataContext rewrite | Flash of empty state eliminated (Pitfall 5) | Move initial read to `useState` lazy initializer |
| Phase 22: AppDataContext rewrite | Import does not update UI (Pitfall 6) | Verify `saveData` calls `setData(newData)` before `setItem` |
| Phase 22: AppDataContext rewrite | Corrupt data written to `localStorage` (Pitfall 7) | Pre-write `DataSchema.safeParse` guard |
| Phase 22: Cleanup | Key collision with theme or other apps (Pitfall 8) | Use named constant `WEALTH_DATA_KEY = 'wealthData'` |
| Phase 22: Cleanup | `data.json` still tracked in git (Pitfall 9) | Add to `.gitignore`; remove plugin; archive `dataPlugin.ts` |
| Phase 22: Cleanup | User-facing strings reference API / `data.json` (Pitfall 10) | String sweep after functional migration |

---

## Integration Gotchas Specific to This Codebase

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `saveData` in `AppDataContext` | Replace `fetch` with `localStorage.setItem` but forget `setData(newData)` optimistic update | Keep the existing body structure: `setData(newData)` first, then storage write, then rollback on error |
| `createInitialData()` in data reset | Call `localStorage.clear()` before `setItem` | Call `setItem('wealthData', ...)` only; `"theme"` must survive |
| `parseAppDataFromImport` during zip import | No change needed — `saveData(pendingImport)` calls the updated `saveData` | Verify import updates UI immediately (no reload required) |
| Boot `useEffect` | Leave `fetch('/api/data')` and add `localStorage` as a fallback | Remove `fetch` entirely; replace with synchronous `localStorage.getItem` in `useState` initializer |
| Cross-tab `"storage"` event | Subscribe to all storage events without filtering by key | Filter: `if (event.key !== 'wealthData') return` |
| Danger-zone copy text | Leave "...your local `data.json` file" in the UI | Update to reference browser storage / localStorage |

---

## What Does NOT Change in v1.7

These patterns are explicitly preserved and require no modification:

- `parseAppDataFromImport` migration chain — unchanged; still the single parse path for boot and import
- All migration helpers (`migrateLegacyBankAccounts`, `ensureNetWorthHistory`, `ensureOtherCommodities`, `ensureLiabilities`) — unchanged
- `createInitialData()` return value — unchanged
- `DataSchema` and all Zod schemas — unchanged
- `useLivePrices`, `ThemeContext`, all page components — unchanged
- Export (zip creation) and import (zip extraction + `parseAppDataFromImport`) flows in `SettingsPage` — unchanged
- The `saveData` function signature `(newData: AppData) => Promise<void>` — unchanged; callers are unaffected

---

## Sources

- Direct code inspection: `src/context/AppDataContext.tsx` — `saveData` body with optimistic update and rollback; `parseAppDataFromImport` chain; `createInitialData()`
- Direct code inspection: `src/context/ThemeContext.tsx` — `STORAGE_KEY = 'theme'`; `try/catch` pattern already in `setTheme`
- Direct code inspection: `index.html` — FOUC script reads `localStorage.getItem('theme')`
- Direct code inspection: `src/pages/SettingsPage.tsx` — danger-zone calls `saveData(createInitialData())`; export reads `data` from `useAppData()`; import calls `saveData(pendingImport)`
- Direct code inspection: `plugins/dataPlugin.ts` — `GET`/`POST` `/api/data` → `data.json`; will be removed in v1.7
- Web: [Handling localStorage errors (quota exceeded)](https://mmazzarolo.com/blog/2022-06-25-local-storage-status/) — MEDIUM confidence
- Web: [TrackJS: Failed to execute setItem on Storage](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/) — MEDIUM confidence
- Web: [RxDB: Using localStorage in Modern Applications](https://rxdb.info/articles/localstorage.html) — MEDIUM confidence
- Web: [Cross-Tab State Synchronization in React Using storage Event](https://medium.com/@vinaykumarbr07/cross-tab-state-synchronization-in-react-using-the-browser-storage-event-14b6f1a97ea6) — MEDIUM confidence
- Web: [Safari Private Browsing localStorage quota=0](https://github.com/scottjehl/Device-Bugs/issues/63) — HIGH confidence (WebKit bug tracker)
- Web: [MDN Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — HIGH confidence

---

*Pitfalls research for: v1.7 localStorage migration (replacing Vite dev-server API)*
*Researched: 2026-05-02*
