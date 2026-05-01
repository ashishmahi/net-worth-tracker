import { describe, expect, it } from 'vitest'
import { ensureOtherCommodities, ensureLiabilities } from '@/context/AppDataContext'

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
