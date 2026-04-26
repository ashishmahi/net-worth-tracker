# Architecture Research

**Project:** Personal Wealth Tracker v1.1 — UX Polish (dark mode + mobile responsive)
**Researched:** 2026-04-26
**Confidence:** HIGH — based on direct inspection of existing source files and confirmed framework behavior

---

## Dark Mode

### How the class strategy works (already half-done)

`tailwind.config.js` already uses `darkMode: ["class"]`. This means Tailwind dark variants
(`dark:bg-slate-900`, etc.) activate when the `dark` class is present on the `<html>` element.

`src/index.css` already defines a complete `.dark { ... }` block with all shadcn/ui CSS custom
properties (`--background`, `--foreground`, `--card`, `--sidebar-background`, etc.). Every
shadcn/ui component in the app already consumes those variables via `bg-background`,
`text-foreground`, `bg-card`, etc.

Conclusion: zero changes needed to Tailwind config, zero changes needed to `index.css`. The
infrastructure is already correct. The only missing piece is a mechanism to toggle the `dark`
class on `<html>` and persist the user's choice.

### New components / providers

**1. `ThemeProvider` — `src/context/ThemeContext.tsx` (NEW)**

Minimal context that owns `theme: 'light' | 'dark'` and exposes `toggleTheme()`. On mount it
reads `localStorage.getItem('theme')` (or falls back to `'light'`). On every change it writes
back to localStorage and adds/removes the `dark` class on `document.documentElement`.

```tsx
// Skeleton only — fill in during implementation
type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) ?? 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

Mount position in `src/main.tsx`: wrap outermost, above `AppDataProvider`, so it controls the
`<html>` class before any render. Provider order becomes:
`ThemeProvider > AppDataProvider > LivePricesProvider > App`.

**2. `ThemeToggle` — `src/components/ThemeToggle.tsx` (NEW)**

A small button component that calls `useTheme().toggleTheme()` and renders a Sun/Moon icon from
lucide-react (already installed). Placed in the sidebar header or as an icon-only button in the
app top bar.

### Modified components

**`src/components/AppSidebar.tsx`**

Currently uses `collapsible="none"`, which bypasses the Sheet-based mobile collapse built into
the shadcn/ui sidebar. This must change to `collapsible="offcanvas"` for mobile (see Mobile
section). As part of that change, add `ThemeToggle` to `SidebarHeader` so it appears in the
sidebar footer or header consistently on both desktop and mobile.

**`src/App.tsx`**

Add a `<SidebarTrigger>` (shadcn/ui export from `sidebar.tsx`) to the `<main>` header area so
mobile users have a visible hamburger button to open the sidebar. The `<main className="p-6">`
wrapper needs a top bar row containing the trigger and optionally the page title.

**`src/main.tsx`**

Add `ThemeProvider` as the outermost wrapper (see above).

### Theme persistence strategy

Storage key: `'theme'` in `localStorage`. Value: `'light'` or `'dark'` (string literal).

Read on provider mount using a lazy state initializer (not `useEffect`) so the correct class is
applied before first paint — this avoids a flash of the wrong theme on load.

Do NOT store the theme preference in `data.json`. It is a UI preference, not financial data.
Keep it separate from `AppDataContext` entirely. No schema version bump needed.

Do NOT attempt to read `prefers-color-scheme`. The requirement is a manual toggle with session
persistence, not automatic system-preference matching. Simpler is correct here.

---

## Mobile Responsive

### Current state

The shadcn/ui `Sidebar` component in `AppSidebar.tsx` is rendered with `collapsible="none"`.
That prop makes the sidebar a static `<div>` with no collapse logic — it is always visible and
always takes `16rem` of horizontal space. On small screens this is unusable.

The `SidebarProvider` and `sidebar.tsx` already implement the full mobile Sheet pattern:
when `isMobile` is true (< 768 px) and `collapsible` is not `"none"`, the sidebar renders
as a `<Sheet>` overlay with an 18rem width. This code is already written in the installed
`sidebar.tsx` — it just needs to be enabled.

The `useIsMobile()` hook at `src/hooks/use-mobile.tsx` is already present and used by
`sidebar.tsx` internally.

### Layout changes needed

**`AppSidebar.tsx` — change `collapsible` prop**

Change `collapsible="none"` to `collapsible="offcanvas"`. This single change activates the
mobile Sheet overlay path in the existing sidebar component for viewports below 768 px.

**`App.tsx` — add top bar with sidebar trigger**

On desktop the sidebar is always visible, so no trigger is needed. On mobile the sidebar is
hidden behind a Sheet, so a trigger button must exist in the main content area. Add a sticky
top bar inside `<SidebarInset>`:

```tsx
// Inside SidebarInset, above <main>
<header className="flex items-center gap-2 px-4 h-12 border-b md:hidden">
  <SidebarTrigger />
  <span className="text-sm font-semibold">Wealth Tracker</span>
</header>
```

Use `md:hidden` so the trigger only appears below the `md` breakpoint (768 px) where the
sidebar collapses.

**`src/App.tsx` — main content padding**

Current: `<main className="p-6">`. On mobile, `p-6` (24 px) is correct but the content width
will be the full viewport minus no sidebar. No padding change is needed — the existing `p-6`
works on mobile once the sidebar is no longer stealing 16rem of horizontal space.

### Component modifications

All 8 pages share the same structure: a `space-y-4` or `space-y-8` wrapper with a page heading,
a card list, and a `Sheet` for add/edit. The patterns below apply uniformly.

**Page header row (all pages)**

Pattern in every page (example from `GoldPage`):
```tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-xl font-semibold">Gold</h1>
    <output>₹1,20,000</output>
  </div>
  <Button>Add Item</Button>
