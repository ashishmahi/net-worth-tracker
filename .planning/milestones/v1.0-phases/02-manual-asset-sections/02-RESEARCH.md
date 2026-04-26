# Phase 02: Manual Asset Sections — Research

**Researched:** 2026-04-25
**Domain:** React Hook Form + Zod + shadcn Sheet — form-heavy CRUD pages
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** All multi-item sections (Gold items, MF platforms, Stocks platforms, Bank accounts) use the Sheet/drawer overlay for add and edit. Click "Add" or click a row → Sheet opens from the right with a form inside. Save and Delete buttons inside the Sheet.
- **D-02:** Single-entity sections (Retirement, Settings) use inline forms — no Sheet needed.
- **D-03:** Gold items store karat + grams only — no price field on individual items.
- **D-04:** Price per gram lives in Settings (one rate per karat: 24K, 22K, 18K). Updated manually from goodreturns.in.
- **D-05:** Section total = sum of (grams × price_per_gram_for_that_karat) across all items. Computed at render, never stored.
- **D-06:** MF — per-platform entries. Fields: platform name + current total value (INR) + monthly SIP (INR, optional).
- **D-07:** MF section total = sum of current values (SIP is informational, not added to total).
- **D-08:** Stocks — per-platform entries. Fields: platform name + current total value (INR).
- **D-09:** Stocks section total = sum of current values.
- **D-10:** INR Bank Savings — per-account entries. Fields: account label + current balance (INR).
- **D-11:** Bank section total = sum of balances.
- **D-12:** INR accounts only in Phase 2. AED accounts are Phase 3.
- **D-13:** Retirement — two fixed fields: NPS current balance + EPF current balance. No list — direct inline edit.
- **D-14:** Show projected corpus at retirement — computed from current balances, return rates, and years to retirement (all from Settings). Formula: each balance grows at its respective rate for `target_age − current_age` years. Display total projected NPS + EPF corpus.
- **D-15:** Current age is a Settings field (needed to compute years to retirement).
- **D-16:** Settings gold prices block: price per gram for 24K, 22K, 18K (INR, manual entry).
- **D-17:** Settings retirement assumptions block: current age, target retirement age, NPS annual return %, EPF annual rate %.
- **D-18:** Export Data button already implemented — keep as-is.
- **D-19:** Settings is a single inline form (no Sheet). Save button at the bottom of each block or one global Save.
- **D-20:** Save errors appear inline below the Save button. Error text disappears on next save attempt. No toast library required.
- **D-21:** `MutualFundsSchema.platforms` → array of `{ id, createdAt, updatedAt, name: string, currentValue: number, monthlySip: number }`
- **D-22:** `StocksSchema.platforms` → array of `{ id, createdAt, updatedAt, name: string, currentValue: number }`
- **D-23:** `BankSavingsSchema.accounts` → array of `{ id, createdAt, updatedAt, label: string, balanceInr: number }`
- **D-24:** `SettingsSchema` gains: `goldPrices: { k24: number, k22: number, k18: number }`, `retirement: { currentAge: number, targetAge: number, npsReturnPct: number, epfRatePct: number }`
- **D-25:** `RetirementSchema` keeps `nps` and `epf` as current balances (numbers). No structural change needed.

### Claude's Discretion
- Section total display position (top header vs. bottom of list) — Claude decides based on layout feel.
- Whether to add a shadcn `card` component for section wrappers or use plain dividers — Claude decides (install if it improves clarity).
- Exact form field order and labels within the Sheet.
- Whether MF monthly SIP is labeled "Monthly SIP" or "SIP/month".

### Deferred Ideas (OUT OF SCOPE)
- AED bank accounts — Phase 3 (alongside AED/INR live rate)
- Bitcoin section — Phase 3
- Live gold price fetch — kept manual; no API for Indian gold prices
- Individual fund / stock tracking within a platform — not in v1; per-platform totals sufficient
- Toast notifications for errors — would require adding Sonner; inline errors are sufficient for v1
</user_constraints>

