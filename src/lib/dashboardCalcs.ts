import type { AppData } from '@/types/data'
import { roundCurrency } from '@/lib/financials'

export const DASHBOARD_CATEGORY_ORDER = [
  'gold',
  'mutualFunds',
  'stocks',
  'bitcoin',
  'property',
  'bankSavings',
  'retirement',
] as const

export type DashboardCategoryKey = (typeof DASHBOARD_CATEGORY_ORDER)[number]

export type CategoryTotals = {
  gold: number | null
  mutualFunds: number
  stocks: number
  bitcoin: number | null
  property: number
  bankSavings: number
  retirement: number
}

const KARAT_TO_KEY = { 24: 'k24', 22: 'k22', 18: 'k18' } as const

function sumGoldInr(data: AppData): number | null {
  const items = data.assets.gold.items
  if (items.length === 0) return 0
  if (data.settings.goldPrices === undefined) return null

  let sum = 0
  for (const item of items) {
    const k = KARAT_TO_KEY[item.karat]
    const price = data.settings.goldPrices![k]
    const line = roundCurrency(item.grams * price)
    sum = roundCurrency(sum + line)
  }
  return sum
}

function sumMutualFunds(data: AppData): number {
  return data.assets.mutualFunds.platforms.reduce(
    (sum, p) => roundCurrency(sum + roundCurrency(p.currentValue)),
    0
  )
}

function sumStocks(data: AppData): number {
  return data.assets.stocks.platforms.reduce(
    (sum, p) => roundCurrency(sum + roundCurrency(p.currentValue)),
    0
  )
}

function sumBitcoinInr(
  data: AppData,
  live: { btcUsd: number | null; usdInr: number | null }
): number | null {
  const q = data.assets.bitcoin.quantity
  if (q === 0) return 0
  if (live.btcUsd == null || live.usdInr == null) return null
  return roundCurrency(q * live.btcUsd * live.usdInr)
}

function sumPropertyInr(data: AppData): number {
  return data.assets.property.items.reduce((sum, item) => {
    const equity = item.hasLiability
      ? roundCurrency(item.agreementInr - (item.outstandingLoanInr ?? 0))
      : item.agreementInr
    return roundCurrency(sum + roundCurrency(equity))
  }, 0)
}

function sumBankSavingsInr(
  data: AppData,
  aedInr: number | null
): number {
  return data.assets.bankSavings.accounts.reduce((sum, a) => {
    if (a.currency === 'INR') {
      return roundCurrency(sum + roundCurrency(a.balance))
    }
    if (aedInr == null) {
      return sum
    }
    return roundCurrency(sum + roundCurrency(a.balance * aedInr))
  }, 0)
}

function sumRetirement(data: AppData): number {
  const { nps, epf } = data.assets.retirement
  return roundCurrency(roundCurrency(nps) + roundCurrency(epf))
}

/**
 * Per-category INR totals. `gold` / `bitcoin` are `null` when rates required for the
 * computation are missing; `bankSavings` still sums INR accounts and AED only when
 * `aedInr` is available.
 */
export function calcCategoryTotals(
  data: AppData,
  live: { btcUsd: number | null; usdInr: number | null; aedInr: number | null }
): CategoryTotals {
  return {
    gold: sumGoldInr(data),
    mutualFunds: sumMutualFunds(data),
    stocks: sumStocks(data),
    bitcoin: sumBitcoinInr(data, live),
    property: sumPropertyInr(data),
    bankSavings: sumBankSavingsInr(data, live.aedInr),
    retirement: sumRetirement(data),
  }
}

export function sumForNetWorth(totals: CategoryTotals): number {
  let s = 0
  for (const k of DASHBOARD_CATEGORY_ORDER) {
    const v = totals[k]
    if (v === null) continue
    s = roundCurrency(s + roundCurrency(v))
  }
  return s
}

/** Share of a category in `grandTotal`; 0 when total is 0 or negative. */
export function percentOfTotal(categoryValue: number, grandTotal: number): number {
  if (grandTotal <= 0) return 0
  return roundCurrency((categoryValue / grandTotal) * 100)
}

export function hasAedAccountsWithMissingRate(
  data: AppData,
  aedInr: number | null
): boolean {
  if (aedInr != null) return false
  return data.assets.bankSavings.accounts.some(a => a.currency === 'AED')
}
