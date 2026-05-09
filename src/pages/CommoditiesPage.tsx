import { useMemo, useState } from 'react'
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
import { useLivePrices } from '@/context/LivePricesContext'
import {
  createId,
  nowIso,
  parseFinancialInput,
  roundCurrency,
} from '@/lib/financials'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'
import { PageHeader } from '@/components/PageHeader'
import { DualCurrencyAmount } from '@/components/DualCurrencyAmount'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
import { cn } from '@/lib/utils'
import { CURRENCY_CODES, CurrencySchema } from '@/types/currency'
import type { OtherCommodityItem } from '@/types/data'

type SheetVariant = 'standard' | 'manual'

const standardFormSchema = z.object({
  grams: z.string().min(1, 'This field is required.'),
})

type StandardFormValues = z.infer<typeof standardFormSchema>

const manualFormSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  value: z.string().min(1, 'This field is required.'),
  currency: CurrencySchema,
})

type ManualFormValues = z.infer<typeof manualFormSchema>

function parseNonnegativeGrams(val: string): { ok: true; grams: number } | { ok: false } {
  const grams = parseFinancialInput(val)
  if (grams < 0) return { ok: false }
  return { ok: true, grams }
}

function parseNonnegativeInr(val: string): { ok: true; inr: number } | { ok: false } {
  const inr = parseFinancialInput(val)
  if (inr < 0) return { ok: false }
  return { ok: true, inr }
}

