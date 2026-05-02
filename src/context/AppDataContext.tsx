import React, { createContext, useContext, useState } from 'react'
import type { ZodError } from 'zod'
import { nowIso } from '@/lib/financials'
import { DataSchema, AppData } from '../types/data'

/** Map legacy Phase-2 `balanceInr` rows to `{ currency: 'INR', balance }` before Zod parse. */
function migrateLegacyBankAccounts(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const root = raw as Record<string, unknown>
  const assets = root.assets
  if (!assets || typeof assets !== 'object') return raw
  const a = assets as Record<string, unknown>
  const bankSavings = a.bankSavings
  if (!bankSavings || typeof bankSavings !== 'object') return raw
  const bs = bankSavings as Record<string, unknown>
  const accounts = bs.accounts
  if (!Array.isArray(accounts)) return raw
  const nextAccounts = accounts.map(entry => {
    if (!entry || typeof entry !== 'object') return entry
    const acc = entry as Record<string, unknown>
    if ('balanceInr' in acc && typeof acc.balanceInr === 'number') {
      const legacy = acc.balanceInr as number
      const next = { ...acc } as Record<string, unknown>
      delete next.balanceInr
      return { ...next, currency: 'INR', balance: legacy }
    }
    return entry
  })
  return {
    ...root,
    assets: {
      ...a,
      bankSavings: {
        ...bs,
        accounts: nextAccounts,
      },
    },
  }
}

/** v1.2 files without `netWorthHistory`: default to `[]` before Zod parse. */
function ensureNetWorthHistory(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  if (!('netWorthHistory' in o) || o.netWorthHistory === undefined) {
    return { ...o, netWorthHistory: [] }
  }
  return raw
}

/** v1.4 files without `assets.otherCommodities`: default empty block before Zod parse. */
export function ensureOtherCommodities(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  const assets = o.assets
  if (!assets || typeof assets !== 'object') return raw
  const a = assets as Record<string, unknown>
  if (!('otherCommodities' in a) || a.otherCommodities === undefined) {
    return {
      ...o,
      assets: {
        ...a,
        otherCommodities: { updatedAt: nowIso(), items: [] },
      },
    }
  }
  return raw
}

/** v1.5 files without `liabilities`: default to `[]` before Zod parse. */
export function ensureLiabilities(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  if (!('liabilities' in o) || o.liabilities === undefined) {
    return { ...o, liabilities: [] }
  }
  return raw
}

/** Same migrate + `DataSchema` path as initial stored wealth load — for import and boot.
 *  Chain: migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → safeParse
 */
export function parseAppDataFromImport(
  raw: unknown,
): { success: true; data: AppData } | { success: false; zodError: ZodError } {
  const migrated = migrateLegacyBankAccounts(raw)
  const withHistory = ensureNetWorthHistory(migrated)
  const withCommodities = ensureOtherCommodities(withHistory)
  const withLiabilities = ensureLiabilities(withCommodities)
  const result = DataSchema.safeParse(withLiabilities)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, zodError: result.error }
}

const WEALTH_STORAGE_KEY = 'wealth-tracker-data'

// ── Initial empty data structure (used when storage is absent or invalid) ──

/** Full empty slate for first load, failed parse, or user-initiated reset. */
export function createInitialData(): AppData {
  const now = nowIso()
  return {
    version: 1,
    settings: { updatedAt: now },
    assets: {
      gold: { updatedAt: now, items: [] },
      otherCommodities: { updatedAt: now, items: [] },
      mutualFunds: { updatedAt: now, platforms: [] },
      stocks: { updatedAt: now, platforms: [] },
      bitcoin: { updatedAt: now, quantity: 0 },
      property: { updatedAt: now, items: [] },
      bankSavings: { updatedAt: now, accounts: [] },
      retirement: { updatedAt: now, nps: 0, epf: 0 },
    },
    liabilities: [],
    netWorthHistory: [],
  }
}

export const INITIAL_DATA: AppData = createInitialData()

function readInitialWealthState(): { data: AppData; loadError: string | null } {
  try {
    const raw = localStorage.getItem(WEALTH_STORAGE_KEY)
    if (raw === null || raw === '') {
      return { data: createInitialData(), loadError: null }
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {
        data: createInitialData(),
        loadError: 'Could not read stored data. Starting with defaults.',
      }
    }
    const result = parseAppDataFromImport(parsed)
    if (result.success) {
      return { data: result.data, loadError: null }
    }
    console.warn('stored data schema mismatch:', result.zodError.issues)
    return {
      data: createInitialData(),
      loadError: 'Saved data format is unrecognized. Starting with defaults to avoid data loss.',
    }
  } catch {
    return {
      data: createInitialData(),
      loadError: 'Could not read stored data. Starting with defaults.',
    }
  }
}

// ── Context type ──────────────────────────────────────────────────────────────

interface AppDataContextValue {
  data: AppData
  saveData: (newData: AppData) => Promise<void>
  loadError: string | null
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => readInitialWealthState().data)
  const [loadError] = useState<string | null>(() => readInitialWealthState().loadError)

  async function saveData(newData: AppData): Promise<void> {
    const previous = data
    try {
      localStorage.setItem(WEALTH_STORAGE_KEY, JSON.stringify(newData))
      setData(newData)
    } catch (err) {
      setData(previous)
      throw err
    }
  }

  return (
    <AppDataContext.Provider value={{ data, saveData, loadError }}>
      {children}
    </AppDataContext.Provider>
  )
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider')
  return ctx
}
