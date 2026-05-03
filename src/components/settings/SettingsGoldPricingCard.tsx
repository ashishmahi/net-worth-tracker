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
import {
  formatInrPerGramInput,
  liveInrPerGramForKarat,
  shouldAutoSyncGoldFromSpot,
} from '@/lib/goldLiveHints'
import type { AppData } from '@/types/data'

const goldPricesSchema = z.object({
  k24: z.string().min(1, 'This field is required.'),
  k22: z.string().min(1, 'This field is required.'),
  k18: z.string().min(1, 'This field is required.'),
})
type GoldPricesValues = z.infer<typeof goldPricesSchema>

function effectiveGoldSnapshot(
  settings: AppData['settings'],
  k24Hint: number | null,
  k22Hint: number | null,
  k18Hint: number | null
): GoldPricesValues {
  const gp = settings.goldPrices
  if (gp) {
    return {
      k24: formatInrPerGramInput(gp.k24),
      k22: formatInrPerGramInput(gp.k22),
      k18: formatInrPerGramInput(gp.k18),
    }
  }
  if (k24Hint != null && k22Hint != null && k18Hint != null) {
    return {
      k24: formatInrPerGramInput(k24Hint),
      k22: formatInrPerGramInput(k22Hint),
      k18: formatInrPerGramInput(k18Hint),
    }
  }
  return { k24: '', k22: '', k18: '' }
}

function goldSourceLabel(settings: AppData['settings']): string {
  if (settings.goldPricesLocked) return 'Saved (locked)'
  if (settings.goldPrices) return 'Saved'
  return 'Live'
}

