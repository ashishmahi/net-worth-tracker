import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppData } from '@/context/AppDataContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import { cn } from '@/lib/utils'
import type { GoldItem } from '@/types/data'

// ── Form schema (strings — parse to typed values on submit) ───────────────────

const goldFormSchema = z.object({
  karat: z.enum(['24', '22', '18']),
  grams: z.string().min(1, 'This field is required.'),
})
type GoldFormValues = z.infer<typeof goldFormSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function GoldPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoldFormValues>({
    resolver: zodResolver(goldFormSchema),
  })

  // ── Sheet open handlers (reset before open — RESEARCH.md Pitfall 3) ───────

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ karat: '22', grams: '' })
    setSheetOpen(true)
  }

  function openEdit(item: GoldItem) {
    setEditingId(item.id)
    setSaveError(null)
    reset({
      karat: String(item.karat) as '24' | '22' | '18',
      grams: String(item.grams),
    })
    setSheetOpen(true)
  }

  // ── Save handler ──────────────────────────────────────────────────────────

  const onSubmit = async (values: GoldFormValues) => {
    setSaveError(null) // clear on each attempt (D-20)
    setSaving(true)
    try {
      const now = nowIso()
      const karat = Number(values.karat) as 24 | 22 | 18
      const grams = parseFinancialInput(values.grams)
      const items = data.assets.gold.items
      const updatedItems = editingId
        ? items.map(i =>
            i.id === editingId ? { ...i, karat, grams, updatedAt: now } : i
          )
        : [
            ...items,
            { id: createId(), createdAt: now, updatedAt: now, karat, grams },
          ]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          gold: { ...data.assets.gold, items: updatedItems, updatedAt: now },
        },
      })
      setSheetOpen(false)
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete handler ────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    const now = nowIso()
    const updatedItems = data.assets.gold.items.filter(i => i.id !== id)
    try {
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          gold: { ...data.assets.gold, items: updatedItems, updatedAt: now },
        },
      })
    } catch {
      // Delete failure — keep Sheet open and show error
      setSaveError('Could not delete. Check that the app is running and try again.')
      return
    }
    setSheetOpen(false)
  }

  // ── Section total (D-05: computed at render, never stored) ────────────────
  // Guard: goldPrices may be undefined if Settings not yet configured (RESEARCH.md Pitfall 4)

  const goldPrices = data.settings.goldPrices
  const goldTotal = goldPrices
    ? data.assets.gold.items.reduce((sum, item) => {
        const priceKey = (
          { 24: 'k24', 22: 'k22', 18: 'k18' } as const
        )[item.karat]
        return roundCurrency(sum + roundCurrency(item.grams * goldPrices[priceKey]))
      }, 0)
    : null

  const items = data.assets.gold.items

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* Page heading + section total + Add button */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Gold</h1>
            <output aria-live="polite" className="text-2xl font-semibold block mt-1">
              {goldTotal !== null
                ? goldTotal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })
                : '₹0'}
            </output>
            {goldTotal === null && (
              <p className="text-sm text-muted-foreground mt-1">
                Set gold prices in Settings
              </p>
            )}
          </div>
          <Button onClick={openAdd} aria-label="Add gold item">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* List card */}
        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              /* Empty state */
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-foreground">No gold items yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first item to track your gold holdings.
                </p>
              </div>
            ) : (
              /* List rows */
              items.map((item, index) => (
                <div key={item.id}>
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                    aria-label={`Edit ${item.karat}K gold item`}
                    onClick={() => openEdit(item)}
                  >
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary">{item.karat}K</Badge>
                      <span className="text-sm font-semibold">{item.karat}K Gold</span>
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {item.grams} g
                    </span>
                  </button>
                  {index < items.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sheet — add/edit overlay (D-01) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Gold Item' : 'Add Gold Item'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Karat selector — native select with shadcn-matching styles (RESEARCH.md Pattern 4) */}
            <div>
              <Label htmlFor="karat">Karat</Label>
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
              {errors.karat && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.karat.message}
                </p>
              )}
            </div>

            {/* Weight field */}
            <div>
              <Label htmlFor="grams">Weight (grams)</Label>
              <Input
                id="grams"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 10.5"
                {...register('grams')}
                aria-invalid={!!errors.grams}
                className={errors.grams ? 'border-destructive' : ''}
              />
              {errors.grams && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.grams.message}
                </p>
              )}
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              {saveError && (
                <p role="alert" className="text-sm text-destructive mt-2">
                  {saveError}
                </p>
              )}
              {editingId && (
                <Button
                  type="button"
                  variant="destructive"
                  aria-label="Delete this gold item"
                  onClick={() => handleDelete(editingId)}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
