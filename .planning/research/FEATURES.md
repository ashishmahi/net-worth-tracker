# Features Research

**Domain:** UX Polish — Dark Mode + Mobile Responsive for personal finance tracker
**Researched:** 2026-04-26
**Confidence:** HIGH (based on direct codebase inspection + shadcn/ui + Tailwind official docs)

---

## Dark Mode

### Context: What Is Already Done

The codebase has dark mode CSS *authored but inactive*:

- `tailwind.config.js` already sets `darkMode: ["class"]` — activation is a single class toggle on `<html>`
- `src/index.css` already defines a complete `.dark {}` block with all CSS custom properties for every shadcn token (`--background`, `--foreground`, `--card`, `--sidebar-background`, etc.)
- All shadcn components (Card, Input, Sheet, Badge, Button, Table, Sidebar) use semantic tokens only — they recolor automatically when `.dark` is applied

The gap is entirely at the *activation layer*: nothing reads or writes the `dark` class, and there is no toggle UI. Dark mode is zero-cost to make functional; the UI to control it is the only work.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Manual light/dark toggle button | Users expect explicit control for a local personal app; "system follows OS" alone is frustrating when you want to use the app at night without changing OS settings | Low | `Sun`/`Moon` icon from `lucide-react` (already installed). Flip `.dark` class on `document.documentElement`. |
| Persistence across sessions | State must survive page reload; a toggle that resets every visit is useless | Low | `localStorage` key (e.g. `theme`). Read on mount, write on toggle. |
| Immediate visual feedback | Toggle must apply instantly with no page reload | Low | Class manipulation on `<html>` is synchronous |
| No flash of wrong theme on load | Page must not briefly flash light mode before JS runs when dark is saved | Low-Medium | Inline `<script>` in `index.html` before React hydrates: reads `localStorage` and sets class before first paint. ~3 lines. |
| All 9 pages readable in dark mode | Every asset section, dashboard, and settings must be legible — no white hardcoded backgrounds | Low | Already handled by semantic tokens throughout codebase. Manual audit needed for any inline `bg-white` or `text-black` that bypass tokens. |
| Form inputs readable in dark mode | The shadcn `Input`, `select`, `Checkbox`, `Switch` must render with correct contrast | Low | Already handled by CSS tokens. The one native `<select>` in GoldPage uses `bg-background` class — will pick up dark correctly. |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| System preference sync on first load | If no saved preference exists, default to OS `prefers-color-scheme` — good first-run experience without requiring user to discover toggle | Low | `window.matchMedia('(prefers-color-scheme: dark)').matches` in the initialisation script. One additional `if` branch. |
| Toggle placement in sidebar header | For a sidebar app, placing Sun/Moon in the sidebar header is immediately discoverable without a separate settings page | Low | Modify `AppSidebar.tsx` to add a ghost icon button in `SidebarHeader`. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Using `next-themes` library | This is a Vite app with no SSR and no hydration. `next-themes`'s core value is preventing hydration mismatch — irrelevant here. Adding a 5 kB library for a 10-line problem is unnecessary. | Implement directly: inline script in `index.html` + a `useTheme` hook in ~30 lines. |
| OS-only automatic dark mode (no manual toggle) | Users of a personal finance app often want to choose their viewing mode independent of system settings | Always provide a manual toggle. System pref can be the default, but not the only control. |
| Storing dark mode preference in `data.json` | Violates the data model — display preferences are not financial data. Also causes an unnecessary API write on every toggle. | `localStorage` only. |
| Per-component `dark:` class overrides scattered in pages | Fragile maintenance burden — every new component requires dark variants to be manually specified | Rely exclusively on CSS custom property tokens already in place. Add `dark:` overrides only where a component truly breaks. |
| Animated theme transition (fade/dissolve) | Finance data tables flash large number changes during transition; this looks like a display glitch, not a polish feature | Apply `disableTransitionOnChange`-equivalent: add a brief `.no-transitions * { transition: none !important; }` class during toggle, remove after 1 frame. Or simply omit transitions entirely. |

