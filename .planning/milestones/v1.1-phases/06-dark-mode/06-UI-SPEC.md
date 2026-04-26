---
phase: 06
slug: dark-mode
status: approved
shadcn_initialized: true
preset: default (baseColor zinc, cssVariables)
created: 2026-04-26
---

# Phase 6 — UI Design Contract

> Visual and interaction contract for **Dark Mode**: manual light/dark toggle, persistence, and no first-paint flash. Generated for `/gsd-ui-phase`; aligned with `06-CONTEXT.md` and DM-01 / DM-02.

**Scope:** This phase does not introduce a new type scale or spacing system; it **binds** the existing shadcn + Tailwind **semantic tokens** in `src/index.css` to both themes and adds the **theme control** and **FOUC** behavior. Phases 7–8 will consume the same tokens.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (existing) |
| Preset | `default`, `baseColor: zinc`, `cssVariables: true` (`components.json`) |
| Component library | Radix-based primitives under `@/components/ui` |
| Icon library | `lucide-react` (Sun / Moon for theme control per roadmap idiom) |
| Font | System / Tailwind default stack (unchanged from v1.0) |

---

## Spacing Scale

Declared values (multiples of 4) — **unchanged**; Phase 6 does not add new layout regions beyond a compact **sidebar footer** row for the theme control.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gap inside theme control |
| sm | 8px | Footer padding, gap between icon and label |
| md | 16px | Default block padding in sidebar footer |
| lg | 24px | Section padding |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

**Exceptions:** Touch targets for the theme control **min-height / min-width 44px** (already used on nav items; match for the toggle). This is an accessibility exception to “compact” hit area, not a new spacing token.

---

## Typography

| Role | Size | Weight | Line height |
|------|------|--------|-------------|
| Body | 16px (`text-base`, inputs) | 400 | 1.5 |
| Label / nav | 14px (`text-sm`) | 400 (nav label) / 600 (app title in header) | 1.5 |
| Heading (page `h1`) | 20px (`text-xl`) | 600 | 1.25 |
| Muted / helper | 14px (`text-sm`) | 400 | 1.5 |

**Max four sizes; two weights in use (400, 600).** Phase 6 does not add new text styles—only ensures **foreground/background** contrast in both themes via tokens.

---

## Color

**Strategy:** 60% **dominant** surfaces, 30% **secondary** (cards, sidebar, elevated surfaces), 10% **accent** (reserved). Colors are **HSL semantic variables** in `:root` and `.dark` in `src/index.css`—implementers **must not** hardcode `bg-white`, `text-gray-900`, or other raw neutrals in `src/`.

| Role | Token / intent | Usage |
|------|----------------|--------|
| Dominant (≈60%) | `--background`, `--foreground` | App canvas, default text |
| Secondary (≈30%) | `--card`, `--secondary`, `--sidebar-*`, `--muted` | Cards, sidebar, subtle fills, borders |
| Accent (≈10%) | `--primary` / `--accent` and foreground pairs | **Primary CTA buttons**, **active** sidebar nav item, **visible focus** (`ring`) — not for large backgrounds |
| Destructive | `--destructive` | Delete/remove confirmations and destructive form feedback only |

**Accent reserved for:** primary action buttons (e.g. add/save actions that are already the main CTA of a form), **active** `SidebarMenuButton`, and **focus-visible** rings. **Not** for: the theme toggle (use `variant="ghost"` or `secondary` so the Sun/Moon control does not compete with primary actions).

**Phase 6 pass/fail:** All **nine** surfaces (dashboard + eight sections) use `bg-background`, `bg-card`, `border-border`, `text-foreground` / `text-muted-foreground` as appropriate—**no** full-viewport raw white in dark mode, **no** unreadable `muted` on `muted` pairings.

---

## Dark mode — interaction & implementation (contract)

| Topic | Contract |
|-------|----------|
| **Placement** | Theme control in **`SidebarFooter`** (new), below main nav — see D-03 in `06-CONTEXT.md` |
| **Control** | Sun + Moon (lucide); **binary** theme only |
| **Visible copy** | Short labels **"Light"** and **"Dark"** next to the icon *or* icon-only with **accessible names** |
| **Accessible names** | `aria-label` **"Switch to dark mode"** when current theme is light, **"Switch to light mode"** when current theme is dark (verb + object; not generic “Toggle theme”) |
| **Persistence** | `localStorage` key **`theme`**, values exactly **`light`** \| **`dark`**; invalid/missing → **light** (D-01, D-04) |
| **FOUC** | Inline script in `index.html` (before module) sets `class="dark"` on `<html>` iff stored value is `dark`. React `ThemeProvider` (or equivalent) **reads** initial class and keeps DOM + storage in sync; mount must **not** clear `dark` (D-05, D-06) |
| **Data** | Theme **not** stored in `data.json` |

---

## Copywriting Contract

| Element | Copy / behavior |
|---------|-----------------|
| Primary CTA (existing app pattern) | Remains **action-specific** (e.g. *Add account*, *Save changes* on forms) — Phase 6 does not rename those |
| New control (theme) | See **"Light"** / **"Dark"** and `aria-label` **"Switch to dark mode"** / **"Switch to light mode"** above — **not** "Submit", "OK", or "Toggle" |
| Empty state (unchanged surfaces) | Existing per-page copy remains authoritative (e.g. Property: *No properties yet* + *Add a property in Settings or here.*) — no new empty lists in Phase 6 |
| Error / persistence | If storage is unreadable: **fall back to light** without blocking the app. If write fails: keep UI theme in sync for the **session**; no modal required. User is never left with a generic *Something went wrong* with no next step—session remains usable; reload may revert to default light |

| Destructive confirmation | Phase 6 **does not** add new destructive actions — existing confirmations unchanged |

---

## Visual hierarchy (Phase 6)

| Focal | Description |
|-------|-------------|
| **Primary** | Main page content (headings, tables, forms) per route — unchanged |
| **Secondary** | Sidebar navigation; new **footer** theme row is **tertiary** (small, does not compete with page title or primary CTA) |

**Icon-only** theme control is allowed if `aria-label` is set (label fallback for assistive tech).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official (CLI / `components.json`) | Existing + optional `Button`, `SidebarFooter` if not already present | not required |
| Third-party registries | **none** | n/a |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-26
