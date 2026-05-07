import { describe, expect, it } from 'vitest'
import type { CurrencyCode } from '@/types/currency'
import { toReportingCurrency } from '@/lib/currencyConversion'

const snap = {
  usdInr: 83,
  aedInr: 22.5,
  eurInr: 90,
  gbpInr: 105,
  sgdInr: 61,
}

describe('toReportingCurrency', () => {
  it('converts USD to INR using usdInr', () => {
    const r = toReportingCurrency(100, 'USD', 'INR', snap)
    expect(r).toEqual({ ok: true, amount: 8300 })
  })

  it('converts EUR to INR using eurInr', () => {
    const r = toReportingCurrency(10, 'EUR', 'INR', snap)
    expect(r).toEqual({ ok: true, amount: 900 })
  })

  it('converts INR to SGD using sgdInr', () => {
    const r = toReportingCurrency(6100, 'INR', 'SGD', snap)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.amount).toBeCloseTo(6100 / 61, 8)
  })

  it('converts GBP to AED via INR hub', () => {
    // 2 GBP -> INR -> AED: (2 * 105) / 22.5
    const r = toReportingCurrency(2, 'GBP', 'AED', snap)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.amount).toBeCloseTo((2 * 105) / 22.5, 8)
  })

  it('returns rate_unavailable when a required leg is null', () => {
    const r = toReportingCurrency(1, 'GBP', 'INR', { ...snap, gbpInr: null })
    expect(r).toEqual({ ok: false, reason: 'rate_unavailable' })
  })

  it('short-circuits same currency', () => {
    expect(toReportingCurrency(42.5, 'EUR', 'EUR', snap)).toEqual({ ok: true, amount: 42.5 })
  })

  it('rejects non-finite amount', () => {
    expect(toReportingCurrency(NaN, 'USD', 'INR', snap)).toEqual({
      ok: false,
      reason: 'rate_unavailable',
    })
  })

  it('rejects unknown currency code', () => {
    const r = toReportingCurrency(1, 'XX' as CurrencyCode, 'INR', snap)
    expect(r).toEqual({ ok: false, reason: 'rate_unavailable' })
  })

  it('rejects non-finite converted result', () => {
    const huge = { ...snap, usdInr: 1e200 }
    const r = toReportingCurrency(1e200, 'USD', 'INR', huge)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('rate_unavailable')
  })
})
