import React, { createContext, useContext, useEffect, useState } from 'react'
import { DataSchema, AppData } from '../types/data'

// ── Initial empty data structure (used when data.json is absent or invalid) ──

const now = new Date().toISOString()

export const INITIAL_DATA: AppData = {
  version: 1,
  settings: { updatedAt: now },
  assets: {
    gold: { updatedAt: now, items: [] },
    mutualFunds: { updatedAt: now, platforms: [] },
    stocks: { updatedAt: now, platforms: [] },
    bitcoin: { updatedAt: now, quantity: 0 },
    property: { updatedAt: now, items: [] },
    bankSavings: { updatedAt: now, accounts: [] },
    retirement: { updatedAt: now, nps: 0, epf: 0 },
  },
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
  const [data, setData] = useState<AppData>(INITIAL_DATA)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(raw => {
        const result = DataSchema.safeParse(raw)
        if (result.success) {
          setData(result.data)
        } else {
          console.warn('data.json schema mismatch:', result.error.issues)
          setLoadError('data.json version unknown or schema invalid — using defaults')
        }
      })
      .catch(() => setLoadError('Could not load data.json — using defaults'))
  }, [])

  async function saveData(newData: AppData): Promise<void> {
    const previous = data // snapshot for rollback
    setData(newData) // optimistic update (D-03)
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
      if (!res.ok) {
        setData(previous) // revert on failure
        throw new Error(`Save failed: ${res.status}`)
      }
    } catch (err) {
      setData(previous) // revert on network error
      throw err // caller catches and shows inline error (D-02)
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
