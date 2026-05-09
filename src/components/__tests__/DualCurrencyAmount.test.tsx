/** @vitest-environment happy-dom */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DualCurrencyAmount } from '@/components/DualCurrencyAmount'
import type { ForexRateSnapshot } from '@/lib/currencyConversion'

const ratesOk: ForexRateSnapshot = {
  usdInr: 83,
  aedInr: 22.5,
  eurInr: 90,
  gbpInr: 105,
  sgdInr: 62,
}

describe('DualCurrencyAmount', () => {
  it('renders single line when record currency matches reporting', () => {
    const html = renderToStaticMarkup(
      <DualCurrencyAmount
        amount={100_000}
        recordCurrency="INR"
        reportingCurrency="INR"
        rates={ratesOk}
      />,
    )
    expect(html).not.toContain('Rate unavailable')
    const matches = html.match(/₹/g)
    expect(matches?.length).toBe(1)
  })

  it('renders primary + secondary when USD vs INR with rates', () => {
    const html = renderToStaticMarkup(
      <DualCurrencyAmount
        amount={1000}
        recordCurrency="USD"
        reportingCurrency="INR"
        rates={ratesOk}
      />,
    )
    expect(html).not.toContain('Rate unavailable')
    expect(html).toMatch(/₹/)
    expect(html).toMatch(/\$1,000/)
  })

  it('shows Rate unavailable when FX legs missing', () => {
    const broken: ForexRateSnapshot = {
      usdInr: null,
      aedInr: null,
      eurInr: null,
      gbpInr: null,
      sgdInr: null,
    }
    const html = renderToStaticMarkup(
      <DualCurrencyAmount
        amount={1000}
        recordCurrency="USD"
        reportingCurrency="INR"
        rates={broken}
      />,
    )
    expect(html).toContain('Rate unavailable')
  })
})
