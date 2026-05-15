---
phase: 39-nwrth-branding-rename-app-to-nwrth-update-favicons-pwa-manif
verified: 2026-05-15T20:15:00Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open app in browser and confirm sidebar shows 3-bar ascending icon with gradient background (not 'W' letter)"
    expected: "Three ascending rect bars visible in a purple gradient square container at sidebar top-left"
    why_human: "SVG rendering and gradient color cannot be verified programmatically without a browser"
  - test: "Confirm sidebar icon gradient adapts correctly across all 3 themes (Ledger, Vault, Studio) in both light and dark modes"
    expected: "Gradient uses var(--accent) start color which changes per theme; icon remains visible and legible in all 6 combinations"
    why_human: "CSS custom property rendering requires visual inspection in a live browser"
  - test: "Check browser tab favicon shows nwrth brand mark (not the Vite logo triangle)"
    expected: "nwrth SVG favicon appears in browser tab"
    why_human: "Favicon rendering requires a live browser"
  - test: "Verify PWA install prompt and manifest by opening DevTools > Application > Manifest"
    expected: "Manifest shows name 'nwrth', theme_color '#3d3480', icons listed with 192px and 512px entries"
    why_human: "PWA manifest parsing and installability require a live browser DevTools check"
---

# Phase 39: nwrth Branding Verification Report

**Phase Goal:** Rename app to "nwrth", update favicons, PWA manifest, sidebar brand component, and meta tags so the product presents the nwrth identity end-to-end.
**Verified:** 2026-05-15T20:15:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Browser tab shows nwrth favicon (not Vite logo) | ✓ VERIFIED | `public/favicon.svg` exists (326B); `index.html` line 5: `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`; zero occurrences of `vite.svg` in `index.html` |
| 2 | Browser tab title reads 'nwrth' | ✓ VERIFIED | `index.html` line 40: `<title>nwrth</title>`; zero occurrences of "Wealth Tracker" in `index.html` |
| 3 | PWA manifest loads with correct name, icons, and theme color | ✓ VERIFIED | `public/manifest.json` contains `"name": "nwrth"`, `"short_name": "nwrth"`, `"theme_color": "#3d3480"`, `"background_color": "#f7f4ed"`, `"start_url": "/"`, icons array with `icon-192.png` and `icon-512.png`; `manifest.json` linked from `index.html` line 8 |
| 4 | All 10 icon files exist in public/ and are served at root / | ✓ VERIFIED | All 10 files present: `favicon.svg` (326B), `icon-32.png` (1.0K), `apple-touch-icon.png` (33.5K), `icon-192.png` (36.9K), `icon-512.png` (233.9K), `icon-512-dark.png` (9.6K), `icon-512-light.png` (9.6K), `brand-mark.svg` (341B), `wordmark.svg` (505B), `wordmark-white.svg` (497B) |
| 5 | Sidebar displays 3-bar ascending SVG icon in a gradient container, not the old 'W' square | ✓ VERIFIED | `AppSidebar.tsx` lines 106-119: `rounded-[8px]` container with `linear-gradient(135deg, var(--accent), oklch(0.55 0.18 270))`, inline SVG `viewBox="0 0 28 28"` with 3 ascending `<rect>` bars; zero occurrences of "W" as text content in brand mark |
| 6 | Sidebar brand text reads 'nwrth' (lowercase), not 'Wealth Tracker' | ✓ VERIFIED | `AppSidebar.tsx` line 122: `nwrth`; zero occurrences of "Wealth Tracker" in `AppSidebar.tsx` |
| 7 | Sidebar subtitle 'Net worth . local only' is unchanged | ✓ VERIFIED | `AppSidebar.tsx` line 124-126: `Net worth · local only` — exactly 1 match, content preserved |
| 8 | Export download filename is nwrth-YYYY-MM-DD.zip | ✓ VERIFIED | `SettingsPage.tsx` line 199: `` a.download = `nwrth-${new Date().toISOString().slice(0, 10)}.zip` ``; zero occurrences of `wealth-tracker-*.zip` |
| 9 | No UI-visible 'Wealth Tracker' string remains anywhere in src/ | ✓ VERIFIED | `grep -rn "Wealth Tracker" src/ \| grep -v '\.css:'` returns zero results; only remaining occurrence is a CSS comment in `src/styles/studio-theme.css` line 2, excluded per plan D-11 as non-UI-visible |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `public/manifest.json` | PWA manifest with nwrth branding | ✓ VERIFIED | Contains `"name": "nwrth"` twice (name + short_name); all required fields present |
| `public/favicon.svg` | SVG favicon | ✓ VERIFIED | 326B file present |
| `public/icon-192.png` | PWA icon 192x192 | ✓ VERIFIED | 36.9K file present |
| `public/icon-512.png` | PWA icon 512x512 | ✓ VERIFIED | 233.9K file present |
| `public/apple-touch-icon.png` | iOS home screen icon | ✓ VERIFIED | 33.5K file present |
| `public/icon-32.png` | PNG favicon fallback | ✓ VERIFIED | 1.0K file present |
| `index.html` | Updated head tags with nwrth branding | ✓ VERIFIED | favicon.svg, icon-32.png, apple-touch-icon, manifest.json, theme-color, description all present |
| `src/components/AppSidebar.tsx` | nwrth brand mark in sidebar header | ✓ VERIFIED | Inline SVG with viewBox 28x28, gradient container, "nwrth" text |
| `src/pages/SettingsPage.tsx` | nwrth export filename | ✓ VERIFIED | `nwrth-` prefix in download filename |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.html` | `public/manifest.json` | `<link rel="manifest">` | ✓ WIRED | Line 8: `<link rel="manifest" href="/manifest.json" />` |
| `index.html` | `public/favicon.svg` | `<link rel="icon">` | ✓ WIRED | Line 5: `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` |
| `public/manifest.json` | `public/icon-192.png` | icons array | ✓ WIRED | `{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }` |
| `src/components/AppSidebar.tsx` | CSS variables | gradient background using var(--accent) | ✓ WIRED | `linear-gradient(135deg, var(--accent), oklch(0.55 0.18 270))` in inline style; `color: 'var(--accent-fg)'` set |

### Data-Flow Trace (Level 4)

Not applicable. This phase modifies static HTML head tags, PWA manifest JSON, and a React component with hardcoded brand strings. There is no dynamic data rendering from a store or API — all brand values are hardcoded constants.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| title tag reads nwrth | `grep '<title>nwrth</title>' index.html` | 1 match | ✓ PASS |
| vite.svg removed | `grep 'vite.svg' index.html` | 0 matches | ✓ PASS |
| manifest linked | `grep 'href="/manifest.json"' index.html` | 1 match | ✓ PASS |
| manifest name nwrth | `grep '"name": "nwrth"' public/manifest.json` | 1 match | ✓ PASS |
| theme_color set | `grep '"theme_color": "#3d3480"' public/manifest.json` | 1 match | ✓ PASS |
| sidebar SVG inline | `grep 'viewBox="0 0 28 28"' src/components/AppSidebar.tsx` | 1 match | ✓ PASS |
| export filename nwrth | `grep 'nwrth-' src/pages/SettingsPage.tsx` | 1 match | ✓ PASS |
| no UI Wealth Tracker | `grep -rn "Wealth Tracker" src/ \| grep -v '.css:'` | 0 matches | ✓ PASS |
| WEALTH_STORAGE_KEY preserved | `grep 'WEALTH_STORAGE_KEY' src/context/AppDataContext.tsx` | 3 matches (definition + 2 usages) | ✓ PASS |

### Requirements Coverage

No requirement IDs were specified for this phase. Phase delivers visual rebrand only (per 39-CONTEXT.md: "Visual rebrand only — no data model changes, no functional changes").

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/styles/studio-theme.css` | 2 | CSS comment references "Wealth Tracker.html" | Info | Not UI-visible; excluded per plan D-11; no user-facing impact |

