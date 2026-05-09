import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const COPY = {
  record:
    'Amounts are saved in this currency. Dashboard totals convert each holding through INR using live or session FX, then to your reporting currency.',
  reporting:
    'Choose the label for net worth and breakdown. Each holding still converts from its stored currency via INR (hub), using the same rates.',
} as const

export type CurrencyFieldHintProps = {
  /** Per-holding forms vs top-bar reporting currency */
  variant?: keyof typeof COPY
  /** Accessible name for the trigger */
  'aria-label'?: string
}

export function CurrencyFieldHint({
  variant = 'record',
  'aria-label': ariaLabel = 'How currency conversion works',
}: CurrencyFieldHintProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="inline-flex shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={ariaLabel}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-xs leading-snug">
        {COPY[variant]}
      </TooltipContent>
    </Tooltip>
  )
}
