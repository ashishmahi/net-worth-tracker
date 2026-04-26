# Pitfalls Research

**Domain:** Adding dark mode (manual toggle + localStorage) and mobile responsiveness to an existing React + Vite + Tailwind + shadcn/ui finance app.
**Researched:** 2026-04-26
**Codebase inspected:** Full source review — App.tsx, index.css, tailwind.config.js, index.html, all pages, AppSidebar.tsx, sheet.tsx, sidebar.tsx, use-mobile.tsx.

---

## Dark Mode Pitfalls

### Pitfall DM-01: Flash of Unstyled Content (FOUC) on page load

**What goes wrong:** The app reads `localStorage` for the saved theme preference inside a React `useEffect`. `useEffect` runs after the browser has already painted, so on the initial render the page always shows light mode for one frame before snapping to dark. On fast machines this is a brief flicker; on slower ones it is a jarring white flash.

**Why it happens in this codebase specifically:** `index.html` has no theme class on `<html>` and no inline script. `main.tsx` renders the React tree with `StrictMode` + two providers before any theme logic could fire. Any `ThemeProvider` component written in React will suffer this gap because React hydration/render is not synchronous with the browser's first paint.

**Prevention:** Inject a small inline `<script>` tag directly in `index.html`, **before** the `<body>` and before the module bundle loads. This script reads `localStorage` and writes `class="dark"` onto `<html>` synchronously during HTML parsing — before any paint.

```html
<!-- index.html, inside <head>, before </head> -->
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
</script>
```

The `try/catch` handles private-browsing environments where `localStorage` access throws. Keep the script minimal — anything more than class toggling belongs in the React layer.

**Phase:** Must be addressed in the same phase that adds the dark mode toggle. Adding the toggle without the inline script ships the FOUC bug.

---

### Pitfall DM-02: ThemeProvider written as a React Context causes FOUC even with the inline script

**What goes wrong:** Developers write a `ThemeContext` that reads `localStorage` in a `useState` initialiser and applies `document.documentElement.classList.toggle('dark', ...)` in a `useEffect`. This appears to work in development (hot-reload masks the flash) but the FOUC reappears in production builds where loading is slower.

**Why it happens:** `useState` initial value is evaluated synchronously but `useEffect` fires after paint. Even if the class is applied in the useState initialiser directly (mutating the DOM in render), React strict mode re-renders cause visible flicker.

**Prevention:** The React context is still correct for exposing the current theme and the toggle function to components. The context should just **read** the class on `<html>` as its initial state rather than applying it:

```ts
const [theme, setTheme] = useState<'light' | 'dark'>(() =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'
);
```

The inline `<script>` in `index.html` (DM-01) does the actual DOM mutation. The React context only syncs to it on toggle. This separation avoids any paint-cycle race.

**Phase:** Architecture decision for dark mode phase — document the pattern in the ThemeContext file.

---

### Pitfall DM-03: Hard-coded colour values that bypass the CSS variable system

**What goes wrong:** Any Tailwind class that references a raw colour token (`bg-white`, `bg-gray-100`, `text-gray-900`, `bg-zinc-800`, `border-gray-200`) instead of a semantic token (`bg-background`, `bg-muted`, `text-foreground`, `border-border`) will not respond to dark mode. The page partially dark-modes; cards and sections remain light-coloured.

**Why it happens in this codebase:** The codebase is clean — all pages use semantic tokens — but the risk surfaces when adding new UI or tweaking existing code. The dashboard `hover:bg-muted/50` pattern is correct. The danger is in fast edits during feature work picking up autocomplete suggestions for raw colour classes.

**Specific existing risk spots to audit:**
- `App.tsx`: `main` element uses `p-6` only — `bg-background` is applied via the global `body` rule in `index.css`, not on `main` itself. If a wrapper div ever gets `bg-white` added, it will break dark mode on all pages.
- Any future `<table>` overflow wrapper divs that get a background for visual grouping.

**Prevention:** Establish the rule before any dark mode work begins: "only use semantic colour tokens." Run a grep for raw colour tokens as part of the review checklist:

```bash
grep -r "bg-white\|bg-gray\|bg-zinc\|text-gray\|border-gray" src/
```

Expect zero results. Any findings must be converted to semantic equivalents before shipping.

**Phase:** Audit in dark mode phase, add grep check to PR review notes.

---

### Pitfall DM-04: shadcn/ui Sheet overlay backdrop uses hardcoded black

