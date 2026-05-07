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
  /**
   * `toolbar` — desktop top bar: symbol+code labels, sits with Live prices / FX chips.
   * `chip` — mobile: short ISO codes, pill shape, next to theme on Dashboard.
   */
  variant?: 'toolbar' | 'chip'
}

export function ReportingCurrencySelect({
  value,
  onChange,
  className,
  disabled,
  variant = 'toolbar',
}: ReportingCurrencySelectProps) {
  if (variant === 'toolbar') {
    return (
      <select
        aria-label="Reporting currency"
        className={cn(
          'h-[29px] min-h-[28px] max-w-[9.5rem] shrink-0 rounded-md border border-border bg-card py-1 text-[11.5px] text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value as CurrencyCode)}
      >
        {CURRENCY_CODES.map(code => (
          <option key={code} value={code}>
            {OPTION_LABEL[code]}
          </option>
        ))}
      </select>
    )
  }

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
            {COMPACT_LABEL[code]}
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
