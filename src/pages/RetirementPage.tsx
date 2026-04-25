import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData } from '@/context/AppDataContext'
import { parseFinancialInput, roundCurrency, calcProjectedCorpus, nowIso } from '@/lib/financials'

// ── Form schema (string inputs — parse to number on submit) ───────────────────
// NEVER use z.number() for form fields (RESEARCH.md Pitfall 1)

const retirementFormSchema = z.object({
  nps: z.string().min(1, 'This field is required.'),
  epf: z.string().min(1, 'This field is required.'),
})
type RetirementFormValues = z.infer<typeof retirementFormSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function RetirementPage() {
  const { data, saveData } = useAppData()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RetirementFormValues>({
    resolver: zodResolver(retirementFormSchema),
    defaultValues: { nps: '', epf: '' },
  })

  // Sync form when loaded/saved balance data changes (avoids empty mount before fetch completes)
  useEffect(() => {
    const r = data.assets.retirement
    reset({
      nps: r.nps > 0 ? String(r.nps) : '',
      epf: r.epf > 0 ? String(r.epf) : '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when persisted retirement balances change
  }, [data.assets.retirement.nps, data.assets.retirement.epf])

  // ── Save handler ──────────────────────────────────────────────────────────

  const onSubmit = async (values: RetirementFormValues) => {
    setSaveError(null) // clear error on each attempt (D-20)
    setSaving(true)
    try {
      const now = nowIso()
      const nps = parseFinancialInput(values.nps)
      const epf = parseFinancialInput(values.epf)
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          retirement: {
            ...data.assets.retirement,
            nps,
            epf,
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

  // ── Projected corpus (computed at render — never stored per CLAUDE.md) ────
  // D-14: balance × (1 + rate/100) ^ (targetAge − currentAge)

  const ra = data.settings.retirement
  const hasAssumptions = !!(ra && ra.currentAge > 0 && ra.targetAge > ra.currentAge)
  const years = hasAssumptions ? ra!.targetAge - ra!.currentAge : 0
  const retirement = data.assets.retirement
  const projectedNps = hasAssumptions
    ? calcProjectedCorpus(retirement.nps, ra!.npsReturnPct, years)
    : 0
  const projectedEpf = hasAssumptions
    ? calcProjectedCorpus(retirement.epf, ra!.epfRatePct, years)
    : 0
  const projectedTotal = roundCurrency(projectedNps + projectedEpf)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Retirement</h1>

      {/* Inline form — NPS and EPF current balances (D-13) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-4">Current Balances</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="nps">NPS Current Balance (₹)</Label>
              <Input
                id="nps"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 5,00,000"
                {...register('nps')}
                aria-invalid={!!errors.nps}
                className={errors.nps ? 'border-destructive' : ''}
              />
              {errors.nps && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.nps.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="epf">EPF Current Balance (₹)</Label>
              <Input
                id="epf"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 8,00,000"
                {...register('epf')}
                aria-invalid={!!errors.epf}
                className={errors.epf ? 'border-destructive' : ''}
              />
              {errors.epf && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.epf.message}
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
        </CardContent>
      </Card>

      {/* Projected corpus display card (D-14) — read-only, computed at render */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-semibold mb-4">Projected Corpus at Retirement</p>
          {hasAssumptions ? (
            <div className="space-y-1">
              <p className="text-sm">
                NPS{' '}
                {projectedNps.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm">
                EPF{' '}
                {projectedEpf.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xl font-semibold mt-2">
                Total{' '}
                {projectedTotal.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on current Settings assumptions
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure retirement assumptions in Settings to see projection.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