---

## Summary

Phase 2 builds 6 fully functional data-entry pages on top of a complete Phase 1 foundation. The persistence layer (Vite `dataPlugin`, `AppDataContext`, `saveData`) is working. All 9 page stub components exist. `data.json` is seeded. The task is to replace stubs with real forms.

The core technical pattern is: React Hook Form 7.73 + `@hookform/resolvers` (to install) + Zod 4.3.6 (already installed) for each form; shadcn `Sheet` (already installed) as the overlay for list-section add/edit; and `useAppData().saveData()` as the single persistence call.

A critical pre-work item exists: `GoldItemSchema` in `data.ts` currently has a `pricePerGram` field that contradicts D-03 (gold items store karat + grams only). This field must be removed from the schema as part of Phase 2's schema migration tasks. The existing `data.json` has no gold items, so no data migration is needed — a schema-only change is safe.

**Primary recommendation:** Install `@hookform/resolvers@5.2.2`, update `src/types/data.ts` with the five D-21–D-25 schema changes (including removing `GoldItem.pricePerGram`), then build each page as a self-contained file using the pattern: `useForm + zodResolver + Sheet-with-reset`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form validation (field-level errors) | Browser / Client | — | RHF + Zod run entirely client-side; no server round-trip needed |
| Persistence (save to data.json) | Frontend Server (Vite plugin) | — | `POST /api/data` is served by the Vite dev-server plugin; context wraps it |
| Section total computation | Browser / Client | — | Computed at render from raw stored values per CLAUDE.md convention |
| Projected corpus calculation | Browser / Client | — | Pure function from stored balances + settings; no persistence |
| Data schema validation on load | Browser / Client | — | `DataSchema.safeParse()` runs in `AppDataContext` on initial fetch |
| Component state (Sheet open/closed) | Browser / Client | — | Local `useState` per page — no cross-page state sharing needed |

---

## Standard Stack

### Core (already installed — versions verified against node_modules)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| react-hook-form | 7.73.1 | Form state, validation triggering, `register`, `handleSubmit`, `reset` | [VERIFIED: node_modules] |
| zod | 4.3.6 | Schema definition and validation | [VERIFIED: node_modules] — v4 classic mode, backward-compatible API |
| shadcn Sheet | installed | Side-drawer overlay for add/edit forms | [VERIFIED: src/components/ui/sheet.tsx] |
| shadcn Input | installed | Text + currency inputs | [VERIFIED: src/components/ui/input.tsx] |
| shadcn Button | installed | Save, Add, Delete | [VERIFIED: src/components/ui/button.tsx] |
| lucide-react | 1.11.0 | Icons: `Plus`, `Trash2`, `Pencil`, `ChevronRight` | [VERIFIED: node_modules] |

### To Install

| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| @hookform/resolvers | 5.2.2 | `zodResolver` adapter — bridges RHF + Zod | `npm install @hookform/resolvers` |
| shadcn card | via CLI | Section wrapper with visual border | `npx shadcn add card` |
| shadcn label | via CLI | Accessible form field labels | `npx shadcn add label` |
| shadcn badge | via CLI | Karat chip on Gold list rows (optional) | `npx shadcn add badge` |

**Installation commands (in order):**
```bash
npm install @hookform/resolvers
npx shadcn add card
npx shadcn add label
npx shadcn add badge
```

**Version notes:**
- `@hookform/resolvers@5.2.2` is the latest. Its only runtime dependency is `@standard-schema/utils`. It explicitly supports zod v4 (docs show `import { z } from 'zod'` or `'zod/v4'`). [VERIFIED: npm registry + official docs]
- `shadcn@4.5.0` is the installed CLI. `npx shadcn add` (not `npx shadcn@latest add`) will use it. [VERIFIED: node_modules]
- `@hookform/resolvers` peer dep is `react-hook-form: ^7.55.0` — compatible with 7.73.1. [VERIFIED: npm registry]

---

## Architecture Patterns

### System Architecture Diagram

