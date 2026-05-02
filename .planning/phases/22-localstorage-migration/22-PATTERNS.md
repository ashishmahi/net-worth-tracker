# Phase 22 — Pattern Map

**Analog for localStorage hygiene:** `src/context/ThemeContext.tsx`

| Pattern | Excerpt / rule |
|---------|----------------|
| Storage key as named constant | `STORAGE_KEY = 'theme'` — Phase 22 uses **`wealth-tracker-data`** per CONTEXT |
| Defensive `try/catch` on `getItem` | `readStored()` returns null on failure |
| Defensive `try/catch` on `setItem` | Theme swallows errors (private mode); **wealth** path must **throw** for STORE-05 |

**Target file (modify):** `src/context/AppDataContext.tsx`

- Replace `useEffect` + `fetch` block (~lines 138–151) with lazy `useState` initializer calling `parseAppDataFromImport`.
- Replace `saveData` fetch body with `localStorage.setItem('wealth-tracker-data', JSON.stringify(newData))` (pretty-print optional — match minimal bytes vs readability; default compact is fine).

**Tests:** `src/context/__tests__/AppDataContext.test.ts` — extend with **`happy-dom`** Vitest environment (not currently configured; project uses Node default + pure unit tests today). Render `AppDataProvider` + tiny probe child, or use `react-dom/server` `renderToString` for synchronous boot-only assertions if avoiding new devDeps — planner chose **`happy-dom`** + `@vitest-environment happy-dom` file directive for minimal DOM (`localStorage`, `document`).

---

## PATTERN MAPPING COMPLETE