**What goes wrong:** The `SheetOverlay` in `sheet.tsx` uses `bg-black/80` — a hardcoded raw colour. In dark mode this still renders correctly (dark overlay over dark content) but is not theme-aware. If the CSS variable system is ever extended, this overlay will be the first thing that looks wrong.

**Why it matters:** This is a low-severity issue for v1.1 since `bg-black/80` actually looks fine in both modes. However, editing `sheet.tsx` is common when customising sheet width or scroll behaviour, and developers may not notice the hardcoded class.

**Prevention:** Note this in code comments when touching `sheet.tsx`. It is acceptable to leave as-is for v1.1. The shadcn/ui canonical source uses the same pattern.

**Phase:** Acknowledge in dark mode phase; no action required unless visual issues arise.

---

### Pitfall DM-05: localStorage key collision or silent parse failure

**What goes wrong:** Using a generic key like `'theme'` in `localStorage` can collide if the app is ever served from a shared origin. More practically: if the stored value is neither `'dark'` nor `'light'` (corrupted, renamed key, old value), the inline script must fall back gracefully to avoid applying an unknown class.

**Prevention:** Keep the inline script defensive — only apply `dark` when the value is exactly `'dark'`, and ignore anything else. In the React ThemeContext, validate `localStorage.getItem('theme')` before using it:

```ts
const stored = localStorage.getItem('theme');
const initial = stored === 'dark' || stored === 'light' ? stored : 'light';
```

**Phase:** Dark mode phase. One-line addition to both the inline script and the ThemeContext initialiser.

---

### Pitfall DM-06: Toggle button placed inside a component that is not accessible from all pages

**What goes wrong:** The dark mode toggle button gets added to `AppSidebar` or to a specific page header. On mobile, when the sidebar collapses into a drawer (which the shadcn SidebarProvider already supports via `useIsMobile()`), the toggle may be unreachable without opening the sidebar first.

**Why it matters for this codebase:** `AppSidebar` currently uses `collapsible="none"`, so it is always visible on desktop. On mobile the shadcn sidebar switches to a Sheet-based drawer. If the toggle lives only in the sidebar, mobile users must open the sidebar to switch themes — poor UX for a setting they may change frequently.

**Prevention:** Place the toggle in a persistent top bar (a `SidebarInset` header row), or add it to both the sidebar and the top bar. The top bar approach is also the correct solution for the mobile hamburger menu trigger (see Mobile Pitfall MB-01 below).

**Phase:** Dark mode phase and mobile phase are coupled here. Implement the top bar trigger/header as part of mobile work, then add the theme toggle to the same header row.

---

## Mobile Responsive Pitfalls

### Pitfall MB-01: Sidebar is always visible — no mobile navigation trigger exists

**What goes wrong:** `AppSidebar` is set `collapsible="none"`, which means it never collapses. The shadcn SidebarProvider and `useIsMobile()` hook are already wired in `sidebar.tsx`, and the component supports a Sheet-based mobile drawer mode, but this mode is never activated because `collapsible="none"` disables it entirely. On narrow screens the sidebar and the main content both compete for the same 320-375px of width, making the layout unusable.

**Root cause in code:** `AppSidebar.tsx` line 40:
```tsx
<Sidebar collapsible="none" className="border-r">
```

**Prevention:** Change `collapsible="none"` to `collapsible="offcanvas"`. This activates the existing shadcn mobile Sheet drawer. Add a hamburger/menu trigger button in a new top bar inside `SidebarInset`. shadcn/ui exports `SidebarTrigger` for exactly this purpose.

Expected result: on desktop the sidebar is persistent; on mobile it is hidden behind a trigger button. No new third-party library required — the infrastructure is already in the installed shadcn sidebar component.

**Phase:** First task in mobile phase. Every other mobile fix depends on the viewport being available to the main content.

---

### Pitfall MB-02: `main` padding (`p-6`) is constant — no mobile-safe padding

**What goes wrong:** `App.tsx` line 35:
```tsx
<main className="p-6">
```
`p-6` is 24px on all sides. On a 375px phone this consumes 48px of horizontal space (24px each side), leaving only 327px for content. Cards and list items have additional internal padding. Combined, some content runs very close to the edge or wraps awkwardly.

**Prevention:** Use responsive padding: `p-4 md:p-6`. This gives 16px on mobile and 24px on md+. Apply the same pattern to any full-width card that adds its own padding.

**Phase:** Mobile phase. A one-line change with wide visual impact — do it early to accurately judge all other mobile fixes.

---

