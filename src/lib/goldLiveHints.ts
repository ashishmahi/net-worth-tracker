import { roundCurrency } from '@/lib/financials'
import { TROY_OZ_TO_GRAMS } from '@/lib/priceApi'

/** Default import-style uplift on parity-derived gold ₹/g (BLN-01). */
export const DEFAULT_GOLD_IMPORT_UPLIFT_RATE = 0.1

/** Resolved nonnegative uplift rate from settings (falls back to default). */
export function resolveGoldImportUpliftRate(settings: {
  goldImportUpliftRate?: number
}): number {
  const r = settings.goldImportUpliftRate
  return r !== undefined ? r : DEFAULT_GOLD_IMPORT_UPLIFT_RATE
}

/** INR per gram for pure (24K) gold from USD/troy oz spot and INR per USD, with optional import uplift. */
export function liveInrPerGramPure(
  goldUsdPerOz: number,
  usdInr: number,
  importUpliftRate: number = DEFAULT_GOLD_IMPORT_UPLIFT_RATE,
): number {
  const base = (goldUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr
  const upliftedPure = base * (1 + importUpliftRate)
  return roundCurrency(upliftedPure)
}

/** INR per gram for a karat, derived from uplifted spot × purity (24K baseline). */
export function liveInrPerGramForKarat(
  goldUsdPerOz: number,
  usdInr: number,
  karat: 24 | 22 | 18,
  importUpliftRate: number = DEFAULT_GOLD_IMPORT_UPLIFT_RATE,
): number {
  const base = (goldUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr
  const upliftedPure = base * (1 + importUpliftRate)
  if (karat === 24) {
    return roundCurrency(upliftedPure)
  }
  return roundCurrency(upliftedPure * (karat / 24))
}

/** Format ₹/g for Settings text inputs (Indian grouping; matches manual entry style). */
export function formatInrPerGramInput(value: number): string {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

/**
 * ₹/g for a karat on the net-worth path: uplifted live spot when auto-sync applies and
 * feeds are present; otherwise saved manual prices from settings.
 */
export function effectiveGoldInrPerGramForKarat(
  settings: {
    goldPrices?: { k24: number; k22: number; k18: number }
    goldPricesLocked?: boolean
    goldImportUpliftRate?: number
  },
  karat: 24 | 22 | 18,
  live: { goldUsdPerOz: number | null; usdInr: number | null },
): number | null {
  if (
    shouldAutoSyncGoldFromSpot(settings) &&
    live.goldUsdPerOz != null &&
    live.usdInr != null
  ) {
    return liveInrPerGramForKarat(
      live.goldUsdPerOz,
      live.usdInr,
      karat,
      resolveGoldImportUpliftRate(settings),
    )
  }
  const gp = settings.goldPrices
  if (!gp) return null
  const key = ({ 24: 'k24', 22: 'k22', 18: 'k18' } as const)[karat]
  return gp[key]
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
