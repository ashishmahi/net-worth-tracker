import { describe, expect, it } from 'vitest'
import {
  sumLiabilitiesInr,
  sumAllDebtInr,
  calcNetWorth,
  debtToAssetRatio,
} from '@/lib/liabilityCalcs'
import { roundCurrency } from '@/lib/financials'
import { createInitialData } from '@/context/AppDataContext'
import type { AppData } from '@/types/data'

const iso = new Date().toISOString()

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

function liability(outstandingInr: number): AppData['liabilities'][number] {
  return {
    id: crypto.randomUUID(),
    label: 'Test Loan',
    outstandingInr,
    lender: 'Test Bank',
    loanType: 'personal',
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
    agreementInr: 5_000_000,
    milestones: [],
    createdAt: iso,
    updatedAt: iso,
    ...overrides,
  }
}

describe('sumLiabilitiesInr', () => {
  it('returns 0 for empty liabilities array', () => {
    expect(sumLiabilitiesInr(withLiabilities([]))).toBe(0)
  })

  it('sums single liability outstandingInr', () => {
    expect(sumLiabilitiesInr(withLiabilities([liability(50_000)]))).toBe(50_000)
  })

  it('sums multiple liabilities with rounding', () => {
    const data = withLiabilities([liability(100_000), liability(250_000.55)])
    expect(sumLiabilitiesInr(data)).toBe(roundCurrency(100_000 + 250_000.55))
  })

  it('handles floating-point edge 0.1 + 0.2', () => {
    const data = withLiabilities([liability(0.1), liability(0.2)])
    expect(sumLiabilitiesInr(data)).toBe(0.3)
  })
})

describe('sumAllDebtInr', () => {
  it('returns 0 when no property liabilities and no standalone liabilities', () => {
    expect(sumAllDebtInr(createInitialData())).toBe(0)
  })

  it('includes property debt when hasLiability is true', () => {
    const data = withPropertyItems([
      propertyRow({ hasLiability: true, outstandingLoanInr: 500_000 }),
    ])
    expect(sumAllDebtInr(data)).toBe(500_000)
  })

  it('excludes property when hasLiability is false even if outstandingLoanInr is set', () => {
    const data = withPropertyItems([
      propertyRow({
        hasLiability: false,
        outstandingLoanInr: 999_999,
      }),
    ])
    expect(sumAllDebtInr(data)).toBe(0)
  })

  it('treats undefined outstandingLoanInr as 0 when hasLiability is true', () => {
    const data = withPropertyItems([propertyRow({ hasLiability: true })])
    expect(sumAllDebtInr(data)).toBe(0)
  })

  it('sums property debt and standalone liabilities', () => {
    const data = withBoth(
      [liability(100_000)],
      [propertyRow({ hasLiability: true, outstandingLoanInr: 500_000 })]
    )
    expect(sumAllDebtInr(data)).toBe(600_000)
  })

  it('sums only properties with hasLiability true across multiple properties', () => {
    const data = withPropertyItems([
      propertyRow({
        hasLiability: true,
        outstandingLoanInr: 100_000,
        label: 'With loan',
      }),
      propertyRow({
        hasLiability: false,
        outstandingLoanInr: 9_000_000,
        label: 'No loan flag',
      }),
    ])
    expect(sumAllDebtInr(data)).toBe(100_000)
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