### Pitfall MB-03: Property page milestone table is not usable on narrow screens

**What goes wrong:** `PropertyPage.tsx` uses a shadcn `<Table>` with four columns inside a `<SheetContent>`. The Sheet is `w-3/4` on mobile (from `sheet.tsx` line 43), which on a 375px phone is approximately 281px wide. The milestone table has four columns: Label (32%), Amount (28%), Paid (w-24 = 96px), Delete (w-10 = 40px). The fixed-pixel columns force the percentage columns to shrink below usable input widths. Users cannot type in the Label or Amount fields without the inputs being truncated.

**Why this is the hardest mobile fix in the codebase:** The milestone table is inside a Sheet inside a form. Overflow options are limited: `overflow-x-auto` on the table container works but forces horizontal scrolling inside an already narrow sheet — acceptable but awkward. The better fix is replacing the table layout with a stacked card-style layout per milestone row on mobile screens.

**Prevention (ordered by effort):**
1. Minimum viable: add `overflow-x-auto` wrapper around the `<Table>`. Two-line change. Prevents clipping.
2. Preferred: replace the `<Table>` with a flex-col milestone card layout on mobile using responsive classes. Each milestone row becomes a stacked form with Label + Amount stacked vertically, and the Paid checkbox + Delete button in a row beneath. More effort but fully usable.

**Phase:** Mobile phase. Flag this as the highest-complexity mobile task. Tackle after the sidebar and padding fixes so the sheet dimensions are stable.

---

### Pitfall MB-04: Sheet forms are not scrollable — content gets clipped on small screens

**What goes wrong:** `SheetContent` in `sheet.tsx` does not include `overflow-y-auto`. The Property sheet is already aware of this (`className="overflow-y-auto sm:max-w-lg"` in `PropertyPage.tsx` line 255), but the other sheets (Stocks, Gold, Mutual Funds, Bank Savings, Bitcoin, Retirement) do **not** have `overflow-y-auto`. On a phone where the keyboard is open, the sheet content area is reduced to roughly 40-50% of the screen height. Form fields below the fold are unreachable.

**Specific affected files:**
- `StocksPage.tsx` — `<SheetContent>` has no overflow class
- `GoldPage.tsx` — same
- `MutualFundsPage.tsx` — same
- `BankSavingsPage.tsx` — same
- `BitcoinPage.tsx` — same
- `RetirementPage.tsx` — same

**Prevention:** Add `overflow-y-auto` to every `SheetContent` that does not already have it. Consider adding it to the default `SheetContent` variant in `sheet.tsx` so it applies globally. Test each sheet with a software keyboard open on a 375px viewport.

**Phase:** Mobile phase. Systematic fix across all page files. Low risk but must be tested with keyboard open.

---

### Pitfall MB-05: Header row (`flex items-start justify-between`) wraps badly on narrow screens

**What goes wrong:** Every asset page uses this pattern:
```tsx
<div className="flex items-start justify-between">
  <div>
    <h1>...</h1>
    <output>₹ total</output>
  </div>
  <Button>Add ...</Button>
</div>
```
On a 375px screen with `p-6` padding (48px consumed), the remaining 327px must fit the page title, section total, and an Add button. For pages with long totals (e.g. `₹1,50,00,000`) or long section names, the button either overlaps text or wraps to a new line misaligning the layout.

**Prevention:** Add `gap-2 flex-wrap` to the outer div, or make the button `shrink-0` and test all INR total string lengths. The total output already uses `tabular-nums` which helps but does not constrain width. A safe fix: `<div className="flex items-start justify-between gap-2 flex-wrap">` — the button drops to a new row only when genuinely needed.

**Phase:** Mobile phase. Check all nine pages.

---

### Pitfall MB-06: Dashboard percentage column has a fixed width on mobile

**What goes wrong:** `DashboardPage.tsx` line 201:
```tsx
<span className="text-sm text-muted-foreground w-10 text-right">
```
The `w-10` (40px) fixed width for the percentage column is fine on desktop. On mobile, combined with the currency value column, the right side of each dashboard row can overflow into the row button's padding if the INR value is wide (eight-digit numbers in Indian formatting like `₹1,50,00,000` are 12 characters).

**Prevention:** Use `min-w-[2.5rem]` instead of `w-10` so the column has a minimum but can shrink if needed. Also ensure the value span has `truncate` or that the right-side `flex` container uses `shrink-0 text-right`. The existing `shrink-0` on the outer container is correct, but the inner spans need explicit protection.

