import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
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
import {
  calcNetWorth,
  debtToAssetRatio,
  sumAllDebtInr,
  sumLiabilitiesInr,
} from '@/lib/liabilityCalcs'
import { roundCurrency } from '@/lib/financials'
import type { AppData } from '@/types/data'
import { NetWorthOverTimeCard } from '@/components/NetWorthOverTimeCard'
import { AllocationRing } from '@/components/AllocationRing'
import { categoryOklch } from '@/lib/categoryColors'
import { sectionToPath } from '@/lib/sectionRoutes'
import { fmtCompactInr, fmtInr0, splitInrAmount } from '@/lib/wealthFormat'
import { cn } from '@/lib/utils'

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
  otherCommodities: 'commodities',
  mutualFunds: 'mutualFunds',
  stocks: 'stocks',
  bitcoin: 'bitcoin',
  property: 'property',
  bankSavings: 'bankSavings',
  retirement: 'retirement',
}

function rowSub(
  key: DashboardCategoryKey,
  data: AppData
): string | undefined {
  switch (key) {
    case 'gold':
      return data.assets.gold.items.length
        ? `${data.assets.gold.items.length} holding${data.assets.gold.items.length > 1 ? 's' : ''}`
        : undefined
    case 'otherCommodities':
      return data.assets.otherCommodities.items.length
        ? `${data.assets.otherCommodities.items.length} line${data.assets.otherCommodities.items.length > 1 ? 's' : ''}`
        : undefined
    case 'mutualFunds':
      return data.assets.mutualFunds.platforms.length
        ? `${data.assets.mutualFunds.platforms.length} platform${data.assets.mutualFunds.platforms.length > 1 ? 's' : ''}`
        : undefined
    case 'stocks':
      return data.assets.stocks.platforms.length
        ? `${data.assets.stocks.platforms.length} broker${data.assets.stocks.platforms.length > 1 ? 's' : ''}`
        : undefined
    case 'bitcoin':
      return data.assets.bitcoin.quantity > 0 ? 'BTC holding' : undefined
    case 'property':
      return data.assets.property.items.length
        ? `${data.assets.property.items.length} propert${data.assets.property.items.length > 1 ? 'ies' : 'y'}`
        : undefined
    case 'bankSavings':
      return data.assets.bankSavings.accounts.length
        ? `${data.assets.bankSavings.accounts.length} account${data.assets.bankSavings.accounts.length > 1 ? 's' : ''}`
        : undefined
    case 'retirement':
      return 'NPS · EPF'
    default:
      return undefined
  }
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
    data.assets.retirement.epf === 0 &&
    data.liabilities.length === 0
  )
}

