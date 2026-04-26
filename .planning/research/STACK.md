# Stack Research: v1.1 UX Polish (Dark Mode + Mobile)

**Project:** Personal Wealth Tracker
**Researched:** 2026-04-26
**Confidence:** HIGH — verified against shadcn/ui official Vite docs and existing codebase inspection

---

## Dark Mode

### Verdict: Zero new dependencies required

The project already has everything needed for class-based dark mode:

| What exists | Where | Status |
|---|---|---|
| `.dark` CSS variable block | `src/index.css` lines 37–65 | Complete — all shadcn/ui tokens defined |
| `darkMode: ["class"]` | `tailwind.config.js` line 3 | Correct — class strategy already set |
| `dark:` Tailwind variant | All shadcn/ui components | Works automatically once `.dark` is on `<html>` |
| `@radix-ui/react-switch` | `package.json` | Already installed — use for the toggle control |
| `lucide-react` Moon/Sun icons | `package.json` | Already installed |

### What to build (no installs)

**Step 1 — `src/components/ThemeProvider.tsx`** (new file, ~50 lines)

The shadcn/ui official Vite dark mode guide (source: `apps/v4/content/docs/dark-mode/vite.mdx`) prescribes a self-contained React Context component — not `next-themes`. This is the correct pattern for a Vite SPA:

```tsx
// Canonical shadcn/ui Vite pattern
type Theme = "dark" | "light" | "system"

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "wealth-tracker-theme" }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    if (theme === "system") {
      root.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      return
    }
    root.classList.add(theme)
  }, [theme])

  // setTheme writes to localStorage + updates state
}

export const useTheme = () => useContext(ThemeProviderContext)
```

Why not `next-themes`?
- `next-themes` v0.4.6 is designed for SSR (Next.js); FOUC prevention relies on injected server scripts irrelevant to a Vite SPA.
- The shadcn/ui Vite guide explicitly uses the custom ThemeProvider approach, not `next-themes`.
- Zero extra bundle weight vs. pulling in a library for a ~50-line pattern.
- No hydration warnings to suppress in a client-only app.

**Step 2 — Wire into `src/main.tsx`**

Wrap `<App />` with `<ThemeProvider defaultTheme="system" storageKey="wealth-tracker-theme">`.

**Step 3 — `src/components/ModeToggle.tsx`** (new file, ~20 lines)

Simple button using `useTheme()` + `Switch` (already installed via `@radix-ui/react-switch`) or a `Button` with Moon/Sun icons from `lucide-react`. Place it in `AppSidebar`'s footer or in a page header.

Pattern from shadcn/ui docs:
```tsx
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button variant="ghost" size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Persistence mechanism

localStorage key `"wealth-tracker-theme"` stores `"light"` | `"dark"` | `"system"`. No FOUC issue in a Vite SPA because React mounts synchronously before paint is seen by the user on localhost (and this is a local-only dev app). The `useState` initialiser reads localStorage synchronously, so the correct class is applied on first render.

### Tailwind config change needed

`tailwind.config.js` already has `darkMode: ["class"]`. No change required. Tailwind 3.4.x supports `dark:` variant out of the box.

---

## Mobile Responsive

### Verdict: Zero new dependencies required

The existing `shadcn/ui` Sidebar component already has full mobile support built in. The issue is a single configuration choice in `AppSidebar.tsx`.

### Current state (problem)

`src/components/AppSidebar.tsx` line 40:
```tsx
<Sidebar collapsible="none" className="border-r">
```

`collapsible="none"` means the sidebar is always visible, always full-width — it never converts to a Sheet/drawer on mobile. This is why the app is broken on small screens.

### Fix: Change collapsible mode

The `shadcn/ui` Sidebar component (`src/components/ui/sidebar.tsx`) already handles mobile at line 199:

```tsx
if (isMobile) {
  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent ... data-sidebar="sidebar" data-mobile="true">
        {children}
      </SheetContent>
    </Sheet>
  )
}
```

This Sheet-based mobile drawer is **already in the installed component**. It activates when `isMobile` is true AND `collapsible` is not `"none"`.

Change `AppSidebar.tsx` to:
```tsx
<Sidebar collapsible="offcanvas" className="border-r">
```

Then add a `SidebarTrigger` (hamburger button) in the main content header so mobile users can open the drawer:

```tsx
import { SidebarTrigger } from "@/components/ui/sidebar"

