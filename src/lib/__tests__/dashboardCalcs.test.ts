import { describe, expect, it } from 'vitest'
import {
  calcCategoryTotals,
  propertyEquityForNetWorth,
  sumCommoditiesInr,
  sumForNetWorth,
  type CategoryTotalsCalcContext,
} from '@/lib/dashboardCalcs'
import { liveInrPerGramForKarat } from '@/lib/goldLiveHints'
import { roundCurrency } from '@/lib/financials'
import { createInitialData } from '@/context/AppDataContext'
import type { AppData, PropertyItem } from '@/types/data'

const iso = new Date().toISOString()

const inrCtx: CategoryTotalsCalcContext = {
  rates: {
    usdInr: null,
    aedInr: null,
    eurInr: null,
    gbpInr: null,
    sgdInr: null,
  },
  reportingLens: 'INR',
}

function withCommodityItems(
  items: AppData['assets']['otherCommodities']['items']
): AppData {
  const d = createInitialData()
  d.assets.otherCommodities.items = items
  return d
}

describe('sumCommoditiesInr', () => {
  it('returns 0 for empty items', () => {
    expect(sumCommoditiesInr(createInitialData(), null, inrCtx.rates)).toBe(0)
  })

  it('sums manual items when silverInrPerGram is null', () => {
    const data = withCommodityItems([
      {
        type: 'manual',
        label: 'A',
        value: 100,
        currency: 'INR',
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
      {
        type: 'manual',
        label: 'B',
        value: 50.5,
        currency: 'INR',
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    expect(sumCommoditiesInr(data, null, inrCtx.rates)).toBe(roundCurrency(100 + 50.5))
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
    expect(sumCommoditiesInr(data, null, inrCtx.rates)).toBeNull()
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
        value: 200,
        currency: 'INR',
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
      },
    ])
    expect(sumCommoditiesInr(data, null, inrCtx.rates)).toBe(200)
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
    expect(sumCommoditiesInr(data, 250.5, inrCtx.rates)).toBe(roundCurrency(2 * 250.5))
  })

  it('sums manual and silver when both present with valid silver price', () => {
    const data = withCommodityItems([
      {
        type: 'manual',
        label: 'M',
        value: 100,
        currency: 'INR',
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
    expect(sumCommoditiesInr(data, 300, inrCtx.rates)).toBe(roundCurrency(100 + silverPart))
  })
})

describe('propertyEquityForNetWorth', () => {
  function baseProperty(partial: Partial<PropertyItem> & Pick<PropertyItem, 'agreementAmount'>): PropertyItem {
    const id = crypto.randomUUID()
    return {
      id,
      createdAt: iso,
      updatedAt: iso,
      label: partial.label ?? 'Test',
      milestones: partial.milestones ?? [],
      hasLiability: partial.hasLiability ?? false,
      currency: partial.currency ?? 'INR',
      ...partial,
    }
  }

  it('uses agreement when no mortgage and no milestones (simple owned)', () => {
    const item = baseProperty({
      agreementAmount: 1_00_00_000,
      hasLiability: false,
      milestones: [],
    })
    expect(propertyEquityForNetWorth(item)).toBe(1_00_00_000)
  })

  it('sums only paid milestones when no mortgage', () => {
    const item = baseProperty({
      agreementAmount: 1_00_00_000,
      hasLiability: false,
      milestones: [
        {
          id: crypto.randomUUID(),
          label: 'S1',
          amount: 50_00_000,
          isPaid: true,
        },
        {
          id: crypto.randomUUID(),
          label: 'S2',
          amount: 50_00_000,
          isPaid: false,
        },
      ],
    })
    expect(propertyEquityForNetWorth(item)).toBe(50_00_000)
  })

  it('uses agreement minus loan when mortgaged (milestones ignored for equity)', () => {
    const item = baseProperty({
      agreementAmount: 1_00_00_000,
      hasLiability: true,
      outstandingLoan: 50_00_000,
      milestones: [
        {
          id: crypto.randomUUID(),
          label: 'S1',
          amount: 25_00_000,
          isPaid: true,
        },
      ],
    })
    expect(propertyEquityForNetWorth(item)).toBe(50_00_000)
  })
})

describe('calcCategoryTotals property equity', () => {
  it('counts paid milestones not full agreement when no mortgage', () => {
    const data = createInitialData()
    data.assets.property.items = [
      {
        id: crypto.randomUUID(),
        createdAt: iso,
        updatedAt: iso,
        label: 'Under construction',
        agreementAmount: 1_00_00_000,
        milestones: [
          {
            id: crypto.randomUUID(),
            label: 'Due',
            amount: 50_00_000,
            isPaid: true,
          },
          {
            id: crypto.randomUUID(),
            label: 'Later',
            amount: 50_00_000,
            isPaid: false,
          },
        ],
        hasLiability: false,
        currency: 'INR',
      },
    ]
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 83,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      inrCtx,
    )
    expect(totals.property).toBe(50_00_000)
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
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr,
        aedInr: null,
        silverUsdPerOz,
        goldUsdPerOz: null,
      },
      { ...inrCtx, rates: { ...inrCtx.rates, usdInr } },
    )
    // 2 g × ₹250/g parity × (1 + default silver uplift 0.08)
    expect(totals.otherCommodities).toBe(540)
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
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 100,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: null,
      },
      { ...inrCtx, rates: { ...inrCtx.rates, usdInr: 100 } },
    )
    expect(totals.otherCommodities).toBeNull()
  })

  it('uses locked silver ₹/g when live would differ', () => {
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
    data.settings.silverInrPerGram = 88
    data.settings.silverPricesLocked = true
    const usdInr = 100
    const silverUsdPerOz = (300 * 31.1035) / usdInr
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr,
        aedInr: null,
        silverUsdPerOz,
        goldUsdPerOz: null,
      },
      { ...inrCtx, rates: { ...inrCtx.rates, usdInr } },
    )
    expect(totals.otherCommodities).toBe(roundCurrency(2 * 88))
  })
})

describe('calcCategoryTotals gold wiring', () => {
  it('uses uplifted live gold when auto-sync and spot present', () => {
    const data = createInitialData()
    data.assets.gold.items = [
      {
        id: crypto.randomUUID(),
        karat: 22,
        grams: 10,
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    const goldUsdPerOz = 3103.5
    const usdInr = 83
    const perG = liveInrPerGramForKarat(goldUsdPerOz, usdInr, 22)
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz,
      },
      { ...inrCtx, rates: { ...inrCtx.rates, usdInr } },
    )
    expect(totals.gold).toBe(roundCurrency(10 * perG))
  })

  it('uses locked saved gold prices when user fixed rates', () => {
    const data = createInitialData()
    data.assets.gold.items = [
      {
        id: crypto.randomUUID(),
        karat: 22,
        grams: 10,
        createdAt: iso,
        updatedAt: iso,
      },
    ]
    data.settings.goldPrices = { k24: 7000, k22: 6400, k18: 5300 }
    data.settings.goldPricesLocked = true
    const totals = calcCategoryTotals(
      data,
      {
        btcUsd: null,
        usdInr: 100,
        aedInr: null,
        silverUsdPerOz: null,
        goldUsdPerOz: 99999,
      },
      { ...inrCtx, rates: { ...inrCtx.rates, usdInr: 100 } },
    )
    expect(totals.gold).toBe(roundCurrency(10 * 6400))
  })
})
