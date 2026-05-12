import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useLivePrices } from '@/context/LivePricesContext'
import { parseFinancialInput } from '@/lib/financials'

/** Match read‑only display; `parseFinancialInput` accepts grouping commas on Apply. */
function formatFxDraft(value: number | null): string {
  if (value == null) return ''
  return value.toLocaleString('en-IN', { maximumFractionDigits: 4 })
}

function formatBtcDraft(value: number | null): string {
  if (value == null) return ''
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

/**
 * Settings → Live rates: merged live quotes + session-only overrides (Phase 38).
 * FX + BTC only — gold/silver spot live on the Gold & Silver tab.
 */
export function SettingsLiveRatesCard() {
  const {
    btcUsd,
    usdInr,
    aedInr,
    eurInr,
    gbpInr,
    sgdInr,
    btcLoading,
    forexLoading,
    btcError,
    forexError,
    setSessionRates,
    clearSessionRates,
  } = useLivePrices()

  const [liveRatesEditing, setLiveRatesEditing] = useState(false)
  const [sessionUsdInr, setSessionUsdInr] = useState('')
  const [sessionAedInr, setSessionAedInr] = useState('')
  const [sessionEurInr, setSessionEurInr] = useState('')
  const [sessionGbpInr, setSessionGbpInr] = useState('')
  const [sessionSgdInr, setSessionSgdInr] = useState('')
  const [sessionBtcUsd, setSessionBtcUsd] = useState('')

  const resetDraftInputs = () => {
    setSessionUsdInr('')
    setSessionAedInr('')
    setSessionEurInr('')
    setSessionGbpInr('')
    setSessionSgdInr('')
    setSessionBtcUsd('')
  }

  /** Seeds manual inputs with effective rates (live ∪ session) — same numbers as read-only rows. */
  const prefillDraftsFromEffectiveRates = () => {
    setSessionUsdInr(formatFxDraft(usdInr))
    setSessionAedInr(formatFxDraft(aedInr))
    setSessionEurInr(formatFxDraft(eurInr))
    setSessionGbpInr(formatFxDraft(gbpInr))
    setSessionSgdInr(formatFxDraft(sgdInr))
    setSessionBtcUsd(formatBtcDraft(btcUsd))
  }

  const applySessionRates = () => {
    const partial: Parameters<typeof setSessionRates>[0] = {}
    if (sessionUsdInr.trim()) partial.usdInr = parseFinancialInput(sessionUsdInr)
    if (sessionAedInr.trim()) partial.aedInr = parseFinancialInput(sessionAedInr)
    if (sessionEurInr.trim()) partial.eurInr = parseFinancialInput(sessionEurInr)
    if (sessionGbpInr.trim()) partial.gbpInr = parseFinancialInput(sessionGbpInr)
    if (sessionSgdInr.trim()) partial.sgdInr = parseFinancialInput(sessionSgdInr)
    if (sessionBtcUsd.trim()) partial.btcUsd = parseFinancialInput(sessionBtcUsd)
    setSessionRates(partial)
    setLiveRatesEditing(false)
    resetDraftInputs()
  }

  const onCancelEdit = () => {
    setLiveRatesEditing(false)
    resetDraftInputs()
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Market & session rates
            </p>
            <p className="mt-1 max-w-[640px] text-sm text-muted-foreground">
              Live forex and Bitcoin quotes refresh automatically. Session overrides apply only in this
              browser session — they are not saved to your data file or export.
            </p>
          </div>
          {!liveRatesEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start"
              onClick={() => {
                prefillDraftsFromEffectiveRates()
                setLiveRatesEditing(true)
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>

        {!liveRatesEditing ? (
          <>
            <dl className="space-y-2 text-sm" aria-live="polite">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">USD → INR (₹ per $1)</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  {forexLoading && !usdInr ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span className="text-muted-foreground">Loading…</span>
                    </>
                  ) : usdInr != null ? (
                    usdInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">AED → INR (₹ per 1 AED)</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  {forexLoading && !aedInr ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span className="text-muted-foreground">Loading…</span>
                    </>
                  ) : aedInr != null ? (
                    aedInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">EUR → INR (₹ per 1 EUR)</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  {forexLoading && !eurInr ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span className="text-muted-foreground">Loading…</span>
                    </>
                  ) : eurInr != null ? (
                    eurInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">GBP → INR (₹ per 1 GBP)</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  {forexLoading && !gbpInr ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span className="text-muted-foreground">Loading…</span>
                    </>
                  ) : gbpInr != null ? (
                    gbpInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">SGD → INR (₹ per 1 SGD)</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  {forexLoading && !sgdInr ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span className="text-muted-foreground">Loading…</span>
                    </>
                  ) : sgdInr != null ? (
                    sgdInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">BTC / USD</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  {btcLoading && !btcUsd ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span className="text-muted-foreground">Loading…</span>
                    </>
                  ) : btcUsd != null ? (
                    btcUsd.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
            </dl>
            {(btcError || forexError) && (
              <p role="alert" className="text-sm text-destructive">
                Could not load market rates. You can enter session-only rates — open Edit above.
                {btcError ? ` BTC: ${btcError}` : ''}
                {forexError ? ` Forex: ${forexError}` : ''}
              </p>
            )}
          </>
        ) : (
          <>
            <p id="session-rates-explainer" className="text-sm text-muted-foreground">
              These values stay in memory only. They are not saved to your data file or export, and
              they clear when you reload the page. When live feeds succeed again, session overrides for
              that channel are dropped automatically.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="session-usd-inr">USD → INR (manual)</Label>
                <Input
                  id="session-usd-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 83.12"
                  value={sessionUsdInr}
                  onChange={e => setSessionUsdInr(e.target.value)}
                  aria-describedby="session-rates-explainer"
                />
              </div>
              <div>
                <Label htmlFor="session-aed-inr">AED → INR (manual)</Label>
                <Input
                  id="session-aed-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 22.65"
                  value={sessionAedInr}
                  onChange={e => setSessionAedInr(e.target.value)}
                  aria-describedby="session-rates-explainer"
                />
              </div>
              <div>
                <Label htmlFor="session-eur-inr">EUR → INR (manual)</Label>
                <Input
                  id="session-eur-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 90.50"
                  value={sessionEurInr}
                  onChange={e => setSessionEurInr(e.target.value)}
                  aria-describedby="session-rates-explainer"
                />
              </div>
              <div>
                <Label htmlFor="session-gbp-inr">GBP → INR (manual)</Label>
                <Input
                  id="session-gbp-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 106.20"
                  value={sessionGbpInr}
                  onChange={e => setSessionGbpInr(e.target.value)}
                  aria-describedby="session-rates-explainer"
                />
              </div>
              <div>
                <Label htmlFor="session-sgd-inr">SGD → INR (manual)</Label>
                <Input
                  id="session-sgd-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 62.40"
                  value={sessionSgdInr}
                  onChange={e => setSessionSgdInr(e.target.value)}
                  aria-describedby="session-rates-explainer"
                />
              </div>
              <div>
                <Label htmlFor="session-btc-usd">BTC / USD (manual)</Label>
                <Input
                  id="session-btc-usd"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 98,000"
                  value={sessionBtcUsd}
                  onChange={e => setSessionBtcUsd(e.target.value)}
                  aria-describedby="session-rates-explainer"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={applySessionRates}>
                  Apply session rates
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    clearSessionRates()
                    resetDraftInputs()
                  }}
                >
                  Clear session rates
                </Button>
                <Button type="button" variant="ghost" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
