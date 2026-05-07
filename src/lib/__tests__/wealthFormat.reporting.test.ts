import { describe, expect, it } from 'vitest'
import {
  fmtCompactForReporting,
  splitReportingHero,
} from '@/lib/wealthFormat'

describe('fmtCompactForReporting', () => {
  it('keeps INR compact Cr/L/₹ conventions', () => {
    const s = fmtCompactForReporting(100000, 'INR')
    expect(s).toMatch(/₹|Cr|L/)
  })

  it('formats USD with a currency marker', () => {
    const s = fmtCompactForReporting(1000, 'USD')
    expect(s).toMatch(/\$|USD/)
  })
})

describe('splitReportingHero', () => {
  it('returns symbol and amount for USD', () => {
    const { symbol, amount } = splitReportingHero(1000, 'USD')
    expect(symbol.length).toBeGreaterThan(0)
    expect(amount.length).toBeGreaterThan(0)
  })
})
