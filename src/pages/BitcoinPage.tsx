import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { parseFinancialInput, roundCurrency, nowIso } from '@/lib/financials'

const bitcoinFormSchema = z.object({
  quantity: z.string().min(1, 'This field is required.'),
})
type BitcoinFormValues = z.infer<typeof bitcoinFormSchema>

export function BitcoinPage() {
  const { data, saveData } = useAppData()
  const { btcUsd, usdInr, btcLoading, forexLoading, btcError, forexError } = useLivePrices()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BitcoinFormValues>({
    resolver: zodResolver(bitcoinFormSchema),
    defaultValues: { quantity: '' },
  })

  useEffect(() => {
    const q = data.assets.bitcoin.quantity
    reset({
      quantity: q > 0 ? String(q) : '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when persisted quantity changes
  }, [data.assets.bitcoin.quantity])

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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Bitcoin</h1>

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
            <p className="text-sm text-muted-foreground">Estimated value (uses live or session rates)</p>
            <div className="flex items-center gap-2 flex-wrap">
              {ratesLoading && (
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="space-y-1">
                <p className="text-2xl font-semibold">
                  {inrValue != null
                    ? `₹${inrValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {usdValue != null
                    ? `USD value: US$${usdValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'USD value: —'}
                </p>
                {btcUsd != null && (
                  <p className="text-xs text-muted-foreground">
                    BTC/USD (effective):{' '}
                    {btcUsd.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
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
