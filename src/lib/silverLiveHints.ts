import { roundCurrency } from '@/lib/financials'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'

/** Default import-style uplift on parity-derived silver ₹/g (BLN-02). */
export const DEFAULT_SILVER_IMPORT_UPLIFT_RATE = 0.08

export function resolveSilverImportUpliftRate(settings: {
  silverImportUpliftRate?: number
}): number {
  const r = settings.silverImportUpliftRate
  return r !== undefined ? r : DEFAULT_SILVER_IMPORT_UPLIFT_RATE
}

/** INR per gram for silver from USD/troy oz spot and INR per USD, with optional import uplift. */
export function liveSilverInrPerGram(
  silverUsdPerOz: number,
  usdInr: number,
  importUpliftRate: number = DEFAULT_SILVER_IMPORT_UPLIFT_RATE,
): number {
  return roundCurrency(
    (silverUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr * (1 + importUpliftRate),
  )
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
    silverImportUpliftRate?: number
  },
  live: { silverUsdPerOz: number | null; usdInr: number | null },
): number | null {
  const locked = settings.silverPricesLocked === true
  const cached = settings.silverInrPerGram

  if (locked && cached != null && Number.isFinite(cached)) {
    return cached
  }
  if (live.silverUsdPerOz != null && live.usdInr != null) {
    return liveSilverInrPerGram(
      live.silverUsdPerOz,
      live.usdInr,
      resolveSilverImportUpliftRate(settings),
    )
  }
  if (cached != null && Number.isFinite(cached)) {
    return cached
  }
  return null
}
