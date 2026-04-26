# Phase 8 — Research

**Date:** 2026-04-26  
**Question:** What do we need to know to *plan* Mobile Page Fixes well?

## Summary

- **MB-02:** Replace per-page ad hoc `flex items-start justify-between` headers with a **shared `PageHeader`** using **`min-[768px]:`** (same breakpoint as `MOBILE_BREAKPOINT` in `use-mobile.tsx`) for row vs column. **Primary CTA: full width** when stacked. **Gold** is the only page with a **title + live total + Add**; use a **`meta` slot** for the `<output>` and helper text.
- **MB-03:** shadcn **`SheetContent`** is a single scrolling block by default. For keyboard overlap, use **`flex flex-col` + `max-h-[100dvh]`** (or `100svh` fallback) on `SheetContent`, **`min-h-0`**, and a **middle** region `flex-1 overflow-y-auto` for form fields, with **SheetHeader** and **SheetFooter** as **flex-shrink-0** siblings. Forms that currently interleave `SheetHeader` + `form` + inline `SheetFooter` need **restructuring** so the scrollable region is explicit. **ROADMAP** names **6** add/edit sheet flows; the repo has **5** pages with `SheetContent` (Gold, Mutual Funds, Stocks, Bank Savings, Property) — all **must** follow the same body-scroll pattern. Bitcoin/Retirement have **no** asset Sheet in v1.1; **not** in the “6” sheet UAT set.
- **MB-04:** `PropertyPage` sheet milestone **`Table`** uses fixed column widths; at 375px wrap the table in **`overflow-x-auto`** and ensure a **`min-w-*`** on `<table>` so a **horizontal scrollbar** appears instead of clipping, **or** implement a narrow-only card stack. **A** (horizontal scroll) is lower scope and sufficient if all columns stay readable.

## File touchpoints (evidence)

| Area | Path | Notes |
|------|------|--------|
| Sheet primitive | `src/components/ui/sheet.tsx` | `SheetContent` uses `cva` full-height side sheet; className overrides for flex column are **additive** on each `SheetContent` (or a tiny wrapper) |
| Breakpoint | `src/hooks/use-mobile.tsx` | `MOBILE_BREAKPOINT` = 768; align **Tailwind** with **`min-[768px]:`** / **`max-md:`** per 08-CONTEXT D-03 |
| Headers | `src/pages/*.tsx` | Gold: lines ~139–161 `flex…`; Property ~193–199; Dashboard ~105–108 `h1` only; Bitcoin ~68–70 `h1` only; etc. |
| Property sheet + table | `src/pages/PropertyPage.tsx` | `SheetContent className="overflow-y-auto sm:max-w-lg"`; **Table** ~296–320 |

## Pitfalls

1. **`max-h-screen`** alone does not model **iOS** dynamic toolbars; prefer **`dvh`/`100dvh`** in docs and plans; optional **`visualViewport`** follow-up in STATE.
2. **Restructuring** forms: ensure **submit** buttons stay **inside** `<form>` or use **`form=`** attribute on buttons if footer is lifted outside the form node (avoid breaking submit).
3. **Table**: `overflow-x-auto` on a **parent with `min-w-0`** inside flex, or the flex child will not shrink and scroll will not appear.

## Validation Architecture

This phase is **UI-only**; the repo has **no** Jest/Vitest suite. **Automated gate:** `npm run build` (`tsc -b` + `vite build`) on every change wave. **Manual UAT** (post-execute) covers **MB-02** (375px, no horizontal header overflow), **MB-03** (software keyboard on emulator or device best-effort), **MB-04** (milestone table scroll/stack). Create **`08-VALIDATION.md`** with manual scripts; run **`/gsd-verify-work`** when implementation is done.

## RESEARCH COMPLETE

Research sufficient to fix plans for Phase 8.
