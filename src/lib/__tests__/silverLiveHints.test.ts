import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SILVER_IMPORT_UPLIFT_RATE,
  effectiveSilverInrPerGramForNetWorth,
  liveSilverInrPerGram,
  resolveSilverImportUpliftRate,
  shouldAutoSyncSilverFromSpot,
} from '@/lib/silverLiveHints'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'
import { roundCurrency } from '@/lib/financials'

describe('liveSilverInrPerGram', () => {
  it('matches troy-oz formula × USD/INR at parity (uplift 0)', () => {
    const usdInr = 100
    const silverUsdPerOz = (250 * TROY_OZ_TO_GRAMS) / usdInr
    expect(liveSilverInrPerGram(silverUsdPerOz, usdInr, 0)).toBe(250)
  })

  it('applies default uplift on silver ₹/g', () => {
    const usdInr = 100
    const silverUsdPerOz = (250 * TROY_OZ_TO_GRAMS) / usdInr
    const parity = roundCurrency((silverUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr)
    expect(liveSilverInrPerGram(silverUsdPerOz, usdInr)).toBe(
      roundCurrency(parity * (1 + DEFAULT_SILVER_IMPORT_UPLIFT_RATE)),
    )
    expect(DEFAULT_SILVER_IMPORT_UPLIFT_RATE).toBe(0.08)
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
        { silverUsdPerOz: liveSpot, usdInr },
      ),
    ).toBe(locked)
  })

  it('prefers live over stale cache when unlocked (parity uplift)', () => {
    const usdInr = 100
    const liveSpot = (400 * TROY_OZ_TO_GRAMS) / usdInr
    expect(
      effectiveSilverInrPerGramForNetWorth(
        {
          silverInrPerGram: 200,
          silverPricesLocked: false,
          silverImportUpliftRate: 0,
        },
        { silverUsdPerOz: liveSpot, usdInr },
      ),
    ).toBe(400)
  })

  it('applies resolved uplift on unlocked live branch', () => {
    const usdInr = 100
    const liveSpot = (400 * TROY_OZ_TO_GRAMS) / usdInr
    expect(
      effectiveSilverInrPerGramForNetWorth(
        { silverInrPerGram: 200, silverPricesLocked: false },
        { silverUsdPerOz: liveSpot, usdInr },
      ),
    ).toBe(roundCurrency(400 * (1 + DEFAULT_SILVER_IMPORT_UPLIFT_RATE)))
  })

  it('falls back to cached when live missing and unlocked', () => {
    expect(
      effectiveSilverInrPerGramForNetWorth(
        { silverInrPerGram: 150, silverPricesLocked: false },
        { silverUsdPerOz: null, usdInr: null },
      ),
    ).toBe(150)
  })

  it('returns null when nothing usable', () => {
    expect(effectiveSilverInrPerGramForNetWorth({}, { silverUsdPerOz: null, usdInr: null })).toBeNull()
  })

  it('uses live when unlocked even if cache equals live rounded', () => {
    const usdInr = 83.12
    const oz = 28.5
    const eff = roundCurrency((oz / TROY_OZ_TO_GRAMS) * usdInr)
    expect(
      effectiveSilverInrPerGramForNetWorth(
        {
          silverInrPerGram: eff,
          silverPricesLocked: false,
          silverImportUpliftRate: 0,
        },
        { silverUsdPerOz: oz, usdInr },
      ),
    ).toBe(eff)
  })

  it('resolveSilverImportUpliftRate matches defaults', () => {
    expect(resolveSilverImportUpliftRate({})).toBe(DEFAULT_SILVER_IMPORT_UPLIFT_RATE)
    expect(resolveSilverImportUpliftRate({ silverImportUpliftRate: 0 })).toBe(0)
  })
})