```
User interaction (click Add / click row)
        │
        ▼
Page Component (e.g. GoldPage)
  ├── reads: useAppData().data.assets.gold
  ├── computes: sectionTotal (render-time, never stored)
  ├── controls: sheetOpen (useState), selectedItem (useState)
  │
  ├──[Sheet overlay — opens on Add or row click]
  │    └── SheetForm (useForm + zodResolver)
  │          ├── register / Controller for each field
  │          ├── handleSubmit → calls saveData()
  │          │     ├── success → reset(), setSheetOpen(false)
  │          │     └── error → setFormError(message), keep Sheet open
  │          └── Delete button → calls saveData(), setSheetOpen(false)
  │
  └──[List / Empty State]
       └── rows: data.assets.gold.items.map(...)
```

### Recommended File Structure

```
src/
├── types/
│   └── data.ts            # Update schema (D-21–D-25, remove GoldItem.pricePerGram)
├── lib/
│   └── financials.ts      # Existing — add calcProjectedCorpus() here
├── pages/
│   ├── GoldPage.tsx        # Replace stub — Sheet + list
│   ├── MutualFundsPage.tsx # Replace stub — Sheet + list
│   ├── StocksPage.tsx      # Replace stub — Sheet + list
│   ├── BankSavingsPage.tsx # Replace stub — Sheet + list
│   ├── RetirementPage.tsx  # Replace stub — inline form + corpus card
│   └── SettingsPage.tsx    # Replace stub — two inline blocks + export button
└── components/
    └── ui/                 # card.tsx, label.tsx, badge.tsx (added via shadcn add)
```

No shared `SheetForm` wrapper component. Each page owns its Sheet and form logic. Four pages have near-identical structure (Gold, MF, Stocks, Bank) but differ enough in fields and types that one-file-per-section is cleaner and avoids prop-drilling gymnastics.

### Pattern 1: Sheet + RHF + Zod (list sections)

**What:** `useForm` with `zodResolver` inside the page component; Sheet open state controlled by `useState`. On row click: call `reset(existingItem)` then open Sheet. On Add: call `reset(defaultValues)` then open Sheet.

**When to use:** Gold, MF, Stocks, Bank Savings pages.

```tsx
// Source: verified against @hookform/resolvers docs + React Hook Form docs
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import { createId, nowIso, parseFinancialInput } from '@/lib/financials'

// 1. Define a form-specific Zod schema (strings, because inputs are text)
const formSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  currentValue: z.string().min(1, 'This field is required.'),
})
type FormValues = z.infer<typeof formSchema>

export function ExampleListPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ name: '', currentValue: '' })
    setSheetOpen(true)
  }

  function openEdit(item: { id: string; name: string; currentValue: number }) {
    setEditingId(item.id)
    setSaveError(null)
    reset({ name: item.name, currentValue: String(item.currentValue) })
    setSheetOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const parsed = parseFinancialInput(values.currentValue)
      // build updated data and call saveData...
      await saveData(/* updated AppData */)
      setSheetOpen(false)
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    // filter item out, call saveData, close Sheet
    setSheetOpen(false)
  }

  return (
    <>
      {/* page heading + section total + Add button */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Platform' : 'Add Platform'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Platform</Label>
              <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p role="alert" className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input id="currentValue" type="text" inputMode="decimal" {...register('currentValue')} />
              {errors.currentValue && <p role="alert" className="text-sm text-destructive mt-1">{errors.currentValue.message}</p>}
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              {saveError && <p role="alert" className="text-sm text-destructive mt-2">{saveError}</p>}
              {editingId && (
                <Button type="button" variant="destructive" aria-label="Delete this platform" onClick={() => handleDelete(editingId)}>Delete</Button>
              )}
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
```

### Pattern 2: Inline form (Settings, Retirement)

**What:** `useForm` with `zodResolver` directly in the page body. No Sheet. Each logical block (Gold Prices, Retirement Assumptions) is its own `useForm` instance with its own Save button and error state.

