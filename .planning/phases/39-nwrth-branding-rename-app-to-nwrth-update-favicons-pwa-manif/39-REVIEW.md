---
phase: 39-nwrth-branding-rename-app-to-nwrth-update-favicons-pwa-manif
reviewed: 2026-05-15T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - public/favicon.svg
  - public/brand-mark.svg
  - public/wordmark.svg
  - public/wordmark-white.svg
  - public/manifest.json
  - index.html
  - src/components/AppSidebar.tsx
  - src/pages/SettingsPage.tsx
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 39: Code Review Report

**Reviewed:** 2026-05-15T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

This phase renames the app to "nwrth", introduces SVG brand assets, updates the PWA manifest, and refreshes `index.html` and `AppSidebar`. The SVGs are clean — no scripts, no external references, and no foreign namespaces. The manifest JSON is valid and all referenced icon files (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `icon-32.png`) exist on disk. However, one undefined CSS custom property causes a silent visual regression in the sidebar logo gradient on every page load, and the ARIA tab role implementation in `SettingsPage` is incomplete in a way that breaks keyboard navigation for screen-reader users.

---

## Critical Issues

### CR-01: `--accent-fg` CSS variable is undefined — sidebar logo color falls back to `unset`

**File:** `src/components/AppSidebar.tsx:110`

**Issue:** The inline style `color: 'var(--accent-fg)'` references a custom property that does not exist anywhere in the stylesheet (`src/index.css`, `src/styles/studio-theme.css`, or any other CSS file). The CSS cascade will resolve `var(--accent-fg)` to the empty string, making `color` effectively `unset`. On the light theme, the icon SVG inside the gradient container uses `fill="currentColor"`, so it inherits a dark foreground color — visually passable but unintended. In dark mode the gradient background (`oklch(0.55 0.18 270)`) is a dark purple, and the icon will also render dark, making it nearly invisible.

This is a visual-correctness defect on every page load; it cannot be caught by TypeScript and requires runtime inspection of rendered color.

**Fix:** Either define `--accent-fg` in `studio-theme.css` (and its `.dark` override), or replace the undefined variable with the existing token that carries the correct semantic meaning for text on an accented background:

```css
/* In src/styles/studio-theme.css :root block */
--accent-fg: 0 0% 99%;   /* white — matches --primary-foreground */

/* And in .dark block */
--accent-fg: 257 28% 11%;
```

Or, inline the known-good token directly in the component:

```tsx
style={{
  background: 'linear-gradient(135deg, var(--primary), oklch(0.55 0.18 270))',
  color: 'var(--primary-foreground)',
}}
```

---

## Warnings

### WR-01: ARIA tab pattern is incomplete — `aria-controls` and `role="tabpanel"` are missing

**File:** `src/pages/SettingsPage.tsx:65-87`

**Issue:** `SettingsTabStrip` correctly assigns `role="tablist"`, `role="tab"`, `aria-selected`, and `id` to each tab button. However, neither `aria-controls` (pointing from each tab to its panel) nor `role="tabpanel"` / `aria-labelledby` (on each panel container) are present. The ARIA Authoring Practices Guide requires this association for the tab pattern to be operable by screen readers: without it, the relationship between a tab button and the content it controls is invisible to assistive technology.

**Fix:** Add `aria-controls` to each tab button and wrap each panel in a `role="tabpanel"` div:

```tsx
// In SettingsTabStrip — add aria-controls to each button
<button
  key={id}
  role="tab"
  aria-selected={tab === id}
  id={`settings-tab-${id}`}
  aria-controls={`settings-panel-${id}`}
  ...
>
```

```tsx
// Wrap each conditional panel in SettingsPage
{settingsTab === 'pricing' && (
  <div
    role="tabpanel"
    id="settings-panel-pricing"
    aria-labelledby="settings-tab-pricing"
  >
    ...
  </div>
)}
```

