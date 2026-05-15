---
created: 2026-05-15T17:27:13.703Z
title: Nwrth branding implementation
area: ui
files:
  - NWRTH-BRANDING-PROMPT.md
  - nwrth-icons/
  - public/
  - index.html
  - src/components/
---

## Problem

The app is currently named "Wealth Tracker" but needs to be rebranded to **nwrth** (always lowercase, vowel-drop compression of "net worth"). All brand surfaces need updating: sidebar, topbar, PWA manifest, favicons, meta tags, HTML title, and any other display of the app name or icon.

Full branding spec and all icon assets are ready in `NWRTH-BRANDING-PROMPT.md` and `nwrth-icons/` — this is a well-scoped implementation task.

## Solution

Follow `NWRTH-BRANDING-PROMPT.md` exactly:

1. Copy icon files from `nwrth-icons/` → `public/` (favicon.svg, icon-*.png, apple-touch-icon.png, brand-mark.svg, wordmark*.svg)
2. Update `index.html`: `<title>nwrth</title>`, meta description, theme-color `#3d3480`, link tags for favicon and apple-touch-icon
3. Update `public/manifest.json` (or `site.webmanifest`): name/short_name → `nwrth`, icons array, theme_color, background_color
4. Update sidebar brand component: swap text to `nwrth`, use `brand-mark.svg` or inline SVG icon with gradient background (per spec)
5. Do NOT change any CSS color tokens — only name, icon, and meta surfaces
