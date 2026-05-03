---
phase: 28
slug: section-routing-home-header
status: ready
shadcn_initialized: true
created: 2026-05-03
---

# Phase 28 — UI Design Contract

> Per-section **URL routes** with **refresh-safe** deep links; **mobile header** includes an explicit **Dashboard / Home** affordance from every non-dashboard route.

## Design system

Reuses **Button** (`variant="ghost"`), **lucide-react** icons, existing **sidebar** tokens. No new shadcn primitives required.

## Routing behavior

| Concept | Spec |
|--------|------|
| **Canonical paths** | One stable path per `SectionKey` (see implementation table below). **`/`** (with optional trailing slash per router) = **Dashboard**. |
| **Refresh / deep link** | Loading `…/gold` (with correct **`basename`**) must render **Gold** — no reset to Dashboard. |
| **Unknown path** | Redirect to **Dashboard** (`/`) with **replace** — no blank screen. |
| **GitHub Pages / `BASE_URL`** | Router **`basename`** must be **`import.meta.env.BASE_URL`** so deployed app paths match Vite **`base`**. |

### Path map (stable contract)

| SectionKey | Path segment |
|------------|----------------|
| `dashboard` | `/` (index) |
| `gold` | `/gold` |
| `commodities` | `/commodities` |
| `mutualFunds` | `/mutual-funds` |
| `stocks` | `/stocks` |
| `bitcoin` | `/bitcoin` |
| `property` | `/property` |
| `liabilities` | `/liabilities` |
| `bankSavings` | `/bank-savings` |
| `retirement` | `/retirement` |
| `settings` | `/settings` |

## Desktop navigation

- **Sidebar** items are **navigation links** (not only JS state): selecting a section updates the URL and highlights the active item (**`aria-current="page"`** on the active route).
- Existing **“Dashboard”** entry remains the primary home affordance on large screens.

## Mobile top bar (`MobileTopBar`)

| Region | Spec |
|--------|------|
| **Left** | Keep existing **menu** control (`aria-label="Toggle main navigation"`), **44×44px** minimum touch target. |
| **Center** | Add **`Home`** navigation: **`Link`** to **`/`** (dashboard) using **`House`** icon from **lucide-react** **or** visible text **“Home”** — pick one consistently with sidebar wording (**“Dashboard”** vs **“Home”**: prefer **`aria-label="Go to dashboard"`** if icon-only). Must be visible without opening the drawer. |
| **Right** | Keep existing **theme toggle**; preserve **`justify-between`** layout — insert **Home** between menu and theme (order: **Menu · Home · Theme**). |

### Mobile visibility rules

- Show **Home** whenever current route is **not** the dashboard index (**`/`*).
- On dashboard, **Home** may be omitted **or** styled disabled — prefer **omit** to reduce chrome (sidebar still lists Dashboard).

## Dashboard drill-ins

- Cards / buttons that call **`onNavigate(section)`** must navigate via **router** (same URLs as sidebar) so copy-pasted URLs and back button stay coherent.

## A11y

- **Home** control: focus-visible ring (default Button/Link styles).
- Active section in sidebar: **`aria-current="page"`** on the matching item.

## Out of scope

- Browser history customization beyond SPA defaults.
- Server-side routing / SSR.
