---
id: SEED-002
status: dormant
planted: "2026-05-05"
planted_during: Between milestones — v2.1 shipped (STATE.md); no active phase
trigger_when: A milestone focused on branding, marketing polish, first-impression UX, or visual identity—especially alongside Studio UI / shell refinements.
scope: Small
---

# SEED-002: Add a distinctive favicon and brand logo to the website

## Why This Matters

The app still surfaces the **default Vite** tab icon (`/vite.svg`) while the sidebar uses a **placeholder “W”** mark. A cohesive icon + logo strengthens recognition in browser tabs and bookmarks, aligns the chrome with **Wealth Tracker** positioning, and finishes the “local premium” feel the UI already aims for.

## When to Surface

**Trigger:** Work that touches **public-facing identity** (favicon, PWA icons, OG images) or **shell chrome** (sidebar header, app title area).

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:

- Branding, polish, or “launch-ready” presentation pass.
- Replacing placeholder chrome (sidebar header mark, document title assets).
- Adding or improving **meta** / **share** previews (optional stretch).

## Scope Estimate

**Small** — typically new SVG/PNG assets in `public/`, `index.html` link tags (and optional `apple-touch-icon`), plus swapping the sidebar header block to use the logo image while preserving layout and accessibility (`alt` text, `aria`).

## Breadcrumbs

Related code and decisions found in the current codebase:

- `index.html` — `<link rel="icon" ... href="/vite.svg" />`, page title **Wealth Tracker**.
- `public/` — expect new assets here alongside any existing `vite.svg`.
- `src/components/AppSidebar.tsx` — `SidebarHeader` uses a **gradient “W”** placeholder (`size-7` rounded square) + **Wealth Tracker** / subtitle copy; natural place to drop an `<img>` or inline SVG logo.
- `docs/STUDIO-UI-REDESIGN.md` — may constrain logo treatment vs Studio visual language (check when executing).

## Notes

- Prefer **SVG** for crisp favicon and sidebar at multiple densities; provide **maskable** or square-safe padding if PWA ever expands.
- “Cool” is subjective—when executing, lock **one** art direction (minimal monogram vs emblem) so the sidebar and favicon stay visually related.
