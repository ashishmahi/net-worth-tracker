import { describe, expect, it } from 'vitest'
import {
  DataSchema,
  OtherCommodityItemSchema,
  LiabilityItemSchema,
  PropertyItemSchema,
} from '@/types/data'
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
      value: 150_000,
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
      value: 100,
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
        value: 10_000,
        ...baseFields(),
      },
    ]
    const r = DataSchema.safeParse(data)
    expect(r.success).toBe(true)
  })
})

describe('LiabilityItemSchema', () => {
  it('accepts valid item with required fields only', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Home Loan',
      outstanding: 2_500_000,
      loanType: 'home',
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('accepts valid item with all optional fields', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Car Loan',
      outstanding: 450_000,
      loanType: 'car',
      lender: 'HDFC Bank',
      emi: 8_500,
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('accepts zero outstanding (fully paid)', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Personal Loan',
      outstanding: 0,
      loanType: 'personal',
      ...baseFields(),
    })
    expect(r.success).toBe(true)
  })

  it('rejects negative outstanding', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Loan',
      outstanding: -1000,
      loanType: 'other',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })

  it('rejects empty label', () => {
    const r = LiabilityItemSchema.safeParse({
      label: '',
      outstanding: 100_000,
      loanType: 'home',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })

  it('rejects unknown loanType', () => {
    const r = LiabilityItemSchema.safeParse({
      label: 'Loan',
      outstanding: 50_000,
      loanType: 'mortgage',
      ...baseFields(),
    })
    expect(r.success).toBe(false)
  })
})

describe('DataSchema liabilities', () => {
  it('accepts full data with liabilities array', () => {
    const data = createInitialData()
    data.liabilities = [
      {
        label: 'Home Loan',
        outstanding: 2_500_000,
        loanType: 'home',
        lender: 'SBI',
        emi: 22_000,
        ...baseFields(),
      },
    ]
    const r = DataSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('accepts full data with empty liabilities array', () => {
    const r = DataSchema.safeParse(createInitialData())
    expect(r.success).toBe(true)
  })
})

describe('PropertyItemSchema cross-field validation', () => {
  it('fails when milestones sum above agreement', () => {
    const r = PropertyItemSchema.safeParse({
      ...baseFields(),
      label: 'Tower A',
      agreementAmount: 100_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'Stage 1', amount: 150_000, isPaid: false },
      ],
      hasLiability: false,
    })
    expect(r.success).toBe(false)
  })

  it('fails when hasLiability true and outstanding loan is zero', () => {
    const r = PropertyItemSchema.safeParse({
      ...baseFields(),
      label: 'Tower B',
      agreementAmount: 500_000,
      milestones: [],
      hasLiability: true,
      outstandingLoan: 0,
    })
    expect(r.success).toBe(false)
  })

  it('passes fully-paid-like row with empty milestones and no liability', () => {
    const r = PropertyItemSchema.safeParse({
      ...baseFields(),
      label: 'Tower C',
      agreementAmount: 800_000,
      milestones: [],
      hasLiability: false,
    })
    expect(r.success).toBe(true)
  })
})
