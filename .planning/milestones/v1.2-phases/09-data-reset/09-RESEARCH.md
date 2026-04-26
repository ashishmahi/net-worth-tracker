# Phase 9: Data reset — Technical research

## RESEARCH COMPLETE

### Stack findings

- **Non-accidental confirm:** shadcn **AlertDialog** (Radix) added via `npx shadcn add alert-dialog`; `AlertDialogCancel` uses **outline** (safe); confirm uses `Button` **`variant="destructive"`** with `className={cn(buttonVariants({ variant: "destructive" }))}` when a **custom** confirm is required for **async** `saveData` — `AlertDialogAction` closes the dialog on click, which is awkward for async; **controlled** `open` + explicit `Button` in `AlertDialogFooter` is the standard pattern for async destructive actions in this codebase.
- **Empty state:** `createInitialData()` should use **`nowIso()`** from `@/lib/financials` (per `09-CONTEXT`) for all `updatedAt` fields, single call per document so timestamps are consistent.
- **Provider initial state:** `useState(INITIAL_DATA)` with `INITIAL_DATA = createInitialData()` at module load; **reset** calls `createInitialData()` again for fresh times.

### Settings / forms

- When `settings` shrinks to `{ updatedAt }` only, **`useEffect`** hooks that only `reset` when `goldPrices` / `retirement` are **truthy** will **not** clear RHF state. **Fix:** add **`else` branches** to `reset` empty string defaults when optional blocks are **absent**.

### Out of scope (confirmed)

- `localStorage` `theme` unchanged.
- No new Vite API routes; `GET`/`POST` `/api/data` only.

## Validation architecture

*Not used for this phase* — no Nyquist `VALIDATION.md` (local UI + existing POST contract; verification by manual UAT and `npm run build`).
