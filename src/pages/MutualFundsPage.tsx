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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppData } from '@/context/AppDataContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import type { MfPlatform } from '@/types/data'

// ── Form schema ───────────────────────────────────────────────────────────────

const mfFormSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  currentValue: z.string().min(1, 'This field is required.'),
  monthlySip: z.string(), // optional — empty string maps to 0 via parseFinancialInput
})
type MfFormValues = z.infer<typeof mfFormSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function MutualFundsPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MfFormValues>({
    resolver: zodResolver(mfFormSchema),
  })

  // ── Sheet open handlers ───────────────────────────────────────────────────

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ name: '', currentValue: '', monthlySip: '' })
    setSheetOpen(true)
  }

  function openEdit(item: MfPlatform) {
    setEditingId(item.id)
    setSaveError(null)
    reset({
      name: item.name,
      currentValue: String(item.currentValue),
      monthlySip: item.monthlySip > 0 ? String(item.monthlySip) : '',
    })
    setSheetOpen(true)
  }

  // ── Save handler ──────────────────────────────────────────────────────────

  const onSubmit = async (values: MfFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const currentValue = parseFinancialInput(values.currentValue)
      const monthlySip = parseFinancialInput(values.monthlySip) // returns 0 for empty string
      const platforms = data.assets.mutualFunds.platforms
      const updatedPlatforms = editingId
        ? platforms.map(p =>
            p.id === editingId
              ? { ...p, name: values.name, currentValue, monthlySip, updatedAt: now }
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
              monthlySip,
            },
          ]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          mutualFunds: {
            ...data.assets.mutualFunds,
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
    const updatedPlatforms = data.assets.mutualFunds.platforms.filter(p => p.id !== id)
    try {
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          mutualFunds: {
            ...data.assets.mutualFunds,
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

  // ── Section total (D-07: sum of currentValue only — SIP is informational) ──

  const sectionTotal = data.assets.mutualFunds.platforms.reduce(
    (sum, p) => roundCurrency(sum + p.currentValue),
    0
  )

  const platforms = data.assets.mutualFunds.platforms

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* Page heading + section total + Add button */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Mutual Funds</h1>
            <output aria-live="polite" className="text-2xl font-semibold block mt-1">
              {sectionTotal.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </output>
          </div>
          <Button onClick={openAdd} aria-label="Add MF platform">
            <Plus className="mr-2 h-4 w-4" />
            Add Platform
          </Button>
        </div>

        {/* List card */}
        <Card>
          <CardContent className="p-0">
            {platforms.length === 0 ? (
              /* Empty state */
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-foreground">No platforms added</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a platform to track your mutual fund investments.
                </p>
              </div>
            ) : (
              /* List rows */
              platforms.map((item, index) => (
                <div key={item.id}>
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                    aria-label={`Edit ${item.name} platform`}
                    onClick={() => openEdit(item)}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item.monthlySip > 0 && (
                        <p className="text-sm text-muted-foreground font-normal">
                          SIP{' '}
                          {item.monthlySip.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          })}
                          /mo
                        </p>
                      )}
                    </div>
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

      {/* Sheet — add/edit overlay (D-01) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit MF Platform' : 'Add MF Platform'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Platform name */}
            <div>
              <Label htmlFor="name">Platform</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. PaytmMoney"
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

            {/* Current value */}
            <div>
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input
                id="currentValue"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1,50,000"
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

            {/* Monthly SIP — optional */}
            <div>
              <Label htmlFor="monthlySip">SIP / month (₹)</Label>
              <Input
                id="monthlySip"
                type="text"
                inputMode="decimal"
                placeholder="0 if none"
                {...register('monthlySip')}
                aria-invalid={!!errors.monthlySip}
                className={errors.monthlySip ? 'border-destructive' : ''}
              />
              {errors.monthlySip && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.monthlySip.message}
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
