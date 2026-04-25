import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  BTC_TTL_MS,
  FOREX_TTL_MS,
  fetchBtcUsd,
  fetchForex,
} from '../lib/priceApi'

/**
 * Live price refresh strategy (D-10):
 * - Initial fetch on mount for BTC and forex.
 * - Re-fetch when the tab becomes visible again (`document.visibilitychange` → visible),
 *   but only for channels whose cached quote is past TTL (reduces API noise).
 * - A lightweight interval (60s) re-checks TTL and refetches stale channels so quotes
 *   eventually advance past TTL without requiring tab focus alone.
 */

export type SessionRatePartial = Partial<{
  btcUsd: number
  usdInr: number
  aedInr: number
}>

export type LivePricesContextValue = {
  /** Effective BTC/USD (session override or last successful live quote). */
  btcUsd: number | null
  /** Effective USD→INR (INR per 1 USD). */
  usdInr: number | null
  /** Effective AED→INR (INR per 1 AED). */
  aedInr: number | null
  btcLoading: boolean
  forexLoading: boolean
  btcError: string | null
  forexError: string | null
  refetch: () => void
  setSessionRates: (partial: SessionRatePartial) => void
  clearSessionRates: () => void
}

const LivePricesContext = createContext<LivePricesContextValue | null>(null)

type SessionOverrides = SessionRatePartial

export function LivePricesProvider({ children }: { children: React.ReactNode }) {
  const [liveBtc, setLiveBtc] = useState<number | null>(null)
  const [liveUsdInr, setLiveUsdInr] = useState<number | null>(null)
  const [liveAedInr, setLiveAedInr] = useState<number | null>(null)

  const lastBtcAt = useRef<number>(0)
  const lastForexAt = useRef<number>(0)
  const liveBtcRef = useRef<number | null>(null)
  const liveUsdInrRef = useRef<number | null>(null)
  const liveAedInrRef = useRef<number | null>(null)

  const [session, setSession] = useState<SessionOverrides>({})

  const [btcLoading, setBtcLoading] = useState(false)
  const [forexLoading, setForexLoading] = useState(false)
  const [btcError, setBtcError] = useState<string | null>(null)
  const [forexError, setForexError] = useState<string | null>(null)

  const runBtcFetch = useCallback(async (force: boolean) => {
    const now = Date.now()
    const hasLive = liveBtcRef.current != null
    const stale = force || now - lastBtcAt.current >= BTC_TTL_MS || !hasLive
    if (!stale) return
    setBtcLoading(true)
    setBtcError(null)
    try {
      const v = await fetchBtcUsd()
      liveBtcRef.current = v
      setLiveBtc(v)
      lastBtcAt.current = Date.now()
      setSession(s => {
        const next = { ...s }
        delete next.btcUsd
        return next
      })
    } catch (e) {
      setBtcError(e instanceof Error ? e.message : 'BTC/USD fetch failed')
    } finally {
      setBtcLoading(false)
    }
  }, [])

  const runForexFetch = useCallback(async (force: boolean) => {
    const now = Date.now()
    const hasLive = liveUsdInrRef.current != null && liveAedInrRef.current != null
    const stale = force || now - lastForexAt.current >= FOREX_TTL_MS || !hasLive
    if (!stale) return
    setForexLoading(true)
    setForexError(null)
    try {
      const { usdInr, aedInr } = await fetchForex()
      liveUsdInrRef.current = usdInr
      liveAedInrRef.current = aedInr
      setLiveUsdInr(usdInr)
      setLiveAedInr(aedInr)
      lastForexAt.current = Date.now()
      setSession(s => {
        const next = { ...s }
        delete next.usdInr
        delete next.aedInr
        return next
      })
    } catch (e) {
      setForexError(e instanceof Error ? e.message : 'Forex fetch failed')
    } finally {
      setForexLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    void runBtcFetch(true)
    void runForexFetch(true)
  }, [runBtcFetch, runForexFetch])

  const refetchStale = useCallback(() => {
    void runBtcFetch(false)
    void runForexFetch(false)
  }, [runBtcFetch, runForexFetch])

  useEffect(() => {
    void runBtcFetch(true)
    void runForexFetch(true)
  }, [runBtcFetch, runForexFetch])

  useEffect(() => {
    const id = window.setInterval(() => {
      refetchStale()
    }, 60_000)
    return () => window.clearInterval(id)
  }, [refetchStale])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        refetchStale()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [refetchStale])

  const setSessionRates = useCallback((partial: SessionRatePartial) => {
    setSession(s => ({ ...s, ...partial }))
  }, [])

  const clearSessionRates = useCallback(() => {
    setSession({})
  }, [])

  const value = useMemo<LivePricesContextValue>(
    () => ({
      btcUsd: session.btcUsd ?? liveBtc,
      usdInr: session.usdInr ?? liveUsdInr,
      aedInr: session.aedInr ?? liveAedInr,
      btcLoading,
      forexLoading,
      btcError,
      forexError,
      refetch,
      setSessionRates,
      clearSessionRates,
    }),
    [
      session,
      liveBtc,
      liveUsdInr,
      liveAedInr,
      btcLoading,
      forexLoading,
      btcError,
      forexError,
      refetch,
      setSessionRates,
      clearSessionRates,
    ],
  )

  return (
    <LivePricesContext.Provider value={value}>{children}</LivePricesContext.Provider>
  )
}

export function useLivePrices(): LivePricesContextValue {
  const ctx = useContext(LivePricesContext)
  if (!ctx) throw new Error('useLivePrices must be used inside LivePricesProvider')
  return ctx
}
