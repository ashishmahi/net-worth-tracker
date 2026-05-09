import type { AppData, PropertyItem } from '@/types/data'
import type { CurrencyCode } from '@/types/currency'
import { roundCurrency } from '@/lib/financials'
import { effectiveGoldInrPerGramForKarat } from '@/lib/goldLiveHints'
import { effectiveSilverInrPerGramForNetWorth } from '@/lib/silverLiveHints'
import {
  toReportingCurrency,
  type ForexRateSnapshot,
} from '@/lib/currencyConversion'

export const DASHBOARD_CATEGORY_ORDER = [
  'gold',
  'otherCommodities',
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
  otherCommodities: number | null
  mutualFunds: number
  stocks: number
  bitcoin: number | null
  property: number
  bankSavings: number
  retirement: number
}

/** Rates + default currency for per-record fields that omit `currency` (DM-01). */
export type CategoryTotalsCalcContext = {
  rates: ForexRateSnapshot
  reportingLens: CurrencyCode
}

function sumGoldInr(
  data: AppData,
  live: { goldUsdPerOz: number | null; usdInr: number | null },
): number | null {
  const items = data.assets.gold.items
  if (items.length === 0) return 0

  let sum = 0
  for (const item of items) {
    const price = effectiveGoldInrPerGramForKarat(data.settings, item.karat, live)
    if (price == null) return null
    sum = roundCurrency(sum + roundCurrency(item.grams * price))
  }
  return sum
}

/** Sum INR for the 'otherCommodities' dashboard row (manual always; silver when priced). */
export function sumCommoditiesInr(
  data: AppData,
  silverInrPerGram: number | null,
  rates: ForexRateSnapshot,
): number | null {
  const items = data.assets.otherCommodities.items
  if (items.length === 0) return 0

  let sum = 0
  let hasPricedItems = false

  for (const item of items) {
    if (item.type === 'manual') {
      const from = item.currency ?? 'INR'
      const conv = toReportingCurrency(item.value, from, 'INR', rates)
      if (!conv.ok) continue
      sum = roundCurrency(sum + roundCurrency(conv.amount))
      hasPricedItems = true
    } else if (item.type === 'standard') {
      if (silverInrPerGram != null && item.grams > 0) {
        sum = roundCurrency(sum + roundCurrency(item.grams * silverInrPerGram))
        hasPricedItems = true
      }
    }
  }

  if (!hasPricedItems) return null
  return sum
}

