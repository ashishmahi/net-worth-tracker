import { describe, expect, it } from 'vitest'
import {
  calcCategoryTotals,
  computeBreakdownOriginalLine,
} from '@/lib/dashboardCalcs'
import { createInitialData } from '@/context/AppDataContext'
import { roundCurrency } from '@/lib/financials'
const iso = new Date().toISOString()

describe('computeBreakdownOriginalLine', () => {
  it('returns null when all MF amounts are INR (matches reportingLens)', () => {
    const data = createInitialData()
    data.assets.mutualFunds.platforms = [
      {
        id: crypto.randomUUID(),
        name: 'a',
        currentValue: 100,
        monthlySip: 0,
        currency: 'INR',
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    const ctx = {
      reportingLens: 'INR' as const,
      rates: {
        usdInr: 83 as number | null,
        aedInr: null,
        eurInr: null,
        gbpInr: null,
        sgdInr: null,
      },
    }
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 83,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      ctx,
    )
    expect(
      computeBreakdownOriginalLine('mutualFunds', data, ctx, totals.mutualFunds),
    ).toBeNull()
  })

  it('returns null when every MF is already in reporting USD (DSP-03)', () => {
    const data = createInitialData()
    data.settings.reportingCurrency = 'USD'
    data.assets.mutualFunds.platforms = [
      {
        id: crypto.randomUUID(),
        name: 'a',
        currentValue: 500,
        monthlySip: 0,
        currency: 'USD',
        createdAt: iso,
        updatedAt: iso,
      },
      {
        id: crypto.randomUUID(),
        name: 'b',
        currentValue: 500,
        monthlySip: 0,
        currency: 'USD',
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    const ctx = {
      reportingLens: 'USD' as const,
      rates: {
        usdInr: 83,
        aedInr: null,
        eurInr: null,
        gbpInr: null,
        sgdInr: null,
      },
    }
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 83,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      ctx,
    )
    expect(
      computeBreakdownOriginalLine('mutualFunds', data, ctx, totals.mutualFunds),
    ).toBeNull()
  })

  it('aggregates one foreign code when mixed with INR (reporting INR)', () => {
    const data = createInitialData()
    data.assets.mutualFunds.platforms = [
      {
        id: crypto.randomUUID(),
        name: 'inr',
        currentValue: 5000,
        monthlySip: 0,
        currency: 'INR',
        createdAt: iso,
        updatedAt: iso,
      },
      {
        id: crypto.randomUUID(),
        name: 'usd',
        currentValue: 1000,
        monthlySip: 0,
        currency: 'USD',
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    const ctx = {
      reportingLens: 'INR' as const,
      rates: {
        usdInr: 83,
        aedInr: null,
        eurInr: null,
        gbpInr: null,
        sgdInr: null,
      },
    }
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 83,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      ctx,
    )
    const orig = computeBreakdownOriginalLine(
      'mutualFunds',
      data,
      ctx,
      totals.mutualFunds,
    )
    expect(orig).toEqual({ currency: 'USD', amount: 1000 })
    expect(totals.mutualFunds).toBe(
      roundCurrency(roundCurrency(5000) + roundCurrency(1000 * 83)),
    )
  })

  it('returns null when two distinct non-reporting MF currencies contribute', () => {
    const data = createInitialData()
    data.assets.mutualFunds.platforms = [
      {
        id: crypto.randomUUID(),
        name: 'usd',
        currentValue: 100,
        monthlySip: 0,
        currency: 'USD',
        createdAt: iso,
        updatedAt: iso,
      },
      {
        id: crypto.randomUUID(),
        name: 'eur',
        currentValue: 100,
        monthlySip: 0,
        currency: 'EUR',
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    const ctx = {
      reportingLens: 'INR' as const,
      rates: {
        usdInr: 83,
        aedInr: null,
        eurInr: 90,
        gbpInr: null,
        sgdInr: null,
      },
    }
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 83,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      ctx,
    )
    expect(
      computeBreakdownOriginalLine('mutualFunds', data, ctx, totals.mutualFunds),
    ).toBeNull()
  })
})

describe('calcCategoryTotals multi-currency MF hub', () => {
  it('converts MF platforms via toReportingCurrency to INR hub', () => {
    const data = createInitialData()
    data.assets.mutualFunds.platforms = [
      {
        id: crypto.randomUUID(),
        name: 'x',
        currentValue: 2,
        monthlySip: 0,
        currency: 'USD',
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    const ctx = {
      reportingLens: 'INR' as const,
      rates: {
        usdInr: 80,
        aedInr: null,
        eurInr: null,
        gbpInr: null,
        sgdInr: null,
      },
    }
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 80,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      ctx,
    )
    expect(totals.mutualFunds).toBe(roundCurrency(160))
  })
})
