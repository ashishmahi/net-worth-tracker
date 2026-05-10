import { describe, expect, it } from 'vitest'
import {
  createWealthExportZip,
  extractDataJsonFromZip,
} from '@/lib/wealthDataZip'
import {
  createInitialData,
  parseAppDataFromImport,
} from '@/context/AppDataContext'
import { DataSchema } from '@/types/data'

function zipBlobToFile(blob: Blob): File {
  return new File([blob], 'wealth.zip', { type: 'application/zip' })
}

describe('phase 38 — snapshot metadata & currency zip round-trip', () => {
  it('preserves per-record currency and net worth snapshot fields through export → import', async () => {
    const data = createInitialData()
    const now = data.settings.updatedAt
    const accountId = crypto.randomUUID()
    data.settings.reportingCurrency = 'USD'
    data.assets.bankSavings.accounts.push({
      id: accountId,
      createdAt: now,
      updatedAt: now,
      label: 'IB USD',
      currency: 'USD',
      balance: 10_000,
    })
    data.netWorthHistory.push({
      recordedAt: now,
      totalInr: 9_000_000,
      reportingCurrency: 'USD',
      totalReporting: 105_000,
      rates: {
        usdInr: 83.25,
        eurInr: 90,
        btcUsd: 98_000,
      },
    })

    const parsedRoot = DataSchema.safeParse(data)
    expect(parsedRoot.success).toBe(true)

    const jsonText = JSON.stringify(data)
    const blob = await createWealthExportZip(jsonText, null)
    const extracted = await extractDataJsonFromZip(zipBlobToFile(blob))
    const result = parseAppDataFromImport(JSON.parse(extracted) as unknown)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.settings.reportingCurrency).toBe('USD')
    const acct = result.data.assets.bankSavings.accounts.find(a => a.id === accountId)
    expect(acct?.currency).toBe('USD')
    expect(acct?.balance).toBe(10_000)

    const snap = result.data.netWorthHistory[result.data.netWorthHistory.length - 1]
    expect(snap?.reportingCurrency).toBe('USD')
    expect(snap?.totalReporting).toBe(105_000)
    expect(snap?.rates?.usdInr).toBe(83.25)
    expect(snap?.rates?.eurInr).toBe(90)
    expect(snap?.rates?.btcUsd).toBe(98_000)
  })
})
