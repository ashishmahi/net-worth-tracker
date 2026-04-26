# Phase 6 — Technical Research: Dark Mode

**Question answered:** What do we need to know to plan `ThemeProvider`, FOUC prevention, and sidebar placement well?

**Sources:** `06-CONTEXT.md`, `06-UI-SPEC.md`, `CLAUDE.md`, `index.html`, `src/main.tsx`, `src/components/AppSidebar.tsx`, `tailwind.config.js`, `src/index.css`, shadcn `sidebar.tsx` (SidebarFooter exists).

---

## Stack fit

- **Tailwind** already uses `darkMode: ["class"]` — the `dark` class must be on the **root** (`<html>`, not only `<body>`), per Tailwind docs, so the document element gets `class="dark"` when the user chose dark.
- **No `next-themes`** in `package.json` — a small **local `ThemeContext`** (React) keeps bundle lean and matches CONTEXT (explicit key `theme`, values `light` | `dark` only). Alternative `next-themes` would add a dependency; not required.
- **shadcn** tokens in `src/index.css` already define `:root` and `.dark` HSL variables — no token file rewrite needed unless audit finds hardcoded colors in pages.

---

## FOUC / first paint (D-05, D-06)

- The **order of execution** is: (1) HTML parse, (2) **inline script** in `index.html` runs (sync), (3) module graph loads, (4) React hydrates. If the script sets `document.documentElement.classList.add('dark')` when `localStorage.getItem('theme') === 'dark'`, the first **paint** for `body`/children uses the correct `dark` variant in CSS, **before** React runs.
- **Caveat:** The script must be wrapped in a try/catch: `localStorage` can throw in private mode / blocked storage; on error, do nothing (stays **light** per D-01).
- **Caveat:** The React provider must read **initial** theme from `document.documentElement.classList.contains('dark')` (or the storage read) and **not** `useEffect` that first clears `dark` — that would reintroduce flash. Initialization: `getInitialTheme(): 'light' | 'dark'` that prefers DOM class (already set) over a blind default.

---

## Persistence contract (D-04, DM-02)

- **Key** `theme`, **values** exactly `light` | `dark` (lowercase). Invalid or missing → treat as **no preference** → **light** and ensure `classList.remove('dark')` on `<html>`.
- **Sync on toggle:** `setItem('theme', 'dark'|'light')` + add/remove `dark` on `document.documentElement` in the same user gesture handler so class and storage never diverge during the session.
- **Not in `data.json`** — do not add theme to the Vite data plugin (STATE.md).

---

## UI placement (D-03, UI-SPEC)

- `SidebarFooter` is exported from `@/components/ui/sidebar` — add `<SidebarFooter>` as sibling under `<SidebarContent>` in `AppSidebar.tsx`, with padding consistent with `SidebarHeader` (`px-4 py-3` or as UI-SPEC: md = 16px for footer).
- **Toggle:** `Button` `variant="ghost"` (or `secondary` per UI-SPEC) with `Sun` / `Moon` from `lucide-react`; `aria-label` "Switch to dark mode" / "Switch to light mode" by current mode; min 44px hit target (`min-h-[44px] min-w-[44px]` or similar).

---

## 9 pages / token audit (success criterion 3)

- **Routes in code:** one shell (`App.tsx`) swaps `DashboardPage` + 8 section pages (Gold, Mutual Funds, Stocks, Bitcoin, Property, Bank, Retirement, Settings) = **9 surfaces** including dashboard.
- **Check:** `rg 'bg-white|#fff|#ffffff|text-gray-[0-9]+|bg-gray-'" src` should return no hits; `bg-background`, `text-foreground`, `card`, `muted` used. If any `Chart`/hardcoded color exists, map to token or add dark-safe class.

---

## Pitfalls (from PITFALLS / experience)

- **Double provider:** `ThemeProvider` should wrap only **above** any consumer; put in `main.tsx` **inside** `StrictMode`, wrapping `App` (or wrap `AppDataProvider` outer/inner per preference — theme does not need live prices; wrapping outermost of app tree is fine: `StrictMode` > `ThemeProvider` > `AppDataProvider` > … > `App`).
- **StrictMode double-mount in dev** — ensure `useEffect` that syncs storage does not **toggle** theme; only idempotent `classList` + `localStorage` writes matching current state.

---

## Validation Architecture (Nyquist)

- **Dimension 1–7:** Largely **manual** and **build/lint** — no unit test framework in repo today. Quick feedback: `npm run build`, `npm run lint`, `npx tsc --noEmit` after each task.
- **Dimension 8 (feedback loop):** Enforce a **checklist** in the final plan: reload test (dark, no light flash), toggle test, 9-page visual pass in devtools dark emulation or toggled `dark` class.
- **Wave 0:** Not introducing Vitest in Phase 6 unless a task explicitly adds it — out of scope for a UI-only phase; VALIDATION.md records manual-first strategy.

---

## RESEARCH COMPLETE
