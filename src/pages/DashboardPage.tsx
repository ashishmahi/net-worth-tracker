import { useMemo, useState, useCallback } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { SectionKey } from '@/components/AppSidebar'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import {
  DASHBOARD_CATEGORY_ORDER,
  calcCategoryTotals,
  hasAedAccountsWithMissingRate,
  percentOfTotal,
  sumForNetWorth,
  type DashboardCategoryKey,
} from '@/lib/dashboardCalcs'
import { roundCurrency } from '@/lib/financials'
import type { AppData } from '@/types/data'
import { NetWorthOverTimeCard } from '@/components/NetWorthOverTimeCard'

const ROW_LABEL: Record<DashboardCategoryKey, string> = {
  gold: 'Gold',
  otherCommodities: 'Commodities',
  mutualFunds: 'Mutual Funds',
  stocks: 'Stocks',
  bitcoin: 'Bitcoin',
  property: 'Property',
  bankSavings: 'Bank Savings',
  retirement: 'Retirement',
}

const NAV_KEY: Record<DashboardCategoryKey, SectionKey> = {
  gold: 'gold',
  otherCommodities: 'settings',
  mutualFunds: 'mutualFunds',
  stocks: 'stocks',
  bitcoin: 'bitcoin',
  property: 'property',
  bankSavings: 'bankSavings',
  retirement: 'retirement',
}

