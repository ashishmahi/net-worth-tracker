/** @vitest-environment happy-dom */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DataSchema } from '@/types/data'
import {
  AppDataProvider,
  createInitialData,
  parseAppDataFromImport,
  useAppData,
} from '@/context/AppDataContext'

const WEALTH_KEY = 'wealth-tracker-data'

const iso = new Date().toISOString()

function minimalOldAppDataShape(): Record<string, unknown> {
  return {
    version: 1,
    settings: { updatedAt: iso },
    assets: {
      gold: { updatedAt: iso, items: [] },
      mutualFunds: { updatedAt: iso, platforms: [] },
      stocks: { updatedAt: iso, platforms: [] },
      bitcoin: { updatedAt: iso, quantity: 0 },
      property: { updatedAt: iso, items: [] },
      bankSavings: { updatedAt: iso, accounts: [] },
      retirement: { updatedAt: iso, nps: 0, epf: 0 },
    },
    netWorthHistory: [],
  }
}

function HookProbe(props: { onValue: (v: ReturnType<typeof useAppData>) => void }) {
  const v = useAppData()
  props.onValue(v)
  return null
}

function renderWithProvider(onValue: (v: ReturnType<typeof useAppData>) => void) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const root = createRoot(div)
  act(() =>
    root.render(
      <AppDataProvider>
        <HookProbe onValue={onValue} />
      </AppDataProvider>,
    ),
  )
  return () => {
    act(() => root.unmount())
    div.remove()
  }
}

describe('createInitialData', () => {
  it('includes assets.otherCommodities with updatedAt and empty items', () => {
    const d = createInitialData()
    expect(d.assets.otherCommodities.items).toEqual([])
    expect(typeof d.assets.otherCommodities.updatedAt).toBe('string')
  })

  it('passes DataSchema.safeParse', () => {
    const r = DataSchema.safeParse(createInitialData())
    expect(r.success).toBe(true)
  })
})

describe('parseAppDataFromImport', () => {
  it('parses old-format data without otherCommodities after migration chain', () => {
    const result = parseAppDataFromImport(minimalOldAppDataShape())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.assets.otherCommodities.items).toEqual([])
    }
  })

  it('parses data with valid standard and manual items', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()
    const raw = {
      ...minimalOldAppDataShape(),
      assets: {
        ...(minimalOldAppDataShape().assets as object),
        otherCommodities: {
          updatedAt: iso,
          items: [
            {
              type: 'standard',
              kind: 'silver',
              grams: 10,
              id: id1,
              createdAt: iso,
              updatedAt: iso,
            },
            {
              type: 'manual',
              label: 'X',
              valueInr: 500,
              id: id2,
              createdAt: iso,
              updatedAt: iso,
            },
          ],
        },
      },
    }
    const result = parseAppDataFromImport(raw)
    expect(result.success).toBe(true)
  })

  it('returns success false for invalid item type in otherCommodities', () => {
    const raw = {
      ...minimalOldAppDataShape(),
      assets: {
        ...(minimalOldAppDataShape().assets as object),
        otherCommodities: {
          updatedAt: iso,
          items: [
            {
              type: 'unknown',
              id: crypto.randomUUID(),
              createdAt: iso,
              updatedAt: iso,
            },
          ],
        },
      },
    }
    const result = parseAppDataFromImport(raw)
    expect(result.success).toBe(false)
  })
})

describe('AppDataProvider + localStorage', () => {
  beforeEach(() => {
    localStorage.removeItem(WEALTH_KEY)
  })

  it('absent key exposes initial data and loadError null', () => {
    let api: ReturnType<typeof useAppData> | undefined
    const cleanup = renderWithProvider(v => {
      api = v
    })
    expect(api).toBeDefined()
    expect(api!.loadError).toBeNull()
    expect(api!.data.version).toBe(1)
    expect(api!.data.assets.gold.items).toEqual([])
    cleanup()
  })

  it('valid JSON round-trips through saveData', async () => {
    const initial = createInitialData()
    localStorage.setItem(WEALTH_KEY, JSON.stringify(initial))
    let api: ReturnType<typeof useAppData> | undefined
    const cleanup = renderWithProvider(v => {
      api = v
    })
    expect(api!.data.settings.updatedAt).toBe(initial.settings.updatedAt)
    const next = {
      ...api!.data,
      settings: { ...api!.data.settings, updatedAt: 'phase-22-roundtrip' },
    }
    await act(async () => {
      await api!.saveData(next)
    })
    const stored = JSON.parse(localStorage.getItem(WEALTH_KEY)!)
    expect(stored.settings.updatedAt).toBe('phase-22-roundtrip')
    cleanup()
  })

  it('invalid JSON string yields loadError', () => {
    localStorage.setItem(WEALTH_KEY, '{')
    let api: ReturnType<typeof useAppData> | undefined
    const cleanup = renderWithProvider(v => {
      api = v
    })
    expect(api!.loadError).toContain('Could not read stored')
    cleanup()
  })

  it('valid JSON failing Zod yields loadError', () => {
    localStorage.setItem(WEALTH_KEY, JSON.stringify({ version: 'not-a-number' }))
    let api: ReturnType<typeof useAppData> | undefined
    const cleanup = renderWithProvider(v => {
      api = v
    })
    expect(api!.loadError).toContain('unrecognized')
    cleanup()
  })

  it('saveData rejects QuotaExceededError from localStorage.setItem', async () => {
    const initial = createInitialData()
    const encoded = JSON.stringify(initial)
    const stub = {
      getItem: (key: string) => (key === WEALTH_KEY ? encoded : null),
      setItem: () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      },
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 1,
    } as unknown as Storage
    vi.stubGlobal('localStorage', stub)

    let api: ReturnType<typeof useAppData> | undefined
    const cleanup = renderWithProvider(v => {
      api = v
    })
    try {
      await expect(api!.saveData(createInitialData())).rejects.toMatchObject({
        name: 'QuotaExceededError',
      })
    } finally {
      vi.unstubAllGlobals()
    }
    cleanup()
  })
})
