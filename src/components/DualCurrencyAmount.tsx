import type { CurrencyCode } from '@/types/currency'
import type { ForexRateSnapshot } from '@/lib/currencyConversion'
import { toReportingCurrency } from '@/lib/currencyConversion'
import { roundCurrency } from '@/lib/financials'
import { fmtCompactForReporting } from '@/lib/wealthFormat'
import { cn } from '@/lib/utils'

export type DualCurrencyAmountProps = {
  amount: number
  recordCurrency: CurrencyCode
  reportingCurrency: CurrencyCode
  rates: ForexRateSnapshot
  className?: string
}

/**
 * Reporting-first dual stack: primary = value in reporting currency when FX ok;
 * secondary = native record-currency line when it differs and conversion succeeds.
 */
export function DualCurrencyAmount({
  amount,
  recordCurrency,
  reportingCurrency,
  rates,
  className,
}: DualCurrencyAmountProps) {
  const result = toReportingCurrency(amount, recordCurrency, reportingCurrency, rates)
  const roundedNative = roundCurrency(amount)
  const sameCurrency = recordCurrency === reportingCurrency

  if (!result.ok) {
    return (
      <div
        className={cn('flex flex-col items-end gap-px leading-tight', className)}
      >
        <span className="text-[11px] font-normal tabular-nums text-muted-foreground">
          Rate unavailable
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {fmtCompactForReporting(roundedNative, recordCurrency)}
        </span>
      </div>
    )
  }

  const primaryReporting = roundCurrency(result.amount)

  if (sameCurrency) {
    return (
      <div
        className={cn('flex flex-col items-end gap-px leading-tight', className)}
      >
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {fmtCompactForReporting(roundedNative, recordCurrency)}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-end gap-px leading-tight', className)}>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {fmtCompactForReporting(primaryReporting, reportingCurrency)}
      </span>
      <span className="text-[11px] font-normal tabular-nums text-muted-foreground">
        {fmtCompactForReporting(roundedNative, recordCurrency)}
      </span>
    </div>
  )
}