function inrNoDecimals(n: number) {
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

function noHoldingsYet(data: AppData): boolean {
  return (
    data.assets.gold.items.length === 0 &&
    data.assets.otherCommodities.items.length === 0 &&
    data.assets.mutualFunds.platforms.length === 0 &&
    data.assets.stocks.platforms.length === 0 &&
    data.assets.bitcoin.quantity === 0 &&
    data.assets.property.items.length === 0 &&
    data.assets.bankSavings.accounts.length === 0 &&
    data.assets.retirement.nps === 0 &&
    data.assets.retirement.epf === 0
  )
}

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (key: SectionKey) => void
}) {
  const { data, saveData } = useAppData()
  const [isRecording, setIsRecording] = useState(false)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)
  const [snapshotSaved, setSnapshotSaved] = useState(false)
  const {
    btcUsd,
    usdInr,
    aedInr,
    btcLoading,
    forexLoading,
    silverUsdPerOz,
    silverLoading,
    silverError,
  } = useLivePrices()

  const totals = useMemo(
    () =>
      calcCategoryTotals(data, {
        btcUsd,
        usdInr,
        aedInr,
        silverUsdPerOz,
      }),
    [data, btcUsd, usdInr, aedInr, silverUsdPerOz]
  )
  const grandTotal = useMemo(() => sumForNetWorth(totals), [totals])
  const hasBtcHolding = data.assets.bitcoin.quantity > 0
  const hasAed =
    data.assets.bankSavings.accounts.some(a => a.currency === 'AED')
  const hasSilverItems = data.assets.otherCommodities.items.some(
    i => i.type === 'standard'
  )
  const showNetWorthSkeleton =
    (hasBtcHolding && btcLoading) ||
    (hasAed && forexLoading) ||
    (hasSilverItems && silverLoading)
  const aedRateMissing = hasAedAccountsWithMissingRate(data, aedInr)

  const excludedNames: string[] = []
  if (totals.gold === null && data.assets.gold.items.length > 0) {
    excludedNames.push('Gold')
  }
  if (totals.bitcoin === null && hasBtcHolding) {
    excludedNames.push('Bitcoin')
  }
  if (totals.otherCommodities === null) {
    excludedNames.push('Commodities')
  }

  const showExclusionNote = excludedNames.length > 0

  const empty = noHoldingsYet(data)

  const canRecordSnapshot = useMemo(() => {
    return (
      !empty &&
      !showNetWorthSkeleton &&
      excludedNames.length === 0 &&
      !hasAedAccountsWithMissingRate(data, aedInr)
    )
  }, [
    empty,
    showNetWorthSkeleton,
    excludedNames.length,
    data,
    aedInr,
  ])

  const recordBlockedMessage =
    !empty && !canRecordSnapshot
      ? showNetWorthSkeleton
        ? 'Waiting for live prices…'
        : excludedNames.length > 0
          ? 'Cannot record while part of your net worth is excluded from the total. Use Settings for gold prices or wait for rates.'
          : hasAedAccountsWithMissingRate(data, aedInr)
            ? 'Cannot record while AED balances lack an exchange rate.'
            : null
      : null

  const handleRecordSnapshot = useCallback(async () => {
    setSnapshotError(null)
    setSnapshotSaved(false)
    setIsRecording(true)
    try {
      const totalInr = roundCurrency(sumForNetWorth(totals))
      await saveData({
        ...data,
        netWorthHistory: [
          ...data.netWorthHistory,
          {
            recordedAt: new Date().toISOString(),
            totalInr,
          },
        ],
      })
      setSnapshotSaved(true)
    } catch {
      setSnapshotError(
        'Could not save snapshot. Check that the app is running and try again.'
      )
    } finally {
      setIsRecording(false)
    }
  }, [data, saveData, totals])

  return (
    <div className="space-y-4" aria-live="polite">
      <PageHeader title="Dashboard" />

      {empty ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold">No holdings yet</p>
          <p className="text-sm text-muted-foreground">
            Add assets in each section; your total will show here.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="space-y-1 p-6">
              <CardDescription className="text-sm text-muted-foreground">
                Net worth
              </CardDescription>
              {showNetWorthSkeleton ? (
                <Skeleton className="h-8 w-40" />
              ) : (
                <CardTitle className="text-2xl font-semibold">
                  {inrNoDecimals(grandTotal)}
                </CardTitle>
              )}
            </CardHeader>
            {showExclusionNote && (
              <CardContent className="px-6 pt-0 pb-6 text-sm text-muted-foreground">
                Total excludes {excludedNames.join(' and ')} because a rate or
                price is missing. Open{' '}
                <span className="font-medium text-foreground">Settings</span> to
                set gold prices or check live rates, or try again later.
              </CardContent>
            )}
          </Card>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!canRecordSnapshot || isRecording}
                onClick={() => void handleRecordSnapshot()}
                aria-busy={isRecording}
              >
                {isRecording ? (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden
                  />
                ) : null}
                Record snapshot
              </Button>
            </div>
            {recordBlockedMessage ? (
              <p className="text-sm text-muted-foreground">
                {recordBlockedMessage}
              </p>
            ) : null}
            {snapshotError ? (
              <p className="text-sm text-destructive" role="alert">
                {snapshotError}
              </p>
            ) : null}
            {snapshotSaved ? (
              <p className="text-sm text-muted-foreground" role="status">
                Snapshot saved.
              </p>
            ) : null}
          </div>

          <NetWorthOverTimeCard
            history={data.netWorthHistory}
            recordBlockedMessage={recordBlockedMessage}
          />

          <Card>
            <CardContent className="p-0">
              {DASHBOARD_CATEGORY_ORDER.map((key, index) => {
                const label = ROW_LABEL[key]
                const v = totals[key]
                const pct = percentOfTotal(
                  v === null ? 0 : v,
                  grandTotal
                )
                const isGoldRow = key === 'gold'
                const isBtcRow = key === 'bitcoin'
                const isBankRow = key === 'bankSavings'
                const isCommoditiesRow = key === 'otherCommodities'

                const valueSkeleton = isBtcRow
                  ? btcLoading || (forexLoading && hasBtcHolding)
                  : isBankRow && forexLoading && hasAed
                const showEmDash = v === null
                return (
                  <div key={key}>
                    {index > 0 && <Separator />}
                    <button
                      type="button"
                      className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors"
                      onClick={() => onNavigate(NAV_KEY[key])}
                      aria-label={`Open ${label} section`}
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-semibold block">{label}</span>
                        {isBankRow && aedRateMissing && (
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            AED balances excluded — rate unavailable
                          </span>
                        )}
                        {isGoldRow && totals.gold === null && !empty && (
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            Set gold prices in Settings
                          </span>
                        )}
                        {isCommoditiesRow &&
                          silverError != null &&
                          hasSilverItems && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              Silver price unavailable — silver items excluded
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        {valueSkeleton ? (
                          <Skeleton className="h-5 w-24 inline-block" />
                        ) : showEmDash ? (
                          <span
                            className="text-sm font-normal inline-flex items-center gap-1 tabular-nums"
                            aria-label={`${label} value unavailable`}
                          >
                            <span>—</span>
                            <AlertCircle
                              className="h-3.5 w-3.5 text-muted-foreground"
                              aria-hidden
                            />
                          </span>
                        ) : (
                          <span className="text-sm font-normal tabular-nums">
                            {inrNoDecimals(v as number)}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground w-10 text-right">
                          {grandTotal <= 0
                            ? '—'
                            : v === null
                              ? '—'
                              : `${Math.round(pct)}%`}
                        </span>
                      </div>
                    </button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
