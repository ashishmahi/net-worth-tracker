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

/** v1 → v2: bump schema version, stamp `reportingCurrency` and per-record `currency: INR` where missing (bank rows keep existing `currency`). */
export function migrateV1ToV2(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const root = raw as Record<string, unknown>
  if (root.version !== 1) return raw

  const next: Record<string, unknown> = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>
  next.version = 2

  const settings = next.settings
  if (settings && typeof settings === 'object') {
    const s = settings as Record<string, unknown>
    if (s.reportingCurrency === undefined) {
      s.reportingCurrency = 'INR'
    }
  }

  const stamp = (row: Record<string, unknown>): Record<string, unknown> => {
    if ('currency' in row && row.currency !== undefined) return row
    return { ...row, currency: 'INR' }
  }

  const assets = next.assets
  if (assets && typeof assets === 'object') {
    const a = assets as Record<string, unknown>

    const gold = a.gold as { items?: unknown[] } | undefined
    if (gold && Array.isArray(gold.items)) {
      gold.items = gold.items.map(entry =>
        entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
      )
    }

    const oc = a.otherCommodities as { items?: unknown[] } | undefined
    if (oc && Array.isArray(oc.items)) {
      oc.items = oc.items.map(entry =>
        entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
      )
    }

    const mf = a.mutualFunds as { platforms?: unknown[] } | undefined
    if (mf && Array.isArray(mf.platforms)) {
      mf.platforms = mf.platforms.map(entry =>
        entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
      )
    }

    const st = a.stocks as { platforms?: unknown[] } | undefined
    if (st && Array.isArray(st.platforms)) {
      st.platforms = st.platforms.map(entry =>
        entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
      )
    }

    const btc = a.bitcoin
    if (btc && typeof btc === 'object') {
      const b = btc as Record<string, unknown>
      if (b.currency === undefined) {
        b.currency = 'INR'
      }
    }

    const prop = a.property as { items?: unknown[] } | undefined
    if (prop && Array.isArray(prop.items)) {
      prop.items = prop.items.map(entry =>
        entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
      )
    }

    const bank = a.bankSavings as { accounts?: unknown[] } | undefined
    if (bank && Array.isArray(bank.accounts)) {
      bank.accounts = bank.accounts.map(entry =>
        entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
      )
    }

    const ret = a.retirement
    if (ret && typeof ret === 'object') {
      const r = ret as Record<string, unknown>
      if (r.currency === undefined) {
        r.currency = 'INR'
      }
    }
  }

  if (Array.isArray(next.liabilities)) {
    next.liabilities = next.liabilities.map(entry =>
      entry && typeof entry === 'object' ? stamp(entry as Record<string, unknown>) : entry,
    )
  }

  return next
}

/** Import uplift defaults (BLN-03): applied before parse when keys absent on `settings`. */
export function ensureImportUpliftRates(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  const settings = o.settings
  if (!settings || typeof settings !== 'object') return raw
  const s = settings as Record<string, unknown>
  const next: Record<string, unknown> = { ...s }
  if (next.goldImportUpliftRate === undefined) {
    next.goldImportUpliftRate = 0.1
  }
  if (next.silverImportUpliftRate === undefined) {
    next.silverImportUpliftRate = 0.08
  }
  return {
    ...o,
    settings: next,
  }
}

/** Same migrate + `DataSchema` path as initial stored wealth load — for import and boot.
 *  Chain: migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → ensureImportUpliftRates → migrateV1ToV2 → safeParse
 */
export function parseAppDataFromImport(
  raw: unknown,
): { success: true; data: AppData } | { success: false; zodError: ZodError } {
  const migrated = migrateLegacyBankAccounts(raw)
  const withHistory = ensureNetWorthHistory(migrated)
  const withCommodities = ensureOtherCommodities(withHistory)
  const withLiabilities = ensureLiabilities(withCommodities)
  const withImportUplift = ensureImportUpliftRates(withLiabilities)
  const v2Ready = migrateV1ToV2(withImportUplift)
  const result = DataSchema.safeParse(v2Ready)
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
    version: 2,
    settings: {
      updatedAt: now,
      reportingCurrency: 'INR',
      goldImportUpliftRate: 0.1,
      silverImportUpliftRate: 0.08,
    },
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
