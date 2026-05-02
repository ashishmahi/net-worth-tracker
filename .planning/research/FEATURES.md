# Feature Landscape: localStorage Migration (v1.7)

**Domain:** Persistence layer replacement — Vite API (data.json) → browser localStorage
**Researched:** 2026-05-02
**Confidence:** HIGH (localStorage behavior is stable web platform API; codebase inspected directly; patterns verified against MDN and React ecosystem sources)

---

## Scope Note

This research covers only **what changes or becomes newly observable** when persistence moves from `fetch('/api/data')` (Vite dev-server plugin → `data.json`) to `localStorage.getItem`/`setItem`. Existing features (asset tracking, live prices, zip export/import, net worth history, data reset, dark mode) are unchanged in purpose; only their persistence plumbing changes.

---

## Table Stakes

Behaviors users expect to hold after the migration. If any of these regress, the migration is a product step backward.

| Behavior | Why Expected | Complexity | Current Status (pre-migration) |
|----------|--------------|------------|-------------------------------|
| Data survives page refresh | Fundamental persistence contract; any data app without this is useless | LOW | Met — Vite plugin writes to `data.json`; page reload fetches from disk |
| Data survives browser close and reopen | `localStorage` is persistent (not `sessionStorage`); users expect long-term storage | LOW | Met — `data.json` survives browser close |
| Data survives tab close and reopen | Same origin, same localStorage | LOW | Met — `data.json` survives tab close |
| First load shows existing data with no flash | Avoidance of an "empty state flash" before data is available | MEDIUM | Currently: async `fetch` with optimistic empty initial state means same flash risk exists today; localStorage read is synchronous, so a correct implementation can eliminate the flash |
| Save is immediate and atomic per key | User edits must not be lost between press and browser close | LOW | Currently: async POST to Vite plugin; localStorage.setItem is synchronous — faster and simpler, but blocks main thread momentarily for large JSON |
| Optimistic update + rollback on failure | AppDataContext already implements this (D-03 in codebase) | LOW | Pattern is in place; must be preserved; with localStorage the only failure mode is QuotaExceededError (not a network error) |
| Data reset ("Clear all data") writes correctly | `saveData(createInitialData())` → must overwrite localStorage key, not append | LOW | Met via `saveData()` call; no change to call site needed |
| Zip export/import reads from in-memory `data` state | Export serializes `data` from React state (not from storage directly); import calls `saveData()` | LOW | Already correct; the zip export in SettingsPage.tsx reads `data` from context, not from disk; no change required |
| Schema migration chain runs on load | `parseAppDataFromImport()` migration chain must run on localStorage load the same way it runs on `fetch()` response | LOW | Chain is already isolated in `parseAppDataFromImport()`; swap load source, keep the same call |
| `version` field preserved in storage | Schema versioning (`"version": 1`) must survive round-trips through localStorage | LOW | `JSON.stringify(data)` → `localStorage.setItem` → `JSON.parse(localStorage.getItem())` round-trip is lossless |
| Dark mode theme key is unaffected | Theme is already stored under a separate `localStorage` key (`"theme"`); migration must not collide | LOW | `ThemeContext.tsx` uses key `"theme"`; data must use a different key (e.g. `"wealthData"`) |
| Private browsing behavior is disclosed or handled | In private mode, localStorage behaves like sessionStorage: data is lost when the tab closes. This is a regime change from `data.json` | MEDIUM | Currently never applies (file-based); after migration users in private mode will silently lose data on tab close without warning |

---

## Differentiators

Behaviors that improve UX beyond the minimum but are not required for correctness.

| Behavior | Value Proposition | Complexity | Dependency / Notes |
|----------|-------------------|------------|-------------------|
| Synchronous read on mount — no loading spinner for data | Because `localStorage.getItem` is synchronous, `AppDataProvider` can read and populate state before first render, eliminating the "empty → loaded" flash that exists with the async fetch today | LOW | Replace `useState(INITIAL_DATA)` + async `useEffect` with synchronous initialization via a lazy `useState(() => loadFromLocalStorage())` pattern |
| QuotaExceededError inline save error | localStorage throws `QuotaExceededError` when storage is full (~5 MB per origin). The app's wealth data is typically 10–100 KB; quota is unlikely to be hit in practice, but if it is, a silent failure would cause lost edits. Catch and surface inline. | LOW | Same try/catch shape as the current fetch error path; different error message: "Could not save — browser storage may be full. Try clearing unused data or exporting first." |
| Clear-data also clears the localStorage key | "Clear all data" in Settings currently calls `saveData(createInitialData())`. After migration, this writes an empty slate to localStorage, which is correct. The existing UX copy references `data.json`; the Danger Zone description text must be updated to say "your local browser storage" instead of "your local data.json file" | LOW | Text-only change to SettingsPage.tsx; no functional change |
| Explicit localStorage key constant | Define `const WEALTH_DATA_KEY = 'wealthData'` (or similar) in a single place, the same way `STORAGE_KEY = 'theme'` is defined in `ThemeContext.tsx` | LOW | Prevents typos; makes key visible for debugging via DevTools |
| "Storage not available" fallback | In extremely rare scenarios (browser policy, extension, corrupted storage), `localStorage` itself may throw on access. The existing `ThemeContext` already demonstrates the correct pattern: wrap in `try/catch`, return `null`, continue with defaults. | LOW | Already solved for theme; replicate for data layer |

