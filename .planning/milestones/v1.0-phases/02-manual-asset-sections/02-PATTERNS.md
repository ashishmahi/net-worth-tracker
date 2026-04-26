# Phase 2: Manual Asset Sections — Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 8 new/modified files
**Analogs found:** 3 / 8 (partial — stubs are nearly empty; full pattern is in RESEARCH.md code examples)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/data.ts` | model/schema | transform | itself (current file) | self-edit |
| `src/lib/financials.ts` | utility | transform | itself (current file) | self-edit |
| `src/pages/GoldPage.tsx` | component/page | CRUD | `src/pages/SettingsPage.tsx` (import structure + useAppData) | partial |
| `src/pages/MutualFundsPage.tsx` | component/page | CRUD | `src/pages/SettingsPage.tsx` | partial |
| `src/pages/StocksPage.tsx` | component/page | CRUD | `src/pages/SettingsPage.tsx` | partial |
| `src/pages/BankSavingsPage.tsx` | component/page | CRUD | `src/pages/SettingsPage.tsx` | partial |
| `src/pages/RetirementPage.tsx` | component/page | request-response | `src/pages/SettingsPage.tsx` | partial |
| `src/pages/SettingsPage.tsx` | component/page | request-response | itself (current file — extend with forms) | self-edit |

**Note on analog quality:** All 6 page stubs are 7–8 lines with no real logic. The closest real analog for component structure and `useAppData` usage is `SettingsPage.tsx` (32 lines — the only page with meaningful import patterns). The RESEARCH.md code examples are the authoritative pattern source for RHF + Sheet; those are transcribed verbatim in the Pattern Assignments below.

---

## Pattern Assignments

### `src/types/data.ts` (model/schema, transform)

**Analog:** itself — modify in-place.

**Current import block** (lines 1):
```typescript
import { z } from 'zod'
```

**Current BaseItemSchema** (lines 5–9) — unchanged, used by all new item schemas:
```typescript
export const BaseItemSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
```

**GoldItemSchema change — remove `pricePerGram`** (lines 13–17, current):
```typescript
// BEFORE (remove pricePerGram — contradicts D-03)
const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
  pricePerGram: z.number().nonnegative(),  // DELETE THIS LINE
})

// AFTER
const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
})
```

**New schemas to add (D-21, D-22, D-23)** — replace `z.unknown()` stubs:
```typescript
// Replace MutualFundsSchema (line 24–27)
const MfPlatformSchema = BaseItemSchema.extend({
  name: z.string(),
  currentValue: z.number().nonnegative(),
  monthlySip: z.number().nonnegative(),
})
const MutualFundsSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(MfPlatformSchema),
})

// Replace StocksSchema (lines 29–32)
const StockPlatformSchema = BaseItemSchema.extend({
  name: z.string(),
  currentValue: z.number().nonnegative(),
})
const StocksSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(StockPlatformSchema),
})

// Replace BankSavingsSchema (lines 44–47)
const BankAccountSchema = BaseItemSchema.extend({
  label: z.string(),
  balanceInr: z.number().nonnegative(),
})
const BankSavingsSchema = z.object({
  updatedAt: z.string().datetime(),
  accounts: z.array(BankAccountSchema),
})
```

**SettingsSchema expansion (D-24)** — replace lines 55–59:
```typescript
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
const SettingsSchema = z
  .object({
    updatedAt: z.string().datetime(),
    goldPrices: GoldPricesSchema.optional(),
    retirement: RetirementAssumptionsSchema.optional(),
  })
  .passthrough()