---

## Mobile Responsive

### Context: What Exists and What Breaks

Current layout structure:

- `SidebarProvider` wraps the app; `AppSidebar` uses `collapsible="none"` — sidebar is always rendered as a fixed left column with no mobile Sheet fallback
- `<main className="p-6">` has no responsive padding or max-width constraints
- Each page is a `<div className="space-y-4">` with a flex header row and a Card body
- Most pages render a list of clickable rows (low-complexity mobile case)
- Property page renders a `<Table>` with milestone rows inside a Sheet — the hardest mobile case
- All add/edit flows use shadcn `Sheet` (right-side slide-over) — Sheet is already mobile-friendly natively

Key breakpoints for this app: `sm` (640px) is largely irrelevant. The real split is `md` (768px): below this, sidebar must collapse to a hamburger; above this, sidebar remains fixed.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Collapsible sidebar on mobile | At 375px–768px the fixed sidebar eats 40%+ of screen width. Navigation is completely broken without this. | Medium | Change `AppSidebar` from `collapsible="none"` to `collapsible="offcanvas"`. shadcn Sidebar already handles the mobile Sheet internally when `isMobile` is true (based on `768px` breakpoint via `useSidebar`). Add a hamburger `<SidebarTrigger>` button in a mobile header bar above `<main>`. |
| Mobile header bar with hamburger | Required companion to collapsible sidebar — users need a target to open the nav | Low | A `<header className="flex items-center gap-2 px-4 py-3 border-b md:hidden">` above SidebarInset. Contains `SidebarTrigger` and app title. |
| Touch target minimum 44px height | iOS HIG and Android Material require 44–48px minimum tap targets. Current `py-3` list rows may be borderline. | Low | Verify all interactive rows have `min-h-[44px]`. Already present on SidebarMenuButton in existing code. Apply same to asset list row buttons. |
| Readable card/list rows at 375px | Asset list rows show label on left, value on right — this pattern works at narrow widths if font and padding are correct | Low | Verify text does not overflow or truncate. Use `truncate` on labels, `shrink-0` on value columns. Already partially done in DashboardPage. |
| Page heading + total + Add button fits one row at 375px | The flex header (`justify-between`) with a large INR value and "Add Item" button will overflow at narrow widths | Low-Medium | Stack heading/total above button on mobile: `flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between`. Or shrink button to icon-only on mobile. |
| Sheet forms usable on mobile keyboard | Sheets must not be obscured by the software keyboard when a text input is focused | Low | shadcn Sheet already uses Radix Dialog under the hood — Radix handles scroll-lock and focus. No special work needed unless specific inputs scroll out of view. Test on device/simulator. |
| Property milestone Table horizontal scroll | The milestone table (Label, Amount, Paid) will overflow at 375px | Low | Wrap table in `overflow-x-auto`. shadcn Table component already adds `overflow-x-auto` on its container wrapper by default. Verify the Sheet containing it does not clip overflow. |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Icon-only "Add" button on very small screens | Frees horizontal space in page headers without removing functionality | Low | `<Button size="icon" className="shrink-0"><Plus /></Button>` with `aria-label`. Show text label on `sm:` and above with `hidden sm:inline`. |
| Bottom sheet Drawer for add/edit forms on mobile | shadcn Drawer (built on Vaul) slides up from bottom — matches native iOS/Android modal form conventions better than a right-side Sheet on narrow screens | Medium | Use shadcn `Drawer` on mobile, `Sheet` on desktop. Pattern: `const isDesktop = useMediaQuery("(min-width: 768px)")`. If `isDesktop`, render Sheet; else render Drawer. Requires adding `@radix-ui/react-dialog` is already installed; Vaul/Drawer would be a new dep. Worthwhile for 7 form-heavy sections. |
| Dashboard category rows never wrap | Dashboard rows (label + %, value) are the most-read layout. Keeping them single-line at 375px with `truncate` and `tabular-nums` prevents visual noise | Low | Already partially implemented with `shrink-0` on value column. Ensure `min-w-0` on label side. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Responsive HTML table with hidden columns | Hiding columns on mobile (e.g. hiding "Created At") degrades functionality and creates confusion when data seems missing | Use a card-per-row pattern for dense tables, OR rely on horizontal scroll with `overflow-x-auto`. For this app's tables (Property milestones only), horizontal scroll is simpler and the columns are all load-bearing. |
| Separate mobile views/routes | Maintaining two codebases for desktop vs mobile diverges quickly | Single responsive component tree with Tailwind breakpoints only. |
| Disabling pinch-to-zoom | Viewport meta with `user-scalable=no` fails WCAG accessibility and frustrates users viewing financial numbers | Keep default viewport. If text is sized correctly, zoom is rarely needed. |
| Bottom navigation bar (tab bar) | This is a sidebar app. Replacing sidebar nav with a tab bar on mobile is a significant nav paradigm shift that conflicts with the existing 9 sections (tab bars max out at 5 items) | Collapsible sidebar to hamburger is the correct mobile pattern for 9 nav items. |
| Forcing landscape-only for finance tables | Some apps restrict orientation; personal finance tools should work in portrait — users check balances in portrait | Design for portrait 375px as primary mobile target. |

