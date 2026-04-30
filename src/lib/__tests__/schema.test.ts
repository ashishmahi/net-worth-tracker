import { describe, expect, it } from 'vitest'
import { DataSchema, OtherCommodityItemSchema } from '@/types/data'
import { createInitialData } from '@/context/AppDataContext'

function baseFields() {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

describe('OtherCommodityItemSchema', () => {
  it('accepts valid standard silver item', () => {
    const r = OtherCommodityItemSchema.safeParse({
      type: 'standard',
      kind: 'silver',
      grams: 100,
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('accepts valid manual item', () => {
    const r = OtherCommodityItemSchema.safeParse({
      type: 'manual',
      label: 'Crude Oil',
      valueInr: 150_000,
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('rejects unknown type', () => {
    const r = OtherCommodityItemSchema.safeParse({
      type: 'unknown',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })

  it('rejects negative grams', () => {
    const r = OtherCommodityItemSchema.safeParse({
      type: 'standard',
      kind: 'silver',
      grams: -5,
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })

  it('rejects empty manual label', () => {
    const r = OtherCommodityItemSchema.safeParse({
      type: 'manual',
      label: '',
      valueInr: 100,
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })
})

describe('DataSchema otherCommodities', () => {
  it('accepts full data with otherCommodities containing both item types', () => {
    const data = createInitialData()
    data.assets.otherCommodities.items = [
      {
        type: 'standard',
        kind: 'silver',
        grams: 50,
        ...baseFields(),
      },
      {
        type: 'manual',
        label: 'Stuff',
        valueInr: 10_000,
        ...baseFields(),
      },
    ]
    const r = DataSchema.safeParse(data)
    expect(r.success).toBe(true)
  })
})
