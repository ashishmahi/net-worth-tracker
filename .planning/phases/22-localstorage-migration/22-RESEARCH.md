# Phase 22: localStorage Migration — Technical Research

**Question:** What must the planner know to replace `fetch`/`data.json` persistence with `localStorage` safely?

---

## Current implementation

| Concern | Location | Behavior today |
|---------|----------|----------------|
| Boot load | `AppDataContext.tsx` `useEffect` → `fetch('/api/data')` | Async; first paint uses `INITIAL_DATA` → flash of empty state |
| Save | `saveData` → `POST /api/data` | Optimistic `setData`; rollback `setData(previous)` on non-OK or throw |
| Dev I/O | `plugins/dataPlugin.ts` | FS read/write `data.json` |
| Theme | `ThemeContext.tsx` | `localStorage` key **`theme`** — must survive wealth saves |

---

## localStorage mechanics

- **Key:** `wealth-tracker-data` (per CONTEXT D-03) — distinct from `theme`.
- **`setItem` / `getItem`** are synchronous on the main thread; keeping `saveData(): Promise<void>` is fine — resolve immediately after `JSON.stringify` + `setItem`, or use `Promise.resolve()` — no network latency.
- **Quota:** `QuotaExceededError` on `setItem` — propagate from `saveData`; callers already use `try/catch` (STORE-05).
- **Never** call `localStorage.clear()` in app code — would wipe `theme` (STORE-04).

---

## Boot read pattern

Replace `useEffect` + fetch with **`useState(() => …)` lazy initializer**:

1. `const raw = localStorage.getItem('wealth-tracker-data')`
2. If `null` or empty → `createInitialData()` for initial state; `loadError` stays `null`.
3. Else `JSON.parse` in try/catch — invalid JSON → `loadError` message + `createInitialData()` (or INITIAL_DATA) per existing UX intent.
4. If JSON parses → `parseAppDataFromImport(parsed)` — success `setData` path via initial state return value; failure → `loadError` + defaults.

Because initializer runs before first paint (same tick as mount), children see resolved data — satisfies STORE-03 / roadmap success criterion 1.

---

## Rollback / optimistic updates

CONTEXT D-01: remove snapshot rollback — `setItem` is synchronous; on throw, revert `setData(previous)` **if** optimistic update still used. Alternative: call `setItem` first then `setData` — ordering tradeoff; document chosen approach in code. Either way callers must still receive thrown errors on quota failure.

---

## Vitest

- Mock **`localStorage`** with `vi.stubGlobal('localStorage', …)` or a small in-memory `{ getItem, setItem, removeItem }` object.
- Spy **`JSON.stringify`** only if needed; prefer asserting final `setItem` payload.
- Boot tests: absent key; valid JSON round-trip; invalid JSON string; valid JSON failing `DataSchema` → `loadError` set.
- No `fetch` mocks required for `AppDataContext` after migration.

---

## Validation Architecture

Phase 22 validates **client-only** persistence:

| Dimension | Approach |
|-----------|----------|
| **Unit** | `src/context/__tests__/AppDataContext.test.ts` — boot paths (missing key, valid data, corrupt JSON, schema failure); `saveData` persists and preserves `theme` key in mocked storage |
| **Integration** | `npm test` + `npm run build`; optional manual spot-check: theme toggle + refresh retains wealth data |
| **Security** | STRIDE in PLAN — XSS remains browser baseline; data is local-only; no secrets in localStorage beyond existing app JSON |

---

## RESEARCH COMPLETE

Technical approach, test strategy, and validation hooks are sufficient for executable planning.
