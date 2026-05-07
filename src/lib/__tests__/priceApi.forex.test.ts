import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchForex } from '@/lib/priceApi'

describe('fetchForex', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns all INR legs when EUR/GBP/SGD rates are valid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          rates: { INR: 83, AED: 3.67, EUR: 0.92, GBP: 0.79, SGD: 1.34 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const r = await fetchForex()
    expect(r.usdInr).toBe(83)
    expect(r.aedInr).toBeCloseTo(83 / 3.67, 5)
    expect(r.eurInr).toBeCloseTo(83 / 0.92, 5)
    expect(r.gbpInr).toBeCloseTo(83 / 0.79, 5)
    expect(r.sgdInr).toBeCloseTo(83 / 1.34, 5)
    expect(r.eurInr).not.toBeNull()
    expect(r.gbpInr).not.toBeNull()
    expect(r.sgdInr).not.toBeNull()
  })

  it('sets eurInr null when EUR missing but keeps usdInr', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ rates: { INR: 83, AED: 3.67 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const r = await fetchForex()
    expect(r.usdInr).toBe(83)
    expect(r.eurInr).toBeNull()
    expect(r.gbpInr).toBeNull()
    expect(r.sgdInr).toBeNull()
  })

  it('sets eurInr null when EUR is zero', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ rates: { INR: 83, AED: 3.67, EUR: 0, GBP: 0.8, SGD: 1.3 } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const r = await fetchForex()
    expect(r.usdInr).toBe(83)
    expect(r.eurInr).toBeNull()
    expect(r.gbpInr).not.toBeNull()
  })
})
