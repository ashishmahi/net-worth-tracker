import { describe, expect, it } from 'vitest'
import {
  effectiveSilverInrPerGramForNetWorth,
  liveSilverInrPerGram,
  shouldAutoSyncSilverFromSpot,
} from '@/lib/silverLiveHints'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'
import { roundCurrency } from '@/lib/financials'

describe('liveSilverInrPerGram', () => {
  it('matches troy-oz formula × USD/INR', () => {
    const usdInr = 100
    const silverUsdPerOz = (250 * TROY_OZ_TO_GRAMS) / usdInr
    expect(liveSilverInrPerGram(silverUsdPerOz, usdInr)).toBe(250)
  })
})

describe('shouldAutoSyncSilverFromSpot', () => {
  it('returns false when locked', () => {
    expect(shouldAutoSyncSilverFromSpot({ silverPricesLocked: true })).toBe(false)
  })

  it('returns true when unlocked or flag absent', () => {
    expect(shouldAutoSyncSilverFromSpot({})).toBe(true)
    expect(shouldAutoSyncSilverFromSpot({ silverPricesLocked: false })).toBe(true)
  })
})

describe('effectiveSilverInrPerGramForNetWorth', () => {
  it('uses locked manual when live would differ', () => {
    const locked = 99.5
    const usdInr = 100
    const liveSpot = (300 * TROY_OZ_TO_GRAMS) / usdInr
    expect(
      effectiveSilverInrPerGramForNetWorth(
        { silverInrPerGram: locked, silverPricesLocked: true },
        { silverUsdPerOz: liveSpot, usdInr }
      )
    ).toBe(locked)
  })

  it('prefers live over stale cache when unlocked', () => {
    const usdInr = 100
    const liveSpot = (400 * TROY_OZ_TO_GRAMS) / usdInr
    expect(
      effectiveSilverInrPerGramForNetWorth(
        { silverInrPerGram: 200, silverPricesLocked: false },
        { silverUsdPerOz: liveSpot, usdInr }
      )
    ).toBe(400)
  })

  it('falls back to cached when live missing and unlocked', () => {
    expect(
      effectiveSilverInrPerGramForNetWorth(
        { silverInrPerGram: 150, silverPricesLocked: false },
        { silverUsdPerOz: null, usdInr: null }
      )
    ).toBe(150)
  })

  it('returns null when nothing usable', () => {
    expect(
      effectiveSilverInrPerGramForNetWorth({}, { silverUsdPerOz: null, usdInr: null })
    ).toBeNull()
  })

  it('uses live when unlocked even if cache equals live rounded', () => {
    const usdInr = 83.12
    const oz = 28.5
    const eff = roundCurrency((oz / TROY_OZ_TO_GRAMS) * usdInr)
    expect(
      effectiveSilverInrPerGramForNetWorth(
        { silverInrPerGram: eff, silverPricesLocked: false },
        { silverUsdPerOz: oz, usdInr }
      )
    ).toBe(eff)
  })
})
