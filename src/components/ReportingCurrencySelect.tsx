import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CURRENCY_CODES,
  type CurrencyCode,
} from '@/types/currency'

const OPTION_LABEL: Record<CurrencyCode, string> = {
  INR: '₹ INR',
  USD: '$ USD',
  AED: 'AED',
  EUR: '€ EUR',
  GBP: '£ GBP',
  SGD: 'S$ SGD',
}

/** Narrow closed-state + picker rows on small headers (full labels stay via desktop `select`). */
const COMPACT_LABEL: Record<CurrencyCode, string> = {
  INR: 'INR',
  USD: 'USD',
  AED: 'AED',
  EUR: 'EUR',
  GBP: 'GBP',
  SGD: 'SGD',
}

export type ReportingCurrencySelectProps = {
  value: CurrencyCode
  onChange: (code: CurrencyCode) => void
  className?: string
  disabled?: boolean
  /** Use 3-letter option text so the closed control fits narrow toolbars (mobile). */
  compact?: boolean
}

export function ReportingCurrencySelect({
  value,
  onChange,
  className,
  disabled,
  compact = false,
}: ReportingCurrencySelectProps) {
  const labels = compact ? COMPACT_LABEL : OPTION_LABEL

  const selectEl = (
    <select
      aria-label="Reporting currency"
      className={cn(
        'rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
        compact &&
          'min-h-[44px] w-full min-w-0 appearance-none pl-3 pr-10 text-sm font-medium tabular-nums',
        className
      )}
      disabled={disabled}
      value={value}
      onChange={e => onChange(e.target.value as CurrencyCode)}
    >
      {CURRENCY_CODES.map(code => (
        <option key={code} value={code}>
          {labels[code]}
        </option>
      ))}
    </select>
  )

  if (compact) {
    return (
      <div className="relative w-full min-w-0">
        {selectEl}
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    )
  }

  return selectEl
}