// In App.tsx inside <SidebarInset>:
<header className="flex items-center gap-2 p-4 md:hidden">
  <SidebarTrigger />
</header>
```

`SidebarTrigger` is already exported from `src/components/ui/sidebar.tsx` — no new install needed.

### Responsive layout patterns for asset pages

The asset pages use Tailwind classes already. The adjustments needed are Tailwind responsive prefixes applied to existing markup:

| Pattern | Current (broken on mobile) | Fix |
|---|---|---|
| Tables with many columns | `<table>` | Wrap in `overflow-x-auto` div, or switch to card-per-row on mobile |
| Multi-column forms | `grid grid-cols-3` | `grid grid-cols-1 md:grid-cols-3` |
| Side-by-side card layouts | `flex gap-4` | `flex flex-col md:flex-row gap-4` |
| Fixed-width inputs | `w-64` | `w-full md:w-64` |
| Page padding | `p-6` (App.tsx) | `p-3 md:p-6` |

These are CSS class changes in existing `.tsx` files — zero new libraries.

### `useIsMobile()` hook

`src/hooks/use-mobile.tsx` already exists with breakpoint `768px`. Consume this hook anywhere conditional mobile/desktop rendering is needed (e.g., showing an abbreviated table on mobile vs. full table on desktop).

### Viewport meta tag

Verify `index.html` has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

This is standard Vite scaffold but worth confirming — without it, mobile browsers render at desktop width and media queries don't fire.

---

## What NOT to Add

| Temptation | Why to skip |
|---|---|
| `next-themes` | Designed for SSR/Next.js. The shadcn/ui Vite guide uses a custom ThemeProvider. Adds bundle weight for a 50-line pattern. |
| `react-responsive` or `@mantine/hooks` | `useIsMobile()` hook already exists in the codebase. |
| `framer-motion` for theme transitions | Overkill for a personal local tool. `transition-colors duration-300` Tailwind class achieves smooth color transitions. |
| CSS media query overrides in `index.css` | All layout responsiveness should live in Tailwind utility classes on components, not in global CSS overrides. |
| A mobile-specific router or page system | The SPA already uses section-based navigation via `activeSection` state. The sidebar Sheet handles mobile nav. |
| `tailwindcss-animate` plugin | Already implicitly available via shadcn/ui component patterns; not needed as an explicit dependency. |
| `color-scheme` meta tag swap | `root.style.colorScheme = theme` in the ThemeProvider effect handles browser chrome (scrollbar, form controls) correctly. |

---

## Installation Summary

```bash
# No new packages required.
# All dark mode and mobile work is configuration + new component files.
```

New files to create:
- `src/components/ThemeProvider.tsx` — context provider + useTheme hook
- `src/components/ModeToggle.tsx` — Sun/Moon toggle button

Files to modify:
- `src/main.tsx` — wrap with ThemeProvider
- `src/components/AppSidebar.tsx` — change `collapsible="none"` to `collapsible="offcanvas"`, add ModeToggle to footer
- `src/App.tsx` — add SidebarTrigger in mobile header, fix `p-6` to `p-3 md:p-6`
- Each asset page (`*.tsx`) — responsive Tailwind prefixes on grids, tables, inputs

---

## Confidence Assessment

| Area | Confidence | Source |
|---|---|---|
| Dark mode CSS variables already complete | HIGH | Direct inspection of `src/index.css` |
| `darkMode: ["class"]` already set | HIGH | Direct inspection of `tailwind.config.js` |
| Custom ThemeProvider (no next-themes) is the Vite pattern | HIGH | shadcn/ui official docs `apps/v4/content/docs/dark-mode/vite.mdx` via Context7 |
| Sidebar Sheet mobile support already in code | HIGH | Direct inspection of `src/components/ui/sidebar.tsx` line 199 |
| `collapsible="offcanvas"` activates mobile drawer | HIGH | shadcn/ui docs + code inspection |
| `useIsMobile()` hook already present | HIGH | Direct inspection of `src/hooks/use-mobile.tsx` |
| No new npm packages needed | HIGH | Verified all required pieces exist in package.json and installed components |
