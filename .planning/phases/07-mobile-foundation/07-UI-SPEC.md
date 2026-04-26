---
phase: 07
slug: mobile-foundation
status: approved
shadcn_initialized: true
preset: default (baseColor zinc, cssVariables)
created: 2026-04-26
---

# Phase 7 — UI Design Contract

> Visual and interaction contract for **Mobile Foundation**: offcanvas main navigation, a **mobile top bar** with hamburger and **icon-only** theme access, and **unchanged desktop** chrome at 768px+. Aligned with `07-CONTEXT.md` and **MB-01** / ROADMAP Phase 7.

**Scope:** This phase does **not** add a new color system or type ramp; it defines **app shell** layout, **z-order**, and **copy** for navigation chrome. **Semantic tokens** and theme behavior remain as in `06-UI-SPEC.md`. **Page-level** header reflow and form sheets are **Phase 8**.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (existing) |
| Preset | `default`, `baseColor: zinc`, `cssVariables: true` (`components.json`) |
| Component library | Radix-based primitives under `@/components/ui` — `Sidebar`, `Sheet`, `Button` |
| Icon library | `lucide-react` — **`Menu`** (mobile nav trigger, per D-05), **Sun / Moon** (theme, per Phase 6 + D-02) |
| Font | System / Tailwind default stack (unchanged) |

---

## Spacing scale

**Multiples of 4 only**; align with `06-UI-SPEC.md`. Phase 7 adds a **full-width top bar** row and tight horizontal padding inside it.

| Token | Value | Phase 7 usage |
|-------|-------|----------------|
| xs | 4px | Gap between top-bar icons; gap between hamburger and leading edge |
| sm | 8px | N/A in bar if using single cluster left / single right |
| md | 16px | **Default horizontal padding** for the top bar content (`px-4`) — keeps tap targets from screen edge |
| lg | 24px | — |
| xl+ | 32px+ | — (unchanged global scale) |

**Touch / hit targets (accessibility, not a new token):** Top bar **menu** and **theme** controls: **min-height ≥ 44px** and **min-width ≥ 44px** (match existing nav/footer pattern in `AppSidebar`).

**Exceptions:** None beyond the 44px minimum, same rationale as Phase 6.

---

## Typography

| Role | Size | Weight | Line height |
|------|------|--------|-------------|
| Body | 16px (`text-base`) | 400 | 1.5 |
| Label / nav (drawer) | 14px (`text-sm`) | 400 (items) / 600 (app title in drawer header) | 1.5 |
| App title in drawer | 14px (`text-sm`) `font-semibold` in `SidebarHeader` | 600 | 1.5 |

**Phase 7 does not introduce text in the mobile top bar** by default (D-01): no title, no section label. **Max four sizes** in contract overall; no new size for the top bar.

---

## Color

**Unchanged from Phase 6** — HSL semantic variables in `src/index.css` (`:root` / `.dark`). **No** raw `bg-white` / `text-gray-*` in new chrome.

| Role | Token / intent | Phase 7 usage |
|------|----------------|---------------|
| Dominant (≈60%) | `--background` | `SidebarInset` main area; top bar **surface** uses `bg-background` with `border-b border-border` (separation only) |
| Secondary (≈30%) | `--sidebar`, `--sidebar-border`, `--muted` | **Drawer** (Sheet) content: `bg-sidebar` as today from `sidebar.tsx` |
| Accent (≈10%) | `--primary`, `--accent` | **Not** for hamburger or theme icon buttons — use `variant="ghost"` (or equivalent) so chrome does not read as primary CTA |
| Destructive | `--destructive` | Unchanged — no new destructive actions in this phase |

**Accent reserved for:** same as `06-UI-SPEC` — form primary actions, **active** nav item, **focus-visible** rings — **not** the top bar icon buttons.

**Dark / light:** Top bar and drawer follow **theme tokens** automatically; verify contrast in both themes for `border-border`, `text-foreground` on `bg-background` / `bg-sidebar`.

---

## Mobile shell — layout and structure

