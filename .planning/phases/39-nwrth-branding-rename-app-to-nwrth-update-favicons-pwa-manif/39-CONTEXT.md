# Phase 39: nwrth branding — rename app to nwrth, update favicons, PWA manifest - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual rebrand only — rename the app from "Wealth Tracker" to "nwrth" across all UI surfaces (sidebar, browser title), PWA manifest, favicons, and HTML head meta tags. No data model changes, no functional changes, no theme token changes.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Brand Component
- **D-01:** Replace the "W" square with the 3-bar ascending SVG icon rendered at 16×16 inside a 28×28 rounded-square (`border-radius: 8px`) with `linear-gradient(135deg, var(--accent), oklch(0.55 0.18 270))` background and `color: var(--accent-fg)` — adapts to all themes
- **D-02:** Replace "Wealth Tracker" text with "nwrth" (always lowercase, no exceptions)
- **D-03:** Subtitle "Net worth · local only" stays unchanged — the spec targets the brand name only, not the tagline

### Export Filename
- **D-04:** Rename download filename from `wealth-tracker-YYYY-MM-DD.zip` to `nwrth-YYYY-MM-DD.zip` — it's a UX surface, not a data structure
- **D-05:** Do NOT change the localStorage key `wealth-tracker-data` — changing it would wipe existing user data; it's a data structure

### PWA Manifest
- **D-06:** Use `start_url: "/"` exactly as specified in `NWRTH-BRANDING-PROMPT.md` — acceptable for this local-first app; GitHub Pages PWA edge case is out of scope
- **D-07:** `manifest.json` goes in the `public/` directory

### HTML Head Tags
- **D-08:** Replace `/vite.svg` favicon with `/favicon.svg` from nwrth-icons assets
- **D-09:** Add all head tags exactly as specified: favicon.svg, icon-32.png, apple-touch-icon, manifest link, theme-color, description meta

### Asset Files
- **D-10:** Copy all icon files from `nwrth-icons/` to `public/` — all 9 files listed in the spec

### String Replacement
- **D-11:** Replace all UI-visible "Wealth Tracker" strings with "nwrth"; keep non-UI identifiers (localStorage keys, internal variable names) unchanged

### Claude's Discretion
- SVG inline vs component: use inline SVG for the sidebar brand mark (as shown in the spec) — no new component needed, it's a one-off
- Open Graph tags: search for any existing OG meta tags and update if found; if absent, do not add new ones

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Brand Spec (Primary Source of Truth)
- `NWRTH-BRANDING-PROMPT.md` — Complete brand spec: icon SVG, manifest JSON, head tags, color tokens, files to update, constraints, and verification checklist. This is the authoritative reference for all branding decisions.

### Brand Assets
- `nwrth-icons/` — All icon files ready to copy to `public/`: favicon.svg, brand-mark.svg, wordmark.svg, wordmark-white.svg, icon-512.png, icon-512-dark.png, icon-512-light.png, icon-192.png, apple-touch-icon.png, icon-32.png

### Files to Modify (identified during codebase scout)
- `src/components/AppSidebar.tsx` — Sidebar brand mark ("W" div) and "Wealth Tracker" text at lines 107–118
- `index.html` — Currently uses `/vite.svg` favicon; needs full head tag replacement
- `src/pages/SettingsPage.tsx:199` — Download filename `wealth-tracker-YYYY-MM-DD.zip` → `nwrth-YYYY-MM-DD.zip`
- `public/` — Target directory for all icon assets and new `manifest.json`

### Do NOT Modify
- `src/context/AppDataContext.tsx` — `WEALTH_STORAGE_KEY = 'wealth-tracker-data'` must stay unchanged
- `src/context/__tests__/AppDataContext.test.tsx` — Only update if test references the download filename

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing sidebar header div (`size-7`, `rounded-lg`, gradient bg) at `AppSidebar.tsx:107` — resize to `size-7` (28×28) with `rounded-[8px]` and swap gradient to `from-accent`; the structural pattern is already correct
- `var(--accent)` and `var(--accent-fg)` CSS variables are already in use across all three themes (Ledger, Vault, Studio) — brand mark inherits correctly with `currentColor`

### Established Patterns
- `public/` is the Vite static assets directory — any file placed here is served at root `/`
- No existing `manifest.json` in `public/` — needs to be created fresh
- The existing favicon is `/vite.svg` (Vite default) — straightforward replacement

### Integration Points
- `index.html` head section: currently only has `/vite.svg` link and viewport meta; all new tags add to this section
- Settings export in `SettingsPage.tsx:199`: single string literal, targeted change

</code_context>

<specifics>
## Specific Ideas

- The sidebar icon SVG uses three bars with decreasing opacity: `opacity="0.4"` (short left bar), `opacity="0.7"` (medium center), `opacity="1.0"` (tall right bar) — exact values from spec
- Brand gradient for sidebar icon container: `linear-gradient(135deg, var(--accent), oklch(0.55 0.18 270))`
- Theme color for meta tag: `#3d3480`
- PWA background color: `#f7f4ed` (light)
- Meta description: `"Privacy-first personal wealth tracker — all data stays on your device"`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 39-nwrth-branding-rename-app-to-nwrth-update-favicons-pwa-manif*
*Context gathered: 2026-05-15*
