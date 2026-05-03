import { roundCurrency } from '@/lib/financials'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'

/** INR per gram for silver from USD/troy oz spot and INR per USD. */
export function liveSilverInrPerGram(silverUsdPerOz: number, usdInr: number): number {
  return roundCurrency((silverUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr)
}

/** Whether live XAG may persist into `settings.silverInrPerGram` (see SilverSpotPricesSync). */
export function shouldAutoSyncSilverFromSpot(s: {
  silverInrPerGram?: number
  silverPricesLocked?: boolean
}): boolean {
  if (s.silverPricesLocked === true) return false
  return true
}

/**
 * Effective silver ₹/g for net worth: locked manual wins; else live spot; else unlocked cached value.
 */
export function effectiveSilverInrPerGramForNetWorth(
  settings: {
    silverInrPerGram?: number
    silverPricesLocked?: boolean
  },
  live: { silverUsdPerOz: number | null; usdInr: number | null }
): number | null {
  const locked = settings.silverPricesLocked === true
  const cached = settings.silverInrPerGram

  if (locked && cached != null && Number.isFinite(cached)) {
    return cached
  }
  if (live.silverUsdPerOz != null && live.usdInr != null) {
    return liveSilverInrPerGram(live.silverUsdPerOz, live.usdInr)
  }
  if (cached != null && Number.isFinite(cached)) {
    return cached
  }
  return null
}