function sumMutualFunds(data: AppData, ctx: CategoryTotalsCalcContext): number {
  // Convert each platform to INR hub; skipped rows mirror “no AED rate” exclusions.
  return data.assets.mutualFunds.platforms.reduce((sum, p) => {
    const from = p.currency ?? ctx.reportingLens
    const conv = toReportingCurrency(
      p.currentValue,
      from,
      'INR',
      ctx.rates,
    )
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
}

function sumStocks(data: AppData, ctx: CategoryTotalsCalcContext): number {
  return data.assets.stocks.platforms.reduce((sum, p) => {
    const from = p.currency ?? ctx.reportingLens
    const conv = toReportingCurrency(
      p.currentValue,
      from,
      'INR',
      ctx.rates,
    )
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
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

/**
 * Net-worth equity for one property: mortgage → agreement minus loan; no mortgage but
 * milestone rows → sum of paid milestone amounts only (builder instalments without double-counting
 * cash still in bank); no mortgage and no milestones → full agreement.
 */
export function propertyEquityForNetWorth(item: PropertyItem): number {
  if (item.hasLiability) {
    return roundCurrency(item.agreementAmount - (item.outstandingLoan ?? 0))
  }
  if (item.milestones.length > 0) {
    let paid = 0
    for (const m of item.milestones) {
      if (!m.isPaid) continue
      paid = roundCurrency(paid + m.amount)
    }
    return roundCurrency(paid)
  }
  return item.agreementAmount
}

function sumPropertyInr(data: AppData, ctx: CategoryTotalsCalcContext): number {
  return data.assets.property.items.reduce((sum, item) => {
    const equity = propertyEquityForNetWorth(item)
    const c = item.currency ?? ctx.reportingLens
    if (c === 'INR') {
      return roundCurrency(sum + roundCurrency(equity))
    }
    const conv = toReportingCurrency(equity, c, 'INR', ctx.rates)
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
}

function sumBankSavingsInr(data: AppData, ctx: CategoryTotalsCalcContext): number {
  return data.assets.bankSavings.accounts.reduce((sum, a) => {
    const conv = toReportingCurrency(
      a.balance,
      a.currency,
      'INR',
      ctx.rates,
    )
    if (!conv.ok && a.balance > 0) return sum
    if (!conv.ok) return sum
    return roundCurrency(sum + roundCurrency(conv.amount))
  }, 0)
}

function sumRetirement(data: AppData, ctx: CategoryTotalsCalcContext): number {
  const { nps, epf } = data.assets.retirement
  const stored = data.assets.retirement.currency
  const eff = stored ?? ctx.reportingLens

  if (eff === 'INR') {
    return roundCurrency(roundCurrency(nps) + roundCurrency(epf))
  }

  let sum = 0
  for (const raw of [nps, epf]) {
    if (raw === 0) continue
    const conv = toReportingCurrency(raw, eff, 'INR', ctx.rates)
    if (!conv.ok) continue
    sum = roundCurrency(sum + roundCurrency(conv.amount))
  }
  return sum
}

/**
 * Per-category INR totals. `gold` / `bitcoin` are `null` when rates required for the
 * computation are missing. MF / stocks / bank / property / retirement convert each
 * row through `toReportingCurrency(..., 'INR', ctx.rates)` using stored currency or
 * `ctx.reportingLens` when absent.
 */
export function calcCategoryTotals(
  data: AppData,
  live: {
    btcUsd: number | null
    usdInr: number | null
    aedInr: number | null
    silverUsdPerOz: number | null
    goldUsdPerOz: number | null
  },
  ctx: CategoryTotalsCalcContext,
): CategoryTotals {
  const silverInrPerGram = effectiveSilverInrPerGramForNetWorth(data.settings, {
    silverUsdPerOz: live.silverUsdPerOz,
    usdInr: live.usdInr,
  })

  return {
    gold: sumGoldInr(data, {
      goldUsdPerOz: live.goldUsdPerOz,
      usdInr: live.usdInr,
    }),
    otherCommodities: sumCommoditiesInr(data, silverInrPerGram, ctx.rates),
    mutualFunds: sumMutualFunds(data, ctx),
    stocks: sumStocks(data, ctx),
    bitcoin: sumBitcoinInr(data, live),
    property: sumPropertyInr(data, ctx),
    bankSavings: sumBankSavingsInr(data, ctx),
    retirement: sumRetirement(data, ctx),
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
  aedInr: number | null,
): boolean {
  if (aedInr != null) return false
  return data.assets.bankSavings.accounts.some(a => a.currency === 'AED')
}

type Contribution = { eff: CurrencyCode; raw: number }

/** D-02: single non-reporting code among successful contributors → aggregated raw sum. */
function foreignOriginalMeta(
  reportingLens: CurrencyCode,
  contribs: Contribution[],
): null | { currency: CurrencyCode; amount: number } {
  const foreign = contribs.filter(c => c.eff !== reportingLens)
  const codes = new Set(foreign.map(c => c.eff))
  if (codes.size === 0) return null
  if (codes.size > 1) return null
  const code = [...codes][0]!
  const amount = foreign
    .filter(c => c.eff === code)
    .reduce((s, c) => roundCurrency(s + roundCurrency(c.raw)), 0)
  return { currency: code, amount }
}

/** Original-currency subline metadata for breakdown rows (36-CONTEXT D-02). */
export function computeBreakdownOriginalLine(
  key: DashboardCategoryKey,
  data: AppData,
  ctx: CategoryTotalsCalcContext,
  totalsEntry: CategoryTotals[typeof key],
): null | { currency: CurrencyCode; amount: number } {
  if (totalsEntry === null) return null

  const contribs: Contribution[] = []

  switch (key) {
    case 'mutualFunds':
      for (const p of data.assets.mutualFunds.platforms) {
        const eff = p.currency ?? ctx.reportingLens
        const conv = toReportingCurrency(
          p.currentValue,
          eff,
          'INR',
          ctx.rates,
        )
        if (!conv.ok) continue
        contribs.push({ eff, raw: p.currentValue })
      }
      break
    case 'stocks':
      for (const p of data.assets.stocks.platforms) {
        const eff = p.currency ?? ctx.reportingLens
        const conv = toReportingCurrency(
          p.currentValue,
          eff,
          'INR',
          ctx.rates,
        )
        if (!conv.ok) continue
        contribs.push({ eff, raw: p.currentValue })
      }
      break
    case 'bankSavings':
      for (const a of data.assets.bankSavings.accounts) {
        const conv = toReportingCurrency(
          a.balance,
          a.currency,
          'INR',
          ctx.rates,
        )
        if (!conv.ok) continue
        contribs.push({ eff: a.currency, raw: a.balance })
      }
      break
    case 'property':
      for (const item of data.assets.property.items) {
        const equity = propertyEquityForNetWorth(item)
        const eff = item.currency ?? ctx.reportingLens
        if (eff === 'INR') {
          contribs.push({ eff, raw: equity })
          continue
        }
        const conv = toReportingCurrency(equity, eff, 'INR', ctx.rates)
        if (!conv.ok) continue
        contribs.push({ eff, raw: equity })
      }
      break
    case 'retirement': {
      const stored = data.assets.retirement.currency
      const eff = stored ?? ctx.reportingLens
      const { nps, epf } = data.assets.retirement
      for (const raw of [nps, epf]) {
        if (raw === 0) continue
        if (eff === 'INR') {
          contribs.push({ eff: 'INR', raw })
          continue
        }
        const conv = toReportingCurrency(raw, eff, 'INR', ctx.rates)
        if (!conv.ok) continue
        contribs.push({ eff, raw })
      }
      break
    }
    default:
      return null
  }

  return foreignOriginalMeta(ctx.reportingLens, contribs)
}
