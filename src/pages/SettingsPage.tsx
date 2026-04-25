import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData } from '@/context/AppDataContext'
import { parseFinancialInput, nowIso } from '@/lib/financials'
import type { AppData } from '@/types/data'

// ── Export handler (D-18 — keep exactly as original) ─────────────────────────

function handleExport(data: AppData) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wealth-tracker-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Form schemas (string inputs — parse to number on submit) ─────────────────
// NEVER use z.number() for form fields bound to text inputs (see RESEARCH.md Pitfall 1)

const goldPricesSchema = z.object({
  k24: z.string().min(1, 'This field is required.'),
  k22: z.string().min(1, 'This field is required.'),
  k18: z.string().min(1, 'This field is required.'),
})
type GoldPricesValues = z.infer<typeof goldPricesSchema>

const retirementSchema = z.object({
  currentAge: z.string().min(1, 'This field is required.'),
  targetAge: z.string().min(1, 'This field is required.'),
  npsReturnPct: z.string().min(1, 'This field is required.'),
  epfRatePct: z.string().min(1, 'This field is required.'),
})
type RetirementValues = z.infer<typeof retirementSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { data, saveData } = useAppData()

  // Per-block save state (D-19 — separate Save buttons, not one global Save)
  const [goldSaving, setGoldSaving] = useState(false)
  const [goldSaveError, setGoldSaveError] = useState<string | null>(null)
  const [retirementSaving, setRetirementSaving] = useState(false)
  const [retirementSaveError, setRetirementSaveError] = useState<string | null>(null)

  // Block 1: Gold Prices form (D-16)
  const goldForm = useForm<GoldPricesValues>({
    resolver: zodResolver(goldPricesSchema),
    defaultValues: { k24: '', k22: '', k18: '' },
  })

  // Block 2: Retirement Assumptions form (D-17)
  const retirementForm = useForm<RetirementValues>({
    resolver: zodResolver(retirementSchema),
    defaultValues: { currentAge: '', targetAge: '', npsReturnPct: '', epfRatePct: '' },
  })

  // Hydrate from server when settings slices load or update (separate deps avoid wiping the other block on save)
  useEffect(() => {
    const gp = data.settings.goldPrices
    if (gp) {
      goldForm.reset({
        k24: String(gp.k24),
        k22: String(gp.k22),
        k18: String(gp.k18),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when persisted gold prices change
  }, [data.settings.goldPrices])

  useEffect(() => {
    const ra = data.settings.retirement
    if (ra) {
      retirementForm.reset({
        currentAge: String(ra.currentAge),
        targetAge: String(ra.targetAge),
        npsReturnPct: String(ra.npsReturnPct),
        epfRatePct: String(ra.epfRatePct),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when persisted retirement block changes
  }, [data.settings.retirement])

  // Block 1: Save gold prices
  const onGoldSubmit = async (values: GoldPricesValues) => {
    setGoldSaveError(null) // clear error on each attempt (D-20)
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
        },
      })
    } catch {
      setGoldSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setGoldSaving(false)
    }
  }

  // Block 2: Save retirement assumptions
  const onRetirementSubmit = async (values: RetirementValues) => {
    setRetirementSaveError(null) // clear error on each attempt (D-20)
    setRetirementSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          retirement: {
            currentAge: parseFinancialInput(values.currentAge),
            targetAge: parseFinancialInput(values.targetAge),
            npsReturnPct: parseFinancialInput(values.npsReturnPct),
            epfRatePct: parseFinancialInput(values.epfRatePct),
          },
          updatedAt: now,
        },
      })
    } catch {
      setRetirementSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setRetirementSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Block 1: Gold Prices (D-16) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-4">Gold Prices</p>
          <form onSubmit={goldForm.handleSubmit(onGoldSubmit)} className="space-y-4">
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
            </div>
            {goldSaveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {goldSaveError}
              </p>
            )}
            <Button type="submit" disabled={goldSaving}>
              {goldSaving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Block 2: Retirement Assumptions (D-17) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-4">Retirement Assumptions</p>
          <form onSubmit={retirementForm.handleSubmit(onRetirementSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="text"
                inputMode="numeric"
                placeholder="35"
                {...retirementForm.register('currentAge')}
                aria-invalid={!!retirementForm.formState.errors.currentAge}
                className={retirementForm.formState.errors.currentAge ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.currentAge && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.currentAge.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="targetAge">Target Retirement Age</Label>
              <Input
                id="targetAge"
                type="text"
                inputMode="numeric"
                placeholder="60"
                {...retirementForm.register('targetAge')}
                aria-invalid={!!retirementForm.formState.errors.targetAge}
                className={retirementForm.formState.errors.targetAge ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.targetAge && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.targetAge.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="npsReturnPct">NPS Annual Return (%)</Label>
              <Input
                id="npsReturnPct"
                type="text"
                inputMode="decimal"
                placeholder="10"
                {...retirementForm.register('npsReturnPct')}
                aria-invalid={!!retirementForm.formState.errors.npsReturnPct}
                className={retirementForm.formState.errors.npsReturnPct ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.npsReturnPct && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.npsReturnPct.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="epfRatePct">EPF Annual Rate (%)</Label>
              <Input
                id="epfRatePct"
                type="text"
                inputMode="decimal"
                placeholder="8.15"
                {...retirementForm.register('epfRatePct')}
                aria-invalid={!!retirementForm.formState.errors.epfRatePct}
                className={retirementForm.formState.errors.epfRatePct ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.epfRatePct && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.epfRatePct.message}
                </p>
              )}
            </div>
            {retirementSaveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {retirementSaveError}
              </p>
            )}
            <Button type="submit" disabled={retirementSaving}>
              {retirementSaving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Block 3: Data (D-18 — Export Data button, keep as-is) */}
      <div>
        <p className="text-sm font-semibold mb-4">Data</p>
        <Button variant="outline" aria-label="Export data as JSON" onClick={() => handleExport(data)}>
          Export Data
        </Button>
      </div>
    </div>
  )
}