**When to use:** SettingsPage (two separate `useForm` instances — one per block), RetirementPage (one `useForm` instance).

**Key difference from Pattern 1:** `useEffect(() => { reset(currentData) }, [currentData, reset])` on mount to pre-populate fields from stored values.

```tsx
// Pattern for Settings blocks — two independent forms, each with own save
const goldPricesForm = useForm<GoldPricesValues>({
  resolver: zodResolver(goldPricesSchema),
  defaultValues: { k24: '', k22: '', k18: '' }
})

// On mount: populate from stored data
useEffect(() => {
  if (data.settings.goldPrices) {
    goldPricesForm.reset({
      k24: String(data.settings.goldPrices.k24),
      k22: String(data.settings.goldPrices.k22),
      k18: String(data.settings.goldPrices.k18),
    })
  }
}, []) // run once on mount only — deep dependency would cause loop
```

### Pattern 3: Projected Corpus Calculation

**What:** Pure function in `src/lib/financials.ts`. Called at render time in RetirementPage. Never stored.

```ts
// src/lib/financials.ts — add this function
/**
 * Compound growth: balance × (1 + rate/100) ^ years
 * Returns 0 if any input is zero/negative.
 */
export function calcProjectedCorpus(
  balance: number,
  annualRatePct: number,
  years: number
): number {
  if (balance <= 0 || annualRatePct <= 0 || years <= 0) return 0
  return roundCurrency(balance * Math.pow(1 + annualRatePct / 100, years))
}
```

In RetirementPage:
```ts
const years = settings.retirement.targetAge - settings.retirement.currentAge
const projectedNps = calcProjectedCorpus(retirement.nps, settings.retirement.npsReturnPct, years)
const projectedEpf = calcProjectedCorpus(retirement.epf, settings.retirement.epfRatePct, years)
const projectedTotal = roundCurrency(projectedNps + projectedEpf)
```

### Pattern 4: Karat selector (Gold Sheet)

**What:** Native `<select>` with shadcn Input-matching visual style. The UI-SPEC says "native `<select>` wrapped in shadcn styling or a simple Button group — do not use a full Combobox."

**Recommended approach:** Native `<select>` using `cn()` to apply the same border/ring classes as shadcn `Input`. This avoids adding a Combobox/Select component and keeps the dependency count low.

```tsx
// register('karat') works directly with native select
<select
  id="karat"
  {...register('karat')}
  className={cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
    'text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  )}
>
  <option value="24">24K</option>
  <option value="22">22K</option>
  <option value="18">18K</option>
</select>
```

Zod form schema for karat:
```ts
karat: z.enum(['24', '22', '18'])  // form values are strings; coerce to number when saving
```

Then when saving: `karat: Number(values.karat) as 24 | 22 | 18`.

### Anti-Patterns to Avoid

- **`type="number"` for currency inputs:** shadcn Input with `type="number"` rejects Indian formatting "1,50,000". Always use `type="text" inputMode="decimal"`. [From CLAUDE.md]
- **Storing computed totals:** Section totals computed at render, never written to `data.json`. [From CLAUDE.md]
- **Single global Save in Settings:** Settings has two separate blocks (Gold Prices, Retirement Assumptions), each with its own Save. One global Save risks confusing which block was saved.
- **Re-rendering on every `data` change in Settings `useEffect`:** Avoid `[data]` as dependency for the reset effect — it will re-populate the form every time any other section saves. Use empty `[]` or a stable selector.
- **Direct form `z.infer<typeof DataSchema.shape.assets.gold.items>` for form types:** The stored schema uses numbers; form fields are strings. Define a separate `formSchema` with `z.string()` for currency fields, then parse to number on submit.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom `validate()` with local error state | RHF + zodResolver | RHF handles touched/dirty/submitted state, nested errors, async validation; hand-rolling misses edge cases |
| UUID generation | Custom random string | `crypto.randomUUID()` via existing `createId()` | Already in `src/lib/financials.ts`; browser-native, no library |
| Indian number formatting | Custom formatter | `toLocaleString('en-IN')` | Browser-native; handles 1,00,000 grouping correctly |
| Floating-point rounding | `Math.round(n * 100) / 100` inline | `roundCurrency()` from `src/lib/financials.ts` | Already written and tested; inline is error-prone |
| Sheet animation | Custom CSS slide-in | shadcn Sheet (already installed) | Radix Dialog with `data-[state=open]:animate-in` already configured |