Apply the same pattern to all five panels (`pricing`, `retirement`, `rates`, `data`, `danger`).

---

### WR-02: `wordmark.svg` and `wordmark-white.svg` embed a font that is not loaded — text will render in browser fallback

**File:** `public/wordmark.svg:7`, `public/wordmark-white.svg:7`

**Issue:** Both wordmarks specify `font-family="'Space Grotesk', 'Geist', sans-serif"` for the `<text>` element. Neither "Space Grotesk" nor "Geist" is loaded anywhere in the app: `index.html` only loads `Inter` via Google Fonts, and there are no `@font-face` declarations for either in the CSS files. Browsers rendering these SVGs inline or as `<img>` tags will fall through to the `sans-serif` system default. The brand text will not match the design intent.

**Fix:** Either load the intended font in `index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
  rel="stylesheet"
/>
```

Or convert the `<text>` to outlines (paths) in the SVG file to make the wordmark font-independent.

---

### WR-03: PWA manifest is missing `scope` field — install behaviour is undefined on some browsers

**File:** `public/manifest.json`

**Issue:** The Web App Manifest spec treats `scope` as optional (it defaults to the directory of the manifest URL), but several browser engines (particularly Samsung Internet and older Chrome) have exhibited install-eligibility or navigation-scope bugs when `scope` is absent and the app is not deployed at the root of the origin. Since this app is known to use a GitHub Pages SPA redirect (see `index.html` lines 13-33 and the `404.html` fallback), there is a real deployment path where the origin root and app root differ. Without an explicit `scope`, installed PWA links can break if served from a sub-path.

**Fix:**

```json
{
  "name": "nwrth",
  "short_name": "nwrth",
  "scope": "/",
  "start_url": "/",
  ...
}
```

If deployed to a GitHub Pages sub-path (e.g. `/net-worth-tracker/`), both `scope` and `start_url` must reflect that sub-path.

---

## Info

### IN-01: `favicon.svg` uses a hardcoded brand color that will not adapt to OS dark mode

**File:** `public/favicon.svg:2-4`

**Issue:** The favicon SVG uses literal `fill="#5a4cc0"` values. Browsers that support `prefers-color-scheme` in SVG favicons (Safari 14+, Chrome 93+) can display a different icon in dark mode if the SVG uses `@media (prefers-color-scheme: dark)` with `currentColor` or different fills. The current file shows a fixed purple on all backgrounds; in dark mode browser chrome this may have poor contrast against dark tab bars.

**Fix:** Add a media query block for dark mode inside the SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none">
  <style>
    rect { fill: #5a4cc0; }
    @media (prefers-color-scheme: dark) {
      rect { fill: #9d8fff; }
    }
  </style>
  <rect x="5" y="16" width="4" height="8" rx="1" opacity="0.4"/>
  <rect x="12" y="10" width="4" height="14" rx="1" opacity="0.7"/>
  <rect x="19" y="4" width="4" height="20" rx="1"/>
</svg>
```

---

### IN-02: `index.html` loads `Inter` but the app theme uses different type tokens — font load may be wasted

**File:** `index.html:37-39`

**Issue:** `index.html` requests `Inter` from Google Fonts. The `studio-theme.css` comment says tokens are "modern Indian fintech cream + indigo" without specifying Inter, and the wordmark SVGs reference `Space Grotesk` / `Geist`. If the Tailwind config or CSS body rule does not specify `font-family: 'Inter', ...`, the preconnect and stylesheet requests are network cost with no visual benefit.

**Fix:** Verify the body or `:root` font-family declaration in `index.css` / `studio-theme.css` references `Inter`. If Inter is genuinely used, add `font-display: swap` (it is already present via `&display=swap` in the URL). If it is not used, remove the `<link>` tags to eliminate the unnecessary network round-trip to `fonts.googleapis.com`.

---

_Reviewed: 2026-05-15T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
