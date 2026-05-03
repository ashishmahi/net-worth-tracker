import { roundCurrency } from '@/lib/financials'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'

/** INR per gram for pure (24K) gold from USD/troy oz spot and INR per USD. */
export function liveInrPerGramPure(goldUsdPerOz: number, usdInr: number): number {
  return roundCurrency((goldUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr)
}

/** INR per gram for a karat, derived from spot × purity (24K baseline). */
export function liveInrPerGramForKarat(
  goldUsdPerOz: number,
  usdInr: number,
  karat: 24 | 22 | 18,
): number {
  const pure = liveInrPerGramPure(goldUsdPerOz, usdInr)
  return roundCurrency(pure * (karat / 24))
}