**Key insight:** The form validation and Sheet interaction patterns are already covered by the installed stack. The only missing piece is `@hookform/resolvers` to connect them.

---

## Schema Changes Required (data.ts)

This is the most consequential pre-work item. All five decisions D-21–D-25 require changes to `src/types/data.ts`. A sixth change is also required: removing the `pricePerGram` field from `GoldItemSchema` (contradicts D-03).

### Changes in order of dependency

**1. Remove `GoldItem.pricePerGram` (fixes D-03 conflict)**

```ts
// BEFORE (current state — contradicts D-03)
const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
  pricePerGram: z.number().nonnegative(),  // ← REMOVE THIS
})

// AFTER
const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
})
```

**Data migration risk:** `data.json` currently has `"items": []` — no existing gold items, so no data loss.

**2. D-21: MutualFundsSchema.platforms**
```ts
const MfPlatformSchema = BaseItemSchema.extend({
  name: z.string(),
  currentValue: z.number().nonnegative(),
  monthlySip: z.number().nonnegative(),
})
const MutualFundsSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(MfPlatformSchema),
})
```

**3. D-22: StocksSchema.platforms**
```ts
const StockPlatformSchema = BaseItemSchema.extend({
  name: z.string(),
  currentValue: z.number().nonnegative(),
})
const StocksSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(StockPlatformSchema),
})
```

**4. D-23: BankSavingsSchema.accounts**
```ts
const BankAccountSchema = BaseItemSchema.extend({
  label: z.string(),
  balanceInr: z.number().nonnegative(),
})
const BankSavingsSchema = z.object({
  updatedAt: z.string().datetime(),
  accounts: z.array(BankAccountSchema),
})
```

**5. D-24: SettingsSchema** — replace `.passthrough()` with explicit shape + `.passthrough()` retained for future fields:
```ts
const GoldPricesSchema = z.object({
  k24: z.number().nonnegative(),
  k22: z.number().nonnegative(),
  k18: z.number().nonnegative(),
})
const RetirementAssumptionsSchema = z.object({
  currentAge: z.number().int().min(1).max(100),
  targetAge: z.number().int().min(1).max(100),
  npsReturnPct: z.number().nonnegative(),
  epfRatePct: z.number().nonnegative(),
})
const SettingsSchema = z.object({
  updatedAt: z.string().datetime(),
  goldPrices: GoldPricesSchema.optional(),
  retirement: RetirementAssumptionsSchema.optional(),
}).passthrough()
```

Using `.optional()` on both blocks ensures existing `data.json` (which has no `goldPrices` or `retirement` keys) continues to parse without errors. [VERIFIED: zod v4 `.optional()` behavior]

**6. D-25: RetirementSchema** — no structural change needed. Already has `nps` and `epf` as numbers.

**Export new types:**
```ts
export type MfPlatform = z.infer<typeof MfPlatformSchema>
export type StockPlatform = z.infer<typeof StockPlatformSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
export type GoldItem = z.infer<typeof GoldItemSchema>  // updated — no pricePerGram
```

### Backward compatibility

`data.json` currently has empty arrays for `platforms` and `accounts`, and no `goldPrices`/`retirement` keys in `settings`. After schema changes:
- Empty arrays pass the new `z.array(...)` validators immediately.
- `settings.goldPrices` and `settings.retirement` are `.optional()` so missing keys do not fail `safeParse`.
- No data migration script needed. [VERIFIED: current data.json contents]

---

## Zod v4 Compatibility Notes

The project has `zod@4.3.6` installed. The existing `data.ts` uses v3-style API (`.uuid()`, `.datetime()`, `.nonnegative()`, `.passthrough()`, `.safeParse()`). These all remain functional in zod v4 but are marked `@deprecated` in TypeScript types:

