# Phase 28 — Technical Research

**Question:** What do we need to ship URL-synced sections and a mobile Home link without breaking GitHub Pages?

## RESEARCH COMPLETE

---

## Current architecture

- **`src/App.tsx`** holds **`useState<SectionKey>('dashboard')`** — section is **not** reflected in the URL; refresh always returns to Dashboard.
- **`src/components/AppSidebar.tsx`** defines **`SectionKey`** and **`NAV_ITEMS`** — clicks call **`onSelect`** only.
- **`src/components/MobileTopBar.tsx`** — hamburger + theme only; no Home.
- **`src/main.tsx`** — no **`react-router`**; **`package.json`** does not list **`react-router-dom`**.
- **`vite.config.ts`** — **`base`** from **`BASE_URL`** — production app lives under a subpath when **`BASE_URL`** is set (e.g. GitHub Pages).

## Recommended stack

- **`react-router-dom` v6.x** — **`BrowserRouter`**, **`Routes`**, **`Route`**, **`Navigate`**, **`Outlet`**, **`NavLink`**, **`Link`**, **`useNavigate`**, **`useLocation`**.
- **`basename={import.meta.env.BASE_URL}`** on **`BrowserRouter`** — matches Vite **`import.meta.env.BASE_URL`** so routes resolve correctly under **`/repo/`** deployments.

## Implementation sketch

1. **Single module** (e.g. **`src/lib/sectionRoutes.ts`**) — bidirectional map **`SectionKey` ↔ pathname suffix**; **`pathToSection`** returns **`dashboard`** for **`/`** and index; unknown segments return **`null`** for redirect handling.
2. **Layout route** — outer **`SidebarProvider`**, **`GoldSpotPricesSync`**, **`SilverSpotPricesSync`**, **`AppSidebar`**, **`MobileTopBar`**, **`Outlet`** for page content; derive **`activeSection`** from **`useLocation()`** via **`pathToSection`**.
3. **Replace** **`useState`** section switching with **`useNavigate()`** from sidebar and dashboard callbacks.
4. **Catch-all** — **`<Route path="*" element={<Navigate to="/" replace />} />`** (paths relative to **`basename`**).

## Pitfalls

- **Double basename** — only set **`basename`** on **`BrowserRouter`**, not again on individual **`Link`** **`to`** props (use paths like **`/gold`**, not **`${BASE_URL}gold`** manually).
- **`NavLink`** end prop — use **`end`** on Dashboard **`NavLink`** so **`/`** matches index only.
- **Vitest** — wrap components under **`MemoryRouter`** with **`basename`** in tests when asserting navigation behavior.

## Validation Architecture

| Dimension | Approach |
|-----------|----------|
| **Correctness** | Unit tests for **`sectionRoutes`** (round-trip **`SectionKey`**, unknown paths, **`mutualFunds`** ↔ **`mutual-funds`**). |
| **Regression** | **`npm run build`** after routing refactor; **`npm test`** full suite. |
| **Deploy parity** | Manual: **`npm run build`** + **`npm run preview`** with **`BASE_URL=/fin/`** (or project-specific) — verify **`/fin/gold`** refresh loads Gold page. |
| **UX** | **`28-UAT.md`** — refresh per section; mobile Home from nested routes. |

---

*Phase 28 — section routing & dashboard home link*
