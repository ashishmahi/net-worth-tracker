# Phase 10 — PATTERN MAPPING

**Phase:** 10 — History & schema  
**No RESEARCH.md** (plan with `--skip-research`). Analogy mapping from `10-CONTEXT.md` + code.

| New / changed area | Closest existing analog | Notes |
|-------------------|------------------------|--------|
| Extend `DataSchema` root | `src/types/data.ts` `DataSchema` — add sibling field to `version`, `settings`, `assets` | Use `z.string().datetime()` for ISO timestamps (matches other schemas). |
| Default empty list on old files | `migrateLegacyBankAccounts` in `AppDataContext.tsx` + `SettingsSchema` `.optional()` / defaults elsewhere | New **`ensureNetWorthHistory`** (or single `migrateV13History`) that inserts `netWorthHistory: []` if missing, **before** `DataSchema.safeParse`, in same `parseAppDataFromImport` chain as **boot load**. |
| `createInitialData` | `createInitialData()` in `AppDataContext.tsx` | Add `netWorthHistory: []` to returned object. |
| Persist append + `saveData` | `SettingsPage` import confirm → `saveData(mergedAppData)` | `DashboardPage`: `setState` or inline `const next: AppData = { ...data, netWorthHistory: [...] }` then `await saveData(next)`. |
| Outlined row action | `SettingsPage` **Export** / **Import** (`variant="outline"`) | **Record snapshot** = outline, not destructive. |
| Block while loading | `showNetWorthSkeleton` in `DashboardPage` | Reuse: record **disabled** when `showNetWorthSkeleton` is true. |
| Partial total | `showExclusionNote` (CardContent under total) / `excludedNames` | Record **disabled** when exclusion disclaimer is shown (or equivalent: any condition where total omits a category with holdings). |
| Error on failed save | Phase 9 / 10.1: `role="alert"` + rollback via `saveData` | `saveData` already reverts; surface message. |

**Files expected to change**

- `src/types/data.ts`  
- `src/context/AppDataContext.tsx`  
- `src/pages/DashboardPage.tsx`  
- `data.example.json`  
- (Optional) `data.json` user file — *do not* commit; migration at load time only.  

**## PATTERN MAPPING COMPLETE**