| API | v4 status | v4 replacement | Action |
|-----|-----------|----------------|--------|
| `z.string().uuid()` | deprecated (TS warning) | `z.uuid()` | Keep as-is in Phase 2 — existing code works; updating would be a separate cleanup task |
| `z.string().datetime()` | deprecated (TS warning) | `z.iso.datetime()` | Keep as-is |
| `.nonnegative()` | still valid | no change | No action needed |
| `.passthrough()` | still valid | no change | No action needed |
| `z.infer<typeof schema>` | still valid | no change | No action needed |

**Recommendation:** Do not migrate deprecated APIs in Phase 2. The deprecation warnings are TypeScript-level only and do not cause runtime failures. Migrating would require changing `BaseItemSchema` which is referenced everywhere, risking unintended breakage. Flag for a cleanup phase after v1. [VERIFIED: zod v4.3.6 node_modules — deprecated markers are non-breaking]

---

## Common Pitfalls

### Pitfall 1: Form schema uses stored-data types instead of string inputs
**What goes wrong:** Defining `currentValue: z.number()` in the form schema. When `register('currentValue')` binds to a text input, the string "1,50,000" fails Zod's `z.number()` validator before it can be parsed.
**Why it happens:** The stored Zod schema and the form validation schema serve different purposes.
**How to avoid:** Always define a separate form schema with `z.string()` for currency/number fields. Parse with `parseFinancialInput()` inside `onSubmit`, then validate the parsed number before saving.
**Warning signs:** `errors.currentValue` shows "Expected number, received string" immediately on open.

### Pitfall 2: Settings form repopulates on every save from any section
**What goes wrong:** `useEffect(() => { reset(data.settings) }, [data])` — since `data` is a new object reference every time any section saves, this re-fires and wipes any unsaved changes in the Settings form.
**Why it happens:** `AppDataContext` creates a new state object on every `saveData` optimistic update.
**How to avoid:** Use an empty dependency array `[]` (run once on mount) or use a stable `useRef` to track whether the form has been populated.

### Pitfall 3: Sheet doesn't reset between Add and Edit
**What goes wrong:** Opening Edit for item A, cancelling, then opening Add shows item A's values.
**Why it happens:** `useForm` keeps previous values unless `reset()` is called explicitly.
**How to avoid:** Always call `reset(defaultValues)` before opening Sheet in add mode; call `reset(existingItem)` before opening in edit mode. Both calls happen before `setSheetOpen(true)`.

### Pitfall 4: GoldPage section total shows ₹0 silently
**What goes wrong:** No `goldPrices` in Settings yet, but Gold items exist. The section total renders ₹0 with no explanation.
**How to avoid:** Check if `data.settings.goldPrices` is defined before computing the total. If undefined: display `₹0` with a muted footnote "Set gold prices in Settings" (per UI-SPEC).

### Pitfall 5: Delete does not reflect optimistic update correctly
**What goes wrong:** Calling `saveData` with the item filtered out, but the list still shows the item for a moment due to stale state.
**Why it happens:** `saveData` does optimistic update to state immediately, so this should not happen — unless the caller reconstructs the wrong data object.
**How to avoid:** Build the new data object before calling `saveData`. The pattern is:
```ts
const updatedItems = data.assets.gold.items.filter(i => i.id !== id)
await saveData({ ...data, assets: { ...data.assets, gold: { ...data.assets.gold, items: updatedItems, updatedAt: nowIso() } } })
```

### Pitfall 6: Sheet width is 75% of viewport (shadcn default), not 400px
**What goes wrong:** On a wide monitor the Sheet feels too wide.
**Why it happens:** The installed `sheet.tsx` uses `w-3/4 sm:max-w-sm` (max ~384px on sm breakpoint), which is close to 400px but not exact.
**How to avoid:** The existing sheet.tsx already applies `sm:max-w-sm` which is 24rem (384px) — this matches the UI-SPEC's "400px on desktop" target well enough. No customization needed.

