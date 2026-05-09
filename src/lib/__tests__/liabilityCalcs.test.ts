import { describe, expect, it } from 'vitest'
import type { ForexRateSnapshot } from '@/lib/currencyConversion'
import {
  sumLiabilitiesInr,
  sumStandaloneLiabilitiesEmiInr,
  sumAllDebtInr,
  sumPropertyOutstandingDebtInr,
  grossAssetsForDebtToAssetRatio,
  calcNetWorth,
  debtToAssetRatio,
} from '@/lib/liabilityCalcs'
import { roundCurrency } from '@/lib/financials'
import { createInitialData } from '@/context/AppDataContext'
import type { AppData } from '@/types/data'

const iso = new Date().toISOString()

const R: ForexRateSnapshot = {
  usdInr: 83,
  aedInr: 22.5,
  eurInr: 90,
  gbpInr: 105,
  sgdInr: 62,
}

function withLiabilities(items: AppData['liabilities']): AppData {
  const d = createInitialData()
  d.liabilities = items
  return d
}

function withPropertyItems(items: AppData['assets']['property']['items']): AppData {
  const d = createInitialData()
  d.assets.property.items = items
  return d
}

function withBoth(
  liabilities: AppData['liabilities'],
  propertyItems: AppData['assets']['property']['items']
): AppData {
  const d = createInitialData()
  d.liabilities = liabilities
  d.assets.property.items = propertyItems
  return d
}

function liability(outstanding: number): AppData['liabilities'][number] {
  return {
    id: crypto.randomUUID(),
    label: 'Test Loan',
    outstanding,
    lender: 'Test Bank',
    loanType: 'personal',
    currency: 'INR',
    createdAt: iso,
    updatedAt: iso,
  }
}

function propertyRow(
  overrides: Partial<AppData['assets']['property']['items'][number]> &
    Pick<AppData['assets']['property']['items'][number], 'hasLiability'>
): AppData['assets']['property']['items'][number] {
  return {
    id: crypto.randomUUID(),
    label: 'Test Property',
    agreementAmount: 5_000_000,
    milestones: [],
    createdAt: iso,
    updatedAt: iso,
    currency: 'INR',
    ...overrides,
  }
}

describe('sumStandaloneLiabilitiesEmiInr', () => {
  it('returns 0 when all items omit emi', () => {
    const data = withLiabilities([liability(10_000), liability(20_000)])
    expect(sumStandaloneLiabilitiesEmiInr(data, R)).toBe(0)
  })

  it('sums emi for two items with rounding', () => {
    const a = liability(1)
    a.emi = 32_000
    const b = liability(2)
    b.emi = 15_000.33
    const data = withLiabilities([a, b])
    expect(sumStandaloneLiabilitiesEmiInr(data, R)).toBe(
      roundCurrency(32_000 + roundCurrency(15_000.33))
    )
  })
})

describe('sumLiabilitiesInr', () => {
  it('returns 0 for empty liabilities array', () => {
    expect(sumLiabilitiesInr(withLiabilities([]), R)).toBe(0)
  })

  it('sums single liability outstanding', () => {
    expect(sumLiabilitiesInr(withLiabilities([liability(50_000)]), R)).toBe(50_000)
  })

  it('sums multiple liabilities with rounding', () => {
    const data = withLiabilities([liability(100_000), liability(250_000.55)])
    expect(sumLiabilitiesInr(data, R)).toBe(roundCurrency(100_000 + 250_000.55))
  })

  it('handles floating-point edge 0.1 + 0.2', () => {
    const data = withLiabilities([liability(0.1), liability(0.2)])
    expect(sumLiabilitiesInr(data, R)).toBe(0.3)
  })
})

describe('sumAllDebtInr', () => {
  it('returns 0 when no property liabilities and no standalone liabilities', () => {
    expect(sumAllDebtInr(createInitialData(), R)).toBe(0)
  })

  it('includes property debt when hasLiability is true', () => {
    const data = withPropertyItems([
      propertyRow({ hasLiability: true, outstandingLoan: 500_000 }),
    ])
    expect(sumAllDebtInr(data, R)).toBe(500_000)
  })

  it('excludes property when hasLiability is false even if outstandingLoan is set', () => {
    const data = withPropertyItems([
      propertyRow({
        hasLiability: false,
        outstandingLoan: 999_999,
      }),
    ])
    expect(sumAllDebtInr(data, R)).toBe(0)
  })

  it('treats undefined outstandingLoan as 0 when hasLiability is true', () => {
    const data = withPropertyItems([propertyRow({ hasLiability: true })])
    expect(sumAllDebtInr(data, R)).toBe(0)
  })

  it('sums property debt and standalone liabilities', () => {
    const data = withBoth(
      [liability(100_000)],
      [propertyRow({ hasLiability: true, outstandingLoan: 500_000 })]
    )
    expect(sumAllDebtInr(data, R)).toBe(600_000)
  })

  it('sums only properties with hasLiability true across multiple properties', () => {
    const data = withPropertyItems([
      propertyRow({
        hasLiability: true,
        outstandingLoan: 100_000,
        label: 'With loan',
      }),
      propertyRow({
        hasLiability: false,
        outstandingLoan: 9_000_000,
        label: 'No loan flag',
      }),
    ])
    expect(sumAllDebtInr(data, R)).toBe(100_000)
  })
})

describe('sumPropertyOutstandingDebtInr', () => {
  it('matches property slice of sumAllDebtInr', () => {
    const data = withBoth([liability(100_000)], [
      propertyRow({ hasLiability: true, outstandingLoan: 500_000 }),
    ])
    expect(sumPropertyOutstandingDebtInr(data, R)).toBe(500_000)
    expect(sumAllDebtInr(data, R)).toBe(600_000)
  })
})

describe('grossAssetsForDebtToAssetRatio', () => {
  it('adds property debt back to gross assets for ratio denominator', () => {
    const data = withPropertyItems([
      propertyRow({ hasLiability: true, outstandingLoan: 500_000 }),
    ])
    expect(grossAssetsForDebtToAssetRatio(4_500_000, data, R)).toBe(5_000_000)
  })
})

describe('calcNetWorth', () => {
  it('subtracts liabilities from gross assets', () => {
    expect(calcNetWorth(1_000_000, 200_000)).toBe(800_000)
  })

  it('allows negative net worth', () => {
    expect(calcNetWorth(100_000, 300_000)).toBe(-200_000)
  })

  it('returns 0 when both are zero', () => {
    expect(calcNetWorth(0, 0)).toBe(0)
  })

  it('returns gross assets when liabilities are zero', () => {
    expect(calcNetWorth(500_000, 0)).toBe(500_000)
  })
})

describe('debtToAssetRatio', () => {
  it('returns percentage of debt to gross assets', () => {
    expect(debtToAssetRatio(200_000, 1_000_000)).toBe(20)
  })

  it('returns 0 when totalDebt is zero', () => {
    expect(debtToAssetRatio(0, 1_000_000)).toBe(0)
  })

  it('returns 0 when grossAssets is zero (division guard)', () => {
    expect(debtToAssetRatio(500_000, 0)).toBe(0)
  })

  it('rounds percentage to two decimals', () => {
    expect(debtToAssetRatio(333_333, 1_000_000)).toBe(roundCurrency(33.3333))
  })
})
