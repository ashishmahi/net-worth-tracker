---
phase: 26
slug: live-gold-spot-price
status: ready
shadcn_initialized: true
created: 2026-05-03
---

# Phase 26 — UI Design Contract

> Read-only live metal prices and **₹/g hints** on **Settings** and a compact line on **Gold**.  
> Aligned with **`26-CONTEXT.md`** (D-05–D-08).

## Design system

Inherits shadcn/zinc from existing app — no new components required.

## Settings — Gold Prices card

| Element | Spec |
|--------|------|
| Hint line | `text-sm text-muted-foreground`, below each karat **`Input`**, one line per field (24K, 22K, 18K) |
| Content when live | `Live: ≈ {n} ₹/g` (or `≈` with `toLocaleString('en-IN')` for the number) |
| Loading | `Loader2` `h-4 w-4 animate-spin` + `Loading…` when **gold** or **forex** still loading and number unavailable |
| Error | `text-destructive` `text-sm` `role="alert"` when `goldError` set; if only forex missing, neutral text that INR hint needs USD→INR |
| Empty | `—` when live data unavailable (non-error) |

**No** new buttons; **no** “Apply live” control.

## Settings — Live market rates `<dl>`

| Row | `dt` | `dd` behavior |
|-----|------|----------------|
| Gold | `Gold (XAU) — USD per troy oz` | Same row pattern as **BTC / USD**: loading / number / `—` |
| Silver | `Silver (XAG) — USD per troy oz` | Same, using existing silver context fields |

**Error strip:** Extend existing `{(btcError \|\| forexError) && ...}` to include **`goldError`** and **`silverError`** (e.g. append sentence or second alert) so users see feed failures.

**Intro copy:** Update the muted paragraph under “Live market rates” to mention **gold and silver** spot (not only Bitcoin and AED) — one sentence.

## Gold page

| State | UI |
|-------|-----|
| `goldTotal === null` (no saved **goldPrices**) + live data OK | One `text-sm text-muted-foreground` line: **Live spot hints (₹/g):** 24K …, 22K …, 18K … (abbreviate with commas) **or** link “See Settings → Gold Prices for live hints” if space constrained |
| Live missing | Omit line or show `—` — do not block existing CTA |

## A11y

- Hints and **`dl`** remain in existing **`aria-live="polite"`** region where applicable.
- New text must not rely on color alone for errors (`role="alert"` on errors).
