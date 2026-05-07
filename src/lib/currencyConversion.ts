import type { CurrencyCode } from '@/types/currency'

/** Snapshot of INR-per-unit forex legs used for conversion (nullable legs match LivePrices / API). */
export type ForexRateSnapshot = {
  usdInr: number | null
  aedInr: number | null
  eurInr: number | null
  gbpInr: number | null
  sgdInr: number | null
}

export type ReportingConversionResult =
  | { ok: true; amount: number }
  | { ok: false; reason: 'rate_unavailable' }

function rateFor(currency: CurrencyCode, rates: ForexRateSnapshot): number | null {
  switch (currency) {
    case 'INR':
      return 1
    case 'USD':
      return rates.usdInr
    case 'AED':
      return rates.aedInr
    case 'EUR':
      return rates.eurInr
    case 'GBP':
      return rates.gbpInr
    case 'SGD':
      return rates.sgdInr
    default:
      return null
  }
}

function isValidLeg(v: number | null): v is number {
  return v !== null && Number.isFinite(v) && v > 0
}

/**
 * Convert `amount` expressed in `from` currency into `to`, using INR as the hub.
 * Returns `rate_unavailable` when any required FX leg is missing or non-finite.
 */
export function toReportingCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ForexRateSnapshot,
): ReportingConversionResult {
  if (!Number.isFinite(amount)) {
    return { ok: false, reason: 'rate_unavailable' }
  }
  if (from === to) {
    return { ok: true, amount }
  }

  const fromLeg = rateFor(from, rates)
  const toLeg = rateFor(to, rates)
  if (!isValidLeg(fromLeg) || !isValidLeg(toLeg)) {
    return { ok: false, reason: 'rate_unavailable' }
  }

  const inInr = from === 'INR' ? amount : amount * fromLeg
  const out = to === 'INR' ? inInr : inInr / toLeg

  if (!Number.isFinite(out)) {
    return { ok: false, reason: 'rate_unavailable' }
  }
  return { ok: true, amount: out }
}
