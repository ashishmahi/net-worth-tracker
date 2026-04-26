# Research Summary — v1.1 UX Polish (Dark Mode + Mobile Responsive)

**Synthesized:** 2026-04-26
**Confidence:** HIGH across all areas — based on direct codebase inspection and shadcn/ui official docs

---

## Executive Summary

v1.1 is a low-risk, zero-new-dependency milestone. The CSS infrastructure for dark mode is already fully authored in `src/index.css` (complete `.dark {}` token block) and `tailwind.config.js` (`darkMode: ["class"]`). The only missing piece is a ThemeProvider context, a toggle button, and an inline `<script>` in `index.html` to prevent FOUC. For mobile, the shadcn/ui Sidebar already contains a Sheet-based mobile drawer — it is disabled by a single prop (`collapsible="none"`) in `AppSidebar.tsx`. Changing that to `collapsible="offcanvas"` unlocks mobile nav instantly. The rest of mobile work is systematic Tailwind responsive-class adjustments across all 8 page files.

The two features are fully independent and can be built sequentially. Dark mode is lower risk (no layout changes, zero pages need per-component overrides) and should be implemented first. Mobile work starts with the sidebar structural fix and then proceeds page-by-page. The highest-complexity mobile task is the Property page milestone table inside a Sheet, which may need either `overflow-x-auto` or a stacked-card rewrite for full usability.

---

## Stack Additions

**None.** All required packages and config are already present.

| Existing asset | Used for |
|---|---|
| `darkMode: ["class"]` in `tailwind.config.js` | Already correct — no change needed |
| `.dark {}` CSS variable block in `src/index.css` | Already complete — all shadcn tokens defined |
| `@radix-ui/react-switch` in `package.json` | Toggle control |
| `lucide-react` Moon/Sun icons | Toggle button icons |
| `src/hooks/use-mobile.tsx` | `useIsMobile()` already present at 768px breakpoint |
| `SidebarTrigger` in `src/components/ui/sidebar.tsx` | Hamburger trigger for mobile drawer |
| Sheet-based mobile drawer in `sidebar.tsx` line 199 | Activated by changing `collapsible` prop |

New files to create (no installs):
- `src/components/ThemeProvider.tsx` — context + `useTheme` hook
- `src/components/ModeToggle.tsx` — Sun/Moon toggle button

---

## Feature Table Stakes

### Dark Mode (must have for v1.1 to feel complete)

| Feature | Notes |
|---|---|
| Manual light/dark toggle button | Sun/Moon icon button; must be reachable without opening sidebar |
| Persistence across sessions | `localStorage` key `wealth-tracker-theme`; read on mount |
| Immediate visual feedback | Class toggle on `document.documentElement` is synchronous |
| No flash of wrong theme (FOUC fix) | Inline `<script>` in `index.html` before React loads — non-negotiable |
| All 9 pages readable in dark mode | Already handled by semantic tokens; audit for any raw `bg-white`/`text-gray-*` overrides |
| System preference as default | First-run: default to `prefers-color-scheme` if no saved preference |

Defer to v1.2+: Animated theme transitions (adds visual noise on number-heavy finance tables).

### Mobile Responsive (must have for v1.1 to feel complete)

| Feature | Notes |
|---|---|
| Collapsible sidebar (hamburger on mobile) | Change `collapsible="none"` to `collapsible="offcanvas"` in `AppSidebar.tsx` |
| Persistent mobile top bar with hamburger + theme toggle | `md:hidden` header above `<main>` in `App.tsx` |
| Page header rows that do not overflow at 375px | `flex-wrap gap-2` on all 8 page header divs |
| Sheet forms scrollable with keyboard open | Add `overflow-y-auto` to `SheetContent` in 6 pages (all except Property) |
| Property milestone table usable at 375px | At minimum: `overflow-x-auto` wrapper; preferred: stacked card layout |
| Touch targets minimum 44px | Verify interactive rows on all asset pages |
| Responsive main padding | `p-4 md:p-6` in `App.tsx` |

Defer to v1.2+: Bottom Drawer (Vaul) for mobile forms — current Sheet covers full screen width on phones and works without a new dependency.

---

## Architecture Decisions

### ThemeProvider integration

- **File:** `src/components/ThemeProvider.tsx` (shadcn/ui Vite pattern, NOT `next-themes`)
- **Mount position:** Outermost wrapper in `src/main.tsx`, above `AppDataProvider`
- **Provider order:** `ThemeProvider > AppDataProvider > LivePricesProvider > App`
- **Initial state:** Read from `document.documentElement.classList` — the inline script has already applied the correct class before React renders, so the context just reads the DOM
- **Persistence:** `localStorage` key `wealth-tracker-theme`, values `"light"` | `"dark"` | `"system"`
- **Do not store** theme in `data.json` — UI preference, not financial data; no schema version bump needed

### FOUC prevention (critical two-layer pattern)

1. Inline `<script>` in `index.html` `<head>` — reads `localStorage` and sets `dark` class on `<html>` before first paint
2. `ThemeProvider` reads the existing class from `document.documentElement` on mount rather than applying it — avoids React race with browser paint

### Mobile top bar (couples dark mode toggle + sidebar trigger)

A single persistent `md:hidden` top bar inside `<SidebarInset>` in `App.tsx` solves both concerns: the hamburger `SidebarTrigger` for nav, and a `ModeToggle` button reachable without opening the sidebar. On desktop, `ModeToggle` lives in the `AppSidebar` header/footer.

### Sidebar collapsible change

`AppSidebar.tsx` line 40: `collapsible="none"` to `collapsible="offcanvas"`. Single-line change activates the Sheet-based mobile drawer already implemented in the installed `sidebar.tsx`. No other changes to sidebar internals.

