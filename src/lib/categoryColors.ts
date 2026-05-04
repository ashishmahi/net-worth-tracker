import type { DashboardCategoryKey } from '@/lib/dashboardCalcs'

/** Hue ladder matching Claude Design mock (studio theme). */
const CAT_HUES: Record<DashboardCategoryKey, number> = {
  gold: 75,
  otherCommodities: 200,
  mutualFunds: 280,
  stocks: 150,
  bitcoin: 35,
  property: 320,
  bankSavings: 230,
  retirement: 110,
}

/** oklch stroke/fill for category swatches and bars */
export function categoryOklch(key: DashboardCategoryKey): string {
  const hue = CAT_HUES[key]
  return `oklch(0.62 0.16 ${hue})`
}
