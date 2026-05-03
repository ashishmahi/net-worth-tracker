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

/** Format ₹/g for Settings text inputs (Indian grouping; matches manual entry style). */
export function formatInrPerGramInput(value: number): string {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

/** Whether live spot may persist into `settings.goldPrices` (see GoldSpotPricesSync). */
export function shouldAutoSyncGoldFromSpot(s: {
  goldPrices?: { k24: number; k22: number; k18: number }
  goldPricesLocked?: boolean
}): boolean {
  if (s.goldPricesLocked === true) return false
  // Legacy: had saved prices before this flag existed — treat as manual, do not auto-overwrite.
  if (s.goldPricesLocked === undefined && s.goldPrices !== undefined) return false
  return true
}
