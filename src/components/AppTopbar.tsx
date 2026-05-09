import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ReportingCurrencySelect } from '@/components/ReportingCurrencySelect'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { nowIso } from '@/lib/financials'
import { pathToSection } from '@/lib/sectionRoutes'
import { fmtCompactInr } from '@/lib/wealthFormat'
import { useSidebar } from '@/components/ui/sidebar'
import type { CurrencyCode } from '@/types/currency'

const SECTION_TITLE: Record<string, string> = {
  dashboard: 'Dashboard',
  gold: 'Gold',
  commodities: 'Commodities',
  mutualFunds: 'Mutual Funds',
  stocks: 'Stocks',
  bitcoin: 'Bitcoin',
  property: 'Property',
  liabilities: 'Liabilities',
  bankSavings: 'Bank Savings',
  retirement: 'Retirement',
  settings: 'Settings',
}

function sectionLabel(pathname: string): string {
  const s = pathToSection(pathname) ?? 'dashboard'
  return SECTION_TITLE[s] ?? 'Dashboard'
}

export function AppTopbar() {
  const { isMobile } = useSidebar()
  const { data, saveData } = useAppData()
  const location = useLocation()
  const { btcUsd, usdInr, btcLoading, forexLoading } = useLivePrices()

  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const handleReportingChange = (code: CurrencyCode) => {
    void saveData({
      ...data,
      settings: {
        ...data.settings,
        reportingCurrency: code,
        updatedAt: nowIso(),
      },
    })
  }

  const title = sectionLabel(location.pathname)
  const asOf = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    []
  )

  const btcInInr =
    btcUsd != null && usdInr != null ? btcUsd * usdInr : null

  if (isMobile) return null

  return (
    <header className="sticky top-0 z-[5] flex items-center justify-between gap-4 border-b border-border bg-background/80 px-8 py-[18px] backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="min-w-0 text-[13px] text-muted-foreground">
        <strong className="font-semibold text-foreground">{title}</strong>
        <span className="mx-2 text-muted-foreground">·</span>
        <span>as of {asOf}</span>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11.5px] text-muted-foreground"
          title="Quotes refresh on the schedule described in Settings"
        >
          <span
            className="size-1.5 shrink-0 animate-pulse rounded-full bg-[hsl(var(--positive))]"
            aria-hidden
          />
          Live prices
        </span>
        <span className="inline-flex items-center gap-1">
          <ReportingCurrencySelect
            variant="toolbar"
            value={reportingCurrency}
            onChange={handleReportingChange}
          />
          <CurrencyFieldHint variant="reporting" aria-label="About reporting currency" />
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1.5 font-mono text-[11.5px] tabular-nums text-muted-foreground">
          {forexLoading || usdInr == null
            ? 'USD/INR …'
            : `USD/INR ${usdInr.toFixed(2)}`}
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1.5 font-mono text-[11.5px] tabular-nums text-muted-foreground">
          {btcLoading || btcInInr == null
            ? 'BTC …'
            : `BTC ${fmtCompactInr(btcInInr)}`}
        </span>
      </div>
    </header>
  )
}