### Page-level responsive pattern (uniform across all 8 pages)

| Element | Current | Fix |
|---|---|---|
| Page header row | `flex items-start justify-between` | Add `flex-wrap gap-2` |
| Multi-column forms/grids | `grid grid-cols-N` | `grid grid-cols-1 md:grid-cols-N` |
| SheetContent (6 pages missing this) | no overflow class | Add `overflow-y-auto` |

---

## Build Order

**Phase A: Dark Mode**
1. Add FOUC-prevention inline script to `index.html` `<head>`
2. Create `src/components/ThemeProvider.tsx` with context and `useTheme` hook
3. Wrap `src/main.tsx` with `ThemeProvider` (outermost)
4. Create `src/components/ModeToggle.tsx` with Sun/Moon toggle
5. Add `ModeToggle` to `AppSidebar.tsx` header/footer (desktop placement)
6. Smoke test: toggle, reload, verify persistence; grep for raw colour tokens

**Phase B: Mobile Foundation (structural)**
7. Change `collapsible="none"` to `collapsible="offcanvas"` in `AppSidebar.tsx`
8. Add `md:hidden` top bar with `SidebarTrigger` + `ModeToggle` to `App.tsx`
9. Change `p-6` to `p-4 md:p-6` on main element in `App.tsx`
10. Test: sidebar drawer at 375px viewport; verify nav tap closes drawer

**Phase C: Page-level Responsive Fixes**
11. Dashboard — `min-w-0 truncate` on value spans; `min-w-[2.5rem]` on percentage column
12. Gold, MF, Stocks, Bitcoin, Bank Savings, Retirement, Settings — `flex-wrap gap-2` on header row + `overflow-y-auto` on SheetContent
13. Property — `overflow-x-auto` wrapper on milestone table (escalate to stacked card if scroll is too awkward)

**Phase D: QA**
14. All sheets with software keyboard open at 375px
15. iOS Safari (real device or BrowserStack) — keyboard viewport resize behaviour
16. Touch target audit: all asset list row buttons must be min 44px

---

## Watch Out For

**DM-01 / DM-02 — FOUC on page load [CRITICAL]**
The `ThemeProvider` must NOT apply the `dark` class via `useEffect` — that runs after paint. The inline `<script>` in `index.html` applies the class synchronously before React loads. The React context then reads the class already on `<html>` as its initial state. Shipping the toggle without the inline script ships a visible white flash on every page load when dark mode is saved.

**MB-01 — Sidebar `collapsible="none"` blocks all mobile work [CRITICAL]**
With the sidebar always rendered at full width, the content viewport is effectively 0px on a phone. Every other mobile fix is invisible until this prop is changed to `collapsible="offcanvas"`. Do this first.

**MB-04 — Sheet forms not scrollable on 6 pages [HIGH]**
`StocksPage`, `GoldPage`, `MutualFundsPage`, `BankSavingsPage`, `BitcoinPage`, `RetirementPage` all have `SheetContent` without `overflow-y-auto`. On mobile with keyboard open, form fields below the fold are unreachable. `PropertyPage` already has this fixed. Apply `overflow-y-auto` systematically to all 6 remaining pages.

**MB-03 — Property milestone table inside a Sheet [HIGH]**
Four columns in a Sheet that is 75% wide at 375px (~281px). `overflow-x-auto` is the minimum viable fix; if horizontal scroll inside a sheet feels awkward in testing, escalate to a stacked card-per-milestone layout (more effort but better UX).

**MB-08 — iOS Safari keyboard viewport resize [MEDIUM]**
Chrome DevTools device emulation does not replicate iOS Safari's viewport-resize on keyboard open. Sheets can jump when keyboard appears. Must test on a real iOS device or BrowserStack. Mitigation: `overflow-y-auto` on all SheetContent (MB-04) reduces severity; add `env(safe-area-inset-bottom)` to sheet footers if Save buttons get clipped.

---

## Confidence Assessment

| Area | Confidence | Basis |
|---|---|---|
| Dark mode CSS already complete | HIGH | Direct inspection of `src/index.css` and `tailwind.config.js` |
| ThemeProvider pattern (no next-themes) | HIGH | shadcn/ui official Vite docs |
| Sidebar offcanvas activates mobile Sheet | HIGH | Direct inspection of `sidebar.tsx` line 199 |
| No new npm packages needed | HIGH | All pieces verified in `package.json` and installed components |
| FOUC prevention approach | HIGH | Standard pattern for class-strategy dark mode |
| Sheet scroll gaps on 6 pages | HIGH | Direct inspection of all page files |
| Property table as hardest mobile task | HIGH | Column count and fixed-pixel widths confirmed in `PropertyPage.tsx` |
| iOS Safari keyboard behaviour | MEDIUM | Cannot validate without device test; mitigations documented |

**Overall: HIGH.** All unknowns are testing/QA concerns, not architecture uncertainties.

**Gaps requiring attention during implementation:**
- iOS Safari keyboard behaviour (MB-08) — requires real device or BrowserStack test
- Property milestone table — decide `overflow-x-auto` vs stacked card layout after visual test at 375px

---

## Sources

- Direct codebase inspection: `src/index.css`, `tailwind.config.js`, `index.html`, `App.tsx`, `AppSidebar.tsx`, `sidebar.tsx`, `use-mobile.tsx`, all 8 page files, `sheet.tsx`
- shadcn/ui official docs: dark mode Vite guide, Sidebar, Sheet, Table — via Context7
- Tailwind CSS 3.4.x `darkMode: ["class"]` documentation
