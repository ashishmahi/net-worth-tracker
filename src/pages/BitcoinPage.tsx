import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { DualCurrencyAmount } from '@/components/DualCurrencyAmount'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
import { parseFinancialInput, roundCurrency, nowIso } from '@/lib/financials'
import { toReportingCurrency } from '@/lib/currencyConversion'
import { CURRENCY_CODES, CurrencySchema } from '@/types/currency'
import type { CurrencyCode } from '@/types/currency'

const bitcoinFormSchema = z.object({
  quantity: z.string().min(1, 'This field is required.'),
  currency: CurrencySchema,
})
type BitcoinFormValues = z.infer<typeof bitcoinFormSchema>

export function BitcoinPage() {
  const { data, saveData } = useAppData()
  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const { btcUsd, usdInr, aedInr, eurInr, gbpInr, sgdInr, btcLoading, forexLoading, btcError, forexError } =
    useLivePrices()
  const rateSnapshot = useMemo(
    () => ({ usdInr, aedInr, eurInr, gbpInr, sgdInr }),
    [usdInr, aedInr, eurInr, gbpInr, sgdInr],
  )

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BitcoinFormValues>({
    resolver: zodResolver(bitcoinFormSchema),
    defaultValues: { quantity: '', currency: reportingCurrency },
  })

  const currencyWatch = watch('currency')

  useEffect(() => {
    const q = data.assets.bitcoin.quantity
    const c = data.assets.bitcoin.currency ?? reportingCurrency
    reset({
      quantity: q > 0 ? String(q) : '',
      currency: c,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when persisted quantity changes
  }, [data.assets.bitcoin.quantity, data.assets.bitcoin.currency, reportingCurrency])

  const onSubmit = async (values: BitcoinFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const quantity = parseFinancialInput(values.quantity)
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          bitcoin: {
            ...data.assets.bitcoin,
            quantity,
            currency: values.currency,
            updatedAt: now,
          },
        },
      })
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }

  const qty = data.assets.bitcoin.quantity
  const ratesLoading = btcLoading || forexLoading
  const hasRates = btcUsd != null && usdInr != null
  const inrValue = hasRates ? roundCurrency(qty * btcUsd! * usdInr!) : null
  const usdValue = btcUsd != null ? roundCurrency(qty * btcUsd) : null

  const recordCurrency: CurrencyCode = data.assets.bitcoin.currency ?? reportingCurrency

  const fiatNative = useMemo(() => {
    if (usdValue == null) return null
    if (recordCurrency === 'USD') return { amount: usdValue, code: 'USD' as const }
    if (recordCurrency === 'INR' && inrValue != null)
      return { amount: inrValue, code: 'INR' as const }
    const c = toReportingCurrency(usdValue, 'USD', recordCurrency, rateSnapshot)
    if (c.ok) return { amount: roundCurrency(c.amount), code: recordCurrency }
    return { amount: usdValue, code: 'USD' as const }
  }, [usdValue, inrValue, recordCurrency, rateSnapshot])

  return (
    <div className="space-y-6">
      <PageHeader title="Bitcoin" />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-4">Holding</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="btc-qty">Quantity (BTC)</Label>
              <Input
                id="btc-qty"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 0.25"
                {...register('quantity')}
                aria-invalid={!!errors.quantity}
                className={errors.quantity ? 'border-destructive' : ''}
              />
              {errors.quantity && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>
            <fieldset className="space-y-2">
              <legend className="flex items-center gap-1.5 text-sm font-medium">
                Currency
                <CurrencyFieldHint />
              </legend>
              <select
                id="btc-currency"
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
            {saveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {saveError}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </form>

          <div className="pt-4 border-t space-y-2" aria-live="polite">
            <p className="text-sm text-muted-foreground">
              Estimated value ({currencyWatch} preference — uses live or session rates)
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {ratesLoading && (
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-muted-foreground" aria-hidden />
              )}
              {fiatNative != null ? (
                <DualCurrencyAmount
                  amount={fiatNative.amount}
                  recordCurrency={fiatNative.code}
                  reportingCurrency={reportingCurrency}
                  rates={rateSnapshot}
                />
              ) : (
                <p className="text-2xl font-semibold">—</p>
              )}
            </div>
            {btcUsd != null && (
              <p className="text-xs text-muted-foreground">
                BTC/USD (effective):{' '}
                {btcUsd.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            )}
            {(btcError || forexError) && qty > 0 && (
              <p role="alert" className="text-sm text-destructive">
                Rates unavailable. Set session-only rates in Settings to estimate values for this session.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