---

## Feature Dependencies (within this milestone)

```
Dark mode toggle UI → index.html inline script (theme initialisation, prevents flash)
Dark mode toggle UI → AppSidebar.tsx (toggle placement)
Collapsible sidebar → AppSidebar.tsx collapsible prop change
Collapsible sidebar → Mobile header bar (SidebarTrigger entry point)
Mobile header bar → App.tsx layout wrapper (add header above SidebarInset)
Page header stacking → Each of 7 asset pages + DashboardPage (same pattern, apply uniformly)
Property Table scroll → PropertyPage.tsx Sheet inner layout
```

## MVP Recommendation

Prioritize in this order:

1. Dark mode toggle + persistence + flash-prevention script — highest ROI, lowest risk, zero new dependencies. The CSS is already done.
2. Collapsible sidebar with hamburger header — without this, mobile is completely broken. Medium complexity but well-supported by shadcn Sidebar's built-in `offcanvas` mode.
3. Page header stacking on narrow screens — affects all 7 asset pages and Dashboard. Apply one responsive Tailwind pattern uniformly.
4. Touch target audit — low effort, high impact for usability.
5. Property Table overflow-x-auto — verify shadcn Table wrapper handles it; likely already works.

Defer: Drawer-vs-Sheet responsive form pattern. The existing Sheet works on mobile (right-side slide covers full width on phones anyway). Only upgrade if manual testing shows it feels wrong.

## Sources

- shadcn/ui sidebar docs: https://ui.shadcn.com/docs/components/sidebar (collapsible offcanvas, mobile Sheet, isMobile hook) — HIGH confidence, Context7
- shadcn/ui table docs: https://ui.shadcn.com/docs/components/table (overflow-x-auto container) — HIGH confidence, Context7
- shadcn/ui drawer docs: https://ui.shadcn.com/docs/components/drawer (responsive Drawer/Dialog pattern) — HIGH confidence, Context7
- next-themes README: https://github.com/pacocoursey/next-themes (localStorage, ThemeProvider) — HIGH confidence, Context7 (noted: not recommended for this project — Vite/no SSR)
- Tailwind darkMode class config: tailwind.config.js in repo — HIGH confidence, direct inspection
- Dark mode CSS tokens: src/index.css in repo — HIGH confidence, direct inspection
- AppSidebar collapsible="none": src/components/AppSidebar.tsx — HIGH confidence, direct inspection