No blockers. The CSS comment is a development artifact (design handoff reference), not user-visible output.

### Human Verification Required

#### 1. Sidebar SVG Icon Visual Rendering

**Test:** Run `npm run dev` and open the app. Examine the sidebar header area.
**Expected:** A small square container with a purple gradient background shows three ascending vertical bars (short, medium, tall left-to-right). The letter "W" is gone. Brand text below the icon reads "nwrth" (lowercase). Subtitle "Net worth · local only" is visible below.
**Why human:** SVG rendering and CSS gradient expression via `oklch()` cannot be confirmed without a browser paint.

#### 2. Theme Adaptation Across All Themes

**Test:** In the running app, switch between all 3 themes (Ledger, Vault, Studio) in both light and dark modes (6 combinations total). Observe the sidebar icon container in each.
**Expected:** The gradient container background shifts with `var(--accent)` per theme. The SVG bars remain visible and legible (adequate contrast) in all 6 combinations. The icon color adapts via `var(--accent-fg)` / `currentColor`.
**Why human:** CSS custom property resolution across themes requires visual inspection; programmatic analysis cannot verify rendered contrast ratios.

#### 3. Browser Tab Favicon

**Test:** Open the app in a browser and observe the favicon in the browser tab.
**Expected:** The nwrth brand mark SVG appears in the tab (not the Vite orange triangle logo). The icon should be recognizable at small sizes (16x16 effective).
**Why human:** Favicon display requires a live browser render.

#### 4. PWA Manifest via DevTools

**Test:** Open DevTools > Application > Manifest panel while the app is running.
**Expected:** Name shows "nwrth", short_name shows "nwrth", theme_color shows "#3d3480", display shows "standalone", icons listed include 192x192 and 512x512 entries.
**Why human:** PWA installability and manifest parsing correctness require DevTools inspection.

### Gaps Summary

No gaps found. All 9 observable truths are verified in the codebase. The phase goal — renaming the app to "nwrth" across favicons, PWA manifest, sidebar brand component, and meta tags — is fully achieved at the code level.

Human verification items are confined to visual rendering correctness (SVG, gradients, favicon appearance) and DevTools confirmation of PWA manifest loading. These are standard post-implementation checks, not evidence of missing implementation.

---

_Verified: 2026-05-15T20:15:00Z_
_Verifier: Claude (gsd-verifier)_