---

## Code Examples

### Section total with INR formatting
```tsx
// Source: CLAUDE.md convention + MDN toLocaleString
const sectionTotal = data.assets.mutualFunds.platforms.reduce(
  (sum, p) => roundCurrency(sum + p.currentValue), 0
)
// Display:
<output aria-live="polite" className="text-2xl font-semibold">
  {sectionTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
</output>
```

### Gold section total (with Settings dependency guard)
```tsx
const goldPrices = data.settings.goldPrices
const goldTotal = goldPrices
  ? data.assets.gold.items.reduce((sum, item) => {
      const priceKey = { 24: 'k24', 22: 'k22', 18: 'k18' }[item.karat] as 'k24' | 'k22' | 'k18'
      return roundCurrency(sum + roundCurrency(item.grams * goldPrices[priceKey]))
    }, 0)
  : null
```

### Retirement projected corpus
```tsx
// src/lib/financials.ts addition
export function calcProjectedCorpus(balance: number, annualRatePct: number, years: number): number {
  if (balance <= 0 || annualRatePct <= 0 || years <= 0) return 0
  return roundCurrency(balance * Math.pow(1 + annualRatePct / 100, years))
}

// In RetirementPage:
const ra = data.settings.retirement
const hasAssumptions = ra && ra.currentAge > 0 && ra.targetAge > ra.currentAge
const years = hasAssumptions ? ra.targetAge - ra.currentAge : 0
const projectedNps = hasAssumptions ? calcProjectedCorpus(retirement.nps, ra.npsReturnPct, years) : 0
const projectedEpf = hasAssumptions ? calcProjectedCorpus(retirement.epf, ra.epfRatePct, years) : 0
```

### Controlled karat select (Gold Sheet)
```tsx
// Zod form schema
const goldFormSchema = z.object({
  karat: z.enum(['24', '22', '18']),
  grams: z.string().min(1, 'This field is required.'),
})

// Template
<select id="karat" {...register('karat')}
  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
>
  <option value="24">24K</option>
  <option value="22">22K</option>
  <option value="18">18K</option>
</select>

// On submit: coerce to number
const karat = Number(values.karat) as 24 | 22 | 18
```

---

## Runtime State Inventory

> Not applicable — Phase 2 is new feature development, not a rename/refactor/migration.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | (darwin, shell confirmed) | — |
| npm | Package installation | ✓ | (via node) | — |
| Vite dev server | Data persistence API | ✓ | 5.4.10 (package.json) | — |
| shadcn CLI | Component installation | ✓ | 4.5.0 [VERIFIED: node_modules] | — |
| data.json | Persistence target | ✓ | Seeded with v1 schema [VERIFIED: file exists] | — |

No missing dependencies that block execution.

---

## Validation Architecture

> Note: No test infrastructure was found in the codebase. No `pytest.ini`, `jest.config.*`, `vitest.config.*`, `tests/`, or `*.test.*` files exist. All validations in this phase are manual smoke tests.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | `npm run build` (TypeScript compilation) |
| Full suite command | Manual smoke test in browser |

### Phase Requirements → Test Map
| Behavior | Test Type | How to Verify |
|----------|-----------|---------------|
| Schema changes parse existing data.json | Manual | `npm run dev` — check browser console for DataSchema errors |
| Gold Sheet add/edit/delete | Manual | Add item → verify in list; edit → verify updated; delete → verify removed |
| MF Sheet add/edit/delete | Manual | Same as Gold |
| Stocks Sheet add/edit/delete | Manual | Same as Gold |
| Bank Savings Sheet add/edit/delete | Manual | Same as Gold |
| Settings gold prices save | Manual | Enter values → Save → reload page → values persist |
| Settings retirement assumptions save | Manual | Same as above |
| Retirement projected corpus display | Manual | Enter balances + settings → verify formula output |
| Section totals recompute | Manual | Add/edit item → verify total updates immediately |
| Inline save error on network failure | Manual | Stop dev server, try to save → verify error message appears |

