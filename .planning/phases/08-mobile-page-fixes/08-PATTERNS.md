# Phase 8 — Pattern map

> Closest **existing** analogs for new work. Downstream: **PLAN** `read_first`.

## Shared header

| New / changed | Analog | Excerpt (concept) |
|---------------|--------|--------------------|
| `PageHeader` stacked row | `GoldPage.tsx` (lines ~139–161) | `flex items-start justify-between` with `h1` + `Button` + optional `<output>` |
| Breakpoint 768 | `use-mobile.tsx` | `MOBILE_BREAKPOINT` → Tailwind `min-[768px]:` |

## Sheets

| Page | `SheetContent` today | Plan direction |
|------|----------------------|----------------|
| `GoldPage` | default padding, single scroll | `flex` column + `flex-1 min-h-0 overflow-y-auto` body (see 08-RESEARCH) |
| `MutualFundsPage`, `StocksPage`, `BankSavingsPage` | same family | same structure |
| `PropertyPage` | `overflow-y-auto` on full content | same + **milestone** `Table` in scroll region; **h-scroll** or cards |

## Property milestone table

| Element | File | Note |
|---------|------|--------|
| `<Table>…` | `PropertyPage.tsx` | Wrap with `overflow-x-auto w-full` + `min-w-0`; optional `min-w-[640px]` on `<Table>` to force scroll |

## Out of scope

- `AppSidebar`, `MobileTopBar` — **Phase 7** only

---

## PATTERN MAPPING COMPLETE
