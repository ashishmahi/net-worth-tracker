import { useEffect, useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { liveInrPerGramForKarat, shouldAutoSyncGoldFromSpot } from '@/lib/goldLiveHints'
import { nowIso } from '@/lib/financials'

/**
 * Persists live-derived ₹/g gold prices into settings so net worth / dashboard work without
 * an explicit Save. Stops overwriting once the user saves fixed prices (`goldPricesLocked`).
 */
export function GoldSpotPricesSync() {
  const { data, saveData } = useAppData()
  const {
    goldUsdPerOz,
    usdInr,
    goldLoading,
    goldError,
    forexLoading,
  } = useLivePrices()

  const goldHintLoading =
    !goldError &&
    ((goldLoading && goldUsdPerOz == null) || (forexLoading && usdInr == null))

  const hints = useMemo(() => {
    if (goldUsdPerOz == null || usdInr == null) return null
    return {
      k24: liveInrPerGramForKarat(goldUsdPerOz, usdInr, 24),
      k22: liveInrPerGramForKarat(goldUsdPerOz, usdInr, 22),
      k18: liveInrPerGramForKarat(goldUsdPerOz, usdInr, 18),
    }
  }, [goldUsdPerOz, usdInr])

  useEffect(() => {
    if (goldError || goldHintLoading || !hints) return
    if (!shouldAutoSyncGoldFromSpot(data.settings)) return

    const prev = data.settings.goldPrices
    if (
      prev &&
      prev.k24 === hints.k24 &&
      prev.k22 === hints.k22 &&
      prev.k18 === hints.k18
    ) {
      return
    }

    void saveData({
      ...data,
      settings: {
        ...data.settings,
        goldPrices: hints,
        goldPricesLocked: false,
        updatedAt: nowIso(),
      },
    })
  }, [
    data,
    goldError,
    goldHintLoading,
    hints,
    saveData,
  ])

  return null
}
