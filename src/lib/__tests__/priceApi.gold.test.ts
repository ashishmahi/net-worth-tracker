import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchGoldUsdPerOz } from '@/lib/priceApi'

describe('fetchGoldUsdPerOz', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('returns price on 200 JSON', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ price: 4600, symbol: 'XAU' }),
    })) as unknown as typeof fetch

    await expect(fetchGoldUsdPerOz()).resolves.toBe(4600)
  })

  it('throws on HTTP error', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    })) as unknown as typeof fetch

    await expect(fetchGoldUsdPerOz()).rejects.toThrow('gold-api.com gold failed: HTTP 404')
  })

  it('throws on bad shape', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ foo: 1 }),
    })) as unknown as typeof fetch

    await expect(fetchGoldUsdPerOz()).rejects.toThrow('unexpected response shape')
  })

  it('throws on non-positive price', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ price: 0 }),
    })) as unknown as typeof fetch

    await expect(fetchGoldUsdPerOz()).rejects.toThrow('non-positive or non-numeric')
  })
})
