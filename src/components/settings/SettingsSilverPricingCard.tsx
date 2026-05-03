import { useEffect, useMemo, useState } from 'react'
import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { parseFinancialInput, nowIso } from '@/lib/financials'
import { formatInrPerGramInput } from '@/lib/goldLiveHints'
import {
  effectiveSilverInrPerGramForNetWorth,
  liveSilverInrPerGram,
  shouldAutoSyncSilverFromSpot,
} from '@/lib/silverLiveHints'

const silverPriceSchema = z.object({
  silver: z.string().min(1, 'This field is required.'),
})
type SilverPriceValues = z.infer<typeof silverPriceSchema>

function silverSourceLabel(
  settings: { silverInrPerGram?: number; silverPricesLocked?: boolean }
): string {
  if (settings.silverPricesLocked) return 'Saved (locked)'
  if (settings.silverInrPerGram != null) return 'Saved'
  return 'Live'
}

export function SettingsSilverPricingCard() {
  const { data, saveData } = useAppData()
  const {
    usdInr,
    forexLoading,
    silverUsdPerOz,
    silverLoading,
    silverError,
  } = useLivePrices()

  const silverHintLoading =
    !silverError &&
    ((silverLoading && silverUsdPerOz == null) || (forexLoading && usdInr == null))

  const silverHint = useMemo(() => {
    if (silverUsdPerOz == null || usdInr == null) return null
    return liveSilverInrPerGram(silverUsdPerOz, usdInr)
  }, [silverUsdPerOz, usdInr])

  const pricingHealthySilver =
    !silverHintLoading &&
    silverUsdPerOz != null &&
    usdInr != null &&
    !silverError

  const [silverPricingEditing, setSilverPricingEditing] = useState(false)
  const [silverSaving, setSilverSaving] = useState(false)
  const [silverSaveError, setSilverSaveError] = useState<string | null>(null)

  const showSilverReadOnly = pricingHealthySilver && !silverPricingEditing
  const showSilverEditForm =
    !silverHintLoading && (!pricingHealthySilver || silverPricingEditing)

  const effectiveSilver = effectiveSilverInrPerGramForNetWorth(data.settings, {
    silverUsdPerOz,
    usdInr,
  })

  const silverSpotAutoSync = shouldAutoSyncSilverFromSpot(data.settings)

  const silverForm = useForm<SilverPriceValues>({
    resolver: zodResolver(silverPriceSchema),
    defaultValues: { silver: '' },
  })

  const { isDirty: silverFormIsDirty } = useFormState({ control: silverForm.control })

  useEffect(() => {
    if (!showSilverEditForm) return
    const s = data.settings.silverInrPerGram
    if (s != null && Number.isFinite(s)) {
      if (!silverFormIsDirty) {
        silverForm.reset({ silver: formatInrPerGramInput(s) })
      }
      return
    }
    if (silverError) {
      if (!silverFormIsDirty) {
        silverForm.reset({ silver: '' })
      }
      return
    }
    if (silverHintLoading) {
      return
    }
    if (silverHint != null && !silverFormIsDirty) {
      silverForm.reset({ silver: formatInrPerGramInput(silverHint) })
      return
    }
    if (!silverFormIsDirty) {
      silverForm.reset({ silver: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- silverForm.reset stable
  }, [
    data.settings.silverInrPerGram,
    silverHint,
    silverHintLoading,
    silverError,
    silverFormIsDirty,
    showSilverEditForm,
  ])

  const snapSilver = (): SilverPriceValues => {
    const s = data.settings.silverInrPerGram
    if (s != null && Number.isFinite(s)) {
      return { silver: formatInrPerGramInput(s) }
    }
    if (silverHint != null) {
      return { silver: formatInrPerGramInput(silverHint) }
    }
    return { silver: '' }
  }

  const onUseLiveSilverSpot = async () => {
    if (silverHint == null) return
    setSilverSaveError(null)
    setSilverSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          silverInrPerGram: silverHint,
          silverPricesLocked: false,
          updatedAt: now,
        },
      })
    } catch {
      setSilverSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSilverSaving(false)
    }
  }

  const onSilverSubmit = async (values: SilverPriceValues) => {
    setSilverSaveError(null)
    setSilverSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          silverInrPerGram: parseFinancialInput(values.silver),
          silverPricesLocked: true,
          updatedAt: now,
        },
      })
      setSilverPricingEditing(false)
    } catch {
      setSilverSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSilverSaving(false)
    }
  }

  const displayLine =
    effectiveSilver != null
      ? `${effectiveSilver.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ₹/g`
      : '—'

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm font-semibold">Silver price (₹/g)</p>
          {showSilverReadOnly ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start"
              disabled={silverSaving}
              onClick={() => {
                setSilverPricingEditing(true)
                silverForm.reset(snapSilver())
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
        {silverError && (
          <p role="alert" className="text-sm text-destructive mb-2">
            {silverError}
          </p>
        )}
        {silverHintLoading && !silverError && (
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
            <span>Loading…</span>
          </p>
        )}
        {!silverSpotAutoSync && silverHint != null && !silverError && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              Silver price is fixed. Resume tracking live spot to update stored ₹/g when the market
              moves.
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={silverSaving || silverHintLoading}
              onClick={() => void onUseLiveSilverSpot()}
            >
              Use live spot
            </Button>
          </div>
        )}
        {showSilverReadOnly ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {silverSourceLabel(data.settings)}
            </span>
            {' · '}
            {displayLine}
          </p>
        ) : null}
        {showSilverEditForm ? (
          <form
            onSubmit={silverForm.handleSubmit(onSilverSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="silverPrice">Price per gram (₹)</Label>
              <Input
                id="silverPrice"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 120"
                {...silverForm.register('silver')}
                aria-invalid={!!silverForm.formState.errors.silver}
                className={silverForm.formState.errors.silver ? 'border-destructive' : ''}
              />
              {silverForm.formState.errors.silver && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {silverForm.formState.errors.silver.message}
                </p>
              )}
              {data.settings.silverInrPerGram != null &&
                !silverError &&
                (silverHintLoading ? (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Loading…</span>
                  </p>
                ) : silverHint != null ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Live: ≈{' '}
                    {silverHint.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ₹/g
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">—</p>
                ))}
            </div>
            {silverSaveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {silverSaveError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {pricingHealthySilver ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={silverSaving}
                  onClick={() => {
                    setSilverPricingEditing(false)
                    silverForm.reset(snapSilver())
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={silverSaving}>
                {silverSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
