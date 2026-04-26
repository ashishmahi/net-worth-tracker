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
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import type { StockPlatform } from '@/types/data'

// ── Form schema ───────────────────────────────────────────────────────────────

const stocksFormSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  currentValue: z.string().min(1, 'This field is required.'),
})
type StocksFormValues = z.infer<typeof stocksFormSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function StocksPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StocksFormValues>({
    resolver: zodResolver(stocksFormSchema),
  })

  // ── Sheet open handlers ───────────────────────────────────────────────────

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ name: '', currentValue: '' })
    setSheetOpen(true)
  }

  function openEdit(item: StockPlatform) {
    setEditingId(item.id)
    setSaveError(null)
    reset({ name: item.name, currentValue: String(item.currentValue) })
    setSheetOpen(true)
  }

  // ── Save handler ──────────────────────────────────────────────────────────

  const onSubmit = async (values: StocksFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const currentValue = parseFinancialInput(values.currentValue)
      const platforms = data.assets.stocks.platforms
      const updatedPlatforms = editingId
        ? platforms.map(p =>
            p.id === editingId
              ? { ...p, name: values.name, currentValue, updatedAt: now }
              : p
          )
        : [
            ...platforms,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              name: values.name,
              currentValue,
            },
          ]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          stocks: {
            ...data.assets.stocks,
            platforms: updatedPlatforms,
            updatedAt: now,
          },
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
    const updatedPlatforms = data.assets.stocks.platforms.filter(p => p.id !== id)
    try {
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          stocks: {
            ...data.assets.stocks,
            platforms: updatedPlatforms,
            updatedAt: now,
          },
        },
      })
    } catch {
      setSaveError('Could not delete. Check that the app is running and try again.')
      return
    }
    setSheetOpen(false)
  }

  // ── Section total (D-09: sum of currentValue) ─────────────────────────────

  const sectionTotal = data.assets.stocks.platforms.reduce(
    (sum, p) => roundCurrency(sum + p.currentValue),
    0
  )

  const platforms = data.assets.stocks.platforms

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Stocks"
          meta={
            <output aria-live="polite" className="text-2xl font-semibold block mt-1">
              {sectionTotal.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </output>
          }
          action={
            <Button
              className="w-full min-[768px]:w-auto"
              onClick={openAdd}
              aria-label="Add stock platform"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Platform
            </Button>
          }
        />

        <Card>
          <CardContent className="p-0">
            {platforms.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-foreground">No platforms added</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a platform to track your stock portfolio.
                </p>
              </div>
            ) : (
              platforms.map((item, index) => (
                <div key={item.id}>
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                    aria-label={`Edit ${item.name} platform`}
                    onClick={() => openEdit(item)}
                  >
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {item.currentValue.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </button>
                  {index < platforms.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className={cn(
            'flex w-full flex-col gap-0 overflow-hidden p-0',
            'max-h-[100dvh] min-h-0 sm:max-w-lg'
          )}
        >
          <div className="shrink-0 px-6 pt-6">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Edit Stock Platform' : 'Add Stock Platform'}</SheetTitle>
            </SheetHeader>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 min-h-0 flex-col"
          >
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6">
              <div>
                <Label htmlFor="name">Platform</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Zerodha"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p role="alert" className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="currentValue">Current Value (₹)</Label>
                <Input
                  id="currentValue"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 50,000"
                  {...register('currentValue')}
                  aria-invalid={!!errors.currentValue}
                  className={errors.currentValue ? 'border-destructive' : ''}
                />
                {errors.currentValue && (
                  <p role="alert" className="text-sm text-destructive mt-1">
                    {errors.currentValue.message}
                  </p>
                )}
              </div>
            </div>
            <SheetFooter className="shrink-0 flex-col gap-2 border-t px-6 pb-6 pt-2 sm:flex-col">
              {saveError && (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}
              {editingId && (
                <Button
                  type="button"
                  variant="destructive"
                  aria-label="Delete this platform"
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
