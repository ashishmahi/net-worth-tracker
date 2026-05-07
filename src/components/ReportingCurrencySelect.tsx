import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CURRENCY_CODES,
  type CurrencyCode,
} from '@/types/currency'

const LABEL: Record<CurrencyCode, string> = {
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
}

/** Compact pill `<select>` — ISO codes, matches topbar “Live prices” chip scale. */
export function ReportingCurrencySelect({
  value,
  onChange,
  className,
  disabled,
}: ReportingCurrencySelectProps) {
  return (
    <div
      className={cn(
        'relative inline-block w-[3.75rem] shrink-0 [&:focus-within]:z-[1]',
        className
      )}
    >
      <select
        aria-label="Reporting currency"
        className={cn(
          'h-8 w-full cursor-pointer appearance-none rounded-full border border-border bg-card py-0 pl-2.5 pr-7 text-[11px] font-semibold tabular-nums text-foreground shadow-sm outline-none transition-colors',
          'hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          disabled && 'pointer-events-none opacity-50'
        )}
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value as CurrencyCode)}
      >
        {CURRENCY_CODES.map(code => (
          <option key={code} value={code}>
            {LABEL[code]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}
