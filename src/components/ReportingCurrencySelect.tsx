import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CURRENCY_CODES,
  type CurrencyCode,
} from '@/types/currency'

/** Short codes — fits a narrow sidebar control; picker lists the same labels. */
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

/** Native `<select>` styled for the app sidebar: fixed narrow width, short ISO codes. */
export function ReportingCurrencySelect({
  value,
  onChange,
  className,
  disabled,
}: ReportingCurrencySelectProps) {
  return (
    <div
      className={cn(
        'relative inline-block w-[4.25rem] shrink-0 [&:focus-within]:z-[1]',
        className
      )}
    >
      <select
        aria-label="Reporting currency"
        className={cn(
          'h-9 w-full cursor-pointer appearance-none rounded-md border border-sidebar-border bg-sidebar py-1 pl-2 pr-7 text-xs font-semibold tabular-nums text-sidebar-foreground shadow-none outline-none transition-colors',
          'hover:bg-sidebar-accent/50 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
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
        className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}
