---
phase: 29
slug: bullion-import-uplift-data-calculations
status: ready
shadcn_initialized: true
created: 2026-05-06
---

# Phase 29 — UI Design Contract

> **No new Settings controls or disclosure copy** in Phase 29 (**`29-CONTEXT.md`** D-08).  
> Existing **read-only** ₹/g hints (**Settings** gold/silver cards, **Gold** page line) continue to follow **`26-UI-SPEC.md`** / **`27-UI-SPEC.md`** typography and loading/error patterns; **numeric values** reflect **import uplift** on live-derived parity math.

## Design system

Inherits existing shadcn/zinc — **no new components**, spacing changes, or routes.

## Settings — Gold Prices card

| Element | Spec |
|--------|------|
| Hint lines | Unchanged layout: `text-sm text-muted-foreground` under each karat **`Input`** |
| Content when live | Same “Live: ≈ {n} ₹/g” pattern; numbers are **uplift-adjusted** per persisted rates (defaults **~10%** gold / **~8%** silver at data layer) |
| Loading / error / empty | Identical to Phase **26** — no copy changes |

## Settings — Silver card

| Element | Spec |
|--------|------|
| Live hint | Same structure as today; **₹/g** reflects uplifted live parity |

## Gold page

| State | UI |
|-------|-----|
| Live hints line | Same optional muted line as Phase **26**; values match uplifted math |

## A11y

No change to **`aria-live`**, **`role="alert"`**, or focus order.