| Topic | Contract |
|-------|----------|
| **Breakpoint** | **&lt; 768px** (`useIsMobile` / `MOBILE_BREAKPOINT`): show mobile top bar + offcanvas behavior. **≥ 768px:** **no** top bar; **inline** sidebar; layout matches pre–Phase-7 desktop (ROADMAP). |
| **Top bar location** | **Above** the main `SidebarInset` content column — only when `isMobile` is true. **Sticky** optional; minimum: **static full-width** row at top of the shell so it is always available without scrolling the page. |
| **Top bar content (D-01 default)** | **One row:** **leading:** menu trigger; **trailing:** theme control. **No** app title and **no** section title in the bar (avoids duplicating in-page `h1` before Phase 8). |
| **Top bar size** | **Height:** at least **44px** total (content min-h + vertical padding). **Horizontal padding:** **16px** (`px-4`) unless a tighter `px-3` (12px) is required for 375px — both are **multiples of 4**. **Border:** `border-b border-border` **only**; no heavy shadow. |
| **Hamburger (D-05)** | **lucide `Menu`**, not `PanelLeft`. Implement by **composing** `Button` + `useSidebar().toggleSidebar` (or `SidebarTrigger` with `asChild` and icon override) so behavior stays **one tap** to open. |
| **Menu control — accessible name** | `aria-label` = **"Toggle main navigation"** (or **"Open or close the main menu"** if the control is strictly a toggle). **Do not** use a lone **"Menu"** / **"Open menu"** without **main** or **navigation** in the name. `sr-only` text acceptable if the visible icon is the only child. |
| **Theme in top bar (D-02)** | **Icon-only** Sun/Moon; **`aria-label`** = **"Switch to dark mode"** when current theme is light, **"Switch to light mode"** when current theme is dark (match `06-UI-SPEC` / `AppSidebar` semantics). **No** "Light" / "Dark" text in the top bar. |
| **Offcanvas (D-04)** | `Sidebar` **`collapsible="offcanvas"`** so mobile uses **Sheet** (existing `sidebar.tsx` branch). Drawer width uses **`SIDEBAR_WIDTH_MOBILE` (18rem)** — do not ad-hoc a wider panel for this phase. |
| **Nav close (D-06)** | Tapping a **nav item** updates the section **and** **closes** the mobile drawer. Sheet **overlay** and **Esc** close: follow **Radix Dialog/Sheet** defaults. |
| **Theme in drawer (D-03)** | **Keep** the **footer** theme control in `AppSidebar` on mobile; **in addition to** the top bar control (intentional duplication). Styling: same as Phase 6 footer pattern (`Button` + icon + "Light"/"Dark" text **allowed** in footer — only the **top bar** is icon-only). |

---

## Sheet (drawer) — copy for assistive technology

| Element | Value |
|---------|--------|
| `SheetTitle` (screen-reader) | **"Main navigation"** (replace generic **"Sidebar"** if the implementation string is still the default) |
| `SheetDescription` (screen-reader) | Short, specific, e.g. **"Wealth and settings sections"** or **"Navigate to a section"** — **not** "Displays the mobile sidebar" |

---

## Z-order and motion

| Layer | Contract |
|-------|----------|
| **Main content** | Default stacking inside `SidebarInset` |
| **Mobile top bar** | **`z-40`** (or `sticky` + `top-0` with same) so it stays **above** scrolling page content **when the sheet is closed** |
| **Sheet overlay + panel** | **z-50** (existing `sheet.tsx` / Radix) — **covers** the top bar when the drawer is open; acceptable |

**Motion:** Use **shadcn Sheet** slide and overlay fade **as implemented**; no custom easing in Phase 7 unless a bug is found.

---

## Visual hierarchy (Phase 7)

| Priority | Description |
|----------|-------------|
| **Primary** | **Page content** inside `SidebarInset` (unchanged) |
| **Secondary** | **Mobile top bar** — thin chrome; hamburger and theme are **peers** (hamburger first in LTR) |
| **Tertiary** | **Drawer** when open — same nav as desktop; **footer** theme is tertiary, consistent with Phase 6 |

**Focal point (viewport &lt; 768, sheet closed):** First meaningful content is still the **page** `h1` / main area; the **top bar** is **peripheral** chrome (thin strip).

---

## Copywriting contract (Phase 7 chrome)

| Element | Copy / behavior |
|---------|-----------------|
| **Primary CTA (rest of app)** | Unchanged — see `06-UI-SPEC` (e.g. *Add account*, *Save changes*) |
| **Hamburger** | `aria-label` as above; **not** "Submit", "OK", "Cancel", "Click here" |
| **Theme (top bar)** | `aria-label` **"Switch to dark mode"** / **"Switch to light mode"** (same verb pattern as Phase 6) |
| **Theme (drawer footer)** | Visible **"Light"** / **"Dark"** with icons — consistent with `AppSidebar` (Phase 6) |
| **Empty / error in content** | No new empty states in this phase — per-page copy remains as today |
| **Persistence / errors** | No new toasts; theme and nav errors are unchanged |

| Destructive | No new destructive actions in Phase 7 |

---

## Registry safety

| Registry | Blocks used | Safety gate |
|----------|-------------|-------------|
| shadcn official | Existing `sidebar`, `sheet`, `button` (no new registry pulls required for the contract) | not required |
| Third-party | **none** | n/a |

---

## Alignment checks (context)

| `07-CONTEXT` ID | In UI-SPEC? |
|-----------------|------------|
| D-01 (minimal top bar) | Yes — row layout, no in-bar titles by default |
| D-02 (icon-only theme in bar) | Yes |
| D-03 (theme in both places) | Yes |
| D-04 (offcanvas) | Yes |
| D-05 (Menu icon) | Yes |
| D-06 (close on nav) | Yes |
| D-07 (768) | Yes |

**Deferred (Phase 8):** Page header reflow, keyboard/sheet scroll, property table — **not** in this file.

---

## Checker sign-off

- [x] Dimension 1 Copywriting: PASS — no generic CTA; nav/theme strings specified
- [x] Dimension 2 Visuals: PASS — hierarchy and focal roles declared
- [x] Dimension 3 Color: PASS — semantic tokens; accent not used for chrome icons
- [x] Dimension 4 Typography: PASS — four roles; no extra top-bar text style
- [x] Dimension 5 Spacing: PASS — 4px grid; padding 12/16px; 44px targets
- [x] Dimension 6 Registry safety: PASS — shadcn-only

**Approval:** approved 2026-04-26
