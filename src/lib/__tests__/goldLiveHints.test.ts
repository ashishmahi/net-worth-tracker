import { describe, expect, it } from 'vitest'
import { liveInrPerGramForKarat, liveInrPerGramPure } from '@/lib/goldLiveHints'
import { roundCurrency } from '@/lib/financials'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'

describe('goldLiveHints', () => {
  it('computes pure ₹/g from spot and forex', () => {
    const goldUsdPerOz = 3103.5
    const usdInr = 83
    const pure = liveInrPerGramPure(goldUsdPerOz, usdInr)
    expect(pure).toBe(roundCurrency((goldUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr))
  })

  it('scales 22K and 18K by karat/24', () => {
    const goldUsdPerOz = 3103.5
    const usdInr = 83
    const pure = liveInrPerGramPure(goldUsdPerOz, usdInr)
    expect(liveInrPerGramForKarat(goldUsdPerOz, usdInr, 24)).toBe(pure)
    expect(liveInrPerGramForKarat(goldUsdPerOz, usdInr, 22)).toBe(
      roundCurrency(pure * (22 / 24)),
    )
    expect(liveInrPerGramForKarat(goldUsdPerOz, usdInr, 18)).toBe(
      roundCurrency(pure * (18 / 24)),
    )
  })
})
