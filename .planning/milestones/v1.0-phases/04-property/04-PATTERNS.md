# Phase 04 — Pattern map

Analogs for new/updated files (closest existing code and role).

| Planned area | Role | Closest analog | Excerpt / pattern to mirror |
|--------------|------|----------------|----------------------------|
| `PropertyItem` + nested milestones in `data.ts` | Zod + exported types | `BankAccountSchema` + `MfPlatformSchema` in `src/types/data.ts` | `BaseItemSchema.extend({ ... })`; section wrapper `z.object({ updatedAt, items })` like `PropertySchema` |
| Load / save | No migration if empty | `AppDataContext.tsx` `INITIAL_DATA` + `migrateLegacyBankAccounts` | Keep `property.items: []` in `INITIAL_DATA`; add migration only if legacy property shape appears |
| List + Sheet CRUD | Page | `src/pages/BankSavingsPage.tsx` | `sheetOpen` / `editingId`, `useForm` + `zodResolver`, `onSubmit` → `saveData` with spread `data.assets.…`, `handleDelete`, inline `role="alert"` for errors |
| Money fields | Form strings → numbers | `BankSavingsPage.tsx` `parseFinancialInput` + `roundCurrency` on save | `balance: z.string()` in form schema; coalesce to number before write |
| Derived readouts | Pure functions in component | Other pages showing formatted INR | `toLocaleString('en-IN', { style: 'currency', currency: 'INR' })` |
| shadcn layout | Sheet / Table / Switch | `src/components/ui/sheet.tsx` (existing) | `Sheet` + `SheetContent` from right; new `table`, `checkbox`, `switch` from official shadcn add |

**Rule:** `src/pages/PropertyPage.tsx` should read like a sibling of `BankSavingsPage` for state and save flow; milestone UI is the main delta (nested list + `useFieldArray` or equivalent).

---

## PATTERN MAPPING COMPLETE