### Cross-Tab Sync — Intentionally Not a Differentiator

Cross-tab sync (listening to `window.storage` events to push changes from one tab to another) is technically possible and has community demand. However, for this app:

- It is a single-user personal finance tool; concurrent editing across tabs is not a real use case
- Automatic reloads triggered by the storage event mid-edit could clobber unsaved in-memory form state
- The existing architecture has no concept of "live document" semantics

**Verdict:** Do not implement cross-tab sync in v1.7. If the user edits in two tabs simultaneously, the last-save-wins behavior of localStorage is adequate for this use case.

---

## Anti-Features

Behaviors to explicitly avoid.

| Anti-Feature | Why It Seems Appealing | Why to Avoid | What to Do Instead |
|--------------|------------------------|--------------|-------------------|
| Migrating data.json → localStorage automatically on first load | Nice to have for users upgrading from the Vite-API version | Requires the Vite plugin to still be present to read `data.json` during migration; this defeats the purpose of removing it. The user base is one person (personal app); a one-time manual export → import is simpler and already supported | Document: "Before switching to v1.7, export your data from Settings. After upgrade, import the zip." No code migration needed. |
| sessionStorage instead of localStorage | Simpler to reason about per-session | Data lost on every tab close; regresses persistence contract vs current `data.json` | Use localStorage exclusively |
| Debounced auto-save on every state change | Feels like real-time persistence; avoids needing explicit "Save" buttons | This app already uses explicit Save buttons per section (SettingsPage confirms this). Auto-save on every context write would trigger on every live price tick, every form keystroke via optimistic update, etc. — chatty and unnecessary. | Keep explicit Save buttons; `saveData()` remains the single write path |
| Storing each asset section under a separate localStorage key | Finer-grained writes; easier to inspect individual sections | Breaks the atomic all-or-nothing data model; zip export/import, schema migration, and data reset all operate on the whole `AppData` blob; splitting storage adds reconciliation complexity for no user-visible benefit | One key, one JSON string: `localStorage.setItem(WEALTH_DATA_KEY, JSON.stringify(data))` |
| IndexedDB instead of localStorage | Async API; no 5 MB quota; better for large data | Massive complexity increase (async API, versioned schema, cursor-based reads); wealth data is ~10–100 KB, far under localStorage quota; the synchronous read benefit of localStorage for eliminating first-render flash is lost with IndexedDB | localStorage is correct for this data size and use case |
| Keeping data.json as a fallback alongside localStorage | Belt-and-suspenders; no data loss | Requires both Vite plugin and localStorage to stay in sync; migration logic for divergence; two sources of truth; doubles the complexity of every save path | Remove data.json and Vite plugin entirely; localStorage is the sole persistence layer from v1.7 forward |
| Encrypting data at rest in localStorage | Security hardening | Web Crypto encryption at rest would require a passphrase on every app load — poor UX for a personal app. The zip export already provides encryption for the backup/transfer use case. Data at rest in localStorage is accessible to any JS on the same origin, but this is a local-only app with no third-party scripts. | Encrypted zip export covers the at-rest threat model for backups; no localStorage-level encryption needed |

---

## Interaction with Existing Features

### Zip Export / Import

No change to the export or import code paths. Export reads `data` from React context state (already in memory). Import calls `saveData(parsed)`, which after migration writes to localStorage instead of POSTing to the Vite server. The zip format, `createWealthExportZip()`, `extractDataJsonFromZip()`, and all passphrase flows are untouched.

One UX copy update: the import confirmation dialog currently says "replace the wealth data in memory and in your local data file." After migration, change "local data file" to "local browser storage."

### Data Reset ("Clear all data")

`saveData(createInitialData())` is the mechanism. After migration this writes the initial empty blob to localStorage. No logic change.

UX copy in the Danger Zone card currently references `data.json` by name ("permanently removes all net-worth and asset data stored in your local `data.json` file"). This must be updated to reference browser storage.

### Schema Versioning

