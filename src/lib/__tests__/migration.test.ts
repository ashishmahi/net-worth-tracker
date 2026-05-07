import { describe, expect, it } from 'vitest'
import {
  ensureOtherCommodities,
  ensureLiabilities,
  parseAppDataFromImport,
} from '@/context/AppDataContext'

const iso = new Date().toISOString()

function minimalOldRoot(): Record<string, unknown> {
  return {
    version: 1,
    settings: { updatedAt: iso },
    assets: {
      gold: { updatedAt: iso, items: [] },
      mutualFunds: { updatedAt: iso, platforms: [] },
      stocks: { updatedAt: iso, platforms: [] },
      bitcoin: { updatedAt: iso, quantity: 0 },
      property: { updatedAt: iso, items: [] },
      bankSavings: { updatedAt: iso, accounts: [] },
      retirement: { updatedAt: iso, nps: 0, epf: 0 },
    },
    netWorthHistory: [],
  }
}

describe('ensureOtherCommodities', () => {
  it('injects otherCommodities when assets has no key', () => {
    const raw = minimalOldRoot()
    const out = ensureOtherCommodities(raw) as Record<string, unknown>
    const assets = out.assets as Record<string, unknown>
    expect(assets.otherCommodities).toEqual(
      expect.objectContaining({
        items: [],
      }),
    )
    expect(typeof (assets.otherCommodities as { updatedAt: string }).updatedAt).toBe('string')
  })

  it('passes through when otherCommodities already exists', () => {
    const existing = { updatedAt: iso, items: [] }
    const raw = {
      ...minimalOldRoot(),
      assets: {
        ...(minimalOldRoot().assets as object),
        otherCommodities: existing,
      },
    }
    expect(ensureOtherCommodities(raw)).toBe(raw)
  })

  it('returns non-object input unchanged', () => {
    expect(ensureOtherCommodities(null)).toBe(null)
    expect(ensureOtherCommodities('x')).toBe('x')
  })
})

describe('ensureLiabilities', () => {
  it('injects liabilities when root has no key', () => {
    const raw = minimalOldRoot()
    const out = ensureLiabilities(raw) as Record<string, unknown>
    expect(Array.isArray(out.liabilities)).toBe(true)
    expect((out.liabilities as unknown[]).length).toBe(0)
  })

  it('passes through when liabilities already exists', () => {
    const raw = { ...minimalOldRoot(), liabilities: [] }
    expect(ensureLiabilities(raw)).toBe(raw)
  })

  it('returns non-object input unchanged', () => {
    expect(ensureLiabilities(null)).toBe(null)
    expect(ensureLiabilities('x')).toBe('x')
  })
})

describe('migrate v1 to v2', () => {
  it('parses minimal v1 fixture to v2 with reportingCurrency and stamped currency fields', () => {
    const id = crypto.randomUUID()
    const raw = {
      ...minimalOldRoot(),
      assets: {
        ...(minimalOldRoot().assets as object),
        gold: {
          updatedAt: iso,
          items: [
            {
              id,
              createdAt: iso,
              updatedAt: iso,
              karat: 24 as const,
              grams: 10,
            },
          ],
        },
      },
    }
    const result = parseAppDataFromImport(raw)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.version).toBe(2)
      expect(result.data.settings.reportingCurrency).toBe('INR')
      const goldItem = result.data.assets.gold.items[0]
      expect(goldItem?.currency).toBe('INR')
      expect(result.data.assets.bitcoin.currency).toBe('INR')
      expect(result.data.assets.retirement.currency).toBe('INR')
    }
  })
})
