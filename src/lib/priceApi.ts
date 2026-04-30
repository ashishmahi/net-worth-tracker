/**
 * Central live market price fetches (D-03). All remote HTTP for rates goes through this module.
 *
 * **BTC/USD — primary:** [CoinGecko](https://www.coingecko.com/en/api) public API
 * `GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
 * Response shape: `{ bitcoin: { usd: number } }`.
 *
 * **Forex (USD base) — primary:** [open.er-api.com](https://www.exchangerate-api.com)
 * `GET https://open.er-api.com/v6/latest/USD` — returns `rates.INR`, `rates.AED` as units of each
 * currency per 1 USD.
 *
 * **AED/INR (INR per 1 AED):** `rates.INR / rates.AED` — divide INR-per-USD by AED-per-USD so both
 * are on the same USD base.
 *
 * If a primary endpoint fails (network, parse, HTTP error), these functions throw so the caller
 * can surface errors and optional session-only overrides (D-04).
 */

const COINGECKO_BTC_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'

const OPEN_ER_USD_LATEST = 'https://open.er-api.com/v6/latest/USD'

/** Client-side cache hint: BTC quotes refresh often (D-02). */
export const BTC_TTL_MS = 5 * 60 * 1000

/** Client-side cache hint: forex less volatile — ~1 hour (D-02). */
export const FOREX_TTL_MS = 60 * 60 * 1000

const GOLD_API_SILVER_URL = 'https://api.gold-api.com/price/XAG'

/** Silver cache hint: same volatility bucket as forex (~1 hour). */
export const SILVER_TTL_MS = FOREX_TTL_MS

/** Troy ounce to grams conversion constant (1 troy oz = 31.1035 g). */
export const TROY_OZ_TO_GRAMS = 31.1035

export async function fetchBtcUsd(): Promise<number> {
  const res = await fetch(COINGECKO_BTC_URL)
  if (!res.ok) {
    throw new Error(`CoinGecko BTC/USD failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  const usd =
    json &&
    typeof json === 'object' &&
    'bitcoin' in json &&
    json.bitcoin &&
    typeof json.bitcoin === 'object' &&
    'usd' in json.bitcoin &&
    typeof (json as { bitcoin: { usd: unknown } }).bitcoin.usd === 'number'
      ? (json as { bitcoin: { usd: number } }).bitcoin.usd
      : NaN
  if (!Number.isFinite(usd) || usd <= 0) {
    throw new Error('CoinGecko BTC/USD: unexpected response shape')
  }
  return usd
}

export type ForexRates = {
  usdInr: number
  aedInr: number
}

export async function fetchForex(): Promise<ForexRates> {
  const res = await fetch(OPEN_ER_USD_LATEST)
  if (!res.ok) {
    throw new Error(`open.er-api.com forex failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  if (!json || typeof json !== 'object' || !('rates' in json)) {
    throw new Error('Forex: unexpected response shape')
  }
  const rates = (json as { rates?: Record<string, number> }).rates
  if (!rates || typeof rates.INR !== 'number' || typeof rates.AED !== 'number') {
    throw new Error('Forex: missing INR or AED rates')
  }
  const { INR, AED } = rates
  if (INR <= 0 || AED <= 0) {
    throw new Error('Forex: non-positive rate')
  }
  const aedInr = INR / AED
  if (!Number.isFinite(aedInr) || aedInr <= 0) {
    throw new Error('Forex: invalid AED/INR derivation')
  }
  return { usdInr: INR, aedInr }
}

/**
 * Fetch silver spot price in USD per troy ounce from gold-api.com.
 * Response shape: { price: number, currency: "USD", symbol: "XAG", ... }
 * No API key required. CORS enabled.
 */
export async function fetchSilverUsdPerOz(): Promise<number> {
  const res = await fetch(GOLD_API_SILVER_URL)
  if (!res.ok) {
    throw new Error(`gold-api.com silver failed: HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  if (!json || typeof json !== 'object' || !('price' in json)) {
    throw new Error('silver price: unexpected response shape')
  }
  const price = (json as { price: unknown }).price
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error('silver price: non-positive or non-numeric value')
  }
  return price
}
