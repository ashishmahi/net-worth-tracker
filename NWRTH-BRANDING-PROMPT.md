# Implement Nwrth Branding

## Overview
Rename and rebrand the app from "Wealth Tracker" to **nwrth** (always lowercase). The name is a vowel-drop compression of "net worth". Apply the brand identity across the entire app: sidebar, topbar, PWA manifest, favicons, meta tags, and any other surfaces where the app name or icon appears.

## Brand Assets
All icon files are included in the `nwrth-icons/` folder:

| File | Size | Purpose |
|------|------|---------|
| `icon-512.png` | 512×512 | PWA icon (purple gradient bg, white icon) |
| `icon-512-dark.png` | 512×512 | Dark variant (dark bg, purple icon) |
| `icon-512-light.png` | 512×512 | Light variant (light bg, dark purple icon) |
| `icon-192.png` | 192×192 | PWA icon smaller |
| `apple-touch-icon.png` | 180×180 | iOS home screen (no border-radius, iOS adds it) |
| `icon-32.png` | 32×32 | Favicon fallback |
| `favicon.svg` | SVG | Modern SVG favicon (purple fill) |
| `brand-mark.svg` | SVG | Icon mark using `currentColor` (for in-app use) |
| `wordmark.svg` | SVG | Full logo: icon + "nwrth" text (dark, for light bg) |
| `wordmark-white.svg` | SVG | Full logo: icon + "nwrth" text (white, for dark bg) |

## Brand Mark (SVG Icon)
The nwrth icon is **3 ascending bars** — a minimal stacked bar chart representing net worth growth at a glance. Here is the exact SVG for inline use:

```svg
<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="16" width="4" height="8" rx="1" fill="currentColor" opacity="0.4" />
  <rect x="12" y="10" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
  <rect x="19" y="4" width="4" height="20" rx="1" fill="currentColor" />
</svg>
```

- The three bars go from short (left) to tall (right), with decreasing opacity (0.4 → 0.7 → 1.0)
- Use `fill="currentColor"` so it inherits the right color from context
- For the sidebar brand mark: render the icon at 16×16 inside a 28×28 rounded-square (border-radius: 8px) with a gradient background of `linear-gradient(135deg, var(--accent), oklch(0.55 0.18 270))` and `color: var(--accent-fg)`

## App Name Usage
- **Sidebar brand**: Display as `nwrth` (lowercase, always)
- **HTML `<title>`**: `nwrth`
- **PWA manifest `name`**: `nwrth`
- **PWA manifest `short_name`**: `nwrth`
- **Meta description**: `"Privacy-first personal wealth tracker — all data stays on your device"`

## Color Tokens
The brand color is deep purple. These are the key hex values for use in manifest/meta:
- **Primary gradient**: `#3d3480` → `#5a4cc0`
- **Theme color** (for `<meta name="theme-color">`): `#3d3480`
- **Background color** (for manifest): `#f7f4ed` (light) / `#16141e` (dark)

The existing Studio theme CSS variables already align with this palette. **Do not change any theme color tokens** — only the name, icon, and meta surfaces.

## PWA Manifest
Copy icon files from `nwrth-icons/` to the appropriate public assets directory. Update or create `manifest.json`:

```json
{
  "name": "nwrth",
  "short_name": "nwrth",
  "description": "Privacy-first personal wealth tracker — all data stays on your device",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f7f4ed",
  "theme_color": "#3d3480",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## HTML Head Tags
Add or update these in `<head>`:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#3d3480" />
<meta name="description" content="Privacy-first personal wealth tracker — all data stays on your device" />
```

## Files to Update
1. **Sidebar component** — Replace the brand mark "W" with the SVG icon above. Replace "Wealth Tracker" text with "nwrth"
2. **HTML `<title>` tag** — Change to `nwrth`
3. **PWA manifest** — Update `name`, `short_name`, icon paths (see above)
4. **HTML `<head>`** — Add favicon/manifest/meta tags (see above)
5. **Any hardcoded "Wealth Tracker" strings** — Find and replace all occurrences across the codebase with "nwrth"
6. **Open Graph / social meta tags** (if they exist) — Update `og:title`, `og:site_name` to "nwrth"

## What NOT to Change
- Do not change any theme color variables, fonts, spacing, or layout
- Do not change any functionality or data structures
- Do not change the theme names (Quiet Ledger, Vault, Studio) — those are design directions, not the brand
- The icon in the sidebar should still use `var(--accent)` / `var(--accent-fg)` so it adapts to all themes, not hardcoded purple

## Verification Checklist
- [ ] Sidebar shows the 3-bar icon + "nwrth" in lowercase
- [ ] Browser tab title says "nwrth"
- [ ] No remaining "Wealth Tracker" strings anywhere in the UI
- [ ] PWA manifest is valid and icons load correctly
- [ ] Favicon appears in the browser tab
- [ ] The icon looks correct in both light and dark modes
- [ ] The icon looks correct across all three themes (Ledger, Vault, Studio)
- [ ] `apple-touch-icon.png` is present for iOS home screen

---

## GSD Phase Setup

To add this as a new phase in your GSD workflow, use the `/gsd-capture` command:

```
/gsd-capture "Nwrth branding implementation"
```

This will create a new phase directory. Then run:

```
/gsd-discuss-phase <N>
```

Where `<N>` is the phase number that was created. During the discussion, point Claude to this file (`NWRTH-BRANDING-PROMPT.md`) and the `nwrth-icons/` folder as the source of truth.

Alternatively, if you want to manually create the phase, create this directory structure under `.planning/phases/`:

```
.planning/phases/<N>-nwrth-branding/
├── REQUIREMENTS.md
└── DECISIONS.md
```

### REQUIREMENTS.md content:

```markdown
# Phase <N>: Nwrth Branding

## Goal
Rebrand the app from "Wealth Tracker" to "nwrth" — update all UI surfaces, PWA manifest, favicons, meta tags, and remove all legacy name references.

## Requirements
1. Replace sidebar brand mark ("W" square) with the nwrth 3-bar ascending icon (SVG in `nwrth-icons/brand-mark.svg`)
2. Replace sidebar brand name "Wealth Tracker" with "nwrth" (lowercase)
3. Copy icon PNGs from `nwrth-icons/` to public assets directory
4. Create or update `manifest.json` with correct PWA metadata
5. Add favicon, apple-touch-icon, and theme-color meta tags to HTML head
6. Find and replace ALL "Wealth Tracker" strings in the codebase with "nwrth"
7. Update page `<title>` to "nwrth"
8. Update Open Graph meta tags if present

## Constraints
- Do NOT change any theme color tokens, fonts, spacing, or layout
- Do NOT change functionality or data structures
- Sidebar icon must use `var(--accent)` / `var(--accent-fg)` to adapt to all themes
- The theme names (Quiet Ledger, Vault, Studio) stay as-is

## Assets
- All brand assets are in `nwrth-icons/` folder
- Full spec is in `NWRTH-BRANDING-PROMPT.md`

## Verification
- Sidebar shows 3-bar icon + "nwrth" lowercase
- Browser tab title says "nwrth"
- Zero remaining "Wealth Tracker" strings in UI
- PWA manifest valid, icons load
- Favicon visible in browser tab
- Icon correct across all 3 themes × light/dark modes
```