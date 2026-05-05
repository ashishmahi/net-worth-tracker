# Phase 33 — Pattern map

Analogs for responsive Property sheet work (**33-CONTEXT**, **33-RESEARCH**).

## Primary touchpoint

| Target | Closest analog | Notes |
|--------|----------------|-------|
| **`src/pages/PropertyPage.tsx`** — Sheet layout, path **`radiogroup`**, milestone **`Table`** | Same file (baseline) | All edits localized here unless a reusable hook is justified. |
| **Responsive `grid`** (`grid-cols-1 sm:grid-cols-3`) | Other pages using Tailwind breakpoint grids | Match **`sm`** breakpoint with **`tailwind.config`** / existing usage (`grep grid-cols-1 sm:`). |
| **Sheet + scroll body** | **`SheetContent`** pattern in this file | Preserve **`flex` + `min-h-0` + `overflow-y-auto`** chain. |

## shadcn / Radix

| Pattern | Reference |
|---------|-----------|
| **Sheet** focus trap | Radix Dialog — prefer **`onOpenChange`** + **`useEffect`** focus for initial path focus (**D-08**). |
| **Button** **`role="radio"`** | Existing path picker — extend with keyboard handlers, not replace with alien primitives (**D-04**). |

## Testing

| Pattern | Reference |
|---------|-----------|
| Vitest + **`@/`** imports | `src/lib/__tests__/propertyValidation.test.ts`, `propertyEntryPath.test.ts` |
| Page-level RTL | Only if stable — project may rely on manual verify for portal-heavy UI (**33-VALIDATION.md**). |
