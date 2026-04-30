import { describe, expect, it } from 'vitest'
import { DataSchema } from '@/types/data'
import { createInitialData, parseAppDataFromImport } from '@/context/AppDataContext'

const iso = new Date().toISOString()

function minimalOldAppDataShape(): Record<string, unknown> {
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

describe('createInitialData', () => {
  it('includes assets.otherCommodities with updatedAt and empty items', () => {
    const d = createInitialData()
    expect(d.assets.otherCommodities.items).toEqual([])
    expect(typeof d.assets.otherCommodities.updatedAt).toBe('string')
  })

  it('passes DataSchema.safeParse', () => {
    const r = DataSchema.safeParse(createInitialData())
    expect(r.success).toBe(true)
  })
})

describe('parseAppDataFromImport', () => {
  it('parses old-format data without otherCommodities after migration chain', () => {
    const result = parseAppDataFromImport(minimalOldAppDataShape())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.assets.otherCommodities.items).toEqual([])
    }
  })

  it('parses data with valid standard and manual items', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()
    const raw = {
      ...minimalOldAppDataShape(),
      assets: {
        ...(minimalOldAppDataShape().assets as object),
        otherCommodities: {
          updatedAt: iso,
          items: [
            {
              type: 'standard',
              kind: 'silver',
              grams: 10,
              id: id1,
              createdAt: iso,
              updatedAt: iso,
            },
            {
              type: 'manual',
              label: 'X',
              valueInr: 500,
              id: id2,
              createdAt: iso,
              updatedAt: iso,
            },
          ],
        },
      },
    }
    const result = parseAppDataFromImport(raw)
    expect(result.success).toBe(true)
  })

  it('returns success false for invalid item type in otherCommodities', () => {
    const raw = {
      ...minimalOldAppDataShape(),
      assets: {
        ...(minimalOldAppDataShape().assets as object),
        otherCommodities: {
          updatedAt: iso,
          items: [
            {
              type: 'unknown',
              id: crypto.randomUUID(),
              createdAt: iso,
              updatedAt: iso,
            },
          ],
        },
      },
    }
    const result = parseAppDataFromImport(raw)
    expect(result.success).toBe(false)
  })
})
