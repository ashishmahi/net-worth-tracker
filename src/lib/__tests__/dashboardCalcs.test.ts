import { describe, expect, it } from 'vitest'
import {
  calcCategoryTotals,
  sumCommoditiesInr,
  sumForNetWorth,
} from '@/lib/dashboardCalcs'
import { roundCurrency } from '@/lib/financials'
import { createInitialData } from '@/context/AppDataContext'
import type { AppData } from '@/types/data'

const iso = new Date().toISOString()

function withCommodityItems(
  items: AppData['assets']['otherCommodities']['items']
): AppData {
  const d = createInitialData()
  d.assets.otherCommodities.items = items
  return d
}

describe('sumCommoditiesInr', () => {
  it('returns 0 for empty items', () => {
    expect(sumCommoditiesInr(createInitialData(), null)).toBe(0)
  })

  it('sums manual items when silverInrPerGram is null', () => {
    const data = withCommodityItems([
      {
        type: 'manual',
        label: 'A',
        valueInr: 100,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
      {
        type: 'manual',
        label: 'B',
        valueInr: 50.5,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    expect(sumCommoditiesInr(data, null)).toBe(roundCurrency(100 + 50.5))
  })

  it('returns null when only standard silver and silverInrPerGram is null', () => {
    const data = withCommodityItems([
      {
        type: 'standard',
        kind: 'silver',
        grams: 10,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    expect(sumCommoditiesInr(data, null)).toBeNull()
  })

  it('sums manual only when mixed manual + standard and silver null', () => {
    const data = withCommodityItems([
      {
        type: 'standard',
        kind: 'silver',
        grams: 10,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
      {
        type: 'manual',
        label: 'M',
        valueInr: 200,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    expect(sumCommoditiesInr(data, null)).toBe(200)
  })

  it('returns rounded grams * silverInrPerGram for standard items when price set', () => {
    const data = withCommodityItems([
      {
        type: 'standard',
        kind: 'silver',
        grams: 2,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    expect(sumCommoditiesInr(data, 250.5)).toBe(roundCurrency(2 * 250.5))
  })

  it('sums manual and silver when both present with valid silver price', () => {
    const data = withCommodityItems([
      {
        type: 'manual',
        label: 'M',
        valueInr: 100,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
      {
        type: 'standard',
        kind: 'silver',
        grams: 1,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    const silverPart = roundCurrency(1 * 300)
    expect(sumCommoditiesInr(data, 300)).toBe(roundCurrency(100 + silverPart))
  })
})

describe('sumForNetWorth with otherCommodities', () => {
  it('includes otherCommodities when it is a number', () => {
    const totals = {
      gold: 0,
      otherCommodities: 500,
      mutualFunds: 0,
      stocks: 0,
      bitcoin: 0,
      property: 0,
      bankSavings: 0,
      retirement: 0,
    }
    expect(sumForNetWorth(totals)).toBe(500)
  })

  it('excludes otherCommodities when null', () => {
    const totals = {
      gold: 0,
      otherCommodities: null,
      mutualFunds: 100,
      stocks: 0,
      bitcoin: 0,
      property: 0,
      bankSavings: 0,
      retirement: 0,
    }
    expect(sumForNetWorth(totals)).toBe(100)
  })
})

describe('calcCategoryTotals silver wiring', () => {
  it('passes derived silverInrPerGram into commodities total', () => {
    const data = withCommodityItems([
      {
        type: 'standard',
        kind: 'silver',
        grams: 2,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    const usdInr = 100
    const silverUsdPerOz = (250 * 31.1035) / usdInr
    const totals = calcCategoryTotals(data, {
      btcUsd: null,
      usdInr,
      aedInr: null,
      silverUsdPerOz,
    })
    expect(totals.otherCommodities).toBe(500)
  })

  it('leaves otherCommodities null when silver USD missing', () => {
    const data = withCommodityItems([
      {
        type: 'standard',
        kind: 'silver',
        grams: 10,
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    const totals = calcCategoryTotals(data, {
      btcUsd: null,
      usdInr: 100,
      aedInr: null,
      silverUsdPerOz: null,
    })
    expect(totals.otherCommodities).toBeNull()
  })
})
