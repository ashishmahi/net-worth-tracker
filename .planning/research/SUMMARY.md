# Research summary — v1.2 (lightweight, in-repo)

**Milestone context:** Add **full data reset** to an existing local React + Vite app. No new libraries required if shadcn **AlertDialog** (or project **Dialog** + clear copy) is used.  

**Skipped:** Four-way ecosystem research (agents unavailable); this file captures **codebase-anchored** facts for planning.

---

## Stack

- Unchanged: React 18, Vite 5, **POST** `/api/data` writes full JSON body in `plugins/dataPlugin.ts` — reset is **`saveData(INITIAL_DATA)`**-shaped body.  
- If **AlertDialog** is not in `src/components/ui`, add via shadcn or reuse **Dialog** with destructive `Button` variant.  

## Features (table stakes)

- **Table stakes:** Warning string; Cancel default; one explicit confirm for destruction.  
- **Differentiator (small):** Typed confirmation phrase vs. one-click — pick in plan; user asked for “wrapped under warning.”

## Architecture integration

- **`AppDataContext`** (`src/context/AppDataContext.tsx`): `saveData` optimistic-updates and reverts on failure; **`INITIAL_DATA`** is the **canonical** empty state — reset should `saveData({ ...INITIAL_DATA, } with fresh ISO timestamps` if needed) without duplicating ad-hoc empty objects.  
- **Settings** already has `handleExport` and `saveData` for blocks — **reset control** should live in Settings (or shared layout) in a **danger** section.  
- **Zod** `DataSchema` — re-use `AppData` type + `INITIAL_DATA` to avoid schema drift.

## Pitfalls

- **Accidental double-submit** — disable confirm while `saveData` in flight.  
- **Migrations** — new fields in future must be reflected in `INITIAL_DATA` when bumping version; for v1.2, `version: 1` only.  
- **Theme** — do not conflate with “clear all”; document if localStorage is untouched.  

---

*Generated during `/gsd-new-milestone` without parallel researcher agents (narrow scope).*