const QUICK_START: {
  key: SectionKey
  label: string
  desc: string
  icon: string
}[] = [
  {
    key: 'bankSavings',
    label: 'Bank Savings',
    desc: 'Add INR or AED accounts',
    icon: '🏦',
  },
  {
    key: 'mutualFunds',
    label: 'Mutual Funds',
    desc: 'Add a platform and scheme',
    icon: '📈',
  },
  {
    key: 'gold',
    label: 'Gold',
    desc: 'Jewellery, coins or bars',
    icon: '🪙',
  },
  {
    key: 'stocks',
    label: 'Stocks',
    desc: 'Broker positions',
    icon: '📊',
  },
]

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
    goldUsdPerOz,
  } = useLivePrices()

  const totals = useMemo(
    () =>
      calcCategoryTotals(data, {
        btcUsd,
        usdInr,
        aedInr,
        silverUsdPerOz,
        goldUsdPerOz,
      }),
    [data, btcUsd, usdInr, aedInr, silverUsdPerOz, goldUsdPerOz],
  )
  const grossAssets = useMemo(() => sumForNetWorth(totals), [totals])
  const netWorth = useMemo(
    () => calcNetWorth(grossAssets, sumLiabilitiesInr(data)),
    [grossAssets, data]
  )
  const totalDebtAll = useMemo(() => sumAllDebtInr(data), [data])
  const hasBtcHolding = data.assets.bitcoin.quantity > 0
  const hasAed =
    data.assets.bankSavings.accounts.some(a => a.currency === 'AED')
  const hasSilverItems = data.assets.otherCommodities.items.some(
    i => i.type === 'standard'
  )
  const hasManualCommodityItems = data.assets.otherCommodities.items.some(
    i => i.type === 'manual'
  )
  const onlySilverStandardCommodities =
    hasSilverItems &&
    data.assets.otherCommodities.items.every(
      i => i.type === 'standard' && i.kind === 'silver'
    )
  const silverLockedRateReady =
    onlySilverStandardCommodities &&
    data.settings.silverPricesLocked === true &&
    data.settings.silverInrPerGram != null &&
    Number.isFinite(data.settings.silverInrPerGram)
  const showNetWorthSkeleton =
    (hasBtcHolding && btcLoading) ||
    (hasAed && forexLoading) ||
    (hasSilverItems && silverLoading && !silverLockedRateReady)
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

  const sortedHistory = useMemo(() => {
    return [...data.netWorthHistory].sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
  }, [data.netWorthHistory])

  const lastSnapshot = sortedHistory[sortedHistory.length - 1]
  const deltaVsSnapshot =
    lastSnapshot != null ? netWorth - lastSnapshot.totalInr : null
  const deltaPctVsSnapshot =
    lastSnapshot != null &&
    lastSnapshot.totalInr !== 0 &&
    deltaVsSnapshot != null
      ? (deltaVsSnapshot / Math.abs(lastSnapshot.totalInr)) * 100
      : null

  const ringSlices = useMemo(() => {
    return DASHBOARD_CATEGORY_ORDER.map(key => ({
      key,
      label: ROW_LABEL[key],
      value:
        totals[key] === null ? 0 : Math.max(0, totals[key] as number),
    })).filter(s => s.value > 0)
  }, [totals])

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
          ? 'Cannot record while part of your net worth is excluded from the total. Open Commodities for silver/manual holdings, Settings for gold prices, or wait for live rates.'
          : hasAedAccountsWithMissingRate(data, aedInr)
            ? 'Cannot record while AED balances lack an exchange rate.'
            : null
      : null

  const handleRecordSnapshot = useCallback(async () => {
    setSnapshotError(null)
    setSnapshotSaved(false)
    setIsRecording(true)
    try {
      const gross = sumForNetWorth(totals)
      const nw = calcNetWorth(gross, sumLiabilitiesInr(data))
      const totalInr = roundCurrency(nw)
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

  const debtRatioPct =
    grossAssets > 0
      ? Math.round(debtToAssetRatio(totalDebtAll, grossAssets))
      : 0

  const heroAmount = splitInrAmount(netWorth)

  if (empty) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1180px] flex-col gap-6"
        aria-live="polite"
      >
        <Card className="overflow-hidden border-border shadow-sm">
          <CardContent className="space-y-6 px-6 py-12 text-center sm:px-10">
            <div
              className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-3xl shadow-sm"
              aria-hidden
            >
              📒
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Start your wealth journal
            </h2>
            <p className="mx-auto max-w-[460px] text-sm leading-relaxed text-muted-foreground">
              Add holdings in any section below. Your net worth, allocation and
              trend will appear here — everything stays in this browser.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={() => onNavigate('bankSavings')}
                className="min-h-10 font-semibold"
              >
                ＋ Add first holding
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={sectionToPath('settings')}>Import a backup</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border shadow-sm">
          <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
            <h3 className="text-sm font-semibold">Quick start</h3>
            <span className="text-xs text-muted-foreground">
              Pick a section to begin
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {QUICK_START.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onNavigate(s.key)}
                className={cn(
                  'flex min-h-[64px] items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-muted/50',
                  i % 2 === 0 && 'sm:border-r sm:border-border',
                  i < QUICK_START.length - 2 && 'border-b border-border'
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{s.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.desc}
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[1180px] flex-col gap-6"
      aria-live="polite"
    >
      <Card className="overflow-hidden border-border bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-sm">
        <div className="grid md:grid-cols-[1.4fr_1fr]">
          <div className="border-border p-7 md:border-r">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Net worth
            </div>
            {showNetWorthSkeleton ? (
              <Skeleton className="mt-2 h-14 w-56 max-w-full" />
            ) : (
              <>
                <div className="mt-1.5 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
                  <span className="font-normal text-muted-foreground">
                    {heroAmount.symbol}
                  </span>
                  <span className="tabular-nums">{heroAmount.amount}</span>
                </div>
                {lastSnapshot != null &&
                deltaVsSnapshot != null &&
                deltaPctVsSnapshot != null ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                        deltaVsSnapshot >= 0
                          ? 'bg-[hsl(var(--positive)/0.14)] text-[hsl(var(--positive))]'
                          : 'bg-[hsl(var(--negative)/0.14)] text-[hsl(var(--negative))]'
                      )}
                    >
                      {deltaVsSnapshot >= 0 ? '▲' : '▼'}{' '}
                      {fmtCompactInr(Math.abs(deltaVsSnapshot))} (
                      {deltaPctVsSnapshot >= 0 ? '+' : ''}
                      {deltaPctVsSnapshot.toFixed(2)}%)
                    </span>
                    <span>vs last snapshot</span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Record a snapshot to track change over time.
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Gross assets
                    </div>
                    <div className="mt-0.5 text-base font-semibold tabular-nums">
                      {fmtCompactInr(grossAssets)}
                    </div>
                  </div>
                  {totalDebtAll > 0 ? (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total debt
                      </div>
                      <div className="mt-0.5 text-base font-semibold tabular-nums text-destructive">
                        {fmtCompactInr(totalDebtAll)}
                      </div>
                    </div>
                  ) : null}
                  {totalDebtAll > 0 ? (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Debt / asset
                      </div>
                      <div className="mt-0.5 text-base font-semibold tabular-nums">
                        {debtRatioPct}%
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    disabled={!canRecordSnapshot || isRecording}
                    onClick={() => void handleRecordSnapshot()}
                    aria-busy={isRecording}
                    className="min-h-10 min-w-[44px] font-semibold"
                  >
                    {isRecording ? (
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden
                      />
                    ) : null}
                    ＋ Record snapshot
                  </Button>
                  <Button variant="outline" asChild className="min-h-10">
                    <Link to={sectionToPath('settings')}>Export data</Link>
                  </Button>
                </div>
                {recordBlockedMessage ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {recordBlockedMessage}
                  </p>
                ) : null}
                {snapshotError ? (
                  <p className="mt-2 text-sm text-destructive" role="alert">
                    {snapshotError}
                  </p>
                ) : null}
                {snapshotSaved ? (
                  <p className="mt-2 text-sm text-muted-foreground" role="status">
                    Snapshot saved.
                  </p>
                ) : null}
              </>
            )}

            {showExclusionNote && (
              <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Total excludes {excludedNames.join(' and ')} because a rate or
                price is missing.
                {excludedNames.includes('Commodities') ? (
                  <>
                    {' '}
                    Use{' '}
                    <span className="font-medium text-foreground">
                      Commodities
                    </span>{' '}
                    for silver grams and manual ₹ values;{' '}
                    <span className="font-medium text-foreground">
                      Settings
                    </span>{' '}
                    for gold prices; wait or refresh for live silver/forex when
                    needed.
                  </>
                ) : (
                  <>
                    {' '}
                    Open{' '}
                    <span className="font-medium text-foreground">
                      Settings
                    </span>{' '}
                    to set gold prices or check live rates, or try again later.
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border bg-muted/20 p-7 md:border-t-0 md:border-l md:bg-transparent">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Allocation
            </div>
            <AllocationRing slices={ringSlices} />
          </div>
        </div>
      </Card>

      <NetWorthOverTimeCard
        history={data.netWorthHistory}
        recordBlockedMessage={recordBlockedMessage}
      />

      <Card className="overflow-hidden border-border shadow-sm">
        <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold">Breakdown</h3>
          <span className="text-xs text-muted-foreground">
            {DASHBOARD_CATEGORY_ORDER.length} categories · tap to open
          </span>
        </div>
        <CardContent className="p-0">
          {DASHBOARD_CATEGORY_ORDER.map((key, index) => {
            const label = ROW_LABEL[key]
            const v = totals[key]
            const pct = percentOfTotal(v === null ? 0 : v, grossAssets)
            const isGoldRow = key === 'gold'
            const isBtcRow = key === 'bitcoin'
            const isBankRow = key === 'bankSavings'
            const isCommoditiesRow = key === 'otherCommodities'
            const sub = rowSub(key, data)

            const valueSkeleton = isBtcRow
              ? btcLoading || (forexLoading && hasBtcHolding)
              : isBankRow && forexLoading && hasAed
            const showEmDash = v === null
            const catColor = categoryOklch(key)

            return (
              <div key={key}>
                {index > 0 && (
                  <div className="h-px bg-border" role="presentation" />
                )}
                <button
                  type="button"
                  className="grid w-full grid-cols-[24px_1fr_auto] items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 md:grid-cols-[28px_minmax(0,1.5fr)_80px_minmax(0,1fr)_110px_70px] md:gap-3.5 md:px-6"
                  onClick={() => onNavigate(NAV_KEY[key])}
                  aria-label={`Open ${label} section`}
                >
                  <span
                    className="size-[22px] shrink-0 rounded-md opacity-90"
                    style={{ background: catColor }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold leading-tight">
                      {label}
                    </div>
                    {sub ? (
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {sub}
                      </div>
                    ) : null}
                    {isBankRow && aedRateMissing && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        AED balances excluded — rate unavailable
                      </div>
                    )}
                    {isGoldRow && totals.gold === null && !empty && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Set gold prices in Settings
                      </div>
                    )}
                    {isCommoditiesRow &&
                      silverError != null &&
                      hasSilverItems && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Silver price unavailable — silver items excluded
                        </div>
                      )}
                    {isCommoditiesRow &&
                      hasSilverItems &&
                      hasManualCommodityItems && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Includes silver & manual
                        </div>
                      )}
                  </div>

                  <span className="hidden text-right text-xs font-medium text-muted-foreground md:block">
                    {grossAssets <= 0 || v === null
                      ? '—'
                      : `${pct.toFixed(1)}%`}
                  </span>
                  <span className="col-span-2 hidden h-1.5 overflow-hidden rounded-full border border-border bg-muted md:col-span-1 md:block">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width:
                          grossAssets <= 0 || v === null
                            ? '0%'
                            : `${Math.min(100, pct)}%`,
                        background: catColor,
                      }}
                    />
                  </span>
                  <div className="col-span-2 flex items-center justify-end gap-3 text-right md:col-span-1">
                    {valueSkeleton ? (
                      <Skeleton className="inline-block h-5 w-24" />
                    ) : showEmDash ? (
                      <span className="inline-flex items-center gap-1 text-sm font-normal tabular-nums">
                        <span>—</span>
                        <AlertCircle
                          className="h-3.5 w-3.5 text-muted-foreground"
                          aria-hidden
                        />
                      </span>
                    ) : (
                      <span className="text-sm font-semibold tabular-nums">
                        {fmtInr0(v as number)}
                      </span>
                    )}
                    <span className="w-10 text-right text-sm text-muted-foreground md:hidden">
                      {grossAssets <= 0
                        ? '—'
                        : v === null
                          ? '—'
                          : `${Math.round(pct)}%`}
                    </span>
                  </div>
                  <span className="hidden text-right text-[11.5px] text-muted-foreground md:block">
                    —
                  </span>
                </button>
              </div>
            )
          })}
          {totalDebtAll > 0 ? (
            <>
              <div className="h-px bg-border" role="presentation" />
              <button
                type="button"
                className="grid w-full grid-cols-[24px_1fr_auto] items-center gap-2.5 px-4 py-3.5 text-left text-destructive transition-colors hover:bg-muted/40 md:grid-cols-[28px_minmax(0,1.5fr)_80px_minmax(0,1fr)_110px_70px] md:gap-3.5 md:px-6"
                onClick={() => onNavigate('liabilities')}
                aria-label="Open Liabilities section"
              >
                <span
                  className="size-[22px] shrink-0 rounded-md bg-destructive/80"
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold">Total Debt</div>
                  <div className="mt-0.5 text-[11.5px] text-destructive/90">
                    {data.liabilities.length} liabilit
                    {data.liabilities.length === 1 ? 'y' : 'ies'}
                  </div>
                </div>
                <span className="hidden md:block" />
                <span className="col-span-2 hidden md:col-span-1 md:block" />
                <div className="col-span-2 flex justify-end md:col-span-2">
                  <span className="text-sm font-semibold tabular-nums text-destructive">
                    {fmtInr0(totalDebtAll)}
                  </span>
                </div>
                <span className="hidden md:block" />
              </button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