### Wave 0 Gaps
- No test infrastructure exists. Phase 2 execution relies on TypeScript compilation (`npm run build` / `npx tsc --noEmit`) as the automated quality gate, plus manual browser smoke tests.
- `npx tsc --noEmit` exits 0 with current codebase [VERIFIED] — use this as the per-task automated check.

---

## Security Domain

This is a local-only dev-server app with no authentication, no network exposure, and no user-submitted data persisted to any external service. ASVS categories do not apply in the traditional sense.

| ASVS Category | Applies | Rationale |
|---------------|---------|-----------|
| V2 Authentication | No | Local-only app, no auth |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Single user, local |
| V5 Input Validation | Partial | RHF + Zod validates form inputs; `parseFinancialInput()` sanitizes currency strings. Risk is data corruption, not injection. |
| V6 Cryptography | No | No secrets, no encryption needed |

**Relevant concern:** `parseFinancialInput()` returns `0` for invalid/non-numeric input rather than throwing. Forms using it must validate that the parsed result is > 0 where required (e.g., gold grams must be > 0, prices must be > 0).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@hookform/resolvers@5.2.2` works with zod v4 via standard-schema protocol | Standard Stack | If wrong: zodResolver validation silently fails or throws; mitigation: test immediately after install with a simple schema |
| A2 | `npx shadcn add card` installs cleanly with shadcn CLI 4.5.0 and the current components.json config | Standard Stack | Low risk — shadcn card is a stable, widely-used component |

**Near-empty assumptions log:** Nearly all claims in this research were verified directly against node_modules, package.json, or existing source files.

---

## Open Questions

1. **Phase 1 incompleteness — impact on Phase 2**
   - What we know: STATE.md says Phase 1 is ~20% complete with persistence missing. But `data.json` exists and `vite.config.ts` imports `dataPlugin`. The files appear complete.
   - What's unclear: Whether the dataPlugin actually handles `GET /api/data` and `POST /api/data` correctly, since STATE.md says it was "missing."
   - Recommendation: Wave 0 of Phase 2 should include verifying `npm run dev` starts cleanly and `GET /api/data` returns the current `data.json` content.

2. **`z.string().uuid()` deprecation warnings in TypeScript**
   - What we know: `zod@4.3.6` is installed; `BaseItemSchema` uses `z.string().uuid()` and `z.string().datetime()` which are deprecated in v4. `tsc --noEmit` passes now.
   - What's unclear: Whether future zod minor versions will turn these into errors vs. keeping them as warnings.
   - Recommendation: Keep as-is for Phase 2 to avoid scope creep. Note for a v1.1 cleanup task.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/react-hook-form/package.json` + `dist/index.esm.mjs` — version 7.73.1, exports verified
- `node_modules/zod/package.json` — version 4.3.6, export paths verified
- `node_modules/zod/v4/classic/schemas.d.ts` — deprecated API markers verified
- `src/types/data.ts` — existing schema structure verified
- `src/context/AppDataContext.tsx` — `saveData` API verified
- `src/components/ui/sheet.tsx` — Sheet component API verified
- `data.json` — current data contents verified (empty arrays, no settings blocks)
- `/react-hook-form/resolvers` Context7 library — zodResolver pattern verified [CITED: context7.com/react-hook-form/resolvers]

### Secondary (MEDIUM confidence)
- `npm view @hookform/resolvers version` + npm registry description — v5.2.2 confirmed, standard-schema dependency confirmed
- npm registry README for @hookform/resolvers — explicitly shows `import { z } from 'zod'` or `'zod/v4'` compatibility

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against node_modules and registry
- Schema changes: HIGH — verified against existing data.ts and data.json
- Architecture: HIGH — derived from existing codebase patterns (AppDataContext, Sheet)
- Pitfalls: MEDIUM — derived from known RHF/Zod integration patterns + codebase inspection

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (stable libraries; zod v4 migration path unlikely to change in 30 days)