export function SettingsGoldPricingCard() {
  const { data, saveData } = useAppData()
  const {
    usdInr,
    forexLoading,
    goldUsdPerOz,
    goldLoading,
    goldError,
  } = useLivePrices()

  const { k24Hint, k22Hint, k18Hint } = useMemo(() => {
    if (goldUsdPerOz == null || usdInr == null) {
      return {
        k24Hint: null as number | null,
        k22Hint: null as number | null,
        k18Hint: null as number | null,
      }
    }
    return {
      k24Hint: liveInrPerGramForKarat(goldUsdPerOz, usdInr, 24),
      k22Hint: liveInrPerGramForKarat(goldUsdPerOz, usdInr, 22),
      k18Hint: liveInrPerGramForKarat(goldUsdPerOz, usdInr, 18),
    }
  }, [goldUsdPerOz, usdInr])

  const goldHintLoading =
    !goldError &&
    ((goldLoading && goldUsdPerOz == null) || (forexLoading && usdInr == null))

  const hasSavedGoldPrices = Boolean(data.settings.goldPrices)
  const goldSpotAutoSync = shouldAutoSyncGoldFromSpot(data.settings)

  const pricingHealthyGold =
    !goldHintLoading &&
    goldUsdPerOz != null &&
    usdInr != null &&
    !goldError

  const [goldPricingEditing, setGoldPricingEditing] = useState(false)
  const [goldSaving, setGoldSaving] = useState(false)
  const [goldSaveError, setGoldSaveError] = useState<string | null>(null)

  const showGoldReadOnly = pricingHealthyGold && !goldPricingEditing
  const showGoldEditForm =
    !goldHintLoading && (!pricingHealthyGold || goldPricingEditing)

  const goldForm = useForm<GoldPricesValues>({
    resolver: zodResolver(goldPricesSchema),
    defaultValues: { k24: '', k22: '', k18: '' },
  })

  const { isDirty: goldFormIsDirty } = useFormState({ control: goldForm.control })

  useEffect(() => {
    if (!showGoldEditForm) return
    const gp = data.settings.goldPrices
    if (gp) {
      // Do not clobber draft edits — live sync updates goldPrices often while user types.
      if (!goldFormIsDirty) {
        goldForm.reset({
          k24: String(gp.k24),
          k22: String(gp.k22),
          k18: String(gp.k18),
        })
      }
      return
    }
    if (goldError) {
      if (!goldFormIsDirty) {
        goldForm.reset({ k24: '', k22: '', k18: '' })
      }
      return
    }
    if (goldHintLoading) {
      return
    }
    if (k24Hint != null && k22Hint != null && k18Hint != null) {
      if (!goldFormIsDirty) {
        goldForm.reset({
          k24: formatInrPerGramInput(k24Hint),
          k22: formatInrPerGramInput(k22Hint),
          k18: formatInrPerGramInput(k18Hint),
        })
      }
      return
    }
    if (!goldFormIsDirty) {
      goldForm.reset({ k24: '', k22: '', k18: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- goldForm.reset is stable; sync rules above
  }, [
    data.settings.goldPrices,
    k24Hint,
    k22Hint,
    k18Hint,
    goldHintLoading,
    goldError,
    goldFormIsDirty,
    showGoldEditForm,
  ])

  const onUseLiveGoldSpot = async () => {
    if (k24Hint == null || k22Hint == null || k18Hint == null) return
    setGoldSaveError(null)
    setGoldSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          goldPrices: {
            k24: k24Hint,
            k22: k22Hint,
            k18: k18Hint,
          },
          goldPricesLocked: false,
          updatedAt: now,
        },
      })
    } catch {
      setGoldSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setGoldSaving(false)
    }
  }

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
          goldPricesLocked: true,
          updatedAt: now,
        },
      })
      setGoldPricingEditing(false)
    } catch {
      setGoldSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setGoldSaving(false)
    }
  }

  const snap = effectiveGoldSnapshot(data.settings, k24Hint, k22Hint, k18Hint)
  const eff = data.settings.goldPrices ?? (
    k24Hint != null && k22Hint != null && k18Hint != null
      ? { k24: k24Hint, k22: k22Hint, k18: k18Hint }
      : null
  )

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm font-semibold">Gold prices (₹/g)</p>
          {showGoldReadOnly ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start"
              disabled={goldSaving}
              onClick={() => {
                setGoldPricingEditing(true)
                goldForm.reset(effectiveGoldSnapshot(data.settings, k24Hint, k22Hint, k18Hint))
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
        {goldError && (
          <p role="alert" className="text-sm text-destructive mb-2">
            {goldError}
          </p>
        )}
        {!hasSavedGoldPrices && !goldError && goldHintLoading && (
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
            <span>Loading live spot for defaults…</span>
          </p>
        )}
        {!hasSavedGoldPrices && !goldError && !goldHintLoading && k24Hint != null && (
          <p className="text-sm text-muted-foreground mb-2">
            Live ₹/g from spot (XAU × USD→INR) saves automatically for net worth. Save below only if
            you want to lock custom prices.
          </p>
        )}
        {!goldSpotAutoSync && k24Hint != null && !goldError && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              Gold prices are fixed. Resume tracking live spot to update stored ₹/g when the market
              moves.
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={goldSaving || goldHintLoading}
              onClick={() => void onUseLiveGoldSpot()}
            >
              Use live spot
            </Button>
          </div>
        )}
        {showGoldReadOnly && eff ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{goldSourceLabel(data.settings)}</span>
            {' · '}
            24K {eff.k24.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · 22K{' '}
            {eff.k22.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · 18K{' '}
            {eff.k18.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        ) : null}
        {showGoldEditForm ? (
          <form
            onSubmit={goldForm.handleSubmit(onGoldSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="k24">24K price per gram (₹)</Label>
              <Input
                id="k24"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 7,200"
                {...goldForm.register('k24')}
                aria-invalid={!!goldForm.formState.errors.k24}
                className={goldForm.formState.errors.k24 ? 'border-destructive' : ''}
              />
              {goldForm.formState.errors.k24 && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {goldForm.formState.errors.k24.message}
                </p>
              )}
              {hasSavedGoldPrices &&
                !goldError &&
                (goldHintLoading ? (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Loading…</span>
                  </p>
                ) : k24Hint != null ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Live: ≈{' '}
                    {k24Hint.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ₹/g
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">—</p>
                ))}
            </div>
            <div>
              <Label htmlFor="k22">22K price per gram (₹)</Label>
              <Input
                id="k22"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 6,600"
                {...goldForm.register('k22')}
                aria-invalid={!!goldForm.formState.errors.k22}
                className={goldForm.formState.errors.k22 ? 'border-destructive' : ''}
              />
              {goldForm.formState.errors.k22 && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {goldForm.formState.errors.k22.message}
                </p>
              )}
              {hasSavedGoldPrices &&
                !goldError &&
                (goldHintLoading ? (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Loading…</span>
                  </p>
                ) : k22Hint != null ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Live: ≈{' '}
                    {k22Hint.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ₹/g
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">—</p>
                ))}
            </div>
            <div>
              <Label htmlFor="k18">18K price per gram (₹)</Label>
              <Input
                id="k18"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 5,000"
                {...goldForm.register('k18')}
                aria-invalid={!!goldForm.formState.errors.k18}
                className={goldForm.formState.errors.k18 ? 'border-destructive' : ''}
              />
              {goldForm.formState.errors.k18 && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {goldForm.formState.errors.k18.message}
                </p>
              )}
              {hasSavedGoldPrices &&
                !goldError &&
                (goldHintLoading ? (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Loading…</span>
                  </p>
                ) : k18Hint != null ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Live: ≈{' '}
                    {k18Hint.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ₹/g
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">—</p>
                ))}
            </div>
            {goldSaveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {goldSaveError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {pricingHealthyGold ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={goldSaving}
                  onClick={() => {
                    setGoldPricingEditing(false)
                    goldForm.reset(snap)
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={goldSaving}>
                {goldSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
