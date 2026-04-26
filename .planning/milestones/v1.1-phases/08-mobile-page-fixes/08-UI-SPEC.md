---
phase: 08
slug: mobile-page-fixes
status: approved
extends:
  - ../06-dark-mode/06-UI-SPEC.md
  - ../07-mobile-foundation/07-UI-SPEC.md
created: 2026-04-26
---

# Phase 8 — UI Design Contract

> Visual and interaction contract for **Mobile Page Fixes**: **page-level** headers that **reflow at &lt;768px**, **Add/Edit sheets** that remain **usable with the on-screen keyboard**, and a **Property milestone** region that stays **fully readable** at 375px. Aligned with `08-CONTEXT.md` and **MB-02, MB-03, MB-04** / ROADMAP Phase 8.

**Scope:** Inset **page** content and **Sheet** content only — not app shell (Phase 7) or color system (Phase 6). **No** new data fields or API changes.

---

## Design system (inherits)

| Property | Value |
|----------|--------|
| Tool | shadcn/ui + Tailwind (existing) |
| Breakpoint for “stacked / mobile” layout | **&lt;768px** — same as `useIsMobile` / `MOBILE_BREAKPOINT` (`use-mobile.tsx`) and Phase 7 |
| Icon library | `lucide-react` (unchanged) |
| Touch targets | Primary actions **min 44px** height where applicable (Phase 7 precedent) |

---

## MB-02 — Page header reflow

| Topic | Contract |
|--------|------------|
| **Component** | Shared **`PageHeader`** (or `AssetPageHeader`) in `src/components/` with **title** and optional **primary action**; optional **meta** slot (e.g. live section total, helper text) **below** the `h1`, **before** the stacked action. |
| **Narrow (&lt;768px)** | **Column** layout: **no horizontal** `flex` that pins title and button on one row. **Order:** title block (h1 + meta) → **primary** action **full width** (`w-full` / `self-stretch` on the control wrapper) so the button is not clipped. |
| **Wide (≥768px)** | **Row:** title/meta **left**, primary action **right** (`items-start justify-between`); action **not** forced full width. |
| **Title** | `h1` uses existing pattern: `text-xl font-semibold` (unchanged from current pages). |
| **Surfaces** | **Dashboard** (title only, no CTA) + **7 asset pages**: Gold, Mutual Funds, Stocks, Bitcoin, Bank Savings, Property, Retirement — all page-level headers that currently use `flex items-start justify-between` + CTA. |

---

## MB-03 — Sheet + keyboard

| Topic | Contract |
|--------|------------|
| **Affected sheets** | All **Add/Edit** sheets on pages that use `Sheet` + `SheetContent` for asset entry: **Gold, Mutual Funds, Stocks, Bank Savings, Bitcoin** (if applicable), **Property** — at minimum the **six** long-form asset flows; any page that uses the same `Sheet` pattern. |
| **Scroll** | The **form body** must be **independently scrollable** in a **flex** column: `SheetContent` = `flex flex-col max-h-[100dvh] min-h-0` (or equivalent `100dvh`/`100svh`), with a **scroll region** (`flex-1 min-h-0 overflow-y-auto`) containing fields so a **low field** can scroll into view when the **software keyboard** reduces visible viewport. |
| **Header description** | Sheet **title** row may stay fixed above the scroll region; long intros stay in the scroll region or compact **SheetDescription** as today. |
| **Property** | Same rule for the main property form **including** the milestone **table** block: table sits inside the scrollable region, or the outer sheet uses the flex split so **nothing** is trapped below the fold without scroll. |
| **iOS / `visualViewport`** | Optional hardening: if pure CSS is insufficient, document in **VERIFICATION**; real-device iOS UAT is **not** gate-blocking for the plan but is called out in **STATE** for MB-03. |

---

## MB-04 — Property milestone table (375px)

| Topic | Contract |
|--------|------------|
| **Goal** | All milestone **columns** (label, amount, paid, actions) remain **visible** or **reachable** at **375px** — no permanent truncation of column content. |
| **Options** (pick one in implementation) | **A)** `overflow-x-auto` wrapper with **visible** horizontal scroll (browser scrollbar on desktop; touch scroll on device), **or** **B)** **stacked card** per milestone row at narrow widths. |
| **Table** | If table remains: give the scroll wrapper **`min-w-0`** on flex parents and an inner **`min-w-[...]`** on the table as needed so horizontal scroll **activates** instead of clipping. |

---

## Spacing and density

- **4px grid** (unchanged). Page header block: `gap-3` vertical when stacked (`12px` between title block and full-width CTA when applicable).
- **Sheet** internal padding: keep `p-6` or move to a structured header/body/footer split; **no** new arbitrary magic numbers.

---

## Accessibility

- Keep **`aria-label`** on icon-only and primary add buttons (existing strings).
- Sheet: preserve **`aria-describedby`** on `SheetContent` where already present.
- Stacked header: **no** new interactive elements without labels.

---

## Out of scope (Phase 8)

- Desktop layout **redesign** beyond reflow
- New **routes** or **data** fields
- **System** dark/light defaults
- **Charts** or historical views

---

*Contract locked for planning — implementation details in `08-RESEARCH.md` and PLAN.md*
