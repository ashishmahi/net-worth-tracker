import type { AppData } from '@/types/data'
import { roundCurrency } from '@/lib/financials'
import { toReportingCurrency, type ForexRateSnapshot } from '@/lib/currencyConversion'

export function sumLiabilitiesInr(data: AppData, rates: ForexRateSnapshot): number {
  return data.liabilities.reduce((sum, item) => {
    const from = item.currency ?? 'INR'
    const conv = toReportingCurrency(item.outstanding, from, 'INR', rates)
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
}

/** Sums optional `emi` across standalone liabilities (skips missing / non-finite / negative). */
export function sumStandaloneLiabilitiesEmiInr(
  data: AppData,
  rates: ForexRateSnapshot,
): number {
  return data.liabilities.reduce((sum, item) => {
    const emi = item.emi
    if (emi === undefined) return sum
    if (!Number.isFinite(emi) || emi < 0) return sum
    const from = item.currency ?? 'INR'
    const conv = toReportingCurrency(emi, from, 'INR', rates)
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
}

/** Outstanding home-loan balances attached to property rows (converted to INR hub). */
export function sumPropertyOutstandingDebtInr(
  data: AppData,
  rates: ForexRateSnapshot,
): number {
  return data.assets.property.items.reduce((sum, item) => {
    if (!item.hasLiability) return sum
    const raw = item.outstandingLoan ?? 0
    const from = item.currency ?? 'INR'
    const conv = toReportingCurrency(raw, from, 'INR', rates)
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
}

export function sumAllDebtInr(data: AppData, rates: ForexRateSnapshot): number {
  return roundCurrency(sumPropertyOutstandingDebtInr(data, rates) + sumLiabilitiesInr(data, rates))
}

/**
 * Denominator for debt-to-assets on the dashboard: `grossAssets` counts mortgaged property at
 * equity (agreement − loan), so add property loans back so ratio ≈ total debt ÷ gross exposure.
 */
export function grossAssetsForDebtToAssetRatio(
  grossAssetsFromCategories: number,
  data: AppData,
  rates: ForexRateSnapshot,
): number {
  return roundCurrency(
    grossAssetsFromCategories + sumPropertyOutstandingDebtInr(data, rates),
  )
}

export function calcNetWorth(grossAssets: number, liabilitiesTotal: number): number {
  return roundCurrency(grossAssets - liabilitiesTotal)
}

export function debtToAssetRatio(totalDebt: number, grossAssets: number): number {
  if (grossAssets === 0) return 0
  return roundCurrency((totalDebt / grossAssets) * 100)
}