```

**New type exports to append** (after line 81):
```typescript
export type MfPlatform = z.infer<typeof MfPlatformSchema>
export type StockPlatform = z.infer<typeof StockPlatformSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
// GoldItem already exported — updated automatically (no pricePerGram)
```

---

### `src/lib/financials.ts` (utility, transform)

**Analog:** itself — append new function.

**Existing pattern to follow** (lines 27–29) — `roundCurrency` as the model for a pure exported function:
```typescript
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}
```

**New function to append:**
```typescript
/**
 * Compound growth: balance × (1 + rate/100) ^ years
 * Returns 0 if any input is zero or negative.
 * Used by RetirementPage to compute projected NPS/EPF corpus.
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

---

### `src/pages/GoldPage.tsx` (component/page, CRUD — Sheet pattern)

**Analog:** `src/pages/SettingsPage.tsx` for import structure; RESEARCH.md Pattern 1 for Sheet+RHF logic.

**Import block pattern** (from SettingsPage.tsx lines 1–3 + RESEARCH.md additions):
```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import { cn } from '@/lib/utils'
// After shadcn add card:  import { Card, CardContent } from '@/components/ui/card'
// After shadcn add label: import { Label } from '@/components/ui/label'
// After shadcn add badge: import { Badge } from '@/components/ui/badge'
import type { GoldItem } from '@/types/data'
```

**Form schema — separate from stored schema (critical convention):**
```typescript
// Form uses strings; stored data uses numbers. Never use z.number() in form schema.
const goldFormSchema = z.object({
  karat: z.enum(['24', '22', '18']),
  grams: z.string().min(1, 'This field is required.'),
})
type GoldFormValues = z.infer<typeof goldFormSchema>
```

**Component state pattern** (from RESEARCH.md Pattern 1):
```typescript
export function GoldPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoldFormValues>({
    resolver: zodResolver(goldFormSchema),
  })
```

**Open add / open edit pattern** (always call reset before setSheetOpen):
```typescript
  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ karat: '22', grams: '' })
    setSheetOpen(true)
  }

  function openEdit(item: GoldItem) {
    setEditingId(item.id)
    setSaveError(null)
    reset({ karat: String(item.karat) as '24' | '22' | '18', grams: String(item.grams) })
    setSheetOpen(true)
  }
```

**onSubmit pattern** (parse strings → numbers on submit, build new data object, call saveData):
```typescript
  const onSubmit = async (values: GoldFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const karat = Number(values.karat) as 24 | 22 | 18
      const grams = parseFinancialInput(values.grams)
      const items = data.assets.gold.items
      const updatedItems = editingId
        ? items.map(i => i.id === editingId ? { ...i, karat, grams, updatedAt: now } : i)
        : [...items, { id: createId(), createdAt: now, updatedAt: now, karat, grams }]
      await saveData({ ...data, assets: { ...data.assets, gold: { ...data.assets.gold, items: updatedItems, updatedAt: now } } })
      setSheetOpen(false)
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }
```

**Delete pattern:**
```typescript
  async function handleDelete(id: string) {
    const now = nowIso()
    const updatedItems = data.assets.gold.items.filter(i => i.id !== id)
    await saveData({ ...data, assets: { ...data.assets, gold: { ...data.assets.gold, items: updatedItems, updatedAt: now } } })
    setSheetOpen(false)
  }
```

**Section total with Settings guard** (from RESEARCH.md):
```typescript
  const goldPrices = data.settings.goldPrices
  const goldTotal = goldPrices
    ? data.assets.gold.items.reduce((sum, item) => {
        const priceKey = { 24: 'k24', 22: 'k22', 18: 'k18' }[item.karat] as 'k24' | 'k22' | 'k18'
        return roundCurrency(sum + roundCurrency(item.grams * goldPrices[priceKey]))
      }, 0)
    : null
```

**Native select pattern for karat** (from RESEARCH.md Pattern 4):
```typescript
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

**SheetFooter pattern** (error above Delete/Save — from RESEARCH.md):
```typescript
<SheetFooter className="flex-col gap-2 sm:flex-col">
  {saveError && <p role="alert" className="text-sm text-destructive mt-2">{saveError}</p>}
  {editingId && (
    <Button type="button" variant="destructive" aria-label="Delete this gold item" onClick={() => handleDelete(editingId)}>
      Delete
    </Button>
  )}
  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
</SheetFooter>
```

**Section total display** (UI-SPEC: below heading, above Card):
```typescript
<output aria-live="polite" className="text-2xl font-semibold">
  {goldTotal !== null
    ? goldTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    : '₹0'}
</output>
{goldTotal === null && (
  <p className="text-sm text-muted-foreground">Set gold prices in Settings</p>
)}
```

**List row pattern** (UI-SPEC contract):
```typescript
// Wrap in <button> for keyboard/screen reader access
<button
  key={item.id}
  className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
  aria-label={`Edit ${item.karat}K gold item`}
  onClick={() => openEdit(item)}
>
  <span className="text-sm font-semibold">{item.karat}K Gold</span>
  <span className="text-sm text-muted-foreground">{item.grams} g</span>
</button>
```

**Empty state pattern** (UI-SPEC):
```typescript
<div className="py-12 text-center">
  <p className="text-sm font-semibold text-foreground">No gold items yet</p>
  <p className="text-sm text-muted-foreground mt-1">Add your first item to track your gold holdings.</p>
</div>
```

---

### `src/pages/MutualFundsPage.tsx` (component/page, CRUD — Sheet pattern)

**Analog:** Same as GoldPage — RESEARCH.md Pattern 1 + SettingsPage import structure.

**Form schema:**
```typescript
const mfFormSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  currentValue: z.string().min(1, 'This field is required.'),
  monthlySip: z.string(),  // optional — empty string maps to 0
})
type MfFormValues = z.infer<typeof mfFormSchema>
```

**Import additions vs GoldPage** — swap GoldItem for MfPlatform type, no Badge needed:
```typescript
import type { MfPlatform } from '@/types/data'
// Remove: cn, Badge (not needed for MF)
```

**Section total** (sum of currentValue only — SIP is informational per D-07):
```typescript
const sectionTotal = data.assets.mutualFunds.platforms.reduce(
  (sum, p) => roundCurrency(sum + p.currentValue), 0
)
```

**onSubmit — parse monthlySip as optional (0 if empty):**
```typescript
const currentValue = parseFinancialInput(values.currentValue)
const monthlySip = parseFinancialInput(values.monthlySip)  // returns 0 for empty string
```

**List row — SIP sub-row** (UI-SPEC: secondary text for SIP below name):
```typescript
<button className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left" onClick={() => openEdit(item)}>
  <div>
    <p className="text-sm font-semibold">{item.name}</p>
    {item.monthlySip > 0 && (
      <p className="text-sm text-muted-foreground">
        SIP {item.monthlySip.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}/mo
      </p>
    )}
  </div>
  <span className="text-sm text-muted-foreground">
    {item.currentValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
  </span>
</button>
```

**Sheet fields (in order per UI-SPEC):** Platform → Current Value → SIP/month

**Empty state copy:** "No platforms added" / "Add a platform to track your mutual fund investments."

**Sheet title copy:** "Add MF Platform" / "Edit MF Platform"

---

### `src/pages/StocksPage.tsx` (component/page, CRUD — Sheet pattern)

**Analog:** Near-identical to MutualFundsPage — simpler (no SIP field).

**Form schema:**
```typescript
const stocksFormSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  currentValue: z.string().min(1, 'This field is required.'),
})
type StocksFormValues = z.infer<typeof stocksFormSchema>
```

**Import type:** `import type { StockPlatform } from '@/types/data'`

**Data path:** `data.assets.stocks.platforms`

**Save pattern:**
```typescript
await saveData({
  ...data,
  assets: {
    ...data.assets,
    stocks: { ...data.assets.stocks, platforms: updatedPlatforms, updatedAt: now }
  }
})
```

**Empty state copy:** "No platforms added" / "Add a platform to track your stock portfolio."

**Sheet title copy:** "Add Stock Platform" / "Edit Stock Platform"

---

### `src/pages/BankSavingsPage.tsx` (component/page, CRUD — Sheet pattern)

**Analog:** Near-identical to StocksPage — different field name (`label` instead of `name`, `balanceInr` instead of `currentValue`).

**Form schema:**
```typescript
const bankFormSchema = z.object({
  label: z.string().min(1, 'This field is required.'),
  balanceInr: z.string().min(1, 'This field is required.'),
})
type BankFormValues = z.infer<typeof bankFormSchema>
```

**Import type:** `import type { BankAccount } from '@/types/data'`

**Data path:** `data.assets.bankSavings.accounts`

**Section total:**
```typescript
const sectionTotal = data.assets.bankSavings.accounts.reduce(
  (sum, a) => roundCurrency(sum + a.balanceInr), 0
)
```

**Save pattern:**
```typescript
await saveData({
  ...data,
  assets: {
    ...data.assets,
    bankSavings: { ...data.assets.bankSavings, accounts: updatedAccounts, updatedAt: now }
  }
})
```

**List row field names:** `item.label` (primary), `item.balanceInr` (secondary, right-aligned)

**Empty state copy:** "No accounts added" / "Add an account to track your INR savings."

**Sheet title copy:** "Add Bank Account" / "Edit Bank Account"

---

### `src/pages/RetirementPage.tsx` (component/page, request-response — inline form)

**Analog:** `src/pages/SettingsPage.tsx` (existing import and useAppData pattern).

**Import block** (SettingsPage lines 1–3 as base, plus RHF and useEffect):
```typescript
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import { parseFinancialInput, roundCurrency, calcProjectedCorpus } from '@/lib/financials'
// After shadcn add card:  import { Card, CardContent } from '@/components/ui/card'
// After shadcn add label: import { Label } from '@/components/ui/label'
```

**Form schema** (inline form, no Sheet):
```typescript
const retirementFormSchema = z.object({
  nps: z.string().min(1, 'This field is required.'),
  epf: z.string().min(1, 'This field is required.'),
})
type RetirementFormValues = z.infer<typeof retirementFormSchema>
```

**useEffect populate pattern** (RESEARCH.md Pattern 2 — empty deps array, avoids re-fire on any save):
```typescript
export function RetirementPage() {
  const { data, saveData } = useAppData()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RetirementFormValues>({
    resolver: zodResolver(retirementFormSchema),
    defaultValues: { nps: '', epf: '' },
  })

  useEffect(() => {
    const r = data.assets.retirement
    reset({
      nps: r.nps > 0 ? String(r.nps) : '',
      epf: r.epf > 0 ? String(r.epf) : '',
    })
  }, []) // empty array — run once on mount; avoids re-population on any other section save
```

**onSubmit — inline form save:**
```typescript
  const onSubmit = async (values: RetirementFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const nps = parseFinancialInput(values.nps)
      const epf = parseFinancialInput(values.epf)
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          retirement: { ...data.assets.retirement, nps, epf, updatedAt: now }
        }
      })
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }
```

**Projected corpus computation** (render-time, never stored — RESEARCH.md Pattern 3):
```typescript
  const ra = data.settings.retirement
  const hasAssumptions = ra && ra.currentAge > 0 && ra.targetAge > ra.currentAge
  const years = hasAssumptions ? ra.targetAge - ra.currentAge : 0
  const retirement = data.assets.retirement
  const projectedNps = hasAssumptions ? calcProjectedCorpus(retirement.nps, ra.npsReturnPct, years) : 0
  const projectedEpf = hasAssumptions ? calcProjectedCorpus(retirement.epf, ra.epfRatePct, years) : 0
  const projectedTotal = roundCurrency(projectedNps + projectedEpf)
```

**Projected corpus display card** (UI-SPEC Retirement section):
```typescript
<Card>
  <CardContent className="pt-6">
    <p className="text-sm font-semibold mb-4">Projected Corpus at Retirement</p>
    {hasAssumptions ? (
      <>
        <p className="text-sm">NPS {projectedNps.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
        <p className="text-sm">EPF {projectedEpf.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
        <p className="text-xl font-semibold mt-2">
          Total {projectedTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-muted-foreground mt-1">Based on current Settings assumptions</p>
      </>
    ) : (
      <p className="text-sm text-muted-foreground">Configure retirement assumptions in Settings to see projection.</p>
    )}
  </CardContent>
</Card>
```

---

### `src/pages/SettingsPage.tsx` (component/page, request-response — inline form, extend existing)

**Analog:** itself — extend in-place. Current file is lines 1–33.

**Existing import block** (lines 1–3) to extend:
```typescript
// EXISTING
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import type { AppData } from '@/types/data'

// ADD
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { parseFinancialInput } from '@/lib/financials'
// After shadcn add card:  import { Card, CardContent } from '@/components/ui/card'
// After shadcn add label: import { Label } from '@/components/ui/label'
```

**Existing handleExport function** (lines 5–16) — keep exactly as-is.

**Two independent useForm instances** (RESEARCH.md Pattern 2 — each block has its own form and Save):
```typescript
// Block 1: Gold Prices
const goldPricesSchema = z.object({
  k24: z.string().min(1, 'This field is required.'),
  k22: z.string().min(1, 'This field is required.'),
  k18: z.string().min(1, 'This field is required.'),
})
type GoldPricesValues = z.infer<typeof goldPricesSchema>

// Block 2: Retirement Assumptions
const retirementSchema = z.object({
  currentAge: z.string().min(1, 'This field is required.'),
  targetAge: z.string().min(1, 'This field is required.'),
  npsReturnPct: z.string().min(1, 'This field is required.'),
  epfRatePct: z.string().min(1, 'This field is required.'),
})
type RetirementValues = z.infer<typeof retirementSchema>
```

**Component with two separate form instances:**
```typescript
export function SettingsPage() {
  const { data, saveData } = useAppData()

  const [goldSaveError, setGoldSaveError] = useState<string | null>(null)
  const [goldSaving, setGoldSaving] = useState(false)
  const [retirementSaveError, setRetirementSaveError] = useState<string | null>(null)
  const [retirementSaving, setRetirementSaving] = useState(false)

  const goldForm = useForm<GoldPricesValues>({
    resolver: zodResolver(goldPricesSchema),
    defaultValues: { k24: '', k22: '', k18: '' },
  })

  const retirementForm = useForm<RetirementValues>({
    resolver: zodResolver(retirementSchema),
    defaultValues: { currentAge: '', targetAge: '', npsReturnPct: '', epfRatePct: '' },
  })

  // Populate on mount — empty deps array prevents re-fire on other section saves
  useEffect(() => {
    const gp = data.settings.goldPrices
    if (gp) {
      goldForm.reset({ k24: String(gp.k24), k22: String(gp.k22), k18: String(gp.k18) })
    }
    const ra = data.settings.retirement
    if (ra) {
      retirementForm.reset({
        currentAge: String(ra.currentAge),
        targetAge: String(ra.targetAge),
        npsReturnPct: String(ra.npsReturnPct),
        epfRatePct: String(ra.epfRatePct),
      })
    }
  }, []) // empty — run once; avoids RESEARCH.md Pitfall 2
```

**Gold prices onSubmit:**
```typescript
  const onGoldSubmit = async (values: GoldPricesValues) => {
    setGoldSaveError(null)
    setGoldSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          goldPrices: {
            k24: parseFinancialInput(values.k24),
            k22: parseFinancialInput(values.k22),
            k18: parseFinancialInput(values.k18),
          },
          updatedAt: now,
        }
      })
    } catch {
      setGoldSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setGoldSaving(false)
    }
  }
```

**Existing Export button pattern** (lines 22–28) — preserve in Block 3:
```typescript
// Block 3 — Data (keep existing Export Data button as-is)
<div>
  <p className="text-sm font-semibold mb-4">Data</p>
  <Button variant="outline" aria-label="Export data as JSON" onClick={() => handleExport(data)}>
    Export Data
  </Button>
</div>
```

---

## Shared Patterns

### useAppData() — persistence
**Source:** `src/context/AppDataContext.tsx` (lines 82–86)
**Apply to:** All 6 page files
```typescript
// Consumer hook — the only way to read/write data
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider')
  return ctx
}
// Usage: const { data, saveData } = useAppData()
// saveData throws on failure — always wrap in try/catch
```

### Inline save error pattern
**Source:** RESEARCH.md + UI-SPEC (D-20)
**Apply to:** All 6 page files (Sheet footer for list pages, below Save button for inline form pages)
```typescript
// State: const [saveError, setSaveError] = useState<string | null>(null)
// Reset on each save attempt: setSaveError(null) at top of onSubmit
// Display: below Save button (mt-2 for persistence error, mt-1 for field error)
{saveError && <p role="alert" className="text-sm text-destructive mt-2">{saveError}</p>}
// Error copy: 'Could not save. Check that the app is running and try again.'
```

### Currency input convention
**Source:** CLAUDE.md + UI-SPEC Interaction States
**Apply to:** All currency/number inputs in all 6 page files
```typescript
// ALWAYS use type="text" inputMode="decimal" — never type="number"
// ALWAYS parse with parseFinancialInput() on submit — never parseInt/parseFloat directly
<Input
  id="currentValue"
  type="text"
  inputMode="decimal"
  placeholder="e.g. 1,50,000"
  {...register('currentValue')}
  aria-invalid={!!errors.currentValue}
/>
// Error state: add border-destructive class when aria-invalid is true
```

### saveData spread pattern
**Source:** `src/context/AppDataContext.tsx` (lines 53–69) + RESEARCH.md Pitfall 5
**Apply to:** All 6 page files — never mutate, always spread full path
```typescript
// Pattern: spread entire data tree to preserve other sections
await saveData({
  ...data,
  assets: {
    ...data.assets,
    [sectionKey]: {
      ...data.assets[sectionKey],
      [itemsKey]: updatedItems,
      updatedAt: nowIso(),
    }
  }
})
```

### Section total display
**Source:** RESEARCH.md Code Examples + UI-SPEC Typography
**Apply to:** GoldPage, MutualFundsPage, StocksPage, BankSavingsPage
```typescript
// Position: directly below page heading (h1), above Card list
// Use <output> with aria-live for screen reader announcements
<output aria-live="polite" className="text-2xl font-semibold">
  {sectionTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
</output>
```

### Page heading pattern
**Source:** All existing stub pages (e.g. GoldPage.tsx line 3, SettingsPage.tsx line 21)
**Apply to:** All 6 page files — use identical heading style
```typescript
<h1 className="text-xl font-semibold">{sectionName}</h1>
```

### Sheet reset before open
**Source:** RESEARCH.md Pitfall 3
**Apply to:** GoldPage, MutualFundsPage, StocksPage, BankSavingsPage
```typescript
// Always call reset() BEFORE setSheetOpen(true) to avoid stale values
// Add mode:  reset(defaultValues); setSheetOpen(true)
// Edit mode: reset(existingItemValues); setSheetOpen(true)
```

### Form field + error pattern
**Source:** RESEARCH.md Pattern 1 + UI-SPEC Accessibility
```typescript
<div>
  <Label htmlFor="fieldId">Field Label</Label>
  <Input
    id="fieldId"
    type="text"
    inputMode="decimal"
    placeholder="e.g. 1,50,000"
    {...register('fieldName')}
    aria-invalid={!!errors.fieldName}
    className={errors.fieldName ? 'border-destructive' : ''}
  />
  {errors.fieldName && (
    <p role="alert" className="text-sm text-destructive mt-1">
      {errors.fieldName.message}
    </p>
  )}
</div>
```

---

## No Analog Found

Files with no close codebase match (use RESEARCH.md patterns directly):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| All 4 Sheet-based pages (Gold, MF, Stocks, Bank) | component/page | CRUD | The pattern (RHF + zodResolver + Sheet) has not been implemented anywhere in the codebase yet. RESEARCH.md Pattern 1 is the authoritative template. |
| RetirementPage (inline + corpus card) | component/page | request-response | Inline form with computed projection display has no existing analog. RESEARCH.md Pattern 2 + 3 are the templates. |

---

## Metadata

**Analog search scope:** `src/pages/`, `src/context/`, `src/lib/`, `src/types/`, `src/components/ui/`
**Files scanned:** 12 (all page stubs, AppDataContext, financials, data.ts, sheet.tsx, utils.ts, App.tsx, AppSidebar.tsx)
**Pattern extraction date:** 2026-04-25

**Key finding:** Because all page stubs are near-empty (7–8 lines each), there are no rich in-codebase CRUD analogs to copy from. The pattern source is the RESEARCH.md code examples (authored by the researcher against the real installed libraries). This PATTERNS.md transcribes those examples with the exact file paths, field names, and data paths drawn from the real codebase (AppDataContext, data.ts, financials.ts).
