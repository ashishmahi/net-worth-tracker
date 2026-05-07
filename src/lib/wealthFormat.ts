import type { CurrencyCode } from '@/types/currency'

/** Compact INR display — aligns with Claude Design mock (Cr / L). */
export function fmtCompactInr(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

export function fmtInr0(n: number): string {
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

/** Split "₹1,23,456" style amount for hero typography */
export function splitInrAmount(n: number): { symbol: string; amount: string } {
  const amount = Math.round(n).toLocaleString('en-IN')
  return { symbol: '₹', amount }
}

/** Non-INR: `en-IN` + compact notation at ≥1e6 for readability; INR delegates to Cr/L rules. */
export function fmtCompactForReporting(amount: number, code: CurrencyCode): string {
  if (code === 'INR') return fmtCompactInr(amount)
  const abs = Math.abs(amount)
  const notation = abs >= 1e6 ? ('compact' as const) : ('standard' as const)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: code,
    notation,
    maximumFractionDigits: notation === 'compact' ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Hero split: INR keeps Lakh/Crore-style grouping; FX uses Intl currency parts. */
export function splitReportingHero(
  amount: number,
  code: CurrencyCode,
): { symbol: string; amount: string } {
  if (code === 'INR') return splitInrAmount(amount)
  const rounded = Math.round(amount)
  const parts = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).formatToParts(rounded)
  let symbol = ''
  let body = ''
  for (const p of parts) {
    if (p.type === 'currency') symbol += p.value
    else body += p.value
  }
  return { symbol: symbol.trim(), amount: body.trim() }
}
