import type { AppData } from '@/types/data'
import { roundCurrency } from '@/lib/financials'

export function sumLiabilitiesInr(data: AppData): number {
  return data.liabilities.reduce(
    (sum, item) => roundCurrency(sum + roundCurrency(item.outstandingInr)),
    0
  )
}

/** Sums optional `emiInr` across standalone liabilities (skips missing / non-finite / negative). */
export function sumStandaloneLiabilitiesEmiInr(data: AppData): number {
  return data.liabilities.reduce((sum, item) => {
    const emi = item.emiInr
    if (emi === undefined) return sum
    if (!Number.isFinite(emi) || emi < 0) return sum
    return roundCurrency(sum + roundCurrency(emi))
  }, 0)
}

export function sumAllDebtInr(data: AppData): number {
  const propertyDebt = data.assets.property.items.reduce((sum, item) => {
    if (!item.hasLiability) return sum
    return roundCurrency(sum + roundCurrency(item.outstandingLoanInr ?? 0))
  }, 0)
  return roundCurrency(propertyDebt + sumLiabilitiesInr(data))
}

export function calcNetWorth(grossAssets: number, liabilitiesTotal: number): number {
  return roundCurrency(grossAssets - liabilitiesTotal)
}

export function debtToAssetRatio(totalDebt: number, grossAssets: number): number {
  if (grossAssets === 0) return 0
  return roundCurrency((totalDebt / grossAssets) * 100)
}