export function CommoditiesPage() {
  const { data, saveData } = useAppData()
  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const { silverUsdPerOz, usdInr, aedInr, eurInr, gbpInr, sgdInr } = useLivePrices()
  const rateSnapshot = useMemo(
    () => ({ usdInr, aedInr, eurInr, gbpInr, sgdInr }),
    [usdInr, aedInr, eurInr, gbpInr, sgdInr],
  )

  const silverInrPerGram = useMemo(() => {
    if (silverUsdPerOz == null || usdInr == null) return null
    return roundCurrency((silverUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr)
  }, [silverUsdPerOz, usdInr])

  const [sheetOpen, setSheetOpen] = useState(false)
  const [variant, setVariant] = useState<SheetVariant>('standard')
  const [editingItem, setEditingItem] = useState<OtherCommodityItem | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const standardForm = useForm<StandardFormValues>({
    resolver: zodResolver(standardFormSchema),
  })

  const manualForm = useForm<ManualFormValues>({
    resolver: zodResolver(manualFormSchema),
  })

  const standardGramsWatch = standardForm.watch('grams')

  const derivedStandardInr = useMemo(() => {
    if (silverInrPerGram == null || !standardGramsWatch) return null
    const parsed = parseFinancialInput(standardGramsWatch)
    if (parsed <= 0) return null
    return roundCurrency(parsed * silverInrPerGram)
  }, [silverInrPerGram, standardGramsWatch])

  function openAddStandard() {
    setEditingItem(null)
    setVariant('standard')
    setSaveError(null)
    standardForm.reset({ grams: '' })
    setSheetOpen(true)
  }

  function openAddManual() {
    setEditingItem(null)
    setVariant('manual')
    setSaveError(null)
    manualForm.reset({ label: '', value: '', currency: reportingCurrency })
    setSheetOpen(true)
  }

  function openEdit(item: OtherCommodityItem) {
    setEditingItem(item)
    setSaveError(null)
    if (item.type === 'standard') {
      setVariant('standard')
      standardForm.reset({ grams: String(item.grams) })
    } else {
      setVariant('manual')
      manualForm.reset({
        label: item.label,
        value: String(item.value),
        currency: item.currency ?? reportingCurrency,
      })
    }
    setSheetOpen(true)
  }

  const onSubmitStandard = async (values: StandardFormValues) => {
    const parsed = parseNonnegativeGrams(values.grams)
    if (!parsed.ok) {
      standardForm.setError('grams', {
        type: 'manual',
        message: 'Must be a nonnegative amount.',
      })
      return
    }
    setSaveError(null)
    setSaving(true)
    const now = nowIso()
    try {
      const items = data.assets.otherCommodities.items
      const updatedItems = editingItem
        ? items.map(i =>
            i.id === editingItem.id && i.type === 'standard'
              ? { ...i, grams: parsed.grams, updatedAt: now }
              : i
          )
        : [
            ...items,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              type: 'standard' as const,
              kind: 'silver' as const,
              grams: parsed.grams,
            },
          ]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          otherCommodities: {
            ...data.assets.otherCommodities,
            items: updatedItems,
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

  const onSubmitManual = async (values: ManualFormValues) => {
    const parsed = parseNonnegativeInr(values.value)
    if (!parsed.ok) {
      manualForm.setError('value', {
        type: 'manual',
        message: 'Must be a nonnegative amount.',
      })
      return
    }
    setSaveError(null)
    setSaving(true)
    const now = nowIso()
    try {
      const items = data.assets.otherCommodities.items
      const updatedItems = editingItem
        ? items.map(i =>
            i.id === editingItem.id && i.type === 'manual'
              ? {
                  ...i,
                  label: values.label.trim(),
                  value: parsed.inr,
                  currency: values.currency,
                  updatedAt: now,
                }
              : i
          )
        : [
            ...items,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              type: 'manual' as const,
              label: values.label.trim(),
              value: parsed.inr,
              currency: values.currency,
            },
          ]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          otherCommodities: {
            ...data.assets.otherCommodities,
            items: updatedItems,
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

  async function handleDelete(id: string) {
    const now = nowIso()
    const updatedItems = data.assets.otherCommodities.items.filter(i => i.id !== id)
    try {
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          otherCommodities: {
            ...data.assets.otherCommodities,
            items: updatedItems,
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

  const items = data.assets.otherCommodities.items

  const sheetTitle =
    variant === 'standard'
      ? editingItem
        ? 'Edit Silver'
        : 'Add Silver'
      : editingItem
        ? 'Edit manual item'
        : 'Add manual item'

  const editingId = editingItem?.id ?? null

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Commodities"
          action={
            items.length > 0 ? (
              <div className="flex w-full flex-col gap-2 min-[768px]:w-auto min-[768px]:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-[768px]:w-auto"
                  onClick={openAddStandard}
                  aria-label="Add silver"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add silver
                </Button>
                <Button
                  type="button"
                  className="w-full min-[768px]:w-auto"
                  onClick={openAddManual}
                  aria-label="Add manual item"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add manual item
                </Button>
              </div>
            ) : null
          }
        />

        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="space-y-6 px-4 py-12 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    No commodities yet
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Track <span className="font-medium text-foreground">silver</span>{' '}
                    by weight (grams); live rates value it on the dashboard when
                    available. Use <span className="font-medium text-foreground">manual items</span>{' '}
                    for anything priced directly in ₹ (collectibles, estimates, etc.).
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button type="button" onClick={openAddStandard} aria-label="Add silver">
                    <Plus className="mr-2 h-4 w-4" />
                    Add silver
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openAddManual}
                    aria-label="Add manual item"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add manual item
                  </Button>
                </div>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    aria-label={
                      item.type === 'standard'
                        ? 'Edit silver holding'
                        : `Edit ${item.label}`
                    }
                    onClick={() => openEdit(item)}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-semibold">
                        {item.type === 'standard' ? 'Silver' : item.label}
                      </span>
                      {item.type === 'manual' ? (
                        <span className="text-xs text-muted-foreground">Manual</span>
                      ) : null}
                    </span>
                    <div className="shrink-0 text-right text-sm text-muted-foreground">
                      {item.type === 'standard' ? (
                        `${item.grams} g`
                      ) : (
                        <DualCurrencyAmount
                          amount={item.value}
                          recordCurrency={item.currency ?? reportingCurrency}
                          reportingCurrency={reportingCurrency}
                          rates={rateSnapshot}
                        />
                      )}
                    </div>
                  </button>
                  {index < items.length - 1 && <Separator />}
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
              <SheetTitle>{sheetTitle}</SheetTitle>
            </SheetHeader>
          </div>

          {variant === 'standard' ? (
            <form
              onSubmit={standardForm.handleSubmit(onSubmitStandard)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6">
                <div>
                  <Label htmlFor="commodity-grams">Weight (grams)</Label>
                  <Input
                    id="commodity-grams"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 100"
                    {...standardForm.register('grams')}
                    aria-invalid={!!standardForm.formState.errors.grams}
                    className={
                      standardForm.formState.errors.grams ? 'border-destructive' : ''
                    }
                  />
                  {standardForm.formState.errors.grams ? (
                    <p role="alert" className="mt-1 text-sm text-destructive">
                      {standardForm.formState.errors.grams.message}
                    </p>
                  ) : null}
                </div>
                {derivedStandardInr != null ? (
                  <p className="text-sm text-muted-foreground" aria-live="polite">
                    Approx. value:{' '}
                    <span className="font-medium text-foreground">
                      {derivedStandardInr.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </span>{' '}
                    (live rates — not saved)
                  </p>
                ) : silverInrPerGram == null ? (
                  <p className="text-sm text-muted-foreground">
                    Live silver rate unavailable — dashboard totals may exclude silver until
                    rates load.
                  </p>
                ) : null}
              </div>
              <SheetFooter className="shrink-0 flex-col gap-2 border-t px-6 pb-6 pt-2 sm:flex-col">
                {saveError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {saveError}
                  </p>
                ) : null}
                {editingId ? (
                  <Button
                    type="button"
                    variant="destructive"
                    aria-label="Delete this commodity item"
                    onClick={() => void handleDelete(editingId)}
                  >
                    Delete
                  </Button>
                ) : null}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </SheetFooter>
            </form>
          ) : (
            <form
              onSubmit={manualForm.handleSubmit(onSubmitManual)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6">
                <div>
                  <Label htmlFor="commodity-label">Label</Label>
                  <Input
                    id="commodity-label"
                    type="text"
                    placeholder="e.g. Collectible coins"
                    {...manualForm.register('label')}
                    aria-invalid={!!manualForm.formState.errors.label}
                    className={manualForm.formState.errors.label ? 'border-destructive' : ''}
                  />
                  {manualForm.formState.errors.label ? (
                    <p role="alert" className="mt-1 text-sm text-destructive">
                      {manualForm.formState.errors.label.message}
                    </p>
                  ) : null}
                </div>
                <fieldset className="space-y-2">
                  <legend className="flex items-center gap-1.5 text-sm font-medium">
                    Currency
                    <CurrencyFieldHint />
                  </legend>
                  <select
                    id="commodity-manual-currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...manualForm.register('currency')}
                    aria-invalid={!!manualForm.formState.errors.currency}
                  >
                    {CURRENCY_CODES.map(code => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  {manualForm.formState.errors.currency ? (
                    <p role="alert" className="text-sm text-destructive">
                      {manualForm.formState.errors.currency.message}
                    </p>
                  ) : null}
                </fieldset>
                <div>
                  <Label htmlFor="commodity-value">Value</Label>
                  <Input
                    id="commodity-value"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 25,000"
                    {...manualForm.register('value')}
                    aria-invalid={!!manualForm.formState.errors.value}
                    className={
                      manualForm.formState.errors.value ? 'border-destructive' : ''
                    }
                  />
                  {manualForm.formState.errors.value ? (
                    <p role="alert" className="mt-1 text-sm text-destructive">
                      {manualForm.formState.errors.value.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <SheetFooter className="shrink-0 flex-col gap-2 border-t px-6 pb-6 pt-2 sm:flex-col">
                {saveError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {saveError}
                  </p>
                ) : null}
                {editingId ? (
                  <Button
                    type="button"
                    variant="destructive"
                    aria-label="Delete this commodity item"
                    onClick={() => void handleDelete(editingId)}
                  >
                    Delete
                  </Button>
                ) : null}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
