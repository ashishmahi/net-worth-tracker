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
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { DualCurrencyAmount } from '@/components/DualCurrencyAmount'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
import { cn } from '@/lib/utils'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import { toReportingCurrency } from '@/lib/currencyConversion'
import { CURRENCY_CODES, CurrencySchema } from '@/types/currency'
import type { MfPlatform } from '@/types/data'

const mfFormSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  currency: CurrencySchema,
  currentValue: z.string().min(1, 'This field is required.'),
  monthlySip: z.string(),
})
type MfFormValues = z.infer<typeof mfFormSchema>

export function MutualFundsPage() {
  const { data, saveData } = useAppData()
  const { usdInr, aedInr, eurInr, gbpInr, sgdInr } = useLivePrices()
  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const rateSnapshot = useMemo(
    () => ({ usdInr, aedInr, eurInr, gbpInr, sgdInr }),
    [usdInr, aedInr, eurInr, gbpInr, sgdInr],
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<MfFormValues>({
      resolver: zodResolver(mfFormSchema),
    })

  const currencyWatch = watch('currency')

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({
      name: '',
      currency: reportingCurrency,
      currentValue: '',
      monthlySip: '',
    })
    setSheetOpen(true)
  }

  function openEdit(item: MfPlatform) {
    setEditingId(item.id)
    setSaveError(null)
    reset({
      name: item.name,
      currency: item.currency ?? reportingCurrency,
      currentValue: String(item.currentValue),
      monthlySip: item.monthlySip > 0 ? String(item.monthlySip) : '',
    })
    setSheetOpen(true)
  }

  const onSubmit = async (values: MfFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const currentValue = parseFinancialInput(values.currentValue)
      const monthlySip = parseFinancialInput(values.monthlySip)
      const platforms = data.assets.mutualFunds.platforms
      const updatedPlatforms = editingId
        ? platforms.map(p =>
            p.id === editingId
              ? {
                  ...p,
                  name: values.name,
                  currency: values.currency,
                  currentValue,
                  monthlySip,
                  updatedAt: now,
                }
              : p,
          )
        : [
            ...platforms,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              name: values.name,
              currency: values.currency,
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

  const platforms = data.assets.mutualFunds.platforms

  const sectionTotal = useMemo(() => {
    return platforms.reduce((sum, p) => {
      const from = p.currency ?? reportingCurrency
      const c = toReportingCurrency(p.currentValue, from, reportingCurrency, rateSnapshot)
      if (!c.ok) return sum
      return roundCurrency(sum + roundCurrency(c.amount))
    }, 0)
  }, [platforms, reportingCurrency, rateSnapshot])

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Mutual Funds"
          meta={
            <output aria-live="polite" className="text-2xl font-semibold block mt-1">
              {sectionTotal.toLocaleString('en-IN', {
                style: 'currency',
                currency: reportingCurrency,
                maximumFractionDigits: 0,
              })}
            </output>
          }
          action={
            <Button
              className="w-full min-[768px]:w-auto"
              onClick={openAdd}
              aria-label="Add MF platform"
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
                  Add a platform to track your mutual fund investments.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(140px,auto)_minmax(100px,auto)] gap-2 px-4 py-2 border-b text-xs font-semibold text-muted-foreground">
                    <span>Platform</span>
                    <span className="text-right">CCY</span>
                    <span className="text-right">Value</span>
                    <span className="text-right">SIP</span>
                  </div>
                  {platforms.map((item, index) => {
                    const platCcy = item.currency ?? reportingCurrency
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          className="grid grid-cols-[minmax(0,1fr)_72px_minmax(140px,auto)_minmax(100px,auto)] gap-2 w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left items-center"
                          aria-label={`Edit ${item.name} platform`}
                          onClick={() => openEdit(item)}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{item.name}</p>
                          </div>
                          <span className="text-xs text-muted-foreground text-right tabular-nums">
                            {platCcy}
                          </span>
                          <div className="flex justify-end">
                            <DualCurrencyAmount
                              amount={item.currentValue}
                              recordCurrency={platCcy}
                              reportingCurrency={reportingCurrency}
                              rates={rateSnapshot}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground text-right tabular-nums shrink-0">
                            {item.monthlySip > 0
                              ? `${item.monthlySip.toLocaleString('en-IN', {
                                  style: 'currency',
                                  currency: platCcy,
                                  maximumFractionDigits: 0,
                                })}/mo`
                              : '—'}
                          </span>
                        </button>
                        {index < platforms.length - 1 && <Separator />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className={cn(
            'flex w-full flex-col gap-0 overflow-hidden p-0',
            'max-h-[100dvh] min-h-0 sm:max-w-lg',
          )}
        >
          <div className="shrink-0 px-6 pt-6">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Edit MF Platform' : 'Add MF Platform'}</SheetTitle>
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
              <fieldset className="space-y-2">
                <legend className="flex items-center gap-1.5 text-sm font-medium">
                  Currency
                  <CurrencyFieldHint />
                </legend>
                <select
                  id="mf-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('currency')}
                  aria-invalid={!!errors.currency}
                >
                  {CURRENCY_CODES.map(code => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.currency.message}
                  </p>
                )}
              </fieldset>
              <div>
                <Label htmlFor="currentValue">Current Value ({currencyWatch})</Label>
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
              <div>
                <Label htmlFor="monthlySip">SIP / month ({currencyWatch})</Label>
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
