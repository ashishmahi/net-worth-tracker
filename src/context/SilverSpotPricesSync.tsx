import { useEffect, useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { liveSilverInrPerGram, shouldAutoSyncSilverFromSpot } from '@/lib/silverLiveHints'
import { nowIso } from '@/lib/financials'

/**
 * Persists live-derived silver ₹/g into settings for net worth.
 * Stops overwriting once the user saves a fixed price (`silverPricesLocked`).
 */
export function SilverSpotPricesSync() {
  const { data, saveData } = useAppData()
  const {
    silverUsdPerOz,
    usdInr,
    silverLoading,
    silverError,
    forexLoading,
  } = useLivePrices()

  const silverHintLoading =
    !silverError &&
    ((silverLoading && silverUsdPerOz == null) || (forexLoading && usdInr == null))

  const hint = useMemo(() => {
    if (silverUsdPerOz == null || usdInr == null) return null
    return liveSilverInrPerGram(silverUsdPerOz, usdInr)
  }, [silverUsdPerOz, usdInr])

  useEffect(() => {
    if (silverError || silverHintLoading || hint == null) return
    if (!shouldAutoSyncSilverFromSpot(data.settings)) return

    const prev = data.settings.silverInrPerGram
    if (prev === hint) return

    void saveData({
      ...data,
      settings: {
        ...data.settings,
        silverInrPerGram: hint,
        silverPricesLocked: false,
        updatedAt: nowIso(),
      },
    })
  }, [data, silverError, silverHintLoading, hint, saveData])

  return null
}