`data.json` always had `"version": 1` at the root. The same field survives in localStorage because the full `AppData` object is stringified and stored. The `parseAppDataFromImport()` migration chain runs identically on the parsed JSON from localStorage. No schema version bump required for this migration.

### Dark Mode Theme

`ThemeContext.tsx` already uses localStorage with key `"theme"`. The wealth data migration must use a **distinct key** (e.g. `"wealthData"`). These two keys are independent and do not interfere.

### Net Worth History

`netWorthHistory` is part of `AppData` and is persisted as part of the single localStorage blob. No separate treatment needed. Snapshots recorded after migration are stored the same way as all other data.

### Live Prices / Session Rates

Live prices and session-only rate overrides are in-memory state (`LivePricesContext`). They are intentionally not persisted (the Settings page explicitly documents "These values stay in memory only"). No change needed.

---

## Feature Dependencies

```
[localStorage persistence]
    └──replaces──> [fetch('/api/data') load in AppDataProvider useEffect]
    └──replaces──> [fetch('/api/data', POST) save in AppDataProvider saveData()]
    └──replaces──> [dataPlugin() in vite.config.ts]
    └──replaces──> [data.json file]
    └──preserves──> [parseAppDataFromImport() migration chain — called identically]
    └──preserves──> [optimistic update + rollback pattern in saveData()]
    └──preserves──> [all call sites: saveData() in SettingsPage, all asset pages]

[QuotaExceededError handling]
    └──requires──> [try/catch around localStorage.setItem in saveData()]
    └──mirrors──> [existing network error catch in saveData()]

[Synchronous init (no loading spinner)]
    └──requires──> [lazy useState initializer reading localStorage on mount]
    └──replaces──> [useEffect + fetch on mount]
    └──eliminates──> [INITIAL_DATA empty-state flash]

[UX copy updates]
    └──requires──> [SettingsPage.tsx: import dialog, Danger Zone description]
    └──independent of all functional changes]

[WEALTH_DATA_KEY constant]
    └──must not collide with──> ['theme' key used by ThemeContext.tsx]
```

---

## MVP for v1.7

### Required (migration is broken without these)

- [ ] Remove `dataPlugin()` from `vite.config.ts`; remove `plugins/dataPlugin.ts`
- [ ] `AppDataProvider`: replace async `useEffect` + `fetch` load with synchronous `localStorage.getItem(WEALTH_DATA_KEY)` + `parseAppDataFromImport()` (same migration chain)
- [ ] `AppDataProvider`: replace async `fetch POST` save with synchronous `localStorage.setItem(WEALTH_DATA_KEY, JSON.stringify(newData))`; wrap in try/catch for `QuotaExceededError`
- [ ] Define `WEALTH_DATA_KEY` constant in one place
- [ ] Rollback on save failure preserved (catch `QuotaExceededError`, revert state, re-throw so call sites see the error)
- [ ] Update `loadError` message wording: remove references to "Could not load saved data" implying network/server; replace with storage-appropriate message
- [ ] `data.json` retired from active use (can be deleted or left as an ignored artifact)
- [ ] Vitest tests for `AppDataContext` updated to mock `localStorage` instead of `fetch`

### Recommended (UX polish, low cost)

- [ ] Update SettingsPage.tsx Danger Zone description: `data.json` → "browser storage"
- [ ] Update import confirmation dialog: "local data file" → "local browser storage"
- [ ] Update save error messages: "Check that the app is running and try again" → "Browser storage may be full or unavailable. Try exporting first." (the old message implies a running server, which no longer applies)

### Defer (not needed for v1.7)

- [ ] Automatic data.json → localStorage migration on first load (manual export/import covers this)
- [ ] Cross-tab sync (not a real use case for this app)
- [ ] Private browsing detection / warning (edge case; document in release notes if desired)

---

## Sources

- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — quota limits by browser, private mode behavior
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) — localStorage vs sessionStorage persistence contracts
- [TrackJS: QuotaExceededError handling](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/) — error surface and catch pattern
- [Felix Gerschau: React localStorage patterns](https://felixgerschau.com/react-localstorage/) — lazy useState init, synchronous read on mount
- [LogRocket: localStorage with React Hooks](https://blog.logrocket.com/using-localstorage-react-hooks/) — useSyncExternalStore patterns, cross-tab events
- [RxDB: localStorage in modern applications](https://rxdb.info/articles/localstorage.html) — serialization costs, localStorage vs IndexedDB tradeoffs
- Codebase direct inspection: `src/context/AppDataContext.tsx`, `src/context/ThemeContext.tsx`, `plugins/dataPlugin.ts`, `vite.config.ts`, `src/pages/SettingsPage.tsx`

---

*Feature research for: localStorage migration — Personal Wealth Tracker v1.7*
*Researched: 2026-05-02*
