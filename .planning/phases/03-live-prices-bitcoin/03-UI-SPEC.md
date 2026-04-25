---
phase: 03
slug: live-prices-bitcoin
status: approved
reviewed_at: 2026-04-25
extends: 02-manual-asset-sections
created: 2026-04-25
---

# Phase 3 — UI Design Contract

> Extends **Phase 2 — UI-SPEC** (shadcn/zinc, spacing, typography, color). Only deltas for live prices, Bitcoin, Bank AED, and Settings are listed here. Where not mentioned, follow `02-UI-SPEC.md` exactly.

## Design System

| Property | Value |
|----------|-------|
| Base | Same as Phase 2 — shadcn/ui, lucide-react, 3 text sizes (14/20/24), two weights (400/600) |
| New dependencies | **None** for skeleton/loading systems (D-09) — use `lucide-react` `Loader2` or `text-sm` status copy |

## Phase 3 — New / Updated Surfaces

### Settings — “Live market rates” block

- **Placement:** New **Card** below existing gold/retirement blocks (or a dedicated section after a `Separator`); use `text-sm font-semibold` block title: e.g. “Live market rates”.
- **Read-only rows:** For each of USD/INR, AED/INR, BTC/USD (when applicable), show label + value in **Indian locale** for INR-pairs where the value is INR per unit or the convention chosen in code — value must be **human-readable** (use `toLocaleString('en-IN')` for INR amounts; USD/BTC as per context).
- **Loading:** Inline `Loader2` (h-4 w-4) + “Loading…” or short muted text; no full-page overlay.
- **Error:** `text-destructive text-sm` message; below it, the **Session-only** subsection (D-06).

### Settings — “Session-only rates (when feeds fail)”

- `text-sm text-muted-foreground` explainer: values are **not saved** to export file / lost on refresh.
- Inputs: `type="text" inputMode="decimal"` (same as Phase 2 money fields), labels for USD/INR, AED/INR, and BTC/USD.
- **Primary button** only if product pattern already uses per-block save elsewhere — here, **apply on blur or single “Use session values”** is Claude’s discretion; must not write to `data.json`.

### Bitcoin page

- **Layout:** `RetirementPage`-style: page title `text-xl font-semibold`, one **Card** with “Holding” or equivalent block title `text-sm font-semibold`.
- **Form:** One field: **Quantity (BTC)** — string RHF, `inputMode="decimal"`.
- **Readouts:** Below the form (or in the same card): **INR value** (display `text-2xl font-semibold` if this is the hero number), **USD value of holding** (body `text-sm` with explicit `US$` or `USD` labeling per English convention).
- **When rates loading:** Show spinner/muted text adjacent to the computed values area, not replacing the form.

### Bank Savings — list rows

- **INR accounts:** Unchanged display — `₹` formatting via `toLocaleString('en-IN', { style: 'currency', currency: 'INR', … })`.
- **AED accounts:** Show **native AED** in the row (e.g. `AED` prefix or `AED` in copy); optional secondary line `text-sm text-muted-foreground` for INR equivalent (recommended for par list sections).
- **Sheet form:** Add **currency** control: shadcn **Select** or two **Radio** items (`INR` / `AED`); default **INR** for new accounts. Balance field label: “Balance (₹)” vs “Balance (AED)” by currency. Same Sheet footer button pattern and destructive delete as Phase 2.

## Copywriting

- **Empty state (Bank):** Update one line to mention **INR or AED** (not only INR).
- **Errors (live prices):** Short, user-facing — e.g. “Could not load market rates. You can enter session-only rates below.” (exact string at implementation; must be non-technical, no stack traces).

## Accessibility

- Live-updating numbers: `aria-live="polite"` on the section total and key computed values (match Phase 2 list patterns).
- Session-only inputs: `aria-describedby` pointing to explainer id where applicable.

## Non-goals (Phase 3)

- No dark-mode-specific tokens (continue zinc CSS variables).
- No new font sizes or weights beyond Phase 2 contract.
