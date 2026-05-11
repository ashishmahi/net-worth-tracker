---
created: "2026-05-11T18:39:33.866Z"
title: Apply Nestworth branding and app logos
area: ui
files:
  - assets/logos/nestworth-icon-nw.svg
  - assets/logos/nestworth-icon-nw-inverse.svg
  - assets/logos/nestworth-pwa-icon-maskable.svg
  - assets/logos/nestworth-wordmark-a5-on-dark.svg
  - assets/brand/brand-spec.md
  - assets/brand/brand-recommendations.md
---

## Problem

The product name is **Nestworth**. Canonical visual assets live under `assets/logos/` (icons, wordmark, PWA maskable) and written brand guidance under `assets/brand/`. These need to be applied consistently across the app shell (favicon, manifest/PWA, headers, marketing surfaces) so the experience matches the documented brand instead of generic or placeholder identity.

## Solution

Use `assets/brand/brand-spec.md` and `assets/brand/brand-recommendations.md` as source of truth; wire `assets/logos/*` for favicon, PWA icons, and in-app wordmarks as appropriate. TBD: audit `index.html`, manifest, and UI chrome for remaining gaps.
