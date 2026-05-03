---
phase: 27
slug: settings-commodity-pricing-ux
status: ready
shadcn_initialized: true
created: 2026-05-03
---

# Phase 27 — UI Design Contract

> Compact **read-only** commodity pricing on **Settings** with **Edit** to expand; **gold** and **silver** share the same interaction pattern. Implements **UX-04–UX-07**.

## Design system

Inherits existing **Card**, **Button**, **Input**, **Label**, muted typography. No new shadcn primitives required unless extracting subcomponents justifies a thin wrapper.

## Shared pattern (both metals)

| Concept | Spec |
|--------|------|
| **Healthy feed** | For **gold:** `goldUsdPerOz != null` && `usdInr != null` && **no** `goldError`. For **silver:** `silverUsdPerOz != null` && `usdInr != null` && **no** `silverError`. |
| **Read-only (UX-05)** | When **healthy feed**, default view = **non-editable** summary text only (no `<Input>`). Right-aligned or header row: **`Edit`** button (`type="button"`, `variant="ghost"` or `outline`, `size="sm"`). |
| **Edit mode** | **Edit** → show `<Input>`s; values prefilled from **effective** ₹/g (live-derived or persisted). Show **`Save`** + **`Cancel`**. **Cancel** → discard unsaved changes, exit edit mode, restore read-only. |
| **Failure / missing (UX-06)** | When feed **not** healthy (after loading settles): **do not** require **Edit**—show inputs **immediately** (edit mode **on** by default). Optional one-line `role="alert"` for error. |
| **Loading** | While forex/gold/silver still loading and neither success nor error: compact **`Loader2`** + “Loading…” in the card header or first line; **no** empty read-only shell that blocks typing once we’ve determined failure. |

## Gold card — read-only summary

| Element | Spec |
|--------|------|
| Title | **Gold prices (₹/g)** — keep semibold `text-sm`. |
| Summary | One **compact** block: three karats on **one** or **two** lines, e.g. `24K … · 22K … · 18K …` using `toLocaleString('en-IN', { maximumFractionDigits: 0 })`. Prefix source: `Live` vs `Saved` vs `Saved (locked)` per product copy (one word). |
| Locked / resume live | Preserve existing **Use live spot** affordance when auto-sync is paused—place near **Edit** or in muted footer so it does not duplicate the whole old form. |

## Gold card — edit mode

| Element | Spec |
|--------|------|
| Fields | Same three fields as today **k24 / k22 / k18** — **text** `inputMode="decimal"`. |
| Validation | Existing zod + `parseFinancialInput`; **Save** sets `goldPricesLocked: true`. |

## Silver card (new section)

| Element | Spec |
|--------|------|
| Title | **Silver price (₹/g)** |
| Read-only | Single number **₹/g** (effective). |
| Edit mode | **One** input for ₹/g; **Save** persists `silverInrPerGram` + `silverPricesLocked: true`. **Use live spot** (or equivalent) when locked to resume auto-tracking—mirror gold’s secondary action. |

## Spacing

Target **≤ ~40%** vertical height vs current gold-only always-open form for the **combined** gold+silver blocks in read-only state (approximate goal—not a pixel law).

## A11y

- Errors: `role="alert"` on live fetch errors when blocking pricing.
- **Edit** / **Save** / **Cancel**: visible focus ring (default shadcn).
- Do not disable **Edit** solely because live data exists—disabled rules only while **saving** or **loading** if needed to prevent double submit.