</div>
```

On narrow screens the heading block and the button compete for horizontal space. Fix:
add `flex-wrap gap-2` and let the button wrap below, or add `shrink-0` to the button. Minimal
class change: `"flex flex-wrap items-start justify-between gap-2"`.

**`DashboardPage.tsx` — category rows**

Each row has a left label block and a right `{value} {pct}` block:
```tsx
<div className="flex items-center justify-between gap-2 px-4 py-3">
```
The percentage column is fixed at `w-10`. On very narrow screens (< 360 px) the INR value
could truncate. Fix: keep existing layout but ensure the value span has `min-w-0 truncate` so
it clips rather than overflows. The `gap-2 shrink-0` on the right block is already present and
correct.

**`PropertyPage.tsx` — milestone Table component**

This is the highest-risk responsive target. It uses `<Table>` with 5 columns (label, amount,
paid checkbox, cumulative, action). On mobile a full table with 5 columns will overflow its
container.

Recommended approach: swap to a stacked card list on mobile, or use horizontal scroll on the
table container. The simpler fix is:
```tsx
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```
This requires no structural change and is safe for an initial pass. A stacked layout would give
better UX but is a more significant rewrite — defer to a follow-up if needed.

**`Sheet` components (all pages with add/edit forms)**

shadcn/ui `Sheet` with `side` unset defaults to `"right"` and renders full-height, 70%+ width on
mobile (Tailwind's default `SheetContent` is `w-3/4`). This already works well on mobile without
modification. No changes required.

**`SettingsPage.tsx` — live rates `<dl>` rows**

Each row: `<div className="flex justify-between gap-4">`. On narrow screens the long label
("USD → INR (₹ per $1)") and value may be too close. Already uses `gap-4` which is fine.
Only change needed: ensure the outer `<Card>` does not have a fixed min-width. Currently it does
not — no change needed.

**`BitcoinPage.tsx`, `MutualFundsPage.tsx`, `StocksPage.tsx`, `BankSavingsPage.tsx`,
`RetirementPage.tsx`** — not read in detail but follow the same `flex items-start justify-between`
header + Card list pattern as GoldPage. Apply the same `flex-wrap gap-2` fix to the header row
in each.

### Build order

The two features (dark mode and mobile) are independent. Recommended order:

**Step 1 — Dark mode (no layout risk)**

1. Create `src/context/ThemeContext.tsx` — `ThemeProvider`, `useTheme` hook
2. Wrap `main.tsx` with `ThemeProvider`
3. Create `src/components/ThemeToggle.tsx` — Sun/Moon toggle button
4. Add `ThemeToggle` to `AppSidebar.tsx` sidebar header
5. Manual smoke test: toggle on/off, reload, confirm persistence

Dark mode requires no changes to any page component. All pages inherit dark mode automatically
via CSS custom properties already defined in `index.css`. This makes it a zero-regression change
to all 8 pages.

**Step 2 — Mobile sidebar (structural, test on each page after)**

1. Change `AppSidebar.tsx` `collapsible="none"` to `collapsible="offcanvas"`
2. Add mobile top bar with `<SidebarTrigger>` inside `App.tsx`
3. Test navigation works on mobile viewport (sidebar opens, page loads, sidebar closes on nav)
4. Since `onSelect` closes the sidebar after navigation: verify `setOpenMobile(false)` is called.
   The shadcn/ui `SidebarMenuButton` `onClick` should call `onSelect` and the Sheet should
   close when the user taps outside — but confirm with a real mobile viewport test.

**Step 3 — Page-level responsive fixes (per page, low risk)**

Apply per-page responsive class fixes in page order: Dashboard, Gold, MF, Stocks, Bitcoin,
Bank Savings, Retirement, Settings, Property (Property last because of table complexity).

Each fix is a Tailwind class change on 1–3 elements per page — no logic changes.

**Step 4 — Property table overflow (isolated)**

Wrap `<Table>` in `<div className="overflow-x-auto">` inside PropertyPage. If horizontal scroll
proves unacceptable in testing, escalate to stacked card layout in a separate sub-task.

---

## Summary: New vs Modified

| Item | Type | File |
|------|------|------|
| `ThemeProvider` + `useTheme` | NEW | `src/context/ThemeContext.tsx` |
| `ThemeToggle` button | NEW | `src/components/ThemeToggle.tsx` |
| Wrap with `ThemeProvider` | MODIFIED | `src/main.tsx` |
| Add `ThemeToggle`, change `collapsible` | MODIFIED | `src/components/AppSidebar.tsx` |
| Add mobile top bar + `SidebarTrigger` | MODIFIED | `src/App.tsx` |
| `flex-wrap gap-2` on header row | MODIFIED | All 8 page files |
| `overflow-x-auto` table wrapper | MODIFIED | `src/pages/PropertyPage.tsx` |

No changes to: `index.css`, `tailwind.config.js`, `AppDataContext.tsx`, `LivePricesContext.tsx`,
`data.json` schema, `priceApi.ts`, or any calculation utilities.
