import type { AppData } from '@/types/data'
import { roundCurrency } from '@/lib/financials'

export function sumLiabilitiesInr(data: AppData): number {
  throw new Error('Not implemented')
}

export function sumAllDebtInr(data: AppData): number {
  throw new Error('Not implemented')
}

export function calcNetWorth(grossAssets: number, liabilitiesTotal: number): number {
  throw new Error('Not implemented')
}

export function debtToAssetRatio(totalDebt: number, grossAssets: number): number {
  throw new Error('Not implemented')
}