**Phase:** Mobile phase. Low severity — test on an actual 375px viewport with maximum-length INR values.

---

### Pitfall MB-07: `use-mobile.tsx` returns `false` on first render — causes layout jump

**What goes wrong:** `useIsMobile()` in `use-mobile.tsx` initialises state as `undefined` (coerced to `false` by the `!!` return). On the first render, `isMobile` is `false` even on a phone. The `useEffect` fires after paint and sets the correct value. Any component that conditionally renders based on `useIsMobile()` will show the desktop layout for one frame before switching to mobile layout — a visible jump, similar to the dark mode FOUC problem.

**Why it matters:** The shadcn Sidebar already uses `useIsMobile()` internally to decide whether to show a Sheet drawer. When `collapsible="offcanvas"` is enabled (MB-01 fix), this means the sidebar briefly renders as a desktop sidebar before collapsing into the mobile drawer on first paint.

**Prevention:** The `useState<boolean | undefined>(undefined)` pattern with `!!` coercion is the shadcn canonical approach, and the jump is usually imperceptible with fast renders. However, if a visible flash occurs in production, the fix is to render nothing (or a skeleton) until `isMobile !== undefined`. This is only worth doing if the flash is confirmed visually.

**Phase:** Mobile phase. Observe in testing; only fix if the flash is actually visible in production build.

---

### Pitfall MB-08: Virtual keyboard pushing content and causing viewport resize on iOS

**What goes wrong:** On iOS Safari, focusing a form input causes the virtual keyboard to appear, which resizes the viewport. This can cause scrollable Sheet containers to jump — the sheet may scroll to the top when a keyboard appears mid-form. This is a known iOS Safari behaviour that interacts poorly with `position: fixed` elements (sheets are fixed-positioned via Radix Dialog).

**Why it matters for this codebase:** Every asset page uses a Sheet for its add/edit form. On iOS, opening a form and tapping the second or third input field can cause the sheet to scroll unexpectedly.

**Prevention:**
- Ensure `overflow-y-auto` on SheetContent (MB-04 fix) — this reduces the problem by allowing the sheet to scroll independently.
- Add `env(safe-area-inset-*)` padding to the sheet footer so Save/Delete buttons remain visible above the keyboard.
- Set `touch-action: manipulation` on form inputs to disable double-tap zoom on iOS, which otherwise mis-triggers the virtual keyboard.
- Test specifically on iOS Safari (BrowserStack or real device), not just Chrome DevTools device emulation, which does not replicate the keyboard resize behaviour.

**Phase:** Mobile phase, second pass. Address after all form overflow fixes are in place. Explicitly note "test on iOS Safari" in the phase review checklist.

---

## Phase-Specific Warnings

| Phase / Topic | Pitfall | Mitigation |
|---|---|---|
| Dark mode — inline script | DM-01: FOUC | Inline script in index.html before React loads |
| Dark mode — ThemeContext | DM-02: React useEffect FOUC | Read class from HTML element, not localStorage |
| Dark mode — all pages | DM-03: Hard-coded colours | Grep for raw colour tokens before shipping |
| Dark mode — toggle placement | DM-06: Toggle unreachable on mobile | Add to persistent top bar, not just sidebar |
| Mobile — layout foundation | MB-01: Sidebar never collapses | Change to collapsible="offcanvas", add SidebarTrigger |
| Mobile — padding | MB-02: Fixed p-6 | Use p-4 md:p-6 responsive padding |
| Mobile — property page | MB-03: Milestone table overflow | overflow-x-auto wrapper or stacked layout |
| Mobile — all sheets | MB-04: Sheet not scrollable | Add overflow-y-auto to all SheetContent |
| Mobile — iOS forms | MB-08: Keyboard viewport resize | Test on real iOS Safari, not DevTools emulation |

---

## Sources

- Code inspection: direct review of all files in `src/pages/`, `src/components/`, `src/hooks/use-mobile.tsx`, `src/index.css`, `tailwind.config.js`, `index.html`
- Tailwind CSS docs: `darkMode: ["class"]` strategy requires class on root element — verified in `tailwind.config.js` line 3
- shadcn/ui Sheet source: `sheet.tsx` confirmed `bg-black/80` overlay and no default `overflow-y-auto`
- shadcn/ui Sidebar source: `sidebar.tsx` confirmed `useIsMobile()` integration and Sheet-based mobile drawer support
- Confidence: HIGH for all DM and MB pitfalls (derived from direct code inspection of actual codebase)
