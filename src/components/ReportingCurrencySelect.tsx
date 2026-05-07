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

export type ReportingCurrencySelectProps = {
  value: CurrencyCode
  onChange: (code: CurrencyCode) => void
  className?: string
  disabled?: boolean
}

export function ReportingCurrencySelect({
  value,
  onChange,
  className,
  disabled,
}: ReportingCurrencySelectProps) {
  return (
    <select
      aria-label="Reporting currency"
      className={cn(
        'rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
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
