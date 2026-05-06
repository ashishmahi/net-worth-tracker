# Phase 32 — Pattern map

Analogs for new validation code:

| Planned surface | Closest existing analog | Notes |
|-----------------|-------------------------|-------|
| Pure financial helpers + Vitest | `src/lib/propertyEntryPath.ts` + `propertyEntryPath.test.ts` | Same module/test split |
| Zod section schemas + tests | `src/lib/__tests__/schema.test.ts` | `safeParse` smoke patterns |
| Page-level guard before persist | Other pages using `saveData` — Property stays controlled | Align with **D-12**: shared validators not duplicate rules |

**Excerpt reference:** `PropertyItemSchema` baseline at `src/types/data.ts` lines 74–89 — extend via `.superRefine`, not parallel schema.
